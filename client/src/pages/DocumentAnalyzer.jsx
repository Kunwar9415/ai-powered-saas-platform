import React, { useState } from 'react';
import { FileText, Sparkles, CheckCircle2, Tag, Compass, ArrowRight, Server } from 'lucide-react';
import confetti from 'canvas-confetti';
import documentService from '../services/document.service';
import { useToast } from '../context/ToastContext';
import FileUpload from '../components/FileUpload';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

export const DocumentAnalyzer = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [analysisMode, setAnalysisMode] = useState('summarize');
  const [provider, setProvider] = useState('ollama');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);

  const toast = useToast();

  const modes = [
    { id: 'summarize', label: 'Executive Summary', desc: 'Concise summary of core findings' },
    { id: 'keypoints', label: 'Key Takeaways', desc: 'Actionable bullet points & conclusions' },
    { id: 'keywords', label: 'Keywords & Entities', desc: 'Nomenclature and key topic tags' },
    { id: 'comprehensive', label: 'Full Audit', desc: 'Complete breakdown with tone rating' },
  ];

  const handleFileAnalysis = async () => {
    if (!selectedFile) {
      toast.warning('Please select or drag-and-drop a document file first.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      toast.info('Extracting document contents...');
      const uploadRes = await documentService.uploadDocument(selectedFile);
      const doc = uploadRes.data?.document;

      if (!doc || !doc.id) {
        throw new Error('Failed to retrieve uploaded document record.');
      }

      toast.info('Analyzing with local Ollama engine (gpt-oss:20b)...');
      const analyzeRes = await documentService.analyzeDocument({
        documentId: doc.id,
        mode: analysisMode,
        provider,
      });

      if (analyzeRes.data?.analysis) {
        setAnalysisResult(analyzeRes.data.analysis);
        toast.success('Document analyzed successfully via local AI model!');
        confetti({ particleCount: 50, spread: 60 });
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Document analysis failed.';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Document Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Upload PDF, DOCX, or TXT documents for instant AI summarization and entity extraction via local Ollama.
          </p>
        </div>

        {/* Local Engine Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-xl border border-purple-200 text-xs font-semibold shadow-sm self-start sm:self-auto">
          <Server className="w-3.5 h-3.5 text-purple-600" />
          <span>Local Ollama (gpt-oss:20b)</span>
        </div>
      </div>

      {/* Upload and Depth Controls */}
      <div className="chat-card p-6 space-y-6">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
            1. Select Document
          </label>
          <FileUpload
            onFileSelect={(file) => setSelectedFile(file)}
            acceptedFormats={['.pdf', '.docx', '.txt', '.doc']}
            title="Drop Document File Here"
            description="Supports PDF, Word DOCX, and TXT files up to 20MB"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
            2. Choose Analysis Depth
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {modes.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setAnalysisMode(m.id)}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  analysisMode === m.id
                    ? 'border-purple-600 bg-purple-50/50 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="text-xs font-bold text-slate-900">{m.label}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">{m.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleFileAnalysis}
          disabled={isLoading || !selectedFile}
          className="w-full py-3.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-purple-600/20"
        >
          {isLoading ? (
            <>
              <Sparkles className="w-4 h-4 animate-spin" />
              <span>Analyzing Document via Local Ollama...</span>
            </>
          ) : (
            <>
              <span>Run Local Document Intelligence</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

      {errorMsg && <ErrorMessage message={errorMsg} />}

      {/* Analysis Results Display */}
      {analysisResult && (
        <div className="chat-card p-6 space-y-6 animate-in fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              Document Intelligence Report
            </h3>
            <span className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
              Model: {analysisResult.model || 'gpt-oss:20b'} (Local)
            </span>
          </div>

          {/* Executive Summary */}
          {analysisResult.summary && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Executive Summary</h4>
              <p className="text-xs sm:text-sm text-slate-800 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200 whitespace-pre-line">
                {analysisResult.summary}
              </p>
            </div>
          )}

          {/* Key Takeaways */}
          {analysisResult.keyPoints && analysisResult.keyPoints.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-purple-600" />
                Key Takeaways
              </h4>
              <ul className="space-y-2">
                {analysisResult.keyPoints.map((pt, i) => (
                  <li key={i} className="text-xs sm:text-sm text-slate-700 flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-600 mt-2 shrink-0" />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Actionable Insights */}
          {analysisResult.actionableInsights && analysisResult.actionableInsights.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Actionable Next Steps</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {analysisResult.actionableInsights.map((ins, i) => (
                  <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700">
                    {ins}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Keywords / Entities */}
          {analysisResult.keywords && analysisResult.keywords.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-purple-600" />
                Extracted Entities & Keywords
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {analysisResult.keywords.map((kw, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 border border-purple-200 text-xs font-medium"
                  >
                    #{kw}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DocumentAnalyzer;
