"""
Custom Tokenizer built from scratch.
Implements vocabulary construction, special tokens, encoding, decoding,
and persistence without external dependencies.
"""

import json
import re
import os

class CustomTokenizer:
    PAD_TOKEN = "<pad>"
    UNK_TOKEN = "<unk>"
    BOS_TOKEN = "<bos>"
    EOS_TOKEN = "<eos>"

    def __init__(self, vocab=None):
        self.special_tokens = [
            self.PAD_TOKEN,
            self.UNK_TOKEN,
            self.BOS_TOKEN,
            self.EOS_TOKEN
        ]
        if vocab is not None:
            self.token2id = vocab
            self.id2token = {v: k for k, v in vocab.items()}
        else:
            self.token2id = {}
            self.id2token = {}

    @property
    def pad_token_id(self):
        return self.token2id.get(self.PAD_TOKEN, 0)

    @property
    def unk_token_id(self):
        return self.token2id.get(self.UNK_TOKEN, 1)

    @property
    def bos_token_id(self):
        return self.token2id.get(self.BOS_TOKEN, 2)

    @property
    def eos_token_id(self):
        return self.token2id.get(self.EOS_TOKEN, 3)

    @property
    def vocab_size(self):
        return len(self.token2id)

    def _tokenize_text(self, text):
        """Splits text into words, numbers, and punctuation symbols."""
        if not text:
            return []
        pattern = r"\w+|[^\w\s]"
        return re.findall(pattern, text.lower())

    def build_vocab(self, texts, min_freq=1, max_vocab_size=4000):
        """Constructs vocabulary from a list or iterator of text strings."""
        token_freq = {}
        for text in texts:
            tokens = self._tokenize_text(text)
            for token in tokens:
                token_freq[token] = token_freq.get(token, 0) + 1

        # Sort tokens by frequency
        sorted_tokens = sorted(token_freq.items(), key=lambda x: x[1], reverse=True)
        
        # Populate vocabulary with special tokens first
        self.token2id = {}
        for idx, token in enumerate(self.special_tokens):
            self.token2id[token] = idx

        for token, freq in sorted_tokens:
            if freq < min_freq:
                continue
            if len(self.token2id) >= max_vocab_size:
                break
            if token not in self.token2id:
                self.token2id[token] = len(self.token2id)

        self.id2token = {v: k for k, v in self.token2id.items()}
        print(f"CustomTokenizer: Vocabulary built with {len(self.token2id)} tokens.")
        return self

    def encode(self, text, add_special_tokens=True):
        """Converts raw text string into token IDs."""
        tokens = self._tokenize_text(text)
        ids = []
        if add_special_tokens:
            ids.append(self.bos_token_id)
        for t in tokens:
            ids.append(self.token2id.get(t, self.unk_token_id))
        if add_special_tokens:
            ids.append(self.eos_token_id)
        return ids

    def decode(self, token_ids, skip_special_tokens=True):
        """Converts token IDs back to a human-readable text string."""
        tokens = []
        for idx in token_ids:
            if idx in self.id2token:
                tok = self.id2token[idx]
                if skip_special_tokens and tok in self.special_tokens:
                    continue
                tokens.append(tok)
            else:
                if not skip_special_tokens:
                    tokens.append(self.UNK_TOKEN)

        text = ""
        for i, tok in enumerate(tokens):
            if re.match(r"[^\w\s]", tok):
                text += tok
            else:
                if i > 0 and not text.endswith(" "):
                    text += " " + tok
                else:
                    text += tok
        return text.strip()

    def save_vocab(self, filepath):
        """Persists vocabulary to JSON file."""
        os.makedirs(os.path.dirname(os.path.abspath(filepath)), exist_ok=True)
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(self.token2id, f, indent=2, ensure_ascii=False)
        print(f"Tokenizer vocabulary saved to {filepath}")

    @classmethod
    def load_vocab(cls, filepath):
        """Loads vocabulary from JSON file."""
        with open(filepath, 'r', encoding='utf-8') as f:
            vocab = json.load(f)
        return cls(vocab=vocab)

