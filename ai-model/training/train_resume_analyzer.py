"""
Training Pipeline for Custom Neural Resume Domain Classification Model.
Trains from scratch with random weight initialization.
"""

import os
import sys
import json
import time
import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader, random_split

AI_MODEL_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if AI_MODEL_ROOT not in sys.path:
    sys.path.insert(0, AI_MODEL_ROOT)

from tokenization.tokenizer import CustomTokenizer
from models.resume_classifier import ResumeDomainClassifierNet

class ResumeDataset(Dataset):
    def __init__(self, samples, tokenizer):
        self.data = []
        for text, label in samples:
            token_ids = tokenizer.encode(text, add_special_tokens=False)
            if not token_ids:
                token_ids = [tokenizer.unk_token_id]
            self.data.append((token_ids, label))

    def __len__(self):
        return len(self.data)

    def __getitem__(self, idx):
        return self.data[idx]

def collate_resume_batch(batch):
    text_list, label_list, offsets = [], [], [0]
    for token_ids, label in batch:
        label_list.append(label)
        processed_text = torch.tensor(token_ids, dtype=torch.long)
        text_list.append(processed_text)
        offsets.append(processed_text.size(0))
    offsets = torch.tensor(offsets[:-1]).cumsum(dim=0)
    text_list = torch.cat(text_list)
    label_list = torch.tensor(label_list, dtype=torch.long)
    return text_list, offsets, label_list

