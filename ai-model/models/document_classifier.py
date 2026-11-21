"""
Custom PyTorch Neural Document Classification & Analysis Model.
Implements word embedding, dense feature extraction, dropout,
and multi-class prediction heads for document categorisation.
"""

import math
import torch
import torch.nn as nn
import torch.nn.functional as F

class DocumentClassifierNet(nn.Module):
    """
    Neural Document Classifier trained from scratch.
    Processes token sequences through embedding, pooling, and multi-layer perceptron.
    """
    def __init__(self, vocab_size: int, embed_dim: int = 128, num_classes: int = 6, dropout: float = 0.2):
        super().__init__()
        self.config = {
            "vocab_size": vocab_size,
            "embed_dim": embed_dim,
            "num_classes": num_classes,
            "dropout": dropout,
        }
        # Embedding with mean pooling
        self.embedding = nn.EmbeddingBag(vocab_size, embed_dim, mode="mean", sparse=False)
        self.fc1 = nn.Linear(embed_dim, 128)
        self.bn1 = nn.LayerNorm(128)
        self.relu = nn.ReLU()
        self.dropout = nn.Dropout(dropout)
        self.fc2 = nn.Linear(128, 64)
        self.bn2 = nn.LayerNorm(64)
        self.classifier = nn.Linear(64, num_classes)

        self._init_weights()

    def _init_weights(self):
        """Random weight initialization."""
        for m in self.modules():
            if isinstance(m, nn.Linear):
                nn.init.kaiming_normal_(m.weight, nonlinearity="relu")
                if m.bias is not None:
                    nn.init.zeros_(m.bias)
            elif isinstance(m, nn.EmbeddingBag):
                nn.init.uniform_(m.weight, -0.1, 0.1)

    def forward(self, text_indices, offsets=None):
        embedded = self.embedding(text_indices, offsets)
        x = self.dropout(self.relu(self.bn1(self.fc1(embedded))))
        features = self.relu(self.bn2(self.fc2(x)))
        logits = self.classifier(features)
        return logits, features

