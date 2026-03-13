import React, { useEffect, useState } from 'react';
import api from '../api';
import { Clock, ExternalLink, ChevronLeft, ChevronRight, Calendar, Hash, ShieldCheck, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

const History = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const response = await api.get(`history/?page=${page}`);
            setData(response.data);
        } catch (err) {
            console.error('Failed to fetch history', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, [page]);

    if (loading && !data) return (
        <div className="flex flex-col items-center justify-center p-24 space-y-4">
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 border-4 border-sky-500/20 border-t-sky-500 rounded-full"
            />
            <p className="text-slate-500 font-medium animate-pulse">Syncing with prediction logs...</p>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/10 rounded-lg">
                            <Clock className="w-5 h-5 text-indigo-400" />
                        </div>
                        <h2 className="text-3xl font-black text-white tracking-tight">Audit History</h2>
                    </div>
                    <p className="text-slate-500 font-medium">Monitoring and logging news classification activities.</p>
                </div>

                <div className="flex items-center gap-3 bg-white/5 border border-white/10 p-1.5 rounded-xl">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={!data?.previous}
                        className="p-2.5 text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-30 rounded-lg transition-all"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div className="px-4 text-sm font-bold text-slate-400 border-x border-white/10">
                        Page {page}
                    </div>
                    <button
                        onClick={() => setPage(p => p + 1)}
                        disabled={!data?.next}
                        className="p-2.5 text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-30 rounded-lg transition-all"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="grid gap-4">
                {data?.results?.map((item, index) => (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="group glass rounded-3xl p-6 hover:bg-white/[0.04] transition-all border border-white/5"
                    >
                        <div className="grid md:grid-cols-12 gap-6 items-center">
                            <div className="md:col-span-2 flex items-center gap-4">
                                <div className="p-3 bg-white/5 rounded-2xl group-hover:scale-110 transition-transform">
                                    <Calendar className="w-5 h-5 text-slate-500" />
                                </div>
                                <div className="md:hidden lg:block">
                                    <p className="text-[11px] font-black text-slate-600 uppercase tracking-tighter">Verified On</p>
                                    <p className="text-sm font-bold text-slate-300">
                                        {new Date(item.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    </p>
                                </div>
                            </div>

                            <div className="md:col-span-6 space-y-2">
                                <p className="text-slate-400 text-sm leading-relaxed line-clamp-2 italic font-medium">
                                    "{item.text}"
                                </p>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded-md">
                                        {item.model_used || 'Legacy Model'}
                                    </span>
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl border ${item.predicted_label === 'Real'
                                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                    : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                                    }`}>
                                    {item.predicted_label === 'Real' ? <ShieldCheck className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                                    <span className="text-sm font-black uppercase tracking-widest">{item.predicted_label}</span>
                                </div>
                            </div>

                            <div className="md:col-span-2 text-right">
                                <div className="inline-flex flex-col items-end">
                                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Confidence</p>
                                    <p className="text-2xl font-black text-slate-200 tabular-nums">
                                        {Math.round(item.probability * 100)}<span className="text-sm text-slate-500 ml-0.5">%</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {data?.results?.length === 0 && (
                <div className="p-20 glass rounded-[3rem] text-center space-y-4">
                    <Hash className="w-12 h-12 text-slate-700 mx-auto" />
                    <p className="text-slate-500 font-bold text-xl">No prediction history found.</p>
                    <p className="text-slate-600">Start by pasting an article in the Inference tab.</p>
                </div>
            )}
        </div>
    );
};

export default History;
