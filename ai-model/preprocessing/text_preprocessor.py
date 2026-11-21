"""
Text preprocessing and dataset loader for PyTorch models.
Handles cleaning, tensor creation, causal padding, and batching.
"""

import torch
from torch.utils.data import Dataset
import re

class TextDataset(Dataset):
    """
    Autoregressive Language Modeling Dataset.
    Chunks token stream into fixed context windows for training.
    """
    def __init__(self, token_ids, seq_len=128):
        self.seq_len = seq_len
        self.inputs = []
        self.targets = []
        
        # Slide window across sequence
        step = max(seq_len // 2, 1)
        for i in range(0, len(token_ids) - seq_len, step):
            self.inputs.append(token_ids[i : i + seq_len])
            self.targets.append(token_ids[i + 1 : i + seq_len + 1])

        if len(self.inputs) == 0 and len(token_ids) > 1:
            pad_needed = seq_len - (len(token_ids) - 1)
            inp = token_ids[:-1] + [0] * pad_needed
            tgt = token_ids[1:] + [0] * pad_needed
            self.inputs.append(inp)
            self.targets.append(tgt)

    def __len__(self):
        return len(self.inputs)

    def __getitem__(self, idx):
        return (
            torch.tensor(self.inputs[idx], dtype=torch.long),
            torch.tensor(self.targets[idx], dtype=torch.long),
        )

def clean_text(text: str) -> str:
    """Standardizes whitespace and removes anomalous control characters."""
    if not text:
        return ""
    text = re.sub(r'[\r\t]', ' ', text)
    text = re.sub(r' +', ' ', text)
    return text.strip()

