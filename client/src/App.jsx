import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Providers & Components
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import DisclaimerBanner from './components/DisclaimerBanner';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import TextGenerator from './pages/TextGenerator';
import ImageGenerator from './pages/ImageGenerator';
import DocumentAnalyzer from './pages/DocumentAnalyzer';
import ResumeAnalyzer from './pages/ResumeAnalyzer';
import ArticleGenerator from './pages/ArticleGenerator';
import TitleGenerator from './pages/TitleGenerator';
import Documents from './pages/Documents';
import History from './pages/History';
import Profile from './pages/Profile';
import Settings from './pages/Settings';

const AppLayout = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex">
      {/* Responsive Sidebar */}
      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          isCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        <Navbar onOpenMobileSidebar={() => setIsMobileOpen(true)} />
        <DisclaimerBanner />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export const App = () => {
  return (
    <AuthProvider>
      <ToastProvider>
        <Routes>
          {/* Public Landing & Authentication Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Application Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Dashboard />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/text-generator"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <TextGenerator />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/image-generator"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <ImageGenerator />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/document-analyzer"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <DocumentAnalyzer />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/resume-analyzer"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <ResumeAnalyzer />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/article-generator"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <ArticleGenerator />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/title-generator"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <TitleGenerator />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/documents"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Documents />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <History />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Profile />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Settings />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ToastProvider>
    </AuthProvider>
  );
};

export default App;
