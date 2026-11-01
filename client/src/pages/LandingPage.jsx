import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Zap,
  MessageSquare,
  Image as ImageIcon,
  FileText,
  UserCheck,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Layers,
  CheckCircle2,
  Database,
  Terminal,
  Briefcase,
  GraduationCap,
  HardDrive,
  Server,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LandingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const capabilities = [
    {
      title: 'Chat & Text Generation',
      desc: 'Conversational reasoning, prompt engineering, and code synthesis powered by local Ollama runtime (gpt-oss:20b).',
      icon: MessageSquare,
      path: '/text-generator',
      badge: 'Local Ollama Engine',
      category: 'Language',
    },
    {
      title: 'Image Synthesis Studio',
      desc: 'Generate photorealistic visuals, 3D render concept designs, and digital art with a modular vision architecture.',
      icon: ImageIcon,
      path: '/image-generator',
      badge: 'Modular Vision Suite',
      category: 'Vision',
    },
    {
      title: 'Document Intelligence',
      desc: 'Upload PDF and Word DOCX research papers for instant executive summaries and key takeaway extraction.',
      icon: FileText,
      path: '/document-analyzer',
      badge: 'Local PDF / DOCX',
      category: 'Analysis',
    },
    {
      title: 'Resume ATS Screener',
      desc: 'Screen resumes against industry benchmarks, uncover missing skills, and audit formatting readability.',
      icon: UserCheck,
      path: '/resume-analyzer',
      badge: 'Local ATS Screener',
      category: 'Career',
    },
    {
      title: 'Long-Form Article Writer',
      desc: 'Draft structured technical essays, whitepapers, and blogs with citation outlines, custom tone, and target keywords.',
      icon: BookOpen,
      path: '/article-generator',
      badge: 'Markdown Export',
      category: 'Writing',
    },
    {
      title: 'Headline & Title Ideator',
      desc: 'Brainstorm high-converting marketing hooks, YouTube video headlines, and email newsletter subject lines.',
      icon: Sparkles,
      path: '/title-generator',
      badge: 'High-CTR Hooks',
      category: 'Marketing',
    },
  ];

  const features = [
    {
      title: 'One Login for Everything',
      desc: 'Access conversational language reasoning, modular image generation, document intelligence, and content creation in one unified full-stack SaaS workspace.',
      icon: Layers,
      highlight: 'Unified Workspace',
    },
    {
      title: 'Local Ollama Inference Layer',
      desc: 'Powered by an on-premise Ollama runtime running open-weight model gpt-oss:20b. Complete data privacy, zero API quotas, and fast local execution.',
      icon: Server,
      highlight: 'On-Premise Privacy',
    },
    {
      title: 'Unified PostgreSQL Vault & History',
      desc: 'Every generation, uploaded research document, and audit result is automatically indexed and searchable in your personal PostgreSQL vault via Prisma ORM.',
      icon: Database,
      highlight: 'PostgreSQL Relational Storage',
    },
    {
      title: 'Three-Tier Modular Architecture',
      desc: 'Presentation Layer (React + Tailwind), Application Layer (Node.js + Express), Local Inference Layer (Ollama + gpt-oss:20b), and Data Layer (PostgreSQL).',
      icon: ShieldCheck,
      highlight: 'Three-Tier Architecture',
    },
  ];

  const workflows = [
    {
      step: '01',
      title: 'Choose AI Tool & Model',
      desc: 'Select your workspace from the menu (Chat, Vision, Document, Resume, Article, or Headline Ideator).',
    },
    {
      step: '02',
      title: 'Provide Prompt or File',
      desc: 'Input natural language instructions or drop PDF/DOCX documents directly into the intelligent file parser.',
    },
    {
      step: '03',
      title: 'Local Inference Execution',
      desc: 'Requests are processed locally on your server by Ollama executing the open-weight gpt-oss:20b model.',
    },
    {
      step: '04',
      title: 'Export & Auto-Vault',
      desc: 'Copy formatted markdown with one click, export raw files, and review past items in the PostgreSQL history log.',
    },
  ];

  const personas = [
    {
      role: 'Software Engineers',
      icon: Terminal,
      highlight: 'Code Synthesis & Architecture',
      desc: 'Generate boilerplate, debug distributed systems, and benchmark database schema designs.',
    },
    {
      role: 'Job Seekers & Students',
      icon: Briefcase,
      highlight: 'Resume ATS Optimization',
      desc: 'Screen resumes against recruiter algorithms and pinpoint missing skills before submitting.',
    },
    {
      role: 'Researchers & Academics',
      icon: GraduationCap,
      highlight: 'Document Intelligence',
      desc: 'Parse dense research papers, extract methodologies, and summarize findings instantly.',
    },
    {
      role: 'Writers & Marketers',
      icon: Sparkles,
      highlight: 'Content & Headline Studio',
      desc: 'Overcome writer’s block with structured article drafting and high-converting headline hooks.',
    },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased selection:bg-purple-600 selection:text-white">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-purple-700 flex items-center justify-center text-white shadow-md shadow-purple-600/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-extrabold tracking-tight text-slate-900">AI Studio</span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                SaaS Platform
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-600">
            <a href="#capabilities" className="hover:text-purple-600 transition-colors">
              Capabilities
            </a>
            <a href="#features" className="hover:text-purple-600 transition-colors">
              Features
            </a>
            <a href="#workflow" className="hover:text-purple-600 transition-colors">
              Workflow
            </a>
            <a href="#personas" className="hover:text-purple-600 transition-colors">
              Use Cases
            </a>
          </nav>

          {/* Auth Action Buttons */}
          <div className="flex items-center gap-3">
            {user ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-purple-600/20 transition-all"
              >
                <span>Go to Studio</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-purple-600 hover:bg-slate-50 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 text-white text-xs font-semibold shadow-md shadow-purple-600/20 transition-all"
                >
                  <span>Launch App</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 bg-gradient-to-b from-purple-50/40 via-white to-white overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-100/80 border border-purple-200 text-purple-800 text-xs font-semibold shadow-sm">
            <Server className="w-3.5 h-3.5 text-purple-600" />
            <span>Three-Tier Architecture with Local Generative AI Inference Layer</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
            Local Generative AI SaaS, <br />
            <span className="bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 bg-clip-text text-transparent">
              powered by Ollama & PostgreSQL
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
            A full-stack SaaS platform uniting conversational reasoning, document intelligence, resume ATS screening, long-form writing, and visual synthesis running on your local server.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            <Link
              to="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-sm font-semibold shadow-lg shadow-purple-600/25 transition-all"
            >
              <span>Explore Studio Tools</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-sm font-medium shadow-sm transition-all"
            >
              <span>Demo Account: Kunwar Gautam</span>
            </Link>
          </div>

          {/* Central Hero Wireframe / Showcase Box */}
          <div className="pt-10 max-w-4xl mx-auto">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xl space-y-6 text-left">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-400"></span>
                  <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
                  <span className="w-3 h-3 rounded-full bg-green-400"></span>
                  <span className="ml-3 text-xs font-mono text-slate-400">workspace.local-ai-saas</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] font-mono text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-pulse"></span>
                  <span>🖥️ Local Ollama Runtime (gpt-oss:20b)</span>
                </div>
              </div>

              {/* Horizontal showcase rows */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex items-center gap-2 text-purple-700 text-xs font-bold">
                    <MessageSquare className="w-4 h-4" />
                    <span>Language Reasoning</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Local text generation and code synthesis via Ollama HTTP interface.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex items-center gap-2 text-indigo-700 text-xs font-bold">
                    <FileText className="w-4 h-4" />
                    <span>Document Intelligence</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Automated PDF/DOCX parsing, summaries, and keyword extraction.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex items-center gap-2 text-pink-700 text-xs font-bold">
                    <UserCheck className="w-4 h-4" />
                    <span>ATS Resume Audit</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Candidate scoring, skill gap detection, and formatting heuristics.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Capabilities Section */}
      <section id="capabilities" className="py-20 bg-slate-50 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <h2 className="text-xs font-bold text-purple-700 uppercase tracking-widest">
              Comprehensive Studio Suite
            </h2>
            <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Six Specialized AI Workspaces
            </h3>
            <p className="text-sm text-slate-600">
              Each workspace is tailored to its specific domain, providing dedicated controls, structured output, and instant export options.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {capabilities.map((c, i) => {
              const Icon = c.icon;
              return (
                <div
                  key={i}
                  className="chat-card p-6 bg-white hover:border-purple-300 hover:shadow-lg transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-all shadow-sm">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
                        {c.badge}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-base font-bold text-slate-900 group-hover:text-purple-700 transition-colors">
                        {c.title}
                      </h4>
                      <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                        {c.desc}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-purple-600">
                    <span>{c.category} Pipeline</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <h2 className="text-xs font-bold text-purple-700 uppercase tracking-widest">
              Architectural Advantages
            </h2>
            <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Designed for Speed, Security & Self-Hosting
            </h3>
            <p className="text-sm text-slate-600">
              Eliminate external API subscription costs and API outages with a localized inference architecture.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-bold text-purple-600 uppercase tracking-wider block">
                    {f.highlight}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900">{f.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section id="workflow" className="py-20 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <h2 className="text-xs font-bold text-purple-400 uppercase tracking-widest">
              Execution Lifecycle
            </h2>
            <h3 className="text-3xl font-extrabold tracking-tight">
              How Local AI Inference Works
            </h3>
            <p className="text-sm text-slate-400">
              Step-by-step workflow from user prompt to local Ollama inference and PostgreSQL persistence.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {workflows.map((w, i) => (
              <div key={i} className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-3">
                <span className="text-2xl font-mono font-extrabold text-purple-400 block">{w.step}</span>
                <h4 className="text-sm font-bold text-white">{w.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{w.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 bg-slate-950 text-slate-400 text-xs border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-500" />
            <span className="font-semibold text-slate-200">AI-POWERED SAAS PLATFORM BASED ON GENERATIVE AI</span>
          </div>
          <div>
            <span>Developer: <strong>KUNWAR KANTIKEYA GAUTAM</strong> • B.Tech Major Project</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
