"""
Training Pipeline for Custom Transformer Language Model.
Trains from scratch with random weight initialization on custom corpus.
Logs training and validation loss, and saves best model checkpoints.
"""

import os
import sys
import json
import time
import torch
from torch.utils.data import DataLoader, random_split

# Add root of ai-model to python path
AI_MODEL_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if AI_MODEL_ROOT not in sys.path:
    sys.path.insert(0, AI_MODEL_ROOT)

from tokenization.tokenizer import CustomTokenizer
from preprocessing.text_preprocessor import TextDataset, clean_text
from models.transformer_lm import CustomTransformerLM

def main():
    print("=" * 60)
    print("STAGE 4: TRAINING CUSTOM TEXT GENERATION TRANSFORMER MODEL")
    print("=" * 60)

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Executing on hardware device: {device}")

    # Paths
    corpus_path = os.path.join(AI_MODEL_ROOT, "datasets", "text_generation_corpus.txt")
    vocab_path = os.path.join(AI_MODEL_ROOT, "checkpoints", "tokenizer_vocab.json")
    checkpoint_path = os.path.join(AI_MODEL_ROOT, "checkpoints", "text_generator_best.pt")
    metrics_path = os.path.join(AI_MODEL_ROOT, "checkpoints", "text_generator_metrics.json")
    os.makedirs(os.path.dirname(checkpoint_path), exist_ok=True)

    # 1. Load Text Corpus
    with open(corpus_path, "r", encoding="utf-8") as f:
        corpus_text = clean_text(f.read())
    print(f"Loaded training corpus: {len(corpus_text)} characters")

    # 2. Tokenizer & Vocabulary Creation
    tokenizer = CustomTokenizer()
    tokenizer.build_vocab([corpus_text], min_freq=1, max_vocab_size=3000)
    tokenizer.save_vocab(vocab_path)
    vocab_size = tokenizer.vocab_size
    print(f"Constructed vocabulary size: {vocab_size}")

    # Encode full corpus
    token_ids = tokenizer.encode(corpus_text, add_special_tokens=False)
    print(f"Total encoded tokens: {len(token_ids)}")

    # 3. Create Dataset and Train/Val Split
    seq_len = 128
    dataset = TextDataset(token_ids, seq_len=seq_len)
    total_samples = len(dataset)
    val_size = max(int(total_samples * 0.1), 1)
    train_size = total_samples - val_size
    train_dataset, val_dataset = random_split(
        dataset, [train_size, val_size], generator=torch.Generator().manual_seed(42)
    )

    batch_size = 16
    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True)
    val_loader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False)
    print(f"Dataset splits: {train_size} train sequences, {val_size} validation sequences")

    # 4. Instantiate Model (Random weight initialization)
    model = CustomTransformerLM(
        vocab_size=vocab_size,
        d_model=256,
        n_heads=4,
        n_layers=4,
        d_ff=1024,
        max_seq_len=256,
        dropout=0.1,
    ).to(device)

    total_params = sum(p.numel() for p in model.parameters() if p.requires_grad)
    print(f"Custom Transformer Model initialized with {total_params:,} trainable parameters.")
    print("All weights initialized randomly. Zero pretrained weights used.")

    # 5. Optimizer and Hyperparameters
    epochs = 25
    optimizer = torch.optim.AdamW(model.parameters(), lr=4e-4, weight_decay=0.01)

    best_val_loss = float("inf")
    history = {"train_loss": [], "val_loss": [], "epochs": []}

    start_time = time.time()
    for epoch in range(1, epochs + 1):
        # Training loop
        model.train()
        train_loss = 0.0
        for x, y in train_loader:
            x, y = x.to(device), y.to(device)
            optimizer.zero_grad()
            _, loss = model(x, targets=y)
            loss.backward()
            torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
            optimizer.step()
            train_loss += loss.item() * len(x)
        train_loss /= len(train_dataset)

        # Validation loop
        model.eval()
        val_loss = 0.0
        with torch.no_grad():
            for x, y in val_loader:
                x, y = x.to(device), y.to(device)
                _, loss = model(x, targets=y)
                val_loss += loss.item() * len(x)
        val_loss /= len(val_dataset)

        history["epochs"].append(epoch)
        history["train_loss"].append(round(train_loss, 4))
        history["val_loss"].append(round(val_loss, 4))

        if epoch % 5 == 0 or epoch == epochs:
            print(f"Epoch {epoch:2d}/{epochs:2d} | Train Loss: {train_loss:.4f} | Val Loss: {val_loss:.4f}")

        # Checkpointing
        if val_loss < best_val_loss:
            best_val_loss = val_loss
            torch.save(
                {
                    "epoch": epoch,
                    "model_state_dict": model.state_dict(),
                    "optimizer_state_dict": optimizer.state_dict(),
                    "val_loss": val_loss,
                    "train_loss": train_loss,
                    "config": model.config,
                },
                checkpoint_path,
            )

    elapsed = time.time() - start_time
    print(f"Training completed in {elapsed:.2f} seconds. Best Val Loss: {best_val_loss:.4f}")
    print(f"Best checkpoint saved at: {checkpoint_path}")

    with open(metrics_path, "w", encoding="utf-8") as f:
        json.dump(history, f, indent=2)

    return checkpoint_path

if __name__ == "__main__":
    main()

