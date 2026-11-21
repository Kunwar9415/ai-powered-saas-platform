"""
Inference engine for Custom Document Analysis & Classification Model.
Extracts text from PDF/DOCX, classifies domain, and extracts salient takeaways.
"""

import os
import sys
import re
import math
import torch
import torch.nn.functional as F

AI_MODEL_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if AI_MODEL_ROOT not in sys.path:
    sys.path.insert(0, AI_MODEL_ROOT)

from tokenization.tokenizer import CustomTokenizer
from models.document_classifier import DocumentClassifierNet

class DocumentAnalyzerInference:
    def __init__(self, checkpoint_path=None, vocab_path=None):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        
        if checkpoint_path is None:
            checkpoint_path = os.path.join(AI_MODEL_ROOT, "checkpoints", "document_classifier_best.pt")
        if vocab_path is None:
            vocab_path = os.path.join(AI_MODEL_ROOT, "checkpoints", "document_vocab.json")

        self.checkpoint_path = checkpoint_path
        self.vocab_path = vocab_path

        if not os.path.exists(vocab_path):
            raise FileNotFoundError(f"Vocabulary not found at {vocab_path}. Train the model first.")
        self.tokenizer = CustomTokenizer.load_vocab(vocab_path)

        if not os.path.exists(checkpoint_path):
            raise FileNotFoundError(f"Checkpoint not found at {checkpoint_path}. Train the model first.")
        checkpoint = torch.load(checkpoint_path, map_location=self.device)

        config = checkpoint.get("config", {})
        self.categories = checkpoint.get("categories", [
            "Technology & Software Engineering",
            "Academic Research & Science",
            "Business & Product Strategy",
            "Finance & Economics",
            "Legal, Compliance & Policy",
            "Medical & Healthcare Sciences"
        ])

        self.model = DocumentClassifierNet(
            vocab_size=config.get("vocab_size", self.tokenizer.vocab_size),
            embed_dim=config.get("embed_dim", 128),
            num_classes=len(self.categories),
            dropout=0.0,
        ).to(self.device)

        self.model.load_state_dict(checkpoint["model_state_dict"])
        self.model.eval()

    def extract_text_from_file(self, file_path: str) -> str:
        """Extracts text from PDF, DOCX, or TXT file."""
        ext = os.path.splitext(file_path)[1].lower()
        if ext == ".txt":
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                return f.read()

        elif ext == ".pdf":
            text = ""
            try:
                import pypdf
                reader = pypdf.PdfReader(file_path)
                for page in reader.pages:
                    text += (page.extract_text() or "") + "\n"
            except Exception as e:
                # Fallback to fitz (pymupdf)
                try:
                    import fitz
                    doc = fitz.open(file_path)
                    for page in doc:
                        text += page.get_text() + "\n"
                except Exception as inner_e:
                    raise RuntimeError(f"Failed to extract text from PDF: {e} / {inner_e}")
            return text

        elif ext in [".docx", ".doc"]:
            try:
                import docx
                doc = docx.Document(file_path)
                text = "\n".join([p.text for p in doc.paragraphs if p.text])
                return text
            except Exception as e:
                raise RuntimeError(f"Failed to extract text from DOCX: {e}")

        else:
            raise ValueError(f"Unsupported file format: {ext}")

    def _split_into_sentences(self, text: str):
        """Splits text into meaningful sentences."""
        sentences = re.split(r'(?<=[.!?])\s+', text)
        cleaned = [s.strip() for s in sentences if len(s.strip()) > 20]
        return cleaned

    def analyze(self, text_or_path: str, file_name: str = "Document", mode: str = "summarize") -> dict:
        """Performs end-to-end document classification and intelligence analysis."""
        if os.path.isfile(text_or_path):
            file_name = os.path.basename(text_or_path)
            raw_text = self.extract_text_from_file(text_or_path)
        else:
            raw_text = text_or_path

        words = raw_text.split()
        word_count = len(words)
        if word_count < 5:
            return {
                "error": "Document contains insufficient text for analysis.",
                "wordCount": word_count
            }

        # 1. Classification
        tokens = self.tokenizer.encode(raw_text[:4000], add_special_tokens=False)
        if not tokens:
            tokens = [self.tokenizer.unk_token_id]

        text_tensor = torch.tensor(tokens, dtype=torch.long, device=self.device)
        offsets = torch.tensor([0], dtype=torch.long, device=self.device)

        with torch.no_grad():
            logits, features = self.model(text_tensor, offsets)
            probs = F.softmax(logits, dim=1).squeeze(0)
            pred_idx = torch.argmax(probs).item()
            confidence = round(probs[pred_idx].item() * 100.0, 2)
            category = self.categories[pred_idx]

        # 2. Key Takeaways & Extractive Summarization
        sentences = self._split_into_sentences(raw_text)
        if not sentences:
            sentences = [raw_text[:200]]

        # Compute TF frequency for scoring key sentences
        word_freq = {}
        for w in words:
            cw = re.sub(r'\W+', '', w.lower())
            if len(cw) > 3:
                word_freq[cw] = word_freq.get(cw, 0) + 1

        sentence_scores = []
        for s in sentences:
            s_words = [re.sub(r'\W+', '', w.lower()) for w in s.split()]
            score = sum(word_freq.get(w, 0) for w in s_words) / max(len(s_words), 1)
            sentence_scores.append((score, s))

        sentence_scores.sort(key=lambda x: x[0], reverse=True)
        top_sentences = [s for _, s in sentence_scores[:min(5, len(sentence_scores))]]

        # Top keywords
        sorted_keywords = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)
        keywords = [k for k, _ in sorted_keywords[:6]]
        if not keywords:
            keywords = ["analysis", "document", "insights"]

        # Actionable insights based on predicted category
        actionable_insights = {
            "Technology & Software Engineering": [
                "Audit microservice interfaces and database indexing for query latency optimization.",
                "Verify API endpoint rate limits and JWT authentication middleware coverage.",
                "Incorporate automated continuous integration regression test suites."
            ],
            "Academic Research & Science": [
                "Validate experimental findings against baseline empirical benchmarks.",
                "Cross-examine statistical significance and sample size confidence intervals.",
                "Document methodology parameters for peer review reproducibility."
            ],
            "Business & Product Strategy": [
                "Align quarterly product sprint roadmaps with identified customer retention goals.",
                "Review enterprise pricing structures and user onboarding conversion funnels.",
                "Schedule cross-functional stakeholder review on market differentiation."
            ],
            "Finance & Economics": [
                "Monitor operating cash flow margins and capital expenditure allocations.",
                "Conduct sensitivity analysis on interest rate volatility and debt obligations.",
                "Perform quarterly compliance reconciliation with statutory accounting standards."
            ],
            "Legal, Compliance & Policy": [
                "Audit terms of service and privacy disclosures for statutory GDPR compliance.",
                "Verify intellectual property ownership and third-party open-source license attributions.",
                "Review limitation of liability clauses and termination notice provisions."
            ],
            "Medical & Healthcare Sciences": [
                "Ensure clinical data handling conforms strictly with patient privacy mandates.",
                "Review clinical dosage protocols and adverse event monitoring procedures.",
                "Verify inclusion criteria and diagnostic modality calibration logs."
            ]
        }.get(category, [
            "Review full executive findings with relevant stakeholders.",
            "Formulate operational timeline for identified action items.",
            "Maintain audit trail of document versions and analytical findings."
        ])

        summary_body = " ".join(top_sentences[:3])
        summary = (
            f"This document ({file_name}) has been classified by our custom neural model as "
            f"'{category}' with {confidence}% confidence. "
            f"Analysis across {word_count:,} words reveals the following central takeaways: {summary_body}"
        )

        return {
            "summary": summary,
            "category": category,
            "categoryConfidence": f"{confidence}%",
            "keyPoints": top_sentences[:4],
            "keywords": keywords,
            "actionableInsights": actionable_insights,
            "sentiment": "Professional, analytical, and objective",
            "wordCount": word_count,
            "provider": "custom_ai",
            "model": "DocumentClassifierNet-v1",
            "isLocal": True,
        }

