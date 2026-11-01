import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Copy, Check, Download, Sparkles, Cpu, Layers, Server } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export const AIResultCard = ({
  result,
  provider = 'ollama',
  model,
  toolType = 'text',
  title = 'AI Generation Output',
  onRegenerate,
  metadata,
}) => {
  const [copied, setCopied] = useState(false);
  const toast = useToast();

  if (!result) return null;

  const handleCopy = () => {
    const textToCopy = typeof result === 'string' ? result : JSON.stringify(result, null, 2);
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    toast.success('Copied output to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const textContent = typeof result === 'string' ? result : JSON.stringify(result, null, 2);
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ai-output-${toolType}-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    toast.info('Exported output file.');
  };

  const isMarkdown = typeof result === 'string';
  const charCount = typeof result === 'string' ? result.length : JSON.stringify(result).length;
  const wordCount = typeof result === 'string' ? result.split(/\s+/).filter(Boolean).length : '-';

  return (
    <div className="chat-card p-6 relative overflow-hidden animate-in fade-in duration-300">
      {/* Top Bar Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-purple-50 border border-purple-200 text-purple-700">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">{title}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                <Server className="w-3 h-3 text-purple-600" />
                {provider === 'ollama' ? 'LOCAL OLLAMA' : provider.toUpperCase()}
              </span>
              {model && (
                <span className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                  <Layers className="w-3 h-3" /> {model}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-purple-700 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-200 transition-all"
            title="Copy to clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button
            onClick={handleDownload}
            className="btn-gemini !px-3 !py-1.5 text-xs font-semibold"
            title="Download result"
          >
            <Download className="w-3.5 h-3.5" />
            Export
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="prose prose-slate max-w-none text-slate-800 text-xs sm:text-sm leading-relaxed overflow-x-auto">
        {isMarkdown ? (
          <ReactMarkdown
            components={{
              h2: ({ node, ...props }) => <h2 className="text-base font-bold text-slate-900 mt-4 mb-2 pb-1 border-b border-slate-200" {...props} />,
              h3: ({ node, ...props }) => <h3 className="text-sm font-semibold text-purple-700 mt-3 mb-1.5" {...props} />,
              p: ({ node, ...props }) => <p className="my-2 leading-relaxed text-slate-700" {...props} />,
              ul: ({ node, ...props }) => <ul className="list-disc list-inside my-2 space-y-1 text-slate-700" {...props} />,
              ol: ({ node, ...props }) => <ol className="list-decimal list-inside my-2 space-y-1 text-slate-700" {...props} />,
              code: ({ node, inline, ...props }) =>
                inline ? (
                  <code className="px-1.5 py-0.5 rounded bg-slate-100 text-purple-700 font-mono text-xs font-semibold" {...props} />
                ) : (
                  <div className="my-3 rounded-xl bg-slate-900 text-slate-100 p-4 border border-slate-800 overflow-x-auto shadow-sm">
                    <code className="text-xs font-mono leading-normal" {...props} />
                  </div>
                ),
            }}
          >
            {result}
          </ReactMarkdown>
        ) : (
          <pre className="p-4 rounded-xl bg-slate-900 text-xs text-purple-200 font-mono overflow-x-auto border border-slate-800">
            {JSON.stringify(result, null, 2)}
          </pre>
        )}
      </div>

      {/* Footer Details */}
      <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-mono">
        <div>
          {wordCount !== '-' && <span>{wordCount} words • </span>}
          <span>{charCount} characters</span>
        </div>
        <span className="text-[11px] text-emerald-600 font-semibold">Processed via Local Engine</span>
      </div>
    </div>
  );
};

export default AIResultCard;
