import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Cpu, CheckCircle2, Server, Shield, Layers, HardDrive, AlertCircle, RefreshCw } from 'lucide-react';
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
            Local Inference Architecture
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            AI Engine & Local Server Settings
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Inspect the on-premise Ollama runtime status, local model weights, and the Three-Tier Web Architecture.
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

      {/* Local Ollama Runtime Telemetry Box */}
      <div className="chat-card p-6 border-purple-200 bg-gradient-to-br from-white via-purple-50/20 to-indigo-50/20 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-purple-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-600/20">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Local AI Inference Server (Ollama)</h3>
              <p className="text-[11px] text-slate-500 font-mono">
                Endpoint: {localStatus?.baseUrl || 'http://localhost:11434'} • Model: {localStatus?.configuredModel || 'gpt-oss:20b'}
              </p>
            </div>
          </div>

          {loading ? (
            <span className="text-xs text-slate-500">Pinging...</span>
          ) : localStatus?.online ? (
            <span className="flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Runtime Active & Online
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 shadow-sm">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              Ollama Server Standby
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
          <div className="p-3 bg-white/80 rounded-xl border border-slate-200/80 shadow-sm">
            <span className="text-slate-500 block mb-1">Inference Engine</span>
            <strong className="text-slate-900 font-mono">Ollama HTTP Daemon</strong>
          </div>
          <div className="p-3 bg-white/80 rounded-xl border border-slate-200/80 shadow-sm">
            <span className="text-slate-500 block mb-1">Configured Model</span>
            <strong className="text-purple-700 font-mono">{localStatus?.configuredModel || 'gpt-oss:20b'}</strong>
          </div>
          <div className="p-3 bg-white/80 rounded-xl border border-slate-200/80 shadow-sm">
            <span className="text-slate-500 block mb-1">Local Model Status</span>
            <strong className={localStatus?.isModelInstalled ? 'text-emerald-700 font-mono' : 'text-slate-700 font-mono'}>
              {localStatus?.isModelInstalled ? 'Installed Locally' : 'Configured / Ready to Pull'}
            </strong>
          </div>
        </div>

        {localStatus?.installedModels && localStatus.installedModels.length > 0 && (
          <div className="pt-2">
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
              Locally Available Models on Host Machine:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {localStatus.installedModels.map((m, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-mono text-purple-700 shadow-sm"
                >
                  {m}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Provider Status Grid */}
      <div>
        <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
          <Cpu className="w-4 h-4 text-purple-600" />
          Configured Architecture Layers
        </h3>

        {loading ? (
          <LoadingSpinner message="Checking local server endpoints..." size="md" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="chat-card p-5 border-purple-300 bg-purple-50/40 flex flex-col justify-between gap-3">
              <div>
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-purple-600" />
                    Local Ollama Inference Layer
                  </h4>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 border border-purple-200">
                    Primary Engine
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Autoregressive open-weight language model running on your local server. Direct Node.js Express integration with zero external API dependencies.
                </p>
              </div>
              <div className="pt-2 border-t border-purple-200 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                <span>Model: gpt-oss:20b</span>
                <span className="text-purple-600">OLLAMA_BASE_URL</span>
              </div>
            </div>

            <div className="chat-card p-5 border-slate-200 bg-white flex flex-col justify-between gap-3">
              <div>
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-indigo-600" />
                    Modular Vision Pipeline
                  </h4>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                    Decoupled Vision
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Modular image synthesis architecture separated cleanly from the text LLM, allowing local diffusion models or vision adapters to be plugged in.
                </p>
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                <span>Pipeline: generative-vision-v2</span>
                <span className="text-slate-400">imageAIService.js</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Three-Tier Architecture Explanation Card */}
      <div className="chat-card p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Layers className="w-4 h-4 text-purple-600" />
          Three-Tier Web Architecture with Local Generative AI Inference Layer
        </h3>
        <p className="text-xs text-slate-700 leading-relaxed">
          The SaaS application is architected across four distinct layers to ensure separation of concerns, complete data privacy, and on-premise execution.
        </p>

        {/* Visual Architecture Flow Diagram */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs text-purple-200 overflow-x-auto leading-relaxed shadow-sm">
          User ➔ React.js + Tailwind CSS ➔ Node.js + Express.js ➔ Local AI Service ➔ Ollama (http://localhost:11434) ➔ gpt-oss-20b ➔ PostgreSQL ➔ React.js
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2 text-xs text-slate-600">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <strong className="text-slate-900 block mb-1">1. Presentation Layer</strong>
            React.js, Tailwind CSS, Lucide icons, and responsive UI components.
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <strong className="text-slate-900 block mb-1">2. Application Layer</strong>
            Express.js REST APIs, JWT authentication, validation, and file parsing.
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <strong className="text-slate-900 block mb-1">3. Local AI Layer</strong>
            Ollama daemon executing open-weight model <code className="text-purple-700 font-bold">gpt-oss:20b</code>.
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <strong className="text-slate-900 block mb-1">4. Data Layer</strong>
            PostgreSQL relational vault storing users, generations, documents, and history.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
