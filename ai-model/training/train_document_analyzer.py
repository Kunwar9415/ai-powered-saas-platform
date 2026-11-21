"""
Training Pipeline for Custom Neural Document Classification Model.
Trains from scratch with random weight initialization.
Evaluates accuracy across train/val/test splits and saves best checkpoints.
"""

import os
import sys
import csv
import json
import time
import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader, random_split

AI_MODEL_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if AI_MODEL_ROOT not in sys.path:
    sys.path.insert(0, AI_MODEL_ROOT)

from tokenization.tokenizer import CustomTokenizer
from models.document_classifier import DocumentClassifierNet

DOCUMENT_CATEGORIES = [
    "Technology & Software Engineering",
    "Academic Research & Science",
    "Business & Product Strategy",
    "Finance & Economics",
    "Legal, Compliance & Policy",
    "Medical & Healthcare Sciences"
]

class DocumentDataset(Dataset):
    def __init__(self, texts, labels, tokenizer):
        self.samples = []
        for text, label in zip(texts, labels):
            token_ids = tokenizer.encode(text, add_special_tokens=False)
            if not token_ids:
                token_ids = [tokenizer.unk_token_id]
            self.samples.append((token_ids, label))

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, idx):
        return self.samples[idx]

def collate_batch(batch):
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
    print("STAGE 5: TRAINING CUSTOM DOCUMENT CLASSIFICATION MODEL")
    print("=" * 60)

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Device: {device}")

    csv_path = os.path.join(AI_MODEL_ROOT, "datasets", "document_classification.csv")
    checkpoint_path = os.path.join(AI_MODEL_ROOT, "checkpoints", "document_classifier_best.pt")
    metrics_path = os.path.join(AI_MODEL_ROOT, "checkpoints", "document_classifier_metrics.json")
    vocab_path = os.path.join(AI_MODEL_ROOT, "checkpoints", "document_vocab.json")

    # 1. Load CSV data
    texts, labels = [], []
    with open(csv_path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            texts.append(row["text"])
            labels.append(int(row["label"]))
    print(f"Loaded {len(texts)} document samples across {len(DOCUMENT_CATEGORIES)} categories.")

    # 2. Tokenizer & Vocab
    tokenizer = CustomTokenizer()
    tokenizer.build_vocab(texts, min_freq=1, max_vocab_size=2500)
    tokenizer.save_vocab(vocab_path)
    print(f"Document Tokenizer Vocabulary size: {tokenizer.vocab_size}")

    # 3. Splits (80% train, 10% val, 10% test)
    full_dataset = DocumentDataset(texts, labels, tokenizer)
    total_len = len(full_dataset)
    val_len = int(total_len * 0.1)
    test_len = int(total_len * 0.1)
    train_len = total_len - val_len - test_len

    train_ds, val_ds, test_ds = random_split(
        full_dataset, [train_len, val_len, test_len], generator=torch.Generator().manual_seed(42)
    )

    train_loader = DataLoader(train_ds, batch_size=16, shuffle=True, collate_fn=collate_batch)
    val_loader = DataLoader(val_ds, batch_size=16, shuffle=False, collate_fn=collate_batch)
    test_loader = DataLoader(test_ds, batch_size=16, shuffle=False, collate_fn=collate_batch)

    print(f"Splits: Train={len(train_ds)}, Val={len(val_ds)}, Test={len(test_ds)}")

    # 4. Model instantiation (Random weights)
    model = DocumentClassifierNet(
        vocab_size=tokenizer.vocab_size,
        embed_dim=128,
        num_classes=len(DOCUMENT_CATEGORIES),
        dropout=0.2,
    ).to(device)

    total_params = sum(p.numel() for p in model.parameters() if p.requires_grad)
    print(f"Document Classifier Net initialized with {total_params:,} parameters (All randomly initialized).")

    # 5. Training Loop
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
                    "categories": DOCUMENT_CATEGORIES,
                },
                checkpoint_path,
            )

    # 6. Evaluate on Test Split
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

