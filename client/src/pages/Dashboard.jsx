import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  Image as ImageIcon,
  FileText,
  UserCheck,
  BookOpen,
  Sparkles,
  ArrowRight,
  Server,
  Send,
  Upload,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import historyService from '../services/history.service';
import LoadingSpinner from '../components/LoadingSpinner';

export const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [prompt, setPrompt] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('ollama');
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await historyService.getDashboardStats();
        if (res.data) {
          setStatsData(res.data);
        }
      } catch (error) {
        console.error('Failed to load dashboard metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const handleQuickSubmit = (e) => {
    e?.preventDefault();
    if (!prompt.trim()) return;

    navigate('/text-generator', { state: { prefilledPrompt: prompt.trim(), prefilledProvider: selectedProvider } });
  };

  const capabilities = [
    {
      title: 'Chat & Language Reasoning',
      desc: 'Local code synthesis, debugging, and conversational logic via Ollama (gpt-oss:20b).',
      icon: MessageSquare,
      path: '/text-generator',
      badge: 'Local Ollama',
      color: 'bg-purple-50 text-purple-700',
    },
    {
      title: 'Generative Image Studio',
      desc: 'Modular visual synthesizer producing concept art and renders in HD square formats.',
      icon: ImageIcon,
      path: '/image-generator',
      badge: 'Vision Suite',
      color: 'bg-pink-50 text-pink-700',
    },
    {
      title: 'Document Intelligence',
      desc: 'Summarize, query, and extract insights from research PDFs & DOCX papers locally.',
      icon: FileText,
      path: '/document-analyzer',
      badge: 'Local PDF / DOCX',
      color: 'bg-indigo-50 text-indigo-700',
    },
    {
      title: 'Resume ATS Optimizer',
      desc: 'Analyze formatting, match keywords, and identify competency gaps locally.',
      icon: UserCheck,
      path: '/resume-analyzer',
      badge: 'Local ATS Screener',
      color: 'bg-emerald-50 text-emerald-700',
    },
    {
      title: 'Long-Form Article Writer',
      desc: 'Generate structured technical essays, whitepapers, and blogs with citations.',
      icon: BookOpen,
      path: '/article-generator',
      badge: 'Technical Writer',
      color: 'bg-blue-50 text-blue-700',
    },
    {
      title: 'Headline & Title Ideator',
      desc: 'Brainstorm high-converting marketing hooks, headlines, and subject lines.',
      icon: Sparkles,
      path: '/title-generator',
      badge: 'High-CTR',
      color: 'bg-amber-50 text-amber-700',
    },
  ];

  const suggestedPrompts = [
    'Explain how Large Language Models perform Transformer self-attention.',
    'Write a robust Node.js rate-limiting middleware using Redis token-bucket.',
    'Draft an ATS-optimized summary for a Full-Stack Generative AI engineer.',
    'Compare PostgreSQL vs Cassandra for real-time telemetry storage.',
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner message="Initializing Studio..." size="md" />
      </div>
    );
  }

  const metrics = statsData?.metrics || { totalGenerations: 0, totalDocuments: 0 };

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-2 animate-in fade-in duration-300">
      {/* Hero Welcome Banner */}
      <div className="text-center space-y-2.5 pt-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-semibold mb-1">
          <Server className="w-3.5 h-3.5 text-purple-600" />
          <span>Local Ollama Inference Engine (gpt-oss:20b) Active</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900">
          Hello, <span className="text-purple-600">{user?.name?.split(' ')[0] || 'Kunwar'}</span>
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto">
          What would you like to build, analyze, or synthesize with your local AI today?
        </p>
      </div>

      {/* Central Interactive Prompt Box */}
      <div className="prompt-box p-3 sm:p-4 relative">
        <form onSubmit={handleQuickSubmit} className="space-y-3">
          <textarea
            rows={3}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleQuickSubmit();
              }
            }}
            placeholder="Ask anything, debug code, draft an article, or describe an idea for the local model..."
            className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 resize-none focus:outline-none px-2 leading-relaxed"
          />

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            {/* Model Selector in input bar */}
            <div className="flex items-center gap-2">
              <select
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value)}
                className="bg-slate-50 text-xs font-semibold text-slate-700 rounded-xl px-3 py-1.5 border border-slate-200 focus:outline-none cursor-pointer hover:bg-slate-100 transition-colors"
              >
                <option value="ollama">🖥️ Local Ollama (gpt-oss:20b)</option>
              </select>

              <button
                type="button"
                onClick={() => navigate('/document-analyzer')}
                className="p-1.5 rounded-lg text-slate-500 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                title="Attach Document"
              >
                <Upload className="w-4 h-4" />
              </button>
            </div>

            {/* Send Button */}
            <button
              type="submit"
              disabled={!prompt.trim()}
              className="w-9 h-9 rounded-full bg-purple-600 hover:bg-purple-700 disabled:opacity-30 text-white flex items-center justify-center transition-all shadow-md shadow-purple-600/20 shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>

      {/* Suggested Quick Prompts */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {suggestedPrompts.map((p, i) => (
          <button
            key={i}
            onClick={() => setPrompt(p)}
            className="text-xs text-slate-600 hover:text-purple-700 bg-white hover:bg-purple-50 px-3.5 py-1.5 rounded-full border border-slate-200 shadow-sm transition-colors text-left"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Specialized Workspaces - Clean Horizontal Feature Rows */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Specialized Workspaces (Horizontal Suite)
          </h3>
          <span className="text-[11px] font-semibold text-purple-700">6 Active Tools</span>
        </div>

        <div className="space-y-3">
          {capabilities.map((cap) => {
            const Icon = cap.icon;
            return (
              <div
                key={cap.path}
                onClick={() => navigate(cap.path)}
                className="feature-row-card cursor-pointer group"
              >
                <div className="flex items-center gap-4 flex-1 overflow-hidden">
                  <div className={`p-3 rounded-xl ${cap.color} border border-slate-100 shrink-0 group-hover:scale-105 transition-transform`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-purple-600 transition-colors">
                        {cap.title}
                      </h4>
                      <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                        {cap.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">{cap.desc}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-xs font-semibold text-purple-600 group-hover:text-purple-700 shrink-0">
                  <span className="hidden sm:inline">Launch Tool</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Telemetry Footer */}
      <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex items-center gap-3">
          <span>Generations Logged: <strong className="text-slate-800 font-mono">{metrics.totalGenerations}</strong></span>
          <span>•</span>
          <span>Vault Documents: <strong className="text-slate-800 font-mono">{metrics.totalDocuments}</strong></span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[11px] text-slate-400 hidden sm:inline">B.Tech Major Project • Kunwar Kantikeya Gautam</span>
          <button
            onClick={() => navigate('/history')}
            className="text-purple-600 hover:text-purple-700 font-bold"
          >
            View Activity History →
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
