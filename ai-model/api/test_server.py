"""
Unit test for FastAPI Local AI Server route handlers.
Tests /health, /generate, /analyze-document, and /analyze-resume.
"""

import sys
import os

API_DIR = os.path.dirname(os.path.abspath(__file__))
AI_MODEL_ROOT = os.path.dirname(API_DIR)
if AI_MODEL_ROOT not in sys.path:
    sys.path.insert(0, AI_MODEL_ROOT)

from api.server import (
    health_check,
    generate_text_endpoint,
    analyze_document_endpoint,
    analyze_resume_endpoint,
    GenerateRequest,
    AnalyzeDocumentRequest,
    AnalyzeResumeRequest,
)

def run_tests():
    print("1. Testing GET /health handler ...")
    health = health_check()
    print("Health Status:", health["status"])
    print("Models Loaded:", health["modelsLoaded"])
    assert health["status"] == "healthy"
    assert health["modelsLoaded"] is True

    print("\n2. Testing POST /generate handler ...")
    gen_req = GenerateRequest(prompt="What is machine learning?", maxTokens=40, temperature=0.6)
    gen_res = generate_text_endpoint(gen_req)
    print("Generated Result:", gen_res["result"])
    assert gen_res["success"] is True
    assert len(gen_res["result"]) > 0

    print("\n3. Testing POST /analyze-document handler ...")
    doc_req = AnalyzeDocumentRequest(
        text="This engineering report covers microservices architecture with Docker, Kubernetes, and PostgreSQL.",
        fileName="Architecture.pdf",
        mode="summarize"
    )
    doc_res = analyze_document_endpoint(doc_req)
    print("Document Category:", doc_res["analysis"]["category"])
    print("Confidence:", doc_res["analysis"]["categoryConfidence"])
    assert doc_res["success"] is True
    assert doc_res["analysis"]["category"] == "Technology & Software Engineering"

    print("\n4. Testing POST /analyze-resume handler ...")
    res_req = AnalyzeResumeRequest(
        text="Full-Stack Engineer with React, Node.js, Express, TypeScript, and PostgreSQL. B.Tech in CSE.",
        fileName="Resume.pdf",
        targetRole="Full-Stack Developer"
    )
    resume_res = analyze_resume_endpoint(res_req)
    print("Resume Domain:", resume_res["analysis"]["detectedDomain"])
    print("ATS Score:", resume_res["analysis"]["atsScore"])
    print("Matched Skills:", resume_res["analysis"]["matchedSkills"])
    assert resume_res["success"] is True
    assert resume_res["analysis"]["detectedDomain"] == "Full-Stack Web Development"

    print("\nALL 4 FASTAPI ROUTE HANDLERS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    run_tests()
