import React, { useState } from 'react';
import api from '../api';
import { Loader2, Send, AlertCircle, CheckCircle2, HelpCircle, ShieldCheck, Zap, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Predictor = () => {
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleAnalyze = async () => {
        if (!text.trim()) return;
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await api.post('predict/', { text });
            setResult(response.data);
        } catch (err) {
            setError(err.response?.data?.error || 'Analysis service is temporarily unavailable.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-10">
            <div className="text-center space-y-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="inline-flex items-center gap-2 px-3 py-1 bg-sky-500/10 border border-sky-500/20 rounded-full text-sky-400 text-xs font-bold tracking-widest uppercase"
                >
                    <Zap className="w-3 h-3" />
                    Neural Engine Active
                </motion.div>
                <h1 className="text-5xl font-black tracking-tight bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent">
                    Verify News Integrity
                </h1>
                <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                    Our fine-tuned <span className="text-slate-200 font-semibold">BERT model</span> analyzes semantic patterns to determine the probability of misinformation.
                </p>
            </div>

            <motion.div
                layout
                className="relative group lg:px-4"
            >
                <div className="absolute -inset-1 bg-gradient-to-r from-sky-500 to-indigo-600 rounded-[2rem] blur opacity-25 group-focus-within:opacity-50 transition duration-1000 group-hover:duration-200" />
                <div className="relative glass rounded-[1.8rem] overflow-hidden">
                    <textarea
                        className="w-full h-80 p-8 bg-transparent border-none focus:ring-0 outline-none transition-all resize-none text-slate-100 placeholder-slate-600 text-lg leading-relaxed"
                        placeholder="Paste news content or article snippets here..."
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                    />

                    <div className="absolute bottom-6 left-8 flex items-center gap-2 text-slate-500 text-sm font-medium">
                        <Info className="w-4 h-4" />
                        <span>Minimum 50 words recommended for accuracy</span>
                    </div>

                    <button
                        onClick={handleAnalyze}
                        disabled={loading || !text.trim()}
                        className="absolute bottom-6 right-8 px-8 py-4 bg-white text-slate-950 hover:bg-sky-50 disabled:bg-slate-800 disabled:text-slate-500 font-bold rounded-2xl flex items-center gap-3 transition-all shadow-2xl hover:scale-105 active:scale-95 group/btn"
                    >
                        {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <Send className="w-5 h-5 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                        )}
                        {loading ? 'Processing...' : 'Run Analysis'}
                    </button>
                </div>
            </motion.div>

            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="p-5 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-4 text-rose-400 glass"
                    >
                        <AlertCircle className="w-6 h-6" />
                        <p className="font-medium">{error}</p>
                    </motion.div>
                )}

                {result && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-10 rounded-[2.5rem] border glass relative overflow-hidden`}
                    >
                        {/* Background Glow */}
                        <div className={`absolute -top-24 -right-24 w-64 h-64 blur-[100px] opacity-20 rounded-full ${result.label === 'Real' ? 'bg-emerald-500' : 'bg-rose-500'
                            }`} />

                        <div className="relative grid md:grid-cols-2 gap-12 items-center">
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className={`p-4 rounded-2xl ${result.label === 'Real' ? 'bg-emerald-500/10' : 'bg-rose-500/10'
                                        }`}>
                                        {result.label === 'Real' ? (
                                            <ShieldCheck className="w-10 h-10 text-emerald-400" />
                                        ) : (
                                            <AlertCircle className="w-10 h-10 text-rose-400" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-slate-400 text-sm font-bold tracking-widest uppercase">Verdict</p>
                                        <h3 className={`text-5xl font-black ${result.label === 'Real' ? 'text-emerald-400' : 'text-rose-400'
                                            }`}>
                                            {result.label}
                                        </h3>
                                    </div>
                                </div>

                                <p className="text-slate-400 leading-relaxed font-medium">
                                    Analysis indicates this content is likely <span className="text-slate-200">{result.label.toLowerCase()}</span> news.
                                    The model identified linguistic markers consistent with {result.label === 'Real' ? 'factual reporting' : 'misinformation patterns'}.
                                </p>
                            </div>

                            <div className="flex flex-col items-center justify-center space-y-6 bg-white/5 p-8 rounded-[2rem] border border-white/5">
                                <div className="relative w-40 h-40 flex items-center justify-center">
                                    {/* Progress Circle SVG */}
                                    <svg className="w-full h-full -rotate-90">
                                        <circle
                                            cx="80" cy="80" r="70"
                                            stroke="currentColor"
                                            strokeWidth="12"
                                            fill="transparent"
                                            className="text-white/5"
                                        />
                                        <motion.circle
                                            cx="80" cy="80" r="70"
                                            stroke="currentColor"
                                            strokeWidth="12"
                                            fill="transparent"
                                            strokeDasharray={440}
                                            initial={{ strokeDashoffset: 440 }}
                                            animate={{ strokeDashoffset: 440 - (440 * result.probability) }}
                                            transition={{ duration: 1.5, ease: "easeOut" }}
                                            className={result.label === 'Real' ? 'text-emerald-500' : 'text-rose-500'}
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-4xl font-black text-white">
                                            {Math.round(result.probability * 100)}%
                                        </span>
                                        <span className="text-[10px] text-slate-500 font-bold tracking-tighter uppercase">Confidence</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                        <span className="text-xs text-slate-400 font-semibold">Real Pattern</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-rose-500" />
                                        <span className="text-xs text-slate-400 font-semibold">Fake Pattern</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* New Metadata Section */}
                        <div className="mt-12 pt-12 border-t border-white/5 grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="space-y-2">
                                <p className="text-slate-500 text-[10px] font-bold tracking-widest uppercase">Analysis Engine</p>
                                <div className="flex items-center gap-2 text-slate-200">
                                    <Zap className="w-4 h-4 text-sky-400" />
                                    <span className="font-semibold">{result.model_used}</span>
                                </div>
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <p className="text-slate-500 text-[10px] font-bold tracking-widest uppercase">Verification Status</p>
                                <div className="flex items-center gap-2 text-slate-200">
                                    <ShieldCheck className={`w-4 h-4 ${result.verification.includes('No') ? 'text-slate-500' : 'text-emerald-400'}`} />
                                    <span className="font-medium text-sm leading-relaxed">{result.verification}</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Predictor;
