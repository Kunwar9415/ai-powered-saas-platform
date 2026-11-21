"""
Inference engine for Custom Transformer Language Model.
Loads our trained checkpoint and generates text autoregressively.
"""

import os
import sys
import torch

AI_MODEL_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if AI_MODEL_ROOT not in sys.path:
    sys.path.insert(0, AI_MODEL_ROOT)

from tokenization.tokenizer import CustomTokenizer
from models.transformer_lm import CustomTransformerLM

class TextGeneratorInference:
    def __init__(self, checkpoint_path=None, vocab_path=None):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        
        if checkpoint_path is None:
            checkpoint_path = os.path.join(AI_MODEL_ROOT, "checkpoints", "text_generator_best.pt")
        if vocab_path is None:
            vocab_path = os.path.join(AI_MODEL_ROOT, "checkpoints", "tokenizer_vocab.json")

        self.checkpoint_path = checkpoint_path
        self.vocab_path = vocab_path

        # 1. Load Tokenizer
        if not os.path.exists(vocab_path):
            raise FileNotFoundError(f"Vocabulary not found at {vocab_path}. Please train the model first.")
        self.tokenizer = CustomTokenizer.load_vocab(vocab_path)

        # 2. Load Checkpoint
        if not os.path.exists(checkpoint_path):
            raise FileNotFoundError(f"Checkpoint not found at {checkpoint_path}. Please train the model first.")
        checkpoint = torch.load(checkpoint_path, map_location=self.device)

        # 3. Instantiate Model
        config = checkpoint.get("config", {})
        self.model = CustomTransformerLM(
            vocab_size=config.get("vocab_size", self.tokenizer.vocab_size),
            d_model=config.get("d_model", 256),
            n_heads=config.get("n_heads", 4),
            n_layers=config.get("n_layers", 4),
            d_ff=config.get("d_ff", 1024),
            max_seq_len=config.get("max_seq_len", 256),
            dropout=config.get("dropout", 0.0),
        ).to(self.device)

        self.model.load_state_dict(checkpoint["model_state_dict"])
        self.model.eval()
        self.val_loss = checkpoint.get("val_loss", None)

    def generate(self, prompt: str, max_new_tokens: int = 120, temperature: float = 0.7, top_k: int = 40) -> str:
        """Autoregressive text generation given a prompt."""
        if not prompt or not prompt.strip():
            return "Please provide a valid prompt."

        prompt_tokens = self.tokenizer.encode(prompt.strip(), add_special_tokens=False)
        if not prompt_tokens:
            prompt_tokens = [self.tokenizer.bos_token_id]

        input_tensor = torch.tensor([prompt_tokens], dtype=torch.long, device=self.device)

        generated_ids = self.model.generate(
            input_tensor,
            max_new_tokens=max_new_tokens,
            temperature=max(temperature, 0.1),
            top_k=top_k,
            eos_token_id=self.tokenizer.eos_token_id,
        )

        output_tokens = generated_ids[0].tolist()
        generated_text = self.tokenizer.decode(output_tokens, skip_special_tokens=True)
        return generated_text

if __name__ == "__main__":
    inference = TextGeneratorInference()
    sample_prompt = "What is machine learning?"
    print(f"Prompt: {sample_prompt}")
    output = inference.generate(sample_prompt, max_new_tokens=80, temperature=0.6)
    print(f"Generated Result:\n{output}")

