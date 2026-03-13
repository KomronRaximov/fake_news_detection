import React, { useEffect, useState } from 'react';
import api from '../api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { LayoutDashboard, Users, ShieldAlert, BarChart2, Activity, PieChart as PieIcon, Globe, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';

const Stats = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('stats/');
                setStats(response.data);
            } catch (err) {
                console.error('Failed to fetch stats', err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-24 space-y-4">
            <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-16 h-16 bg-emerald-500/10 rounded-3xl flex items-center justify-center"
            >
                <Activity className="w-8 h-8 text-emerald-500" />
            </motion.div>
            <p className="text-slate-500 font-medium animate-pulse">Aggregating intelligence data...</p>
        </div>
    );

    const COLORS = ['#10b981', '#f43f5e', '#64748b'];

    const pieData = stats?.label_stats?.map(item => ({
        name: item.predicted_label,
        value: item.count
    })) || [];

    return (
        <div className="max-w-7xl mx-auto space-y-10 pb-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-sky-500/10 rounded-xl">
                            <LayoutDashboard className="w-6 h-6 text-sky-400" />
                        </div>
                        <h2 className="text-4xl font-black text-white tracking-tight">Intelligence Dashboard</h2>
                    </div>
                    <p className="text-slate-500 font-medium text-lg">Detailed overview of global news classification performance.</p>
                </div>

                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 text-sm font-bold uppercase tracking-wider">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                    Live Services Operational
                </div>
            </div>

            {/* Primary Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Audited', val: stats?.total_count || 0, icon: Globe, color: 'sky' },
                    { label: 'Fake Flagged', val: stats?.label_stats?.find(s => s.predicted_label === 'Fake')?.count || 0, icon: ShieldAlert, color: 'rose' },
                    { label: 'Safe Content', val: stats?.label_stats?.find(s => s.predicted_label === 'Real')?.count || 0, icon: Users, color: 'emerald' },
                    { label: 'Active Nodes', val: stats?.daily_stats?.length || 0, icon: BarChart2, color: 'indigo' },
                ].map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="glass p-8 rounded-[2rem] border border-white/5 space-y-4 hover:bg-white/[0.04] transition-all group"
                    >
                        <div className="flex items-center justify-between">
                            <div className={`p-3 rounded-2xl bg-${stat.color}-500/10 group-hover:scale-110 transition-transform`}>
                                <stat.icon className={`w-6 h-6 text-${stat.color}-400`} />
                            </div>
                            <ArrowUpRight className="w-5 h-5 text-slate-700" />
                        </div>
                        <div>
                            <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">{stat.label}</p>
                            <p className="text-4xl font-black text-slate-100 tabular-nums">{stat.val}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Activity Chart */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="lg:col-span-8 glass p-10 rounded-[2.5rem] border border-white/5 space-y-10"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-indigo-500/10 rounded-xl">
                                <Activity className="w-5 h-5 text-indigo-400" />
                            </div>
                            <h3 className="text-2xl font-black text-white tracking-tight">Verification Volume</h3>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-sky-500" />
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Daily Requests</span>
                            </div>
                        </div>
                    </div>

                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats?.daily_stats}>
                                <defs>
                                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" vertical={false} />
                                <XAxis
                                    dataKey="day"
                                    stroke="#475569"
                                    fontSize={11}
                                    tickLine={false}
                                    axisLine={false}
                                    dy={10}
                                />
                                <YAxis
                                    stroke="#475569"
                                    fontSize={11}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', color: '#f8fafc' }}
                                    itemStyle={{ color: '#0ea5e9', fontWeight: 'bold' }}
                                />
                                <Area type="monotone" dataKey="count" stroke="#0ea5e9" strokeWidth={4} fillOpacity={1} fill="url(#colorCount)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Breakdown Chart */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="lg:col-span-4 glass p-10 rounded-[2.5rem] border border-white/5 space-y-10"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-emerald-500/10 rounded-xl">
                            <PieIcon className="w-5 h-5 text-emerald-400" />
                        </div>
                        <h3 className="text-2xl font-black text-white tracking-tight">Classification</h3>
                    </div>

                    <div className="h-64 relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={75}
                                    outerRadius={100}
                                    paddingAngle={8}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cornerRadius={8} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', color: '#f8fafc' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest leading-none">Total</span>
                            <span className="text-3xl font-black text-white leading-none">{stats?.total_count}</span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {pieData.map((item, i) => (
                            <div key={item.name} className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                    <span className="text-sm font-bold text-slate-300 uppercase tracking-tight">{item.name}</span>
                                </div>
                                <span className="text-slate-400 font-black tabular-nums">{item.value}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Stats;
