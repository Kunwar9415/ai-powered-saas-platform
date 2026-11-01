import React, { useState } from 'react';
import { Image as ImageIcon, Sparkles, Download, Maximize2, X, Palette, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import aiService from '../services/ai.service';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

export const ImageGenerator = () => {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('Photorealistic');
  const [size, setSize] = useState('1024x1024');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [generatedData, setGeneratedData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toast = useToast();

  const styles = [
    'Photorealistic',
    'Cyberpunk Neon',
    '3D Pixar Concept',
    'Anime / Manga',
    'Digital Oil Painting',
    'Futuristic Architectural Render',
    'Cinematic 8K',
  ];

  const handleGenerate = async (e) => {
    e?.preventDefault();
    if (!prompt.trim()) {
      toast.warning('Please enter an image prompt description.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const res = await aiService.generateImage({
        prompt: prompt.trim(),
        style,
        size,
      });

      if (res.data) {
        setGeneratedData(res.data);
        toast.success('Visual synthesized successfully!');
        confetti({ particleCount: 60, spread: 70, origin: { y: 0.7 } });
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Image generation failed.';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!generatedData?.imageUrl) return;

    try {
      toast.info('Downloading synthesized image...');
      const response = await fetch(generatedData.imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ai-visual-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Image saved to downloads.');
    } catch {
      window.open(generatedData.imageUrl, '_blank');
    }
  };

  const examplePrompts = [
    'A futuristic smart grid control room with glowing holographic telemetry charts.',
    'A sleek cybernetic AI neural processor core floating with neon blue quantum particles.',
    'A cozy coffee shop in Kyoto during a rainy autumn evening with warm reflections.',
    'A futuristic astronaut discovering ancient glowing crystal monoliths on Mars.',
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-50 text-pink-700 border border-pink-200 text-xs font-semibold mb-2">
          <ImageIcon className="w-3.5 h-3.5" />
          Generative Vision Suite
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          AI Image Synthesis
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Turn natural language descriptions into high-resolution visual concept art.
        </p>
      </div>

      {/* Input Configuration */}
      <div className="chat-card p-6 space-y-5">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Image Prompt Description
          </label>
          <textarea
            rows={3}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the visual scene in vivid detail..."
            className="studio-input w-full resize-y text-xs sm:text-sm"
          />
        </div>

        {/* Quick Example Chips */}
        <div>
          <p className="text-[11px] text-slate-500 font-bold mb-2">Sample Prompts:</p>
          <div className="flex flex-wrap gap-2">
            {examplePrompts.map((sample, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setPrompt(sample)}
                className="text-xs text-slate-600 hover:text-purple-700 bg-slate-50 hover:bg-purple-50 px-3 py-1.5 rounded-lg border border-slate-200 transition-colors text-left truncate max-w-full sm:max-w-md"
              >
                "{sample}"
              </button>
            ))}
          </div>
        </div>

        {/* Style & Resolution Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-pink-600" />
              Artistic Style
            </label>
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="studio-input w-full text-xs font-semibold cursor-pointer"
            >
              {styles.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Resolution
            </label>
            <select
              value={size}
              onChange={(e) => setSize(e.target.value)}
              className="studio-input w-full text-xs font-semibold cursor-pointer"
            >
              <option value="1024x1024">1024 x 1024 (HD Square)</option>
              <option value="512x512">512 x 512 (Standard Preview)</option>
            </select>
          </div>
        </div>

        {/* Generate Button */}
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isLoading || !prompt.trim()}
            className="btn-gemini text-xs font-semibold px-6 py-2.5"
          >
            {isLoading ? (
              <LoadingSpinner message="" size="sm" />
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Synthesize Visual
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>

      {errorMsg && <ErrorMessage message={errorMsg} onRetry={handleGenerate} />}

      {/* Generated Result Preview */}
      {generatedData && (
        <div className="chat-card p-6 space-y-4 animate-in fade-in">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-pink-600" />
                Synthesized Output
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Model: <span className="font-mono text-purple-700 font-semibold">{generatedData.model || 'Generative Diffusion'}</span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsModalOpen(true)}
                className="btn-secondary !px-3 !py-1.5 text-xs font-semibold"
                title="View Fullscreen"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                Fullscreen
              </button>
              <button
                onClick={handleDownload}
                className="btn-gemini !px-3.5 !py-1.5 text-xs font-semibold"
              >
                <Download className="w-3.5 h-3.5" />
                Download
              </button>
            </div>
          </div>

          <div className="relative group rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center min-h-[360px] shadow-sm">
            <img
              src={generatedData.imageUrl}
              alt={prompt}
              className="w-full max-h-[500px] object-contain rounded-2xl transition-transform duration-300 group-hover:scale-[1.01]"
              loading="lazy"
            />
          </div>

          {generatedData.revisedPrompt && (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed">
              <strong className="text-slate-800">Prompt Context:</strong> {generatedData.revisedPrompt}
            </div>
          )}
        </div>
      )}

      {/* Fullscreen Modal */}
      {isModalOpen && generatedData && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute -top-10 right-0 p-2 text-white hover:text-slate-300 rounded-full bg-slate-900 border border-slate-700"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={generatedData.imageUrl}
              alt={prompt}
              className="max-h-[80vh] w-auto object-contain rounded-2xl border border-slate-200 shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageGenerator;
