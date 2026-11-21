import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Cpu, CheckCircle2, Server, Shield, Layers, HardDrive, AlertCircle, RefreshCw, FileText, UserCheck, MessageSquare } from 'lucide-react';
import aiService from '../services/ai.service';
import LoadingSpinner from '../components/LoadingSpinner';

export const Settings = () => {
  const [providers, setProviders] = useState([]);
  const [localStatus, setLocalStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStatus = async () => {
    try {
      setRefreshing(true);
      const [provRes, statusRes] = await Promise.all([
        aiService.getProviders().catch(() => ({ data: { providers: [] } })),
        aiService.getStatus().catch(() => ({ data: { online: false, error: 'Cannot connect to backend' } })),
      ]);

      if (provRes.data?.providers) {
        setProviders(provRes.data.providers);
      }
      if (statusRes.data) {
        setLocalStatus(statusRes.data);
      }
    } catch (err) {
      console.error('Failed to fetch provider status:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-xs font-semibold mb-2">
            <SettingsIcon className="w-3.5 h-3.5" />
            Custom AI Model Architecture
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            AI Engine & Local Server Settings
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Inspect our custom-trained PyTorch AI models, Python FastAPI inference server status, and full-stack integration.
          </p>
        </div>

        <button
          onClick={fetchStatus}
          disabled={refreshing}
          className="px-3 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-purple-600' : ''}`} />
          <span>Refresh Status</span>
        </button>
      </div>

      {/* Custom AI Inference Server Telemetry Box */}
      <div className="chat-card p-6 border-purple-200 bg-gradient-to-br from-white via-purple-50/20 to-indigo-50/20 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-purple-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-600/20">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Custom AI Inference Server (Python FastAPI)</h3>
              <p className="text-[11px] text-slate-500 font-mono">
                Endpoint: {localStatus?.baseUrl || 'http://localhost:8000'} • Service: {localStatus?.service || 'Custom PyTorch Server'}
              </p>
            </div>
          </div>

          {loading ? (
            <span className="text-xs text-slate-500">Pinging...</span>
          ) : localStatus?.online ? (
            <span className="flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              FastAPI Server Online & Models Loaded
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 shadow-sm">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              FastAPI Server Standby (Run python ai-model/api/server.py)
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
          <div className="p-3 bg-white/80 rounded-xl border border-slate-200/80 shadow-sm">
            <span className="text-slate-500 block mb-1">Inference Backend</span>
            <strong className="text-slate-900 font-mono">Python 3.12 + FastAPI + PyTorch</strong>
          </div>
          <div className="p-3 bg-white/80 rounded-xl border border-slate-200/80 shadow-sm">
            <span className="text-slate-500 block mb-1">Text Generation Model</span>
            <strong className="text-purple-700 font-mono">CustomTransformerLM-v1</strong>
          </div>
          <div className="p-3 bg-white/80 rounded-xl border border-slate-200/80 shadow-sm">
            <span className="text-slate-500 block mb-1">Weights Initialization</span>
            <strong className="text-emerald-700 font-mono">Randomly Initialized & Trained</strong>
          </div>
        </div>

        {/* Custom Trained Models Cards */}
        <div className="pt-2">
          <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-2">
            Our Custom Trained AI Models:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-white rounded-xl border border-purple-200 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <MessageSquare className="w-4 h-4 text-purple-600" />
                <span className="font-bold text-slate-900">Text Generation Model</span>
              </div>
              <p className="text-[11px] text-slate-600">Decoder-only causal transformer (3.4M params) with self-attention and positional embeddings.</p>
              <span className="inline-block mt-2 text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                checkpoint: text_generator_best.pt
              </span>
            </div>

            <div className="p-3 bg-white rounded-xl border border-indigo-200 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <FileText className="w-4 h-4 text-indigo-600" />
                <span className="font-bold text-slate-900">Document Classifier Net</span>
              </div>
              <p className="text-[11px] text-slate-600">Multi-class neural classifier & extractive sentence ranker across 6 domain categories.</p>
              <span className="inline-block mt-2 text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                checkpoint: document_classifier_best.pt
              </span>
            </div>

            <div className="p-3 bg-white rounded-xl border border-emerald-200 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <UserCheck className="w-4 h-4 text-emerald-600" />
                <span className="font-bold text-slate-900">Resume Domain Classifier</span>
              </div>
              <p className="text-[11px] text-slate-600">Neural domain classification & ATS benchmark skill matching engine.</p>
              <span className="inline-block mt-2 text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                checkpoint: resume_classifier_best.pt
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Four-Tier Architecture Explanation Card */}
      <div className="chat-card p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Layers className="w-4 h-4 text-purple-600" />
          Layered Architecture & AI Service Communication Flow
        </h3>
        <p className="text-xs text-slate-700 leading-relaxed">
          The SaaS application separates concerns cleanly across four specialized tiers. The React front-end communicates strictly through the Node.js backend, which proxies requests to the Python FastAPI AI service hosting our custom model checkpoints.
        </p>

        {/* Visual Architecture Flow Diagram */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs text-purple-200 overflow-x-auto leading-relaxed shadow-sm">
          React Frontend ➔ Node.js + Express.js ➔ Python FastAPI Service (http://localhost:8000) ➔ Our Own Trained AI Models ➔ Generated Results ➔ PostgreSQL ➔ React Frontend
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2 text-xs text-slate-600">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <strong className="text-slate-900 block mb-1">1. Presentation Layer</strong>
            React.js, Tailwind CSS, Vite, Lucide icons, responsive interactive dashboards.
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <strong className="text-slate-900 block mb-1">2. Application Layer</strong>
            Express.js REST APIs, JWT authentication, rate limiting, request validation, PostgreSQL history.
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <strong className="text-slate-900 block mb-1">3. Custom AI Layer</strong>
            Python, PyTorch, NumPy, Scikit-learn, FastAPI service hosting our trained checkpoints.
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <strong className="text-slate-900 block mb-1">4. Data Layer</strong>
            PostgreSQL relational vault storing users, prompts, generated outputs, uploaded documents, and history.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
