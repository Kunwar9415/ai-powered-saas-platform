import React, { useState } from 'react';
import { BookOpen, Sparkles, Send, Copy, Check, Download, Layers, Server } from 'lucide-react';
import confetti from 'canvas-confetti';
import ReactMarkdown from 'react-markdown';
import aiService from '../services/ai.service';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

export const ArticleGenerator = () => {
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('Authoritative & Technical');
  const [length, setLength] = useState('Medium (~1000 words)');
  const [keywords, setKeywords] = useState('');
  const [provider, setProvider] = useState('ollama');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [generatedArticle, setGeneratedArticle] = useState(null);
  const [copied, setCopied] = useState(false);

  const toast = useToast();

  const tones = [
    'Authoritative & Technical',
    'Professional & Concise',
    'Conversational & Engaging',
    'Academic & Research Paper',
    'Analytical & Deep-Dive',
  ];
  const lengths = ['Short (~500 words)', 'Medium (~1000 words)', 'In-Depth Guide (~2000 words)'];

  const handleGenerate = async (e) => {
    e?.preventDefault();
    if (!topic.trim()) {
      toast.warning('Please enter an article topic or subject.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const keywordArr = keywords
        .split(',')
        .map((k) => k.trim())
        .filter(Boolean);

      const response = await aiService.generateArticle({
        topic: topic.trim(),
        tone,
        length,
        keywords: keywordArr,
        provider,
      });

      if (response.data) {
        setGeneratedArticle(response.data);
        toast.success('Article generated successfully via local AI model!');
        confetti({ particleCount: 50, spread: 60 });
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Article generation failed.';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!generatedArticle?.article) return;
    navigator.clipboard.writeText(generatedArticle.article);
    setCopied(true);
    toast.success('Article copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!generatedArticle?.article) return;
    const blob = new Blob([generatedArticle.article], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `article-${Date.now()}.md`;
    link.click();
    URL.revokeObjectURL(url);
    toast.info('Exported article as Markdown file.');
  };

  const exampleTopics = [
    'Three-Tier Web Architecture with Local Generative AI Inference Layer',
    'Deploying Open-Weight LLMs (gpt-oss:20b) with Ollama and Node.js',
    'PostgreSQL Schema Design and Optimization for Multi-Tenant AI SaaS Platforms',
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-xs font-semibold mb-2">
            <BookOpen className="w-3.5 h-3.5" />
            Long-Form Article Studio
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Article & Technical Writer
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Draft structured, long-form technical whitepapers, guides, and essays with local Ollama inference.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-xl border border-purple-200 text-xs font-semibold shadow-sm">
            <Server className="w-3.5 h-3.5 text-purple-600" />
            <span>Local Ollama (gpt-oss:20b)</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form Controls */}
        <div className="lg:col-span-5 chat-card p-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Article Subject or Thesis
            </label>
            <textarea
              rows={3}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Modern Full-Stack AI SaaS Architectures with Local Inference..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-slate-500">Quick-Fill Exemplars:</span>
            <div className="flex flex-wrap gap-1.5">
              {exampleTopics.map((ex, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setTopic(ex)}
                  className="text-[11px] text-left px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-purple-50 hover:text-purple-700 text-slate-600 border border-slate-200 transition-colors truncate max-w-full"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Stylistic Tone
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-purple-500"
              >
                {tones.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Target Depth
              </label>
              <select
                value={length}
                onChange={(e) => setLength(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-purple-500"
              >
                {lengths.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Target SEO Keywords (Comma Separated)
            </label>
            <input
              type="text"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="e.g. Ollama, PostgreSQL, React, Node.js, Local AI"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-purple-500"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={isLoading || !topic.trim()}
            className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-purple-600/20"
          >
            {isLoading ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>Running Local Inference (Ollama)...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Synthesize Long-Form Article</span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: Article Workspace & Preview */}
        <div className="lg:col-span-7">
          {errorMsg && <ErrorMessage message={errorMsg} className="mb-4" />}

          {isLoading ? (
            <div className="chat-card p-12 flex flex-col items-center justify-center min-h-[400px]">
              <LoadingSpinner message="Ollama local LLM is generating structured Markdown whitepaper..." size="lg" />
            </div>
          ) : generatedArticle ? (
            <div className="chat-card p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Local Ollama Ready
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    Model: {generatedArticle.model || 'gpt-oss:20b'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>

                  <button
                    onClick={handleDownload}
                    className="px-3 py-1.5 rounded-lg bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download .md</span>
                  </button>
                </div>
              </div>

              <div className="prose prose-slate max-w-none text-xs sm:text-sm text-slate-800 overflow-y-auto max-h-[600px] pr-2">
                <ReactMarkdown
                  components={{
                    h1: ({ node, ...props }) => <h1 className="text-xl font-bold text-slate-900 mt-4 mb-2 pb-2 border-b border-slate-200" {...props} />,
                    h2: ({ node, ...props }) => <h2 className="text-lg font-bold text-slate-900 mt-4 mb-2 pb-1 border-b border-slate-100" {...props} />,
                    h3: ({ node, ...props }) => <h3 className="text-base font-semibold text-purple-700 mt-3 mb-1" {...props} />,
                    p: ({ node, ...props }) => <p className="my-2 leading-relaxed text-slate-700" {...props} />,
                    ul: ({ node, ...props }) => <ul className="list-disc list-inside my-2 space-y-1 text-slate-700" {...props} />,
                    ol: ({ node, ...props }) => <ol className="list-decimal list-inside my-2 space-y-1 text-slate-700" {...props} />,
                  }}
                >
                  {generatedArticle.article || generatedArticle.text}
                </ReactMarkdown>
              </div>
            </div>
          ) : (
            <div className="chat-card p-12 flex flex-col items-center justify-center text-center min-h-[400px] space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Your Generated Article Will Appear Here</h3>
              <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
                Configure your topic, target tone, and keywords on the left. The local Ollama model will construct a production-ready whitepaper with headings and citations.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArticleGenerator;
