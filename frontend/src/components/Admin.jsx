import React, { useState, useEffect } from 'react';
import api, { clearAuthTokens } from '../api';
import { LogIn, User, Shield, Lock, Loader2, LogOut, CheckCircle, Database, Users, Globe, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AuthPortal = ({ onAuthSuccess }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');
        const endpoint = isLogin ? 'login/' : 'register/';
        const payload = isLogin ? { username, password } : { username, email, password };

        try {
            if (isLogin) {
                clearAuthTokens();
            }
            const res = await api.post(endpoint, payload);
            if (res.data.success) {
                if (isLogin) {
                    // Store tokens in localStorage
                    localStorage.setItem('access_token', res.data.access);
                    localStorage.setItem('refresh_token', res.data.refresh);
                    onAuthSuccess(res.data.is_staff, res.data.username);
                } else {
                    setSuccess(res.data.message || 'Registration successful! You can now login.');
                    setIsLogin(true); // Switch to login after registration
                    setUsername(''); // Clear fields
                    setPassword('');
                    setEmail('');
                }
            }
        } catch (err) {
            setError(err.response?.data?.error || err.response?.data?.detail || `${isLogin ? 'Login' : 'Registration'} failed.`);
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="max-w-md mx-auto py-12 px-6">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass p-10 rounded-[2.5rem] border border-white/5 space-y-8"
            >
                <div className="text-center space-y-2">
                    <div className="w-16 h-16 bg-sky-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-sky-500/20">
                        <Shield className="w-8 h-8 text-sky-400" />
                    </div>
                    <h2 className="text-3xl font-black text-white">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
                    <p className="text-slate-500 font-medium text-sm">
                        {isLogin ? 'Verify your identity to continue.' : 'Join the TruthLens AI movement.'}
                    </p>
                </div>

                <div className="grid grid-cols-2 p-1 bg-white/5 rounded-xl border border-white/10">
                    <button
                        onClick={() => setIsLogin(true)}
                        className={`py-2 rounded-lg text-xs font-bold transition-all ${isLogin ? 'bg-sky-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        LOGIN
                    </button>
                    <button
                        onClick={() => setIsLogin(false)}
                        className={`py-2 rounded-lg text-xs font-bold transition-all ${!isLogin ? 'bg-sky-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        REGISTER
                    </button>
                </div>

                <form onSubmit={handleAuth} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Username {isLogin && 'or Email'}</label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input
                                type="text"
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:border-sky-500/50 outline-none transition-all"
                                placeholder={isLogin ? "Username or Email" : "Choose username"}
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {!isLogin && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="space-y-2"
                        >
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Email</label>
                            <div className="relative">
                                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input
                                    type="email"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:border-sky-500/50 outline-none transition-all"
                                    placeholder="your@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </motion.div>
                    )}

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input
                                type="password"
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:border-sky-500/50 outline-none transition-all"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <AnimatePresence>
                        {error && (
                            <motion.p
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="text-rose-500 text-xs font-bold bg-rose-500/10 p-4 rounded-xl border border-rose-500/20"
                            >
                                {error}
                            </motion.p>
                        )}
                        {success && (
                            <motion.p
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="text-emerald-500 text-sm font-bold bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20"
                            >
                                {success}
                            </motion.p>
                        )}
                    </AnimatePresence>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-sky-600 hover:bg-sky-500 py-4 rounded-xl text-white font-bold flex items-center justify-center gap-2 transition-all shadow-xl shadow-sky-600/20 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogIn className="w-5 h-5" />}
                        {isLogin ? (loading ? 'Authenticating...' : 'Authenticate') : (loading ? 'Processing...' : 'Create Account')}
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

const AdminDashboard = ({ onLogout }) => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('stats/');
                setStats(res.data);
            } catch (err) {
                console.error('Failed to load admin stats', err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return (
        <div className="p-24 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-12 h-12 text-sky-500 animate-spin" />
            <p className="text-slate-500 font-bold uppercase tracking-widest">Hydrating Dashboard...</p>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto py-12 px-6 space-y-12">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black text-white tracking-tight">Admin Intelligence</h1>
                    <p className="text-slate-500 font-medium">Privileged access to global misinformation analytics.</p>
                </div>
                <button
                    onClick={onLogout}
                    className="bg-white/5 border border-white/10 px-6 py-2.5 rounded-xl text-slate-300 font-bold flex items-center gap-2 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/20 transition-all"
                >
                    <LogOut className="w-4 h-4" />
                    End Session
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="glass p-8 rounded-[2rem] border border-white/5 text-center space-y-4">
                    <div className="w-12 h-12 bg-sky-500/10 rounded-2xl flex items-center justify-center mx-auto border border-sky-500/20">
                        <Users className="w-6 h-6 text-sky-400" />
                    </div>
                    <div>
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Global Samples</p>
                        <p className="text-5xl font-black text-white tabular-nums">{stats?.total_count}</p>
                    </div>
                </div>
                <div className="glass p-8 rounded-[2rem] border border-white/5 text-center space-y-4">
                    <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto border border-emerald-500/20">
                        <Database className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Database State</p>
                        <p className="text-5xl font-black text-white uppercase tracking-tighter">Healthy</p>
                    </div>
                </div>
                <div className="glass p-8 rounded-[2rem] border border-white/5 text-center space-y-4">
                    <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center mx-auto border border-indigo-500/20">
                        <Globe className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div>
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Regional Coverage</p>
                        <p className="text-5xl font-black text-white uppercase tracking-tighter">Global</p>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <div className="flex items-center gap-2 ml-4">
                    <CheckCircle className="w-5 h-5 text-sky-500" />
                    <h3 className="text-xl font-bold text-slate-200">System Monitoring</h3>
                </div>
                <div className="glass rounded-[2rem] border border-white/5 p-8 flex items-center justify-between">
                    <div className="space-y-1">
                        <p className="text-white font-bold">BERT Model Engine</p>
                        <p className="text-slate-500 text-sm">Version 1.0.4-stable • Local Inference Mode</p>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="text-right">
                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Status</p>
                            <p className="text-emerald-500 font-black">OPERATIONAL</p>
                        </div>
                        <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center">
                            <div className="w-3 h-3 bg-emerald-500 rounded-full animate-ping" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const UserDashboard = ({ username, onLogout }) => {
    return (
        <div className="max-w-4xl mx-auto py-12 px-6 space-y-12">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black text-white tracking-tight">Welcome, {username}</h1>
                    <p className="text-slate-500 font-medium">You are now part of the truth-seeking community.</p>
                </div>
                <button
                    onClick={onLogout}
                    className="bg-white/5 border border-white/10 px-6 py-2.5 rounded-xl text-slate-300 font-bold flex items-center gap-2 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/20 transition-all"
                >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                </button>
            </div>

            <div className="glass p-12 rounded-[2.5rem] border border-white/5 text-center space-y-8">
                <div className="w-20 h-20 bg-sky-500/10 rounded-full flex items-center justify-center mx-auto border border-sky-500/20">
                    <User className="w-10 h-10 text-sky-400" />
                </div>
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-white">Your Profile Active</h2>
                    <p className="text-slate-400 max-w-md mx-auto">
                        Your prediction history is now securely linked to your account. You can access it from the History tab.
                    </p>
                </div>
                <div className="flex justify-center gap-4">
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Account Type</p>
                        <p className="text-lg font-bold text-slate-200">Regular User</p>
                    </div>
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</p>
                        <p className="text-lg font-bold text-emerald-400">Verified</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export { AuthPortal, AdminDashboard, UserDashboard };
