import React, { useState } from 'react';
import { Sparkles, Copy, Check, Send, Server } from 'lucide-react';
import confetti from 'canvas-confetti';
import aiService from '../services/ai.service';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

export const TitleGenerator = () => {
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [contentType, setContentType] = useState('Blog Post / Article');
  const [provider, setProvider] = useState('ollama');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [titles, setTitles] = useState([]);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const toast = useToast();

  const contentTypes = [
    'Blog Post / Article',
    'Technical Whitepaper / Research Title',
    'YouTube Video Headline',
    'Email Newsletter Subject Line',
    'SaaS Product Hero Hook',
    'Social Media Thread Opener (X/LinkedIn)',
  ];

  const handleGenerate = async (e) => {
    e?.preventDefault();
    if (!topic.trim()) {
      toast.warning('Please enter a target topic.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    setTitles([]);

    try {
      const res = await aiService.generateTitles({
        topic: topic.trim(),
        description: description.trim(),
        contentType,
        provider,
      });

      if (res.data?.titles) {
        setTitles(res.data.titles);
        toast.success(`Generated ${res.data.titles.length} headlines via local AI!`);
        confetti({ particleCount: 50, spread: 60 });
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Title generation failed.';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const copyTitle = (titleText, idx) => {
    navigator.clipboard.writeText(titleText);
    setCopiedIndex(idx);
    toast.success('Copied headline!');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const copyAllTitles = () => {
    if (titles.length === 0) return;
    navigator.clipboard.writeText(titles.join('\n'));
    toast.success('All headlines copied to clipboard!');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Headline & Hook Ideator
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            AI Headline & Title Ideator
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Generate high-converting titles, SEO headlines, and newsletter subjects with local Ollama inference.
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-xl border border-purple-200 text-xs font-semibold shadow-sm">
          <Server className="w-3.5 h-3.5 text-purple-600" />
          <span>Local Ollama (gpt-oss:20b)</span>
        </div>
      </div>

      {/* Form */}
      <div className="chat-card p-6 space-y-5">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Target Topic or Subject
          </label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. Building Next-Gen Generative AI SaaS Platforms"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-purple-500 transition-all"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Content Format / Channel
            </label>
            <select
              value={contentType}
              onChange={(e) => setContentType(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-purple-500"
            >
              {contentTypes.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Audience / Key Angle (Optional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. For CTOs, Senior Engineers, and Tech Founders"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={isLoading || !topic.trim()}
          className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-purple-600/20"
        >
          {isLoading ? (
            <>
              <Sparkles className="w-4 h-4 animate-spin" />
              <span>Generating Viral Hooks with Local Ollama...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Generate 7 High-Converting Titles</span>
            </>
          )}
        </button>
      </div>

      {errorMsg && <ErrorMessage message={errorMsg} />}

      {/* Generated Titles Listing */}
      {titles.length > 0 && (
        <div className="chat-card p-6 space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              Generated Headlines ({titles.length})
            </h3>
            <button
              onClick={copyAllTitles}
              className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
              Copy All
            </button>
          </div>

          <div className="space-y-2.5">
            {titles.map((title, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-slate-50 hover:bg-purple-50/50 border border-slate-200 hover:border-purple-200 flex items-center justify-between gap-3 transition-colors group"
              >
                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="text-xs sm:text-sm font-medium text-slate-800 leading-snug">{title}</p>
                </div>

                <button
                  onClick={() => copyTitle(title, idx)}
                  className="p-2 rounded-lg text-slate-400 hover:text-purple-700 hover:bg-white transition-colors shrink-0"
                  title="Copy Headline"
                >
                  {copiedIndex === idx ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TitleGenerator;
