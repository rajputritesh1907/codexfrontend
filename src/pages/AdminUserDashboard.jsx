import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api_base_url } from '../helper';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';
import ProjectsTimeline from '../components/ProjectsTimeline';
import AdminUserDashboardSkeleton from '../components/skeletons/AdminUserDashboardSkeleton';

import { FaUser, FaProjectDiagram, FaRegThumbsUp, FaRegCommentDots, FaUserFriends } from 'react-icons/fa';

export default function AdminUserDashboard() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        const run = async () => {
            setLoading(true);
            setError('');
            try {
                const token = (() => {
                    try { return localStorage.getItem('adminToken'); } catch { return null; }
                })();
                const headers = token ? { 'x-admin-token': token } : {};
                const res = await fetch(`${api_base_url}/api/admin/users/${id}/summary`, { headers, credentials: 'include' });
                let json = {}; try { json = await res.json(); } catch { }
                if (res.status === 401) { navigate('/admin/login'); return; }
                if (!res.ok || !json.success) { setError(json.message || 'Failed to load user'); }
                else if (!cancelled) { setData(json); }
            } catch (e) { if (!cancelled) setError('Network error'); }
            finally { if (!cancelled) setLoading(false); }
        };
        run();
        return () => { cancelled = true; };
    }, [id, navigate]);

    // Do not early-return before hooks below; keep hook order stable across renders.

    // Prepare chart data
    const revenueData = useMemo(() => {
        if (!data?.projects) return [];
        const counts = new Map();
        data.projects.forEach(p => {
            try {
                const dRaw = p.createdAt || p.date;
                if (!dRaw) return;
                const d = new Date(dRaw);
                if (isNaN(d.getTime())) return;
                const key = d.toLocaleString('en', { day: 'numeric', month: 'short' }).toUpperCase();
                counts.set(key, (counts.get(key) || 0) + 1);
            } catch { }
        });
        return Array.from(counts.entries()).slice(-8).map(([name, value]) => ({ name, value }));
    }, [data]);

