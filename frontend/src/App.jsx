import React, { useState, useEffect } from 'react';
import Predictor from './components/Predictor';
import History from './components/History';
import Stats from './components/Stats';
import { AuthPortal, AdminDashboard, UserDashboard } from './components/Admin';
import { Newspaper, History as HistoryIcon, LayoutDashboard, BrainCircuit, Sparkles, User as UserIcon, Loader2, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api, { clearAuthTokens } from './api';

function App() {
  const [activeTab, setActiveTab] = useState('predictor');
  const [isStaff, setIsStaff] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  useEffect(() => {
    const checkVerifyToken = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('verify_token');
      if (token) {
        try {
          const res = await api.get(`verify-email/${token}/`);
          alert(res.data.message || 'Verification complete!');
          // Clean up URL
          window.history.replaceState({}, document.title, window.location.pathname);
        } catch (err) {
          alert('Verification failed: ' + (err.response?.data?.error || 'Invalid token'));
        }
      }
    };

    const checkUser = async () => {
      try {
        const res = await api.get('user/');
        if (res.data.username) {
          setIsAuthenticated(true);
          setIsStaff(res.data.is_staff);
          setUsername(res.data.username);
        }
      } catch (err) {
        if (err.response?.status === 401) {
          clearAuthTokens();
        }
        console.error('Auth check failed', err);
      } finally {
        setIsAuthChecking(false);
      }
    };

    checkVerifyToken().then(checkUser);
  }, []);

  const handleLogout = async () => {
    clearAuthTokens();
    setIsAuthenticated(false);
    setIsStaff(false);
    setUsername('');
    if (activeTab === 'admin') setActiveTab('predictor');
    try {
      await api.post('logout/');
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  const navItems = [
    { id: 'predictor', label: 'Inference', icon: BrainCircuit },
    { id: 'history', label: 'History', icon: HistoryIcon },
    { id: 'stats', label: 'Analytics', icon: LayoutDashboard },
    { id: 'admin', label: 'Account', icon: UserIcon },
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans selection:bg-sky-500/30 overflow-x-hidden relative">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-sky-500/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full animate-pulse delay-700" />
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-slate-950/60 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="relative group cursor-pointer" onClick={() => setActiveTab('predictor')}>
              <div className="absolute inset-0 bg-sky-500 blur-lg opacity-20 group-hover:opacity-40 transition-opacity animate-pulse" />
              <img
                src="/logo.png"
                alt="TruthLens AI Logo"
                className="relative h-40 w-auto object-contain transition-transform group-hover:scale-105"
              />
            </div>
          </motion.div>

          {isAuthenticated ? (
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-1.5 p-1.5 bg-white/5 border border-white/10 rounded-2xl">
                {navItems.filter(item => item.id !== 'admin').map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`relative flex items-center gap-2.5 px-6 py-2.5 rounded-xl transition-all duration-500 group ${activeTab === item.id
                      ? 'text-white'
                      : 'text-slate-400 hover:text-slate-100'
                      }`}
                  >
                    {activeTab === item.id && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-gradient-to-r from-sky-600 to-indigo-600 rounded-xl shadow-lg shadow-sky-600/20"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <item.icon className={`relative w-4 h-4 transition-colors ${activeTab === item.id ? 'text-white' : 'group-hover:text-sky-400'}`} />
                    <span className="relative text-sm font-semibold tracking-wide">{item.label}</span>
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-4 pl-4 border-l border-white/10">
                <div className="text-right hidden sm:block">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{isStaff ? 'Admin Access' : 'Verified User'}</p>
                  <p className="text-sm font-bold text-slate-200">{username}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-3 bg-white/5 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 border border-white/10 hover:border-rose-500/20 rounded-xl transition-all"
                  title="Sign Out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="text-sm font-bold text-slate-500 animate-pulse">
              Secure Authentication Required
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto py-12 px-6">
        <AnimatePresence mode="wait">
          {isAuthChecking ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
            </div>
          ) : !isAuthenticated ? (
            <motion.div
              key="auth"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <AuthPortal onAuthSuccess={(staff, uname) => {
                setIsStaff(staff);
                setIsAuthenticated(true);
                setUsername(uname);
                setActiveTab('predictor');
              }} />
            </motion.div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              {activeTab === 'predictor' && <Predictor />}
              {activeTab === 'history' && <History />}
              {activeTab === 'stats' && <Stats />}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-12 mt-12 bg-slate-950/40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 text-slate-500">
            <Sparkles className="w-4 h-4 text-sky-500" />
            <p className="text-sm font-medium tracking-wide">BERT-Powered Fake News Classification</p>
          </div>
          <p className="text-slate-600 text-[13px] font-medium">© 2026 TruthLens AI Platform • All rights reserved</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
