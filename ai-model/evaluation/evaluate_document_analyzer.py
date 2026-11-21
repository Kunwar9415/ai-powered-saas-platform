"""
Evaluation script for Custom Neural Document Classification Model.
Evaluates accuracy, cross-entropy test loss, and classification report.
"""

import os
import sys
import csv
import json
import torch
import torch.nn as nn
from torch.utils.data import DataLoader

AI_MODEL_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if AI_MODEL_ROOT not in sys.path:
    sys.path.insert(0, AI_MODEL_ROOT)

from tokenization.tokenizer import CustomTokenizer
from models.document_classifier import DocumentClassifierNet
from training.train_document_analyzer import DocumentDataset, collate_batch, DOCUMENT_CATEGORIES

def evaluate_document_classifier():
    print("=" * 60)
    print("EVALUATING CUSTOM DOCUMENT CLASSIFICATION MODEL")
    print("=" * 60)

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    checkpoint_path = os.path.join(AI_MODEL_ROOT, "checkpoints", "document_classifier_best.pt")
    vocab_path = os.path.join(AI_MODEL_ROOT, "checkpoints", "document_vocab.json")
    csv_path = os.path.join(AI_MODEL_ROOT, "datasets", "document_classification.csv")

    checkpoint = torch.load(checkpoint_path, map_location=device)
    tokenizer = CustomTokenizer.load_vocab(vocab_path)

    config = checkpoint["config"]
    categories = checkpoint["categories"]

    model = DocumentClassifierNet(
        vocab_size=config["vocab_size"],
        embed_dim=config["embed_dim"],
        num_classes=len(categories),
        dropout=0.0,
    ).to(device)
    model.load_state_dict(checkpoint["model_state_dict"])
    model.eval()

    texts, labels = [], []
    with open(csv_path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            texts.append(row["text"])
            labels.append(int(row["label"]))

    dataset = DocumentDataset(texts, labels, tokenizer)
    loader = DataLoader(dataset, batch_size=16, shuffle=False, collate_fn=collate_batch)

    criterion = nn.CrossEntropyLoss()
    total_loss, total_correct = 0.0, 0
    all_preds, all_targets = [], []

    with torch.no_grad():
        for text, offsets, targets in loader:
            text, offsets, targets = text.to(device), offsets.to(device), targets.to(device)
            logits, _ = model(text, offsets)
            loss = criterion(logits, targets)
            total_loss += loss.item() * targets.size(0)
            preds = logits.argmax(dim=1)
            total_correct += (preds == targets).sum().item()
            all_preds.extend(preds.cpu().tolist())
            all_targets.extend(targets.cpu().tolist())

    acc = (total_correct / len(dataset)) * 100.0
    avg_loss = total_loss / len(dataset)

    print(f"Dataset Total Samples: {len(dataset)}")
    print(f"Overall Accuracy:      {acc:.2f}%")
    print(f"Cross-Entropy Loss:    {avg_loss:.4f}")

    results = {
        "accuracy": round(acc, 2),
        "loss": round(avg_loss, 4),
        "categories": categories,
        "sample_count": len(dataset),
        "parameters": sum(p.numel() for p in model.parameters()),
    }

    eval_out_path = os.path.join(AI_MODEL_ROOT, "evaluation", "document_model_eval_results.json")
    with open(eval_out_path, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2)
    print(f"Evaluation metrics written to {eval_out_path}")

if __name__ == "__main__":
    evaluate_document_classifier()

