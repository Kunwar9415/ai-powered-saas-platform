import React, { useState } from 'react';
import { User, Mail, Lock, Award, Calendar, Zap, Server } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import authService from '../services/auth.service';
import LoadingSpinner from '../components/LoadingSpinner';

export const Profile = () => {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || 'KUNWAR KANTIKEYA GAUTAM');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const toast = useToast();

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (newPassword && newPassword !== confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }

    setIsSaving(true);
    try {
      const res = await authService.updateProfile(name, newPassword || undefined);
      if (res.data?.user) {
        updateUser(res.data.user);
        toast.success('Profile details updated successfully!');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      toast.error('Failed to update profile: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-xs font-semibold mb-2">
          <User className="w-3.5 h-3.5" />
          Account & Credentials
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Developer Profile
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Manage your account profile details, credentials, and academic project specifications.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Card */}
        <div className="chat-card p-6 text-center flex flex-col items-center justify-center space-y-4">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white text-3xl font-extrabold shadow-lg shadow-purple-600/20">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'K'}
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">{user?.name || 'KUNWAR KANTIKEYA GAUTAM'}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{user?.email || 'kunwarkantikeyagautam@gmail.com'}</p>
          </div>
          <div className="pt-3 border-t border-slate-100 w-full text-xs text-slate-500 flex items-center justify-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>Project Developer</span>
          </div>
        </div>

        {/* Update Form */}
        <div className="chat-card p-6 md:col-span-2 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 mb-2">Update Account Details</h3>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="studio-input w-full text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address (Read Only)
              </label>
              <input
                type="email"
                value={user?.email || 'kunwarkantikeyagautam@gmail.com'}
                disabled
                className="studio-input w-full text-sm opacity-60 cursor-not-allowed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  New Password (Optional)
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Leave blank to keep current"
                  className="studio-input w-full text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="studio-input w-full text-sm"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="btn-gemini text-xs font-semibold px-6 py-2"
              >
                {isSaving ? <LoadingSpinner message="" size="sm" /> : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Academic Project Specification */}
      <div className="chat-card p-6 space-y-3">
        <div className="flex items-center gap-2 text-purple-700">
          <Award className="w-5 h-5" />
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Academic Project Architecture & Specification
          </h4>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs text-slate-700 pt-2">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-500 block text-[11px]">Project Title:</span>
            <span className="font-bold text-slate-900">AI-POWERED SAAS PLATFORM BASED ON GENERATIVE AI</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-500 block text-[11px]">Developer:</span>
            <span className="font-bold text-purple-700">KUNWAR KANTIKEYA GAUTAM</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-500 block text-[11px]">Database & Persistence:</span>
            <span className="font-bold text-slate-900">PostgreSQL with Prisma ORM</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-500 block text-[11px]">Active AI Engine:</span>
            <span className="font-bold text-emerald-700">Groq Cloud (GPT-OSS 120B / Fast LPU)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