def main():
    print("=" * 60)
    print("STAGE 6: TRAINING CUSTOM RESUME DOMAIN CLASSIFIER MODEL")
    print("=" * 60)

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Device: {device}")

    json_path = os.path.join(AI_MODEL_ROOT, "datasets", "resume_skills_dataset.json")
    checkpoint_path = os.path.join(AI_MODEL_ROOT, "checkpoints", "resume_classifier_best.pt")
    metrics_path = os.path.join(AI_MODEL_ROOT, "checkpoints", "resume_classifier_metrics.json")
    vocab_path = os.path.join(AI_MODEL_ROOT, "checkpoints", "resume_vocab.json")

    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    categories = data["categories"]
    taxonomy = data["taxonomy"]
    base_samples = data["samples"]

    # Synthesize diverse training instances by combining skill permutations
    training_samples = []
    prefixes = [
        "Experienced software professional with background in ",
        "Senior developer specializing in ",
        "Technical portfolio and profile focused on ",
        "Certified engineer with expertise in ",
        "Candidate resume summary: ",
        "Core competencies include: ",
        "Professional experience in ",
        "Hands-on technical background in ",
        "Technical skills and project portfolio covering ",
        "Education in Computer Science with applied skills in "
    ]

    for item in base_samples:
        domain = item["domain"]
        label = item["label"]
        raw_text = item["text"]
        for p in prefixes:
            training_samples.append((p + raw_text, label))
            # Also permute with domain skill subsets
            domain_skills = []
            if label == 0:
                domain_skills = ["React", "Node.js", "Express", "TypeScript", "PostgreSQL", "REST APIs", "Tailwind CSS"]
            elif label == 1:
                domain_skills = ["PyTorch", "Python", "Machine Learning", "Scikit-Learn", "Pandas", "NLP", "Neural Networks"]
            elif label == 2:
                domain_skills = ["AWS", "Docker", "Kubernetes", "Linux", "Terraform", "CI/CD", "DevOps"]
            elif label == 3:
                domain_skills = ["Cybersecurity", "Network Security", "Penetration Testing", "SIEM", "Firewall", "ISO 27001"]
            elif label == 4:
                domain_skills = ["React Native", "Flutter", "Swift", "Kotlin", "Mobile Apps", "iOS", "Android"]
            elif label == 5:
                domain_skills = ["Product Management", "Agile", "Scrum", "Engineering Leadership", "Sprint Planning", "Roadmaps"]

            skill_str = ", ".join(domain_skills)
            training_samples.append((f"{p} {domain}. Key tools: {skill_str}.", label))

    print(f"Generated {len(training_samples)} resume profile samples across {len(categories)} domains.")

    # Tokenizer & Vocab
    texts = [t for t, _ in training_samples]
    tokenizer = CustomTokenizer()
    tokenizer.build_vocab(texts, min_freq=1, max_vocab_size=2000)
    tokenizer.save_vocab(vocab_path)
    print(f"Resume Tokenizer Vocabulary size: {tokenizer.vocab_size}")

    # Splits (80/10/10)
    full_ds = ResumeDataset(training_samples, tokenizer)
    total_len = len(full_ds)
    val_len = int(total_len * 0.1)
    test_len = int(total_len * 0.1)
    train_len = total_len - val_len - test_len

    train_ds, val_ds, test_ds = random_split(
        full_ds, [train_len, val_len, test_len], generator=torch.Generator().manual_seed(42)
    )

    train_loader = DataLoader(train_ds, batch_size=16, shuffle=True, collate_fn=collate_resume_batch)
    val_loader = DataLoader(val_ds, batch_size=16, shuffle=False, collate_fn=collate_resume_batch)
    test_loader = DataLoader(test_ds, batch_size=16, shuffle=False, collate_fn=collate_resume_batch)

    # Model instantiation
    model = ResumeDomainClassifierNet(
        vocab_size=tokenizer.vocab_size,
        embed_dim=128,
        num_classes=len(categories),
        dropout=0.2,
    ).to(device)

    total_params = sum(p.numel() for p in model.parameters() if p.requires_grad)
    print(f"Resume Classifier Model initialized with {total_params:,} parameters (All randomly initialized).")

    # Training
    criterion = nn.CrossEntropyLoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=1e-3, weight_decay=1e-4)

    epochs = 30
    best_val_acc = 0.0
    history = {"train_loss": [], "val_loss": [], "val_acc": [], "epochs": []}

    start_time = time.time()
    for epoch in range(1, epochs + 1):
        model.train()
        train_loss = 0.0
        for text, offsets, targets in train_loader:
            text, offsets, targets = text.to(device), offsets.to(device), targets.to(device)
            optimizer.zero_grad()
            logits, _ = model(text, offsets)
            loss = criterion(logits, targets)
            loss.backward()
            optimizer.step()
            train_loss += loss.item() * targets.size(0)
        train_loss /= len(train_ds)

        model.eval()
        val_loss, val_correct = 0.0, 0
        with torch.no_grad():
            for text, offsets, targets in val_loader:
                text, offsets, targets = text.to(device), offsets.to(device), targets.to(device)
                logits, _ = model(text, offsets)
                loss = criterion(logits, targets)
                val_loss += loss.item() * targets.size(0)
                preds = logits.argmax(dim=1)
                val_correct += (preds == targets).sum().item()
        val_loss /= len(val_ds)
        val_acc = (val_correct / len(val_ds)) * 100.0

        history["epochs"].append(epoch)
        history["train_loss"].append(round(train_loss, 4))
        history["val_loss"].append(round(val_loss, 4))
        history["val_acc"].append(round(val_acc, 2))

        if epoch % 5 == 0 or epoch == epochs:
            print(f"Epoch {epoch:2d}/{epochs:2d} | Train Loss: {train_loss:.4f} | Val Loss: {val_loss:.4f} | Val Acc: {val_acc:.2f}%")

        if val_acc >= best_val_acc:
            best_val_acc = val_acc
            torch.save(
                {
                    "epoch": epoch,
                    "model_state_dict": model.state_dict(),
                    "val_acc": val_acc,
                    "val_loss": val_loss,
                    "config": model.config,
                    "categories": categories,
                    "taxonomy": taxonomy,
                    "role_benchmarks": data.get("role_benchmarks", {}),
                },
                checkpoint_path,
            )

    # Test Split Evaluation
    checkpoint = torch.load(checkpoint_path, map_location=device)
    model.load_state_dict(checkpoint["model_state_dict"])
    model.eval()

    test_correct = 0
    with torch.no_grad():
        for text, offsets, targets in test_loader:
            text, offsets, targets = text.to(device), offsets.to(device), targets.to(device)
            logits, _ = model(text, offsets)
            preds = logits.argmax(dim=1)
            test_correct += (preds == targets).sum().item()
    test_acc = (test_correct / len(test_ds)) * 100.0

    elapsed = time.time() - start_time
    print(f"Training completed in {elapsed:.2f}s | Best Val Acc: {best_val_acc:.2f}% | Test Acc: {test_acc:.2f}%")
    print(f"Best checkpoint saved at: {checkpoint_path}")

    with open(metrics_path, "w", encoding="utf-8") as f:
        json.dump(history, f, indent=2)

    return checkpoint_path

if __name__ == "__main__":
    main()

