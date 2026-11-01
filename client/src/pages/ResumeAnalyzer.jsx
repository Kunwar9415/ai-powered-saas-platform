import React, { useState } from 'react';
import { UserCheck, Sparkles, CheckCircle2, AlertTriangle, ShieldCheck, Award, Target, ArrowRight, Server } from 'lucide-react';
import confetti from 'canvas-confetti';
import aiService from '../services/ai.service';
import { useToast } from '../context/ToastContext';
import FileUpload from '../components/FileUpload';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

export const ResumeAnalyzer = () => {
  const [resumeFile, setResumeFile] = useState(null);
  const [targetRole, setTargetRole] = useState('');
  const [provider, setProvider] = useState('ollama');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [analysis, setAnalysis] = useState(null);

  const toast = useToast();

  const handleAnalyze = async (e) => {
    e?.preventDefault();
    if (!resumeFile) {
      toast.warning('Please select a PDF or DOCX resume to analyze.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const formData = new FormData();
      formData.append('resume', resumeFile);
      formData.append('provider', provider);
      if (targetRole) formData.append('targetRole', targetRole.trim());

      toast.info('Extracting skills and evaluating ATS alignment with local AI...');
      const response = await aiService.analyzeResume(formData);

      if (response.data?.analysis) {
        setAnalysis(response.data.analysis);
        toast.success('Resume analyzed successfully via local AI model!');
        confetti({ particleCount: 60, spread: 70 });
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Resume analysis failed.';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Resume ATS Screener
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Extract competencies, analyze formatting readability, and find missing skill gaps with local Ollama inference.
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-xl border border-purple-200 text-xs font-semibold shadow-sm self-start sm:self-auto">
          <Server className="w-3.5 h-3.5 text-purple-600" />
          <span>Local Ollama (gpt-oss:20b)</span>
        </div>
      </div>

      {/* Input Section */}
      <div className="chat-card p-6 space-y-5">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
            Upload Candidate Resume
          </label>
          <FileUpload
            onFileSelect={(file) => setResumeFile(file)}
            acceptedFormats={['.pdf', '.docx', '.doc', '.txt']}
            title="Drop Resume File Here"
            description="PDF or Word DOCX resume (Processed 100% locally on your server)"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Target Job Title / Domain (Optional)
          </label>
          <input
            type="text"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            placeholder="e.g. Full-Stack Engineer, Cloud Architect, AI Specialist"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-purple-500 transition-all"
          />
        </div>

        <button
          onClick={handleAnalyze}
          disabled={isLoading || !resumeFile}
          className="w-full py-3.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-purple-600/20"
        >
          {isLoading ? (
            <>
              <Sparkles className="w-4 h-4 animate-spin" />
              <span>Analyzing Resume with Local Ollama (gpt-oss:20b)...</span>
            </>
          ) : (
            <>
              <UserCheck className="w-4 h-4" />
              <span>Perform Local ATS Resume Audit</span>
            </>
          )}
        </button>
      </div>

      {errorMsg && <ErrorMessage message={errorMsg} />}

      {/* Structured Output Display */}
      {analysis && (
        <div className="space-y-6 animate-in fade-in">
          {/* Candidate Overview Card */}
          <div className="chat-card p-6 border-purple-200 bg-purple-50/30 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-purple-200">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-600" />
                <h3 className="text-sm font-bold text-slate-900">Candidate Profiling Overview</h3>
              </div>
              <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700 border border-purple-200">
                Model: {analysis.model || 'gpt-oss:20b'} (Local)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block">Document:</span>
                <strong className="text-slate-900">{analysis.candidateOverview?.documentName || 'Resume'}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Detected Primary Title:</span>
                <strong className="text-purple-700">{analysis.candidateOverview?.detectedRole || 'Software Engineer'}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Experience Level:</span>
                <strong className="text-emerald-700">{analysis.candidateOverview?.experienceLevel || 'Mid-Level'}</strong>
              </div>
            </div>
          </div>

          {/* Identified Skills Card */}
          {analysis.skillsIdentified && analysis.skillsIdentified.length > 0 && (
            <div className="chat-card p-6 space-y-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Verified Technical Competencies
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {analysis.skillsIdentified.map((sk, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold"
                  >
                    {sk}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Missing / Recommended Skills */}
          {analysis.missingOrRecommendedSkills && analysis.missingOrRecommendedSkills.length > 0 && (
            <div className="chat-card p-6 space-y-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Target className="w-4 h-4 text-amber-600" />
                Recommended Skills & Benchmark Gaps
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {analysis.missingOrRecommendedSkills.map((sk, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold"
                  >
                    + {sk}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations Card */}
          {analysis.recommendations && analysis.recommendations.length > 0 && (
            <div className="chat-card p-6 space-y-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-purple-600" />
                High-Impact ATS Optimization Action Items
              </h4>
              <ul className="space-y-2">
                {analysis.recommendations.map((rec, i) => (
                  <li key={i} className="text-xs sm:text-sm text-slate-700 flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="pt-0.5 leading-relaxed">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ResumeAnalyzer;
