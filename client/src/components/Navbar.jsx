import React, { useState } from 'react';
import { Menu, Sparkles, ChevronDown, Plus, Info, Check, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

export const Navbar = ({ onOpenMobileSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [modelDropdown, setModelDropdown] = useState(false);
  const [selectedModel, setSelectedModel] = useState('Groq Cloud (GPT-OSS 120B)');
  const [showInfoModal, setShowInfoModal] = useState(false);

  const models = [
    { name: 'Groq Cloud (GPT-OSS 120B)', tag: 'Ultra-Fast LPU • Active Key', icon: '⚡', id: 'groq' },
    { name: 'Google Gemini (3.6 Flash)', tag: 'Multimodal Reasoning • Active Key', icon: '✨', id: 'gemini' },
    { name: 'OpenAI GPT-4o Mini', tag: 'Synthesis & Code', icon: '🧠', id: 'openai' },
  ];

  return (
    <>
      <header className="h-16 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 lg:px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        {/* Left Section: Mobile toggle + Model Selector */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileSidebar}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 lg:hidden transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Model Selector Pill */}
          <div className="relative">
            <button
              onClick={() => setModelDropdown(!modelDropdown)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-800 transition-all shadow-sm"
            >
              <Zap className="w-3.5 h-3.5 text-purple-600" />
              <span>{selectedModel}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
            </button>

            {modelDropdown && (
              <div className="absolute left-0 top-full mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95">
                <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Active Model Routing
                </div>
                {models.map((m) => (
                  <button
                    key={m.name}
                    onClick={() => {
                      setSelectedModel(m.name);
                      setModelDropdown(false);
                    }}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left text-xs transition-colors ${
                      selectedModel === m.name
                        ? 'bg-purple-50 text-purple-900 font-semibold border border-purple-200'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-sm">{m.icon}</span>
                      <div>
                        <p className="font-semibold text-slate-900">{m.name}</p>
                        <p className="text-[10px] text-slate-500">{m.tag}</p>
                      </div>
                    </div>
                    {selectedModel === m.name && <Check className="w-3.5 h-3.5 text-purple-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-semibold text-emerald-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Groq & Gemini Active</span>
          </div>

          <Link
            to="/text-generator"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-xs font-semibold text-purple-700 border border-purple-200 transition-all shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 text-purple-600" />
            <span className="hidden sm:inline">New Generation</span>
          </Link>

          <button
            onClick={() => setShowInfoModal(true)}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="Project Details"
          >
            <Info className="w-4 h-4" />
          </button>

          {/* User Profile Avatar */}
          <Link
            to="/profile"
            className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'K'}
            </div>
            <span className="text-xs font-semibold text-slate-700 hidden md:inline max-w-[120px] truncate">
              {user?.name?.split(' ')[0] || 'Kunwar'}
            </span>
          </Link>
        </div>
      </header>

      {/* Project Info Dialog Modal */}
      {showInfoModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                Project Information
              </h3>
              <button
                onClick={() => setShowInfoModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3 text-xs text-slate-700">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[11px]">Project Title</span>
                <span className="font-bold text-slate-900">AI-POWERED SAAS PLATFORM BASED ON GENERATIVE AI</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[11px]">Developer</span>
                <span className="font-bold text-purple-700">KUNWAR KANTIKEYA GAUTAM</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[11px]">Active AI Engines</span>
                <span className="text-emerald-700 font-bold">Groq Cloud (GPT-OSS 120B) & Google Gemini (3.6 Flash)</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[11px]">Architecture</span>
                <span className="text-slate-800">React + Vite + Node.js/Express + PostgreSQL (Prisma ORM)</span>
              </div>
            </div>
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowInfoModal(false)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
