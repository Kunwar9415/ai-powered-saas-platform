# AI Datasets Documentation & Licensing

This document outlines the datasets collected, curated, and utilized for training our custom AI models from scratch within the SaaS platform.

---

## 1. Text Generation Corpus (`text_generation_corpus.txt`)
- **Purpose**: Pretraining and fine-tuning our custom decoder-only Transformer Language Model (`CustomTransformerLM`) for conversational reasoning, technical explanations, and software development queries.
- **Source**: Curated from open-licensed technical knowledge texts, standard public domain technical definitions, and open-source documentation under permissive licenses (MIT, Apache-2.0, Creative Commons CC-BY 4.0 / CC0 Public Domain).
- **Format**: Plain text (`.txt`), utf-8 encoded.
- **Licensing**: Permissive Open Access (MIT / CC-BY 4.0 / Public Domain).
- **Processing**: Tokenized using our custom Byte-Pair / Subword Tokenizer into a compact vocabulary with special tokens (`<pad>`, `<unk>`, `<bos>`, `<eos>`).

---

## 2. Document Analysis & Classification Dataset (`document_classification.csv`)
- **Purpose**: Training our custom Neural Document Classifier (`DocumentClassifierNet`) to categorize document types, assess tone/sentiment, and rank sentence importance for extractive summarization.
- **Categories**:
  1. `Technology & Software Engineering`
  2. `Academic Research & Science`
  3. `Business & Product Strategy`
  4. `Finance & Economics`
  5. `Legal, Compliance & Policy`
  6. `Medical & Healthcare Sciences`
- **Source**: Labeled domain corpus adapted from openly licensed public benchmarks and educational datasets (CC-BY 4.0 / Open Data Commons).
- **Splits**: 80% Training, 10% Validation, 10% Test.
- **Licensing**: Open Data Commons Public Domain Dedication (CC0 1.0) / CC-BY 4.0.

---

## 3. Resume Analysis & Job Skill Matching Dataset (`resume_skills_dataset.json`)
- **Purpose**: Training our custom Resume Domain Classifier (`ResumeDomainClassifierNet`) and powering the ATS skill matching and scoring engine.
- **Domains**:
  - Full-Stack Web Development
  - Machine Learning & Data Science
  - Cloud Engineering & DevOps
  - Cybersecurity & Systems
  - Mobile Application Development
  - Product & Engineering Leadership
- **Skill Taxonomy**: Structured technical taxonomy spanning programming languages, frameworks, cloud platforms, databases, AI/ML tools, and software engineering methodologies.
- **Licensing**: CC-BY 4.0 Open Educational Resource.

