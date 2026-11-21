"""
Inference Engine for Custom Resume Analysis & ATS Optimization.
Extracts candidate skills, education, and experience from PDF/DOCX resumes,
predicts candidate technical domain, and evaluates match against job benchmarks.
"""

import os
import sys
import re
import json
import torch
import torch.nn.functional as F

AI_MODEL_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if AI_MODEL_ROOT not in sys.path:
    sys.path.insert(0, AI_MODEL_ROOT)

from tokenization.tokenizer import CustomTokenizer
from models.resume_classifier import ResumeDomainClassifierNet
from inference.document_inference import DocumentAnalyzerInference

class ResumeAnalyzerInference:
    def __init__(self, checkpoint_path=None, vocab_path=None):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.doc_extractor = DocumentAnalyzerInference.__new__(DocumentAnalyzerInference)

        if checkpoint_path is None:
            checkpoint_path = os.path.join(AI_MODEL_ROOT, "checkpoints", "resume_classifier_best.pt")
        if vocab_path is None:
            vocab_path = os.path.join(AI_MODEL_ROOT, "checkpoints", "resume_vocab.json")

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
            "Full-Stack Web Development",
            "Machine Learning & Data Science",
            "Cloud Engineering & DevOps",
            "Cybersecurity & Infrastructure",
            "Mobile App Development",
            "Product & Engineering Management"
        ])
        self.taxonomy = checkpoint.get("taxonomy", {})
        self.role_benchmarks = checkpoint.get("role_benchmarks", {})

        self.model = ResumeDomainClassifierNet(
            vocab_size=config.get("vocab_size", self.tokenizer.vocab_size),
            embed_dim=config.get("embed_dim", 128),
            num_classes=len(self.categories),
            dropout=0.0,
        ).to(self.device)

        self.model.load_state_dict(checkpoint["model_state_dict"])
        self.model.eval()

    def extract_text(self, file_path_or_text: str) -> str:
        """Extracts text from file path or returns text directly."""
        if os.path.isfile(file_path_or_text):
            return self.doc_extractor.extract_text_from_file(file_path_or_text)
        return file_path_or_text

    def extract_skills(self, text: str) -> dict:
        """Extracts skills matching our structured technical taxonomy."""
        found_skills = {}
        all_detected = []

        lower_text = text.lower()
        for category, skills in self.taxonomy.items():
            category_found = []
            for skill in skills:
                # Use regex with word boundaries for precision
                escaped = re.escape(skill.lower())
                pattern = rf"(?<!\w){escaped}(?!\w)"
                if re.search(pattern, lower_text):
                    category_found.append(skill)
                    all_detected.append(skill)
            if category_found:
                found_skills[category] = category_found

        return {"by_category": found_skills, "all": list(dict.fromkeys(all_detected))}

    def extract_education(self, text: str) -> list:
        """Parses education degrees and academic credentials."""
        degrees = []
        patterns = [
            (r"\b(b\.?tech|bachelor of technology|b\.?e\.?|bachelor of engineering|b\.?s\.?|bachelor of science)\b", "Bachelor's Degree in Technology / Engineering"),
            (r"\b(m\.?tech|master of technology|m\.?s\.?|master of science|mca)\b", "Master's Degree in Computer Science / Technology"),
            (r"\b(ph\.?d\.?|doctor of philosophy|doctorate)\b", "Doctorate (Ph.D.)"),
            (r"\b(mba|master of business administration)\b", "Master of Business Administration (MBA)"),
            (r"\b(diploma|associate degree)\b", "Associate / Diploma")
        ]
        for pattern, label in patterns:
            if re.search(pattern, text, re.IGNORECASE):
                degrees.append(label)

        if not degrees:
            degrees.append("Relevant Technical Education / Professional Certification")
        return degrees

    def extract_experience(self, text: str) -> str:
        """Estimates candidate seniority and years of experience."""
        exp_match = re.search(r"(\d+)\+?\s*(?:years?|yrs?)(?:\s+of)?\s+experience", text, re.IGNORECASE)
        if exp_match:
            years = int(exp_match.group(1))
            if years >= 5:
                return f"Senior Level ({years}+ years experience)"
            elif years >= 2:
                return f"Mid-Level Professional ({years}+ years experience)"
            else:
                return f"Junior / Early Career ({years}+ years experience)"

        if re.search(r"\b(senior|lead|principal|staff)\b", text, re.IGNORECASE):
            return "Senior / Lead Professional"
        elif re.search(r"\b(intern|graduate|entry level|associate)\b", text, re.IGNORECASE):
            return "Entry-Level / Graduate Engineer"
        else:
            return "Mid-Level Professional"

    def analyze(self, file_path_or_text: str, file_name: str = "Resume", target_role: str = "") -> dict:
        """Performs complete resume intelligence and ATS evaluation."""
        text = self.extract_text(file_path_or_text)
        if not text or len(text.strip()) < 30:
            return {
                "error": "Resume text is too brief for analysis.",
                "candidateOverview": "Insufficient content."
            }

        # 1. Neural Domain Classification
        tokens = self.tokenizer.encode(text[:2500], add_special_tokens=False)
        if not tokens:
            tokens = [self.tokenizer.unk_token_id]

        tensor = torch.tensor(tokens, dtype=torch.long, device=self.device)
        offsets = torch.tensor([0], dtype=torch.long, device=self.device)

        with torch.no_grad():
            logits, _ = self.model(tensor, offsets)
            probs = F.softmax(logits, dim=1).squeeze(0)
            pred_idx = torch.argmax(probs).item()
            domain = self.categories[pred_idx]
            confidence = round(probs[pred_idx].item() * 100.0, 2)

        # 2. Extract Skills, Education, Experience
        skills_data = self.extract_skills(text)
        detected_skills = skills_data["all"]
        education = self.extract_education(text)
        experience_level = self.extract_experience(text)

        # 3. Target Role Matching
        resolved_role = target_role.strip() if target_role and target_role.strip() else None
        if not resolved_role:
            # Map domain to benchmark role
            domain_to_role = {
                "Full-Stack Web Development": "Full-Stack Developer",
                "Machine Learning & Data Science": "Machine Learning Engineer",
                "Cloud Engineering & DevOps": "DevOps / Cloud Engineer",
                "Cybersecurity & Infrastructure": "Backend Engineer",
                "Mobile App Development": "Frontend Engineer",
                "Product & Engineering Management": "Full-Stack Developer"
            }
            resolved_role = domain_to_role.get(domain, "Full-Stack Developer")

        # Find closest role benchmark
        benchmark_skills = self.role_benchmarks.get(resolved_role)
        if not benchmark_skills:
            # Fallback to Full-Stack Developer benchmark
            benchmark_skills = self.role_benchmarks.get("Full-Stack Developer", [
                "React", "Node.js", "JavaScript", "TypeScript", "PostgreSQL", "REST APIs", "Docker"
            ])

        matched_skills = [s for s in benchmark_skills if s.lower() in [d.lower() for d in detected_skills]]
        missing_skills = [s for s in benchmark_skills if s.lower() not in [d.lower() for d in detected_skills]]

        match_score = round((len(matched_skills) / max(len(benchmark_skills), 1)) * 100)
        ats_score = min(max(int(match_score * 0.75 + min(len(detected_skills) * 3, 25)), 40), 98)

        # 4. Formulate Improvements and Strengths
        strengths = [
            f"Proficient alignment with {domain} competencies ({confidence}% neural classification confidence).",
            f"Identified {len(detected_skills)} relevant technical competencies across taxonomy.",
            f"Education verified: {education[0]}.",
            f"Experience qualification identified: {experience_level}."
        ]

        improvements = []
        if missing_skills:
            improvements.append(f"Acquire or explicitly document missing target competencies: {', '.join(missing_skills[:5])}.")
        improvements.append("Quantify project bullet points with measurable impact metrics (e.g., latency reduction, user scale).")
        improvements.append("Ensure standard heading structure (Summary, Skills, Experience, Projects, Education) for automated ATS parsers.")
        if len(detected_skills) < 6:
            improvements.append("Expand technical skills section with databases, cloud tools, and development frameworks used in projects.")

        candidate_overview = (
            f"Candidate profile classified in '{domain}' ({confidence}% neural model confidence). "
            f"Evaluated against target role '{resolved_role}' with a {match_score}% skill alignment score "
            f"and an overall ATS readiness score of {ats_score}/100. "
            f"Detected {len(detected_skills)} technical competencies including {', '.join(detected_skills[:5]) if detected_skills else 'foundational skills'}."
        )

        return {
            "candidateOverview": candidate_overview,
            "detectedDomain": domain,
            "domainConfidence": f"{confidence}%",
            "targetRole": resolved_role,
            "matchScore": match_score,
            "atsScore": ats_score,
            "experienceLevel": experience_level,
            "education": education,
            "extractedSkills": skills_data["by_category"],
            "allSkills": detected_skills,
            "matchedSkills": matched_skills,
            "missingSkills": missing_skills,
            "strengths": strengths,
            "improvements": improvements,
            "fileName": file_name,
            "provider": "custom_ai",
            "model": "ResumeDomainClassifierNet-v1",
            "isLocal": True,
        }

if __name__ == "__main__":
    inf = ResumeAnalyzerInference()
    sample = (
        "Kunwar Kantikeya Gautam - Full-Stack Software Engineer with 3+ years experience building web applications "
        "using React, Node.js, Express, TypeScript, and PostgreSQL. Experienced in REST API design, Prisma ORM, "
        "Tailwind CSS, Docker, and GitHub Actions CI/CD workflows. B.Tech in Computer Science and Engineering."
    )
    result = inf.analyze(sample, file_name="SampleResume.pdf", target_role="Full-Stack Developer")
    print(json.dumps(result, indent=2))

