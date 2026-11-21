"""
Evaluation script for Custom Transformer Language Model.
Computes cross-entropy validation loss, perplexity, and qualitative generations.
"""

import os
import sys
import math
import json
import torch
from torch.utils.data import DataLoader

AI_MODEL_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if AI_MODEL_ROOT not in sys.path:
    sys.path.insert(0, AI_MODEL_ROOT)

from tokenization.tokenizer import CustomTokenizer
from preprocessing.text_preprocessor import TextDataset, clean_text
from models.transformer_lm import CustomTransformerLM
from inference.text_inference import TextGeneratorInference

def evaluate_model():
    print("=" * 60)
    print("EVALUATING CUSTOM TRANSFORMER LANGUAGE MODEL")
    print("=" * 60)

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    checkpoint_path = os.path.join(AI_MODEL_ROOT, "checkpoints", "text_generator_best.pt")
    vocab_path = os.path.join(AI_MODEL_ROOT, "checkpoints", "tokenizer_vocab.json")
    corpus_path = os.path.join(AI_MODEL_ROOT, "datasets", "text_generation_corpus.txt")

    if not os.path.exists(checkpoint_path):
        print("Model checkpoint does not exist. Run training first.")
        return

    checkpoint = torch.load(checkpoint_path, map_location=device)
    tokenizer = CustomTokenizer.load_vocab(vocab_path)

    config = checkpoint["config"]
    model = CustomTransformerLM(
        vocab_size=config["vocab_size"],
        d_model=config["d_model"],
        n_heads=config["n_heads"],
        n_layers=config["n_layers"],
        d_ff=config["d_ff"],
        max_seq_len=config["max_seq_len"],
        dropout=0.0,
    ).to(device)
    model.load_state_dict(checkpoint["model_state_dict"])
    model.eval()

    with open(corpus_path, "r", encoding="utf-8") as f:
        corpus = clean_text(f.read())
    token_ids = tokenizer.encode(corpus, add_special_tokens=False)

    dataset = TextDataset(token_ids, seq_len=128)
    loader = DataLoader(dataset, batch_size=16, shuffle=False)

    total_loss = 0.0
    with torch.no_grad():
        for x, y in loader:
            x, y = x.to(device), y.to(device)
            _, loss = model(x, targets=y)
            total_loss += loss.item() * len(x)
    avg_loss = total_loss / len(dataset)
    perplexity = math.exp(min(avg_loss, 20.0))

    print(f"Overall Evaluation Loss: {avg_loss:.4f}")
    print(f"Evaluation Perplexity:  {perplexity:.4f}")

    # Qualitative Prompt Generation Tests
    inference = TextGeneratorInference(checkpoint_path, vocab_path)
    test_prompts = [
        "What is machine learning?",
        "Explain PostgreSQL.",
        "How do transformers work?",
        "Software engineering encompasses",
    ]

    print("\n--- SAMPLE AUTOREGRESSIVE GENERATIONS ---")
    for p in test_prompts:
        out = inference.generate(p, max_new_tokens=60, temperature=0.6)
        print(f"\n[Prompt]: {p}\n[Generation]: {out}")

    results = {
        "evaluation_loss": round(avg_loss, 4),
        "perplexity": round(perplexity, 4),
        "parameters": sum(p.numel() for p in model.parameters()),
        "trained_epochs": checkpoint.get("epoch", 25),
    }

    eval_out_path = os.path.join(AI_MODEL_ROOT, "evaluation", "text_model_eval_results.json")
    with open(eval_out_path, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2)
    print(f"\nEvaluation metrics written to {eval_out_path}")

if __name__ == "__main__":
    evaluate_model()

