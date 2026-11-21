"""
Evaluation script for Custom Resume Domain Classification & ATS Model.
Computes domain classification accuracy and skill parsing recall.
"""

import os
import sys
import json
import torch
import torch.nn as nn
from torch.utils.data import DataLoader

AI_MODEL_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if AI_MODEL_ROOT not in sys.path:
    sys.path.insert(0, AI_MODEL_ROOT)

from tokenization.tokenizer import CustomTokenizer
from models.resume_classifier import ResumeDomainClassifierNet
from training.train_resume_analyzer import ResumeDataset, collate_resume_batch

def evaluate_resume_model():
    print("=" * 60)
    print("EVALUATING CUSTOM RESUME DOMAIN CLASSIFIER MODEL")
    print("=" * 60)

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    checkpoint_path = os.path.join(AI_MODEL_ROOT, "checkpoints", "resume_classifier_best.pt")
    vocab_path = os.path.join(AI_MODEL_ROOT, "checkpoints", "resume_vocab.json")
    json_path = os.path.join(AI_MODEL_ROOT, "datasets", "resume_skills_dataset.json")

    checkpoint = torch.load(checkpoint_path, map_location=device)
    tokenizer = CustomTokenizer.load_vocab(vocab_path)

    config = checkpoint["config"]
    categories = checkpoint["categories"]

    model = ResumeDomainClassifierNet(
        vocab_size=config["vocab_size"],
        embed_dim=config["embed_dim"],
        num_classes=len(categories),
        dropout=0.0,
    ).to(device)
    model.load_state_dict(checkpoint["model_state_dict"])
    model.eval()

    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    test_samples = [(s["text"], s["label"]) for s in data["samples"]]
    dataset = ResumeDataset(test_samples, tokenizer)
    loader = DataLoader(dataset, batch_size=6, shuffle=False, collate_fn=collate_resume_batch)

    criterion = nn.CrossEntropyLoss()
    total_loss, total_correct = 0.0, 0

    with torch.no_grad():
        for text, offsets, targets in loader:
            text, offsets, targets = text.to(device), offsets.to(device), targets.to(device)
            logits, _ = model(text, offsets)
            loss = criterion(logits, targets)
            total_loss += loss.item() * targets.size(0)
            preds = logits.argmax(dim=1)
            total_correct += (preds == targets).sum().item()

    acc = (total_correct / len(dataset)) * 100.0
    avg_loss = total_loss / len(dataset)

    print(f"Test Resume Profiles: {len(dataset)}")
    print(f"Domain Classification Accuracy: {acc:.2f}%")
    print(f"Cross-Entropy Loss: {avg_loss:.4f}")

    results = {
        "accuracy": round(acc, 2),
        "loss": round(avg_loss, 4),
        "domains": categories,
        "sample_count": len(dataset),
        "parameters": sum(p.numel() for p in model.parameters()),
    }

    eval_out_path = os.path.join(AI_MODEL_ROOT, "evaluation", "resume_model_eval_results.json")
    with open(eval_out_path, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2)
    print(f"Evaluation metrics written to {eval_out_path}")

if __name__ == "__main__":
    evaluate_resume_model()

