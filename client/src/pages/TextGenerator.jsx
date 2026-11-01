import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Sparkles, Send, Trash2, Sliders, Copy, Check, Server, User, HardDrive } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import aiService from '../services/ai.service';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';

export const TextGenerator = () => {
  const location = useLocation();
  const toast = useToast();
  const messagesEndRef = useRef(null);

  const [prompt, setPrompt] = useState('');
  const [provider, setProvider] = useState('ollama');
  const [modelName, setModelName] = useState('gpt-oss:20b');
  const [temperature, setTemperature] = useState(0.7);
  const [showSettings, setShowSettings] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  // Handle prefilled prompt from Dashboard
  useEffect(() => {
    if (location.state?.prefilledPrompt) {
      const p = location.state.prefilledPrompt;
      const prov = location.state.prefilledProvider || 'ollama';
      setProvider(prov);
      setPrompt(p);
      executeGeneration(p, prov);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const executeGeneration = async (inputPrompt, activeProvider) => {
    const userMsg = {
      id: 'usr_' + Date.now(),
      sender: 'user',
      text: inputPrompt,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);
    setPrompt('');

    const startTime = Date.now();

    try {
      const response = await aiService.generateText({
        prompt: inputPrompt,
        provider: activeProvider || provider,
        model: modelName,
        temperature,
      });

      const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);

      if (response.data) {
        const aiMsg = {
          id: response.data.generationId || 'ai_' + Date.now(),
          sender: 'ai',
          text: response.data.result,
          provider: response.data.provider || activeProvider || provider,
          model: response.data.model || modelName,
          latency: `${elapsed}s`,
          isLocal: true,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMsg]);
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Generation failed.';
      toast.error(errMsg);
      setMessages((prev) => [
        ...prev,
        {
          id: 'err_' + Date.now(),
          sender: 'ai',
          text: `⚠️ **Error:** ${errMsg}`,
          isError: true,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!prompt.trim() || isLoading) return;
    executeGeneration(prompt.trim(), provider);
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-8rem)] relative">
      {/* Top Model Controls Pill */}
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-xl border border-purple-200 text-xs font-semibold shadow-sm">
            <Server className="w-3.5 h-3.5 text-purple-600" />
            <span>Local Ollama</span>
            <span className="text-purple-400 font-mono">({modelName})</span>
          </div>

          <select
            value={modelName}
            onChange={(e) => setModelName(e.target.value)}
            className="bg-white text-xs font-semibold text-slate-700 rounded-xl px-3 py-1.5 border border-slate-200 shadow-sm focus:outline-none cursor-pointer"
          >
            <option value="gpt-oss:20b">🖥️ gpt-oss:20b (Primary Local Open-Weight)</option>
            <option value="llama3:latest">🦙 llama3:latest (Local Alternative)</option>
            <option value="mistral:latest">⚡ mistral:latest (Local Alternative)</option>
          </select>

          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-purple-600 hover:bg-purple-50 transition-colors"
            title="Temperature Settings"
          >
            <Sliders className="w-4 h-4" />
          </button>
        </div>

        {messages.length > 0 && (
          <button
            onClick={clearChat}
            className="text-xs text-slate-400 hover:text-red-600 flex items-center gap-1 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear Conversation
          </button>
        )}
      </div>

      {/* Temperature Slider Drawer */}
      {showSettings && (
        <div className="p-3 mb-3 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-between text-xs animate-in fade-in">
          <span className="text-slate-700">Inference Temperature: <strong className="font-mono text-purple-600">{temperature}</strong></span>
          <input
            type="range"
            min="0.1"
            max="1.0"
            step="0.1"
            value={temperature}
            onChange={(e) => setTemperature(parseFloat(e.target.value))}
            className="w-48 accent-purple-600 cursor-pointer"
          />
        </div>
      )}

      {/* Messages Thread Container */}
      <div className="flex-1 overflow-y-auto space-y-6 pb-28 pr-1">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shadow-sm">
              <HardDrive className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Local AI Inference Studio</h3>
            <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
              Running locally on your machine via <strong>Ollama HTTP Runtime ({modelName})</strong>. Zero cloud dependencies, complete privacy, and full offline inference.
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'ai' && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm">
                  <Sparkles className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] p-4 text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'chat-bubble-user'
                    : 'chat-bubble-ai shadow-sm'
                }`}
              >
                {msg.sender === 'user' ? (
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                ) : (
                  <div className="prose prose-slate max-w-none text-xs sm:text-sm text-slate-800">
                    <ReactMarkdown
                      components={{
                        h2: ({ node, ...props }) => <h2 className="text-base font-bold text-slate-900 mt-3 mb-1.5 pb-1 border-b border-slate-200" {...props} />,
                        h3: ({ node, ...props }) => <h3 className="text-sm font-semibold text-purple-700 mt-2 mb-1" {...props} />,
                        p: ({ node, ...props }) => <p className="my-1.5 leading-relaxed text-slate-700" {...props} />,
                        ul: ({ node, ...props }) => <ul className="list-disc list-inside my-1.5 space-y-1 text-slate-700" {...props} />,
                        ol: ({ node, ...props }) => <ol className="list-decimal list-inside my-1.5 space-y-1 text-slate-700" {...props} />,
                        code: ({ node, inline, ...props }) =>
                          inline ? (
                            <code className="px-1.5 py-0.5 rounded bg-slate-100 text-purple-700 font-mono text-xs font-semibold" {...props} />
                          ) : (
                            <div className="my-2.5 rounded-xl bg-slate-900 text-slate-100 p-3.5 border border-slate-800 overflow-x-auto shadow-sm">
                              <code className="text-xs font-mono leading-normal" {...props} />
                            </div>
                          ),
                      }}
                    >
                      {msg.text}
                    </ReactMarkdown>

                    {/* Latency & Local Node Footer */}
                    <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                      <div className="flex items-center gap-2">
                        <span className="text-purple-700 font-bold flex items-center gap-1">
                          <Server className="w-3 h-3" />
                          LOCAL OLLAMA ({msg.model})
                        </span>
                        {msg.latency && <span className="text-slate-400">• {msg.latency}</span>}
                      </div>
                      <button
                        onClick={() => handleCopy(msg.text, msg.id)}
                        className="flex items-center gap-1 text-slate-500 hover:text-purple-700 transition-colors"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-600 font-sans">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span className="font-sans">Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-full bg-purple-700 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold animate-pulse">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="chat-bubble-ai p-3 px-4 shadow-sm">
              <LoadingSpinner message={`Ollama local inference (${modelName})...`} size="sm" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Floating Prompt Bar */}
      <div className="absolute bottom-2 left-0 right-0">
        <form onSubmit={handleSubmit} className="prompt-box p-2.5 flex items-center gap-2">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={`Ask local AI model (${modelName})...`}
            className="flex-1 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none px-3"
            disabled={isLoading}
          />

          <button
            type="submit"
            disabled={isLoading || !prompt.trim()}
            className="w-9 h-9 rounded-full bg-purple-600 hover:bg-purple-700 disabled:opacity-30 text-white flex items-center justify-center shrink-0 transition-all shadow-md shadow-purple-600/20"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default TextGenerator;