const salesData = useMemo(() => {
    // Always show these languages, even if count is zero
    const allLanguages = [
        'C++', 'C', 'JS', 'Py', 'Node', 'Java', 'Web'
    ];
    // Map API language names to display names
    const langMap = {
        'javascript': 'JS',
        'js': 'JS',
        'python': 'Py',
        'py': 'Py',
        'c++': 'C++',
        'c': 'C',
        'node': 'Node',
        'java': 'Java',
        'web': 'Web'
    };
    const stats = (data?.stats?.topLanguages || [])
        .filter(l => l && typeof l.language === 'string' && typeof l.count === 'number')
        .map(l => ({
            name: langMap[l.language.toLowerCase()] || l.language,
            value: l.count
        }));
    // Build a map for fast lookup
    const statsMap = new Map(stats.map(l => [l.name, l.value]));
    // Output allLanguages with their count, plus any extra languages
    const arr = allLanguages.map(lang => ({
        name: lang,
        value: statsMap.get(lang) || 0
    }));
    // Add any extra languages not in allLanguages
    stats.forEach(l => {
        if (!allLanguages.includes(l.name)) {
            arr.push({ name: l.name, value: l.value });
        }
    });
    // Sort by usage count descending
    return arr.sort((a, b) => b.value - a.value);
}, [data]);

    const languageTotals = useMemo(() => {
        const total = salesData.reduce((a, b) => a + b.value, 0);
        return {
            total,
            enriched: salesData.map(d => ({ ...d, percent: total ? (d.value / total) * 100 : 0 }))
        };
    }, [salesData]);

    // Friends list (safe fallback from several possible API shapes)
    const friendsList = useMemo(() => {

        if (!data) return [];
        if (Array.isArray(data.friends)) return data.friends;
        if (Array.isArray(data.stats?.friends)) return data.stats.friends;
        if (Array.isArray(data.user?.friends)) return data.user.friends;
        return [];
    }, [data]);

    const COLORS = ['#6366F1', '#14b8a6', '#f59e0b', '#ec4899', '#8b5cf6', '#0ea5e9'];

    // Compute last 7 days project counts for a tiny sparkline
    const last7Counts = useMemo(() => {
        const arr = new Array(7).fill(0);
        if (!data?.projects) return arr;
        const today = new Date();
        const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        start.setDate(start.getDate() - 6);
        data.projects.forEach(p => {
            try {
                const dRaw = p.createdAt || p.date;
                if (!dRaw) return;
                const d = new Date(dRaw);
                const day = new Date(d.getFullYear(), d.getMonth(), d.getDate());
                const diff = Math.round((day - start) / (1000 * 60 * 60 * 24));
                if (diff >= 0 && diff < 7) arr[diff]++;
            } catch (e) { }
        });
        return arr;
    }, [data]);

    // Previous 7 days (days -13 to -7) for growth comparison
    const prev7Total = useMemo(() => {
        if (!data?.projects) return 0;
        const today = new Date();
        const endPrev = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7); // inclusive end of previous window
        const startPrev = new Date(endPrev);
        startPrev.setDate(startPrev.getDate() - 6);
        let count = 0;
        data.projects.forEach(p => {
            try {
                const dRaw = p.createdAt || p.date; if (!dRaw) return;
                const d = new Date(dRaw);
                const day = new Date(d.getFullYear(), d.getMonth(), d.getDate());
                if (day >= startPrev && day <= endPrev) count++;
            } catch { }
        });
        return count;
    }, [data]);

    const last7Total = useMemo(() => last7Counts.reduce((a, b) => a + b, 0), [last7Counts]);
    const projectGrowthPct = useMemo(() => {
        if (prev7Total === 0) return last7Total > 0 ? 100 : 0;
        return Math.round(((last7Total - prev7Total) / prev7Total) * 100);
    }, [last7Total, prev7Total]);

    // Tiny inline sparkline SVG
    function Sparkline({ values = [], color = '#60A5FA', width = 100, height = 28 }) {
        if (!values || values.length === 0) return null;
        const max = Math.max(...values, 1);
        const step = width / Math.max(values.length - 1, 1);
        const points = values.map((v, i) => `${i * step},${height - (v / max) * height}`).join(' ');
        return (
            <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="block mt-2">
                <polyline fill="none" stroke={color} strokeWidth="2" points={points} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        );
    }

    return (
        <div className="min-h-screen flex flex-col text-white">
            {/* Top bar */}
            <div className="shrink-0 p-4 flex items-center gap-4 backdrop-blur-sm bg-dark-800/70 border-b border-dark-700/50">
                <button onClick={() => navigate(-1)} className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-700 via-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-400 text-xs font-semibold shadow transition-all duration-200">← Back</button>
                {/* {loading && <p className="text-cyan-300 text-xs animate-pulse">Loading...</p>} */}
                {error && <div className="bg-red-500/10 border border-red-500/30 text-red-300 px-3 py-1 rounded text-xs shadow">{error}</div>}
            </div>
            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-2 md:px-6 pb-10 pt-4 space-y-6 custom-scrollbar">
                {loading ? (
                    <AdminUserDashboardSkeleton />
                ) : (!error && data) && (
                    <div className="space-y-6"> 
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4 md:gap-0">
                            <div className="flex items-center gap-4">
                                {data.user.profilePicture ? (
                                    <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-tr from-indigo-600/40 to-cyan-400/30 shadow-lg border-2 border-indigo-500">
                                        <img src={data.user.profilePicture} alt={data.user.username} className="w-full h-full object-cover" />
                                    </div>
                                ) : (
                                    <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold bg-indigo-500/30 text-indigo-200 shadow-lg border-2 border-indigo-500">
                                        <FaUser className="mr-1" />{(data.user.username?.[0] || '?').toUpperCase()}
                                    </div>
                                )}
                                <div>
                                    <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight flex items-center gap-2">User, {data.user.username} <span className="animate-wiggle"> </span></h1>
                                    <p className="text-xs md:text-sm text-gray-400 mt-1">Joined <span className="font-semibold text-indigo-300">{new Date(data.user.joined).toLocaleDateString()}</span> • Last login <span className="font-semibold text-cyan-300">{new Date(data.user.lastLogin || data.user.joined).toLocaleDateString()}</span></p>
                                </div>
                            </div>
                             
                        </div>

                        <div className="flex flex-col md:flex-row w-full gap-4">
                            <div className="w-full md:w-1/2 flex flex-row gap-4 px-0 md:px-5">
                                <div className="flex flex-col gap-4 flex-1">
                                    <Card className="flex-1 rounded-2xl   p-0 shadow-lg bg-gradient-to-br from-indigo-900/40 to-gray-900/60 border border-indigo-700/20 hover:scale-[1.02] transition-transform duration-200">
                                        <CardContent>
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <p className="text-xs text-gray-400 flex items-center gap-1"><FaProjectDiagram className="inline-block mr-1 text-indigo-400" /> Projects</p>
                                                    <h2 className="text-3xl font-extrabold text-indigo-300 drop-shadow-lg">{data.stats.projectCount}</h2>
                                                </div>
                                                <div className="text-right">
                                                    <FaProjectDiagram className="text-3xl text-indigo-400/80 drop-shadow" />
                                                </div>
                                            </div>
                                            <div className="mt-3">
                                                <div className="text-xs text-gray-400 mb-2 font-semibold">Recent projects</div>
                                                <ul className="space-y-2">
                                                    {Array.isArray(data.projects) && data.projects.length > 0 ? (
                                                        [...data.projects]
                                                            .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))
                                                            .slice(0, 5)
                                                            .map(p => (
                                                                <li key={p._id || p.id || (p.title || Math.random())} className="flex items-center justify-between group">
                                                                    <button
                                                                        onClick={() => navigate(`/admin/project/${p._id || p.id}`)}
                                                                        className="text-sm text-indigo-200 group-hover:text-cyan-300 hover:underline truncate text-left font-medium transition-colors duration-150"
                                                                        title={p.title || 'Untitled project'}
                                                                    >
                                                                        {p.title || p.name || 'Untitled project'}
                                                                    </button>
                                                                    <div className="text-xs text-gray-500 ml-3">
                                                                        {p.createdAt || p.date ? new Date(p.createdAt || p.date).toLocaleDateString() : ''}
                                                                    </div>
                                                                </li>
                                                            ))
                                                    ) : (
                                                        <li className="text-xs text-gray-500">No projects</li>
                                                    )}
                                                </ul>
                                            </div>
                                        </CardContent>
                                    </Card>
                                    <Card className="flex-1 rounded-2xl   p-0 shadow-lg bg-gradient-to-br from-cyan-900/40 to-gray-900/60 border border-cyan-700/20 hover:scale-[1.02] transition-transform duration-200">
                                        <CardContent>
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <p className="text-xs text-gray-400 mb-2 font-semibold">Languages Used</p>
                                                    {/* Bar graph for top languages */}
                                                    <div style={{ width: '100%', height: 120 }} className="rounded-xl bg-gray-800/30 p-2">
                                                        <ResponsiveContainer width="100%" height={120}>
                                                            <BarChart data={salesData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                                                                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#a3a3a3' }} axisLine={false} tickLine={false} />
                                                                <YAxis tick={{ fontSize: 10, fill: '#a3a3a3' }} axisLine={false} tickLine={false} allowDecimals={false} width={24} />
                                                                <Tooltip contentStyle={{ background: '#111827', border: '1px solid #374151', fontSize: '11px' }} />
                                                                <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="#06b6d4">
                                                                    {salesData.map((entry, index) => (
                                                                        <Cell key={`bar-cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                                    ))}
                                                                </Bar>
                                                            </BarChart>
                                                        </ResponsiveContainer>
                                                    </div>
                                                    <ul className="mt-2 text-xs text-gray-400">
                                                        {salesData.map((lang, idx) => (
                                                            <li key={lang.name} className="flex items-center gap-2">
                                                                <span className="inline-block w-2 h-2 rounded-sm" style={{ background: COLORS[idx % COLORS.length] }}></span>
                                                                <span className="text-gray-300 font-medium">{lang.name}</span>
                                                                <span className="ml-1 text-gray-400">({lang.value})</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                                <div className="ml-2">
                                                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                                                        <path d="M4 4h16v5H4zM4 11h10v9H4z" fill="#06b6d4" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                                 
                            </div>
                            <div className="w-full md:w-1/2 flex flex-col gap-4 px-0 md:px-5">
                                <Card className="flex-1 rounded-2xl     p-0 shadow-lg bg-gradient-to-br from-indigo-600/30 via-indigo-500/10 to-transparent border border-indigo-500/20 hover:scale-[1.02] transition-transform duration-200">
                                    <CardContent className="pb-3">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h2 className="text-xl font-semibold flex items-center gap-2"><FaRegThumbsUp className="text-indigo-400" /> Posts Overview</h2>
                                                <p className="text-gray-500 text-[10px] mt-0.5">Total posts, likes, comments</p>
                                            </div>
                                            <div className="w-10 h-10 rounded-md bg-indigo-500/20 flex items-center justify-center">
                                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M3 4h18v10H9l-6 6V4z" fill="#6366F1" /></svg>
                                            </div>
                                        </div>
                                        <div className="mt-3 grid grid-cols-3 gap-2 text-[11px]">
                                            <div className="flex flex-col bg-gray-800/60 rounded-lg p-2 shadow">
                                                <span className="text-gray-400">Posts</span>
                                                <span className="text-indigo-300 font-semibold text-sm">{data.stats.postsCount || 0}</span>
                                            </div>
                                            <div className="flex flex-col bg-gray-800/60 rounded-lg p-2 shadow">
                                                <span className="text-gray-400">Likes</span>
                                                <span className="text-indigo-300 font-semibold text-sm">{data.stats.likesCount || 0}</span>
                                            </div>
                                            <div className="flex flex-col bg-gray-800/60 rounded-lg p-2 shadow">
                                                <span className="text-gray-400">Comments</span>
                                                <span className="text-indigo-300 font-semibold text-sm">{data.stats.commentsCount || 0}</span>
                                            </div>
                                        </div>
                                        <div className="mt-4">
                                            {/* Sparkline for avg likes/comments per post */}
                                            <div className="flex items-center gap-4">
                                                <div className="flex-1">
                                                    <span className="text-[10px] text-gray-400">Avg Likes & Comments per Post (last 7 posts)</span>
                                                    <Sparkline values={
                                                        (() => {
                                                            if (!data?.posts || !Array.isArray(data.posts)) return [];
                                                            // Take last 7 posts (by createdAt descending)
                                                            const sorted = [...data.posts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 7).reverse();
                                                            return sorted.map(p => ((p.likesCount || 0) + (p.commentsCount || 0)) / 2);
                                                        })()
                                                    } color="#6366F1" width={120} height={28} />
                                                </div>
                                                <div className="flex flex-col text-[10px] text-right">
                                                    <span className="text-gray-400">Avg Likes</span>
                                                    <span className="text-indigo-300 font-semibold">{data.stats.postsCount ? ((data.stats.likesCount || 0) / data.stats.postsCount).toFixed(1) : '0.0'}</span>
                                                    <span className="text-gray-400 mt-1">Avg Comments</span>
                                                    <span className="text-indigo-300 font-semibold">{data.stats.postsCount ? ((data.stats.commentsCount || 0) / data.stats.postsCount).toFixed(1) : '0.0'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card className="flex-1 rounded-2xl  p-0 shadow-lg bg-gradient-to-br from-emerald-600/30 via-emerald-500/10 to-transparent border border-emerald-500/20 hover:scale-[1.02] transition-transform duration-200">
                                    <CardContent className="pb-3">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h2 className="text-xl font-semibold flex items-center gap-2"><FaUserFriends className="text-emerald-400" /> {data.stats.friendsCount || 0} friends</h2>
                                                <p className="text-gray-500 text-[10px] mt-0.5">{(data.stats.friendsCount || 0) ? 'Connections present' : 'No friends yet'}</p>
                                            </div>
                                            <div className="w-10 h-10 rounded-md bg-emerald-500/20 flex items-center justify-center">
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 11a4 4 0 100-8 4 4 0 000 8zM4 21a8 8 0 0116 0H4z" fill="#10B981" /></svg>
                                            </div>
                                        </div>
                                        <div className="mt-2 text-[10px] text-gray-500">Friends</div>
                                        <div className="mt-1.5 flex -space-x-2">
                                            {/* ...existing code... */}
                                            {(data.stats.friendsCount || 0) > 5 && <div className="w-6 h-6 rounded-full bg-emerald-700/40 border border-emerald-500/40 text-[10px] flex items-center justify-center text-emerald-200 shadow">+{(data.stats.friendsCount || 0) - 5}</div>}
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="flex -space-x-2">
                                                {friendsList.slice(0, 5).map((f, i) => (
                                                    <div key={String(f._id || f.id || f.username || i)} className="relative group">
                                                        <div
                                                            className="w-9 h-9 rounded-full overflow-hidden border-2 border-emerald-500/60 cursor-pointer shadow-lg group-hover:scale-110 transition-transform duration-150"
                                                            title={f.username || f.name || 'Friend'}
                                                            role="button"
                                                            tabIndex={0}
                                                            onClick={() => { if (f._id) navigate(`/admin/users/${f._id}`); }}
                                                        >
                                                            {f.profilePicture ? (
                                                                <img src={f.profilePicture} alt={f.username || f.name} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center bg-emerald-600/30 text-emerald-200 text-[13px] font-bold"><FaUser className="mr-1" />{(f.username || f.name || '?')[0]?.toUpperCase()}</div>
                                                            )}
                                                        </div>
                                                        <button
                                                            aria-label={`Chat with ${f.username || f.name || 'friend'}`}
                                                            className="absolute -right-1 -bottom-1 w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center border border-gray-800 shadow group-hover:bg-cyan-500 transition-colors duration-150"
                                                            onClick={(e) => { e.stopPropagation(); if (f._id) navigate(`/messages?userId=${data.user._id}&friendId=${f._id}`); }}
                                                        >
                                                            <FaRegCommentDots />
                                                        </button>
                                                    </div>
                                                ))}
                                                {friendsList.length > 5 && (
                                                    <div className="w-8 h-8 rounded-full bg-emerald-700/40 border-2 border-emerald-500/40 flex items-center justify-center text-[11px] shadow">+{friendsList.length - 5}</div>
                                                )}
                                            </div>
                                            <div className="flex flex-col text-sm">
                                                {/* <div className="text-[11px] text-gray-400">Friends</div> */}
                                                <div className="text-[12px] text-gray-200 font-medium">
                                                    {friendsList.slice(0, 3).map((f, i) => (f.username || f.name)).filter(Boolean).map((name, idx) => {
                                                        const f = friendsList.slice(0, 3)[idx];
                                                        return f && f._id ? (
                                                            <button key={String(f._id)} onClick={() => navigate(`/admin/users/${f._id}`)} className="text-indigo-300 hover:underline mr-1">{name}</button>
                                                        ) : (
                                                            <span key={idx}>{name}</span>
                                                        );
                                                    }).reduce((acc, cur, idx) => idx === 0 ? [cur] : [...acc, ', ', cur], [])}
                                                </div>
                                                {data?.user?._id ? (
                                                    <div
                                                        role="button"
                                                        tabIndex={0}
                                                        className="text-indigo-300 hover:underline cursor-pointer mt-1 text-sm"
                                                        onClick={() => navigate(`/messages?friendId=${data.user._id}`)}
                                                    >
                                                        See chats
                                                    </div>
                                                ) : (
                                                    <div className="text-gray-500 text-sm mt-1">No chats</div>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                            
                                      <div className='w-full md:w-1/3 pr-0 md:pr-4'>
                                <Card className="rounded-2xl shadow-lg bg-gradient-to-br from-gray-900/60 to-indigo-900/30 border border-indigo-700/20 hover:scale-[1.02] transition-transform duration-200">
                                    <CardContent className="flex flex-col pb-3">
                                        <h3 id="languages-share-title" className="mb-1.5 font-semibold text-sm flex items-center gap-2"><FaProjectDiagram className="text-indigo-400" /> Languages Share</h3>
                                        <p className="text-[9px] text-gray-400 mb-2">Top {salesData.length || 0} languages{languageTotals.total === 0 ? '' : ` • Total ${languageTotals.total}`}</p>
                                        {salesData.length === 0 || languageTotals.total === 0 ? (
                                            <p className="text-xs text-gray-500">No language data.</p>
                                        ) : (
                                            <div className="flex flex-col sm:flex-row sm:items-center gap-4" aria-labelledby="languages-share-title">
                                                <div className="w-full sm:w-[200px]"><ResponsiveContainer width="100%" height={170}>
                                                    <PieChart>
                                                        <Pie
                                                            data={languageTotals.enriched}
                                                            dataKey="value"
                                                            nameKey="name"
                                                            outerRadius={70}
                                                            innerRadius={40}
                                                            stroke="#111827"
                                                            strokeWidth={2}
                                                            isAnimationActive={false}
                                                        >
                                                            {languageTotals.enriched.map((entry, index) => (
                                                                <Cell key={`lang-cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                            ))}
                                                        </Pie>
                                                        <Tooltip
                                                            formatter={(value, _name, props) => {
                                                                const pct = props?.payload?.percent ? (props.payload.percent * 100).toFixed(1) : ((value / languageTotals.total) * 100).toFixed(1);
                                                                return [`${value} repos`, `${pct}%`];
                                                            }}
                                                            contentStyle={{ background: '#111827', border: '1px solid #374151', fontSize: '11px' }}
                                                        />
                                                        {/* Center summary */}
                                                        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-gray-300" style={{ fontSize: '9px' }}>
                                                            <tspan x="50%" dy="-0.4em" className="font-semibold fill-white">{languageTotals.enriched[0].name}</tspan>
                                                            <tspan x="50%" dy="1.2em" className="fill-indigo-300">{languageTotals.enriched[0].percent.toFixed(1)}%</tspan>
                                                        </text>
                                                    </PieChart>
                                                </ResponsiveContainer></div>
                                                <ul className="flex-1 flex flex-col gap-1.5 text-[10px] min-w-[120px] max-h-48 overflow-auto pr-1 custom-scrollbar" role="list">
                                                    {languageTotals.enriched.map((l, i) => (
                                                        <li key={l.name + i} className="flex items-center justify-between gap-3 group">
                                                            <span className="flex items-center gap-2 min-w-0">
                                                                <span className="w-2.5 h-2.5 rounded-sm ring-2 ring-gray-900" style={{ background: COLORS[i % COLORS.length] }} />
                                                                <span className="text-gray-300 truncate" title={l.name}>{l.name}</span>
                                                            </span>
                                                            <span className="flex items-center gap-2 tabular-nums">
                                                                <span className="text-gray-400">{Math.round(l.percent)}%</span>
                                                                <span className="text-gray-600">({l.value})</span>
                                                            </span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </div>


                       

                        {/* Extra Cards moved above into second section */}
                    </div>
                )}
            </div>
        </div>
    );
}

// Reusable UI wrappers
function Card({ children, className = '' }) {
    return <div className={`bg-gray-900/90 text-white rounded-2xl shadow-lg border border-gray-800/40 hover:shadow-2xl transition-shadow duration-200 ${className}`}>{children}</div>;
}
function CardContent({ children, className = '' }) {
    return <div className={"p-4 " + className}>{children}</div>;
}
