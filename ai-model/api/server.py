"""
Python FastAPI Local AI Inference Server.
Serves our custom-trained PyTorch AI model checkpoints:
- POST /generate           -> Custom Transformer Language Model
- POST /analyze-document  -> Custom Document Analysis & Classification Model
- POST /analyze-resume    -> Custom Resume ATS & Domain Classification Model
- GET  /health            -> System and checkpoint health status
"""

import os
import sys
import shutil
import tempfile
from typing import Optional, List
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# Ensure ai-model is in Python path
API_DIR = os.path.dirname(os.path.abspath(__file__))
AI_MODEL_ROOT = os.path.dirname(API_DIR)
if AI_MODEL_ROOT not in sys.path:
    sys.path.insert(0, AI_MODEL_ROOT)

from inference.text_inference import TextGeneratorInference
from inference.document_inference import DocumentAnalyzerInference
from inference.resume_inference import ResumeAnalyzerInference

app = FastAPI(
    title="Custom Trained AI Inference Server",
    description="Locally deployed PyTorch models trained from scratch without external APIs or pretrained weights.",
    version="1.0.0",
)

# Enable CORS for internal Express backend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Inference Engines (loads trained checkpoints)
text_engine = None
doc_engine = None
resume_engine = None
engine_errors = {}

try:
    text_engine = TextGeneratorInference()
except Exception as e:
    engine_errors["text_engine"] = str(e)

try:
    doc_engine = DocumentAnalyzerInference()
except Exception as e:
    engine_errors["doc_engine"] = str(e)

try:
    resume_engine = ResumeAnalyzerInference()
except Exception as e:
    engine_errors["resume_engine"] = str(e)

# ==================== PYDANTIC SCHEMAS ====================

class GenerateRequest(BaseModel):
    prompt: str = Field(..., description="Prompt string to continue/generate from")
    systemPrompt: Optional[str] = Field(None, description="Optional system instruction")
    temperature: float = Field(0.7, ge=0.01, le=2.0)
    maxTokens: int = Field(150, ge=10, le=1000)
    topK: int = Field(40, ge=1, le=100)
    model: Optional[str] = Field("CustomTransformerLM-v1")

class AnalyzeDocumentRequest(BaseModel):
    text: Optional[str] = Field(None, description="Raw text of the document")
    filePath: Optional[str] = Field(None, description="Absolute or relative file path to PDF/DOCX")
    fileName: Optional[str] = Field("Document", description="Original filename")
    mode: Optional[str] = Field("summarize", description="Analysis mode")

class AnalyzeResumeRequest(BaseModel):
    text: Optional[str] = Field(None, description="Raw text of the resume")
    filePath: Optional[str] = Field(None, description="Absolute or relative file path to PDF/DOCX resume")
    fileName: Optional[str] = Field("Resume", description="Original filename")
    targetRole: Optional[str] = Field(None, description="Target job title / benchmark role")

# ==================== API ENDPOINTS ====================

@app.get("/health")
def health_check():
    """Health check endpoint indicating loaded model checkpoints."""
    all_ready = bool(text_engine and doc_engine and resume_engine)
    return {
        "status": "healthy" if all_ready else "degraded",
        "service": "Custom PyTorch AI Model Server",
        "version": "1.0.0",
        "modelsLoaded": all_ready,
        "models": {
            "textGeneration": {
                "name": "CustomTransformerLM-v1",
                "loaded": text_engine is not None,
                "valLoss": getattr(text_engine, "val_loss", None),
            },
            "documentAnalysis": {
                "name": "DocumentClassifierNet-v1",
                "loaded": doc_engine is not None,
                "categories": getattr(doc_engine, "categories", []),
            },
            "resumeAnalysis": {
                "name": "ResumeDomainClassifierNet-v1",
                "loaded": resume_engine is not None,
                "categories": getattr(resume_engine, "categories", []),
            },
        },
        "errors": engine_errors if engine_errors else None,
    }

@app.post("/generate")
def generate_text_endpoint(req: GenerateRequest):
    """
    POST /generate
    Autoregressively generates text using our custom-trained Transformer LM.
    """
    if not text_engine:
        raise HTTPException(status_code=503, detail="Custom text generation model is not loaded.")
    
    if not req.prompt or not req.prompt.strip():
        raise HTTPException(status_code=400, detail="Prompt text is required.")

    try:
        generated = text_engine.generate(
            prompt=req.prompt.strip(),
            max_new_tokens=req.maxTokens,
            temperature=req.temperature,
            top_k=req.topK,
        )

        approx_prompt_tokens = len(req.prompt.split())
        approx_comp_tokens = len(generated.split())

        return {
            "success": True,
            "result": generated,
            "provider": "custom_ai",
            "model": "CustomTransformerLM-v1",
            "usage": {
                "promptTokens": approx_prompt_tokens,
                "completionTokens": approx_comp_tokens,
                "totalTokens": approx_prompt_tokens + approx_comp_tokens,
            },
            "isLocal": True,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Generation failed: {str(e)}")

@app.post("/analyze-document")
def analyze_document_endpoint(req: AnalyzeDocumentRequest):
    """
    POST /analyze-document
    Analyzes document text or uploaded document file using our custom classifier and extractor.
    """
    if not doc_engine:
        raise HTTPException(status_code=503, detail="Custom document analysis model is not loaded.")

    source = req.text
    if not source and req.filePath:
        source = req.filePath

    if not source:
        raise HTTPException(status_code=400, detail="Document text or filePath is required.")

    try:
        analysis_result = doc_engine.analyze(
            text_or_path=source,
            file_name=req.fileName or "Document",
            mode=req.mode or "summarize",
        )
        return {
            "success": True,
            "analysis": analysis_result,
            "provider": "custom_ai",
            "model": "DocumentClassifierNet-v1",
            "isLocal": True,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Document analysis failed: {str(e)}")

@app.post("/analyze-resume")
def analyze_resume_endpoint(req: AnalyzeResumeRequest):
    """
    POST /analyze-resume
    Analyzes resume text or file using our custom domain classifier and ATS skill matcher.
    """
    if not resume_engine:
        raise HTTPException(status_code=503, detail="Custom resume analysis model is not loaded.")

    source = req.text
    if not source and req.filePath:
        source = req.filePath

    if not source:
        raise HTTPException(status_code=400, detail="Resume text or filePath is required.")

    try:
        analysis_result = resume_engine.analyze(
            file_path_or_text=source,
            file_name=req.fileName or "Resume",
            target_role=req.targetRole or "",
        )
        return {
            "success": True,
            "analysis": analysis_result,
            "provider": "custom_ai",
            "model": "ResumeDomainClassifierNet-v1",
            "isLocal": True,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Resume analysis failed: {str(e)}")

# CLI Runner
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api.server:app", host="0.0.0.0", port=8000, reload=False)

