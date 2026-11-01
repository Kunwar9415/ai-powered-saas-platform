import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  MessageSquare,
  Image as ImageIcon,
  FileText,
  UserCheck,
  BookOpen,
  Sparkles,
  FolderOpen,
  History,
  User,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Plus,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar = ({ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { label: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Chat & Text Gen', path: '/text-generator', icon: MessageSquare },
    { label: 'Image Studio', path: '/image-generator', icon: ImageIcon },
    { label: 'Document Intelligence', path: '/document-analyzer', icon: FileText },
    { label: 'Resume ATS Screener', path: '/resume-analyzer', icon: UserCheck },
    { label: 'Article Writer', path: '/article-generator', icon: BookOpen },
    { label: 'Headline Ideator', path: '/title-generator', icon: Sparkles },
    { label: 'Document Vault', path: '/documents', icon: FolderOpen },
    { label: 'Activity History', path: '/history', icon: History },
  ];

  const secondaryItems = [
    { label: 'My Account', path: '/profile', icon: User },
    { label: 'Model Settings', path: '/settings', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 flex flex-col bg-white border-r border-slate-200 transition-all duration-300 shadow-sm ${
          isCollapsed ? 'w-18' : 'w-64'
        } ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand & New Prompt Header */}
        <div className="p-3 border-b border-slate-200">
          <div className="flex items-center justify-between mb-3 px-2 pt-1">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-500 flex items-center justify-center shrink-0 shadow-md shadow-purple-600/20">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              {!isCollapsed && (
                <div className="overflow-hidden">
                  <h1 className="text-sm font-bold text-slate-900 tracking-tight">AI Studio</h1>
                  <p className="text-[10px] text-purple-700 font-semibold">Generative Platform</p>
                </div>
              )}
            </div>

            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* New Prompt Button */}
          <button
            onClick={() => {
              navigate('/text-generator');
              setIsMobileOpen(false);
            }}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-xs font-semibold text-purple-700 border border-purple-200 transition-all ${
              isCollapsed ? 'justify-center px-0' : ''
            }`}
            title="Start New Generation"
          >
            <Plus className="w-4 h-4 text-purple-600 shrink-0" />
            {!isCollapsed && <span>New Generation</span>}
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto py-3 px-2.5 space-y-5">
          {/* Main AI Tools */}
          <div>
            {!isCollapsed && (
              <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                AI Capabilities
              </p>
            )}
            <nav className="space-y-0.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/30'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      } ${isCollapsed ? 'justify-center px-0' : ''}`
                    }
                    title={isCollapsed ? item.label : undefined}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {!isCollapsed && <span className="flex-1 truncate">{item.label}</span>}
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* System & Settings */}
          <div>
            {!isCollapsed && (
              <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Account & Config
              </p>
            )}
            <nav className="space-y-0.5">
              {secondaryItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/30'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      } ${isCollapsed ? 'justify-center px-0' : ''}`
                    }
                    title={isCollapsed ? item.label : undefined}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {!isCollapsed && <span className="flex-1 truncate">{item.label}</span>}
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </div>

        {/* User Profile & Logout */}
        <div className="p-2.5 border-t border-slate-200 bg-slate-50">
          <div className={`flex items-center gap-2.5 ${isCollapsed ? 'justify-center' : ''}`}>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'K'}
            </div>
            {!isCollapsed && (
              <div className="flex-1 overflow-hidden">
                <p className="text-xs font-bold text-slate-900 truncate">{user?.name || 'Kunwar Gautam'}</p>
                <p className="text-[10px] text-slate-500 truncate">{user?.email || 'kunwarkantikeyagautam@gmail.com'}</p>
              </div>
            )}
            {!isCollapsed && (
              <button
                onClick={handleLogout}
                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Log Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
