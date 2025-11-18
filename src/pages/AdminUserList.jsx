import React, { useEffect, useState, useMemo } from 'react';
import { api_base_url } from '../helper';
import { useNavigate } from 'react-router-dom';
import AdminUserListSkeleton from '../components/skeletons/AdminUserListSkeleton';

function AdminUserList() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [showHashes, setShowHashes] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmId, setConfirmId] = useState(null); // user id pending deletion
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');
//   const [selected, setSelected] = useState(new Set());
  const [toast, setToast] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const token = (()=>{ try { return localStorage.getItem('adminToken'); } catch { return null; } })();
        const authHeaders = token ? { 'x-admin-token': token } : {};
        const [usersRes, statsRes] = await Promise.all([
          fetch(`${api_base_url}/api/admin/users`, { credentials: 'include', headers: { ...authHeaders } }),
          fetch(`${api_base_url}/api/admin/stats`, { credentials: 'include', headers: { ...authHeaders } })
        ]);
        let usersData = {}; let statsData = {};
        try { usersData = await usersRes.json(); } catch {}
        try { statsData = await statsRes.json(); } catch {}
        if (usersRes.status === 401 || statsRes.status === 401) {
          // Unauthorized -> redirect to admin login
          try { window.location.replace('/admin/login'); return; } catch {}
        }
        if ((!usersRes.ok || !usersData.success) || (!statsRes.ok || !statsData.success)) {
          setError(usersData.message || statsData.message || 'Failed to load dashboard');
          return;
        }
        if (!cancelled) {
          setUsers(usersData.users || []);
          setStats(statsData.stats || null);
        }
      } catch (err) {
        if (!cancelled) setError('Network error fetching data');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  // IMPORTANT: Keep all hooks (useState/useEffect/useMemo/etc.) unconditionally called
  // Do not early-return before hooks below, or it will break the Hooks order between renders.

  const formatDate = (d) => {
    if (!d) return '-';
    try { return new Date(d).toLocaleString(); } catch { return '-'; }
  };

  const filtered = useMemo(()=>{
    let list = [...users];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(u => (u.username||'').toLowerCase().includes(q) || (u.email||'').toLowerCase().includes(q) || String(u._id).includes(q));
    }
    switch (sort) {
      case 'oldest': list.sort((a,b)=> new Date(a.date)-new Date(b.date)); break;
      case 'lastLogin': list.sort((a,b)=> new Date(b.lastLogin||0)-new Date(a.lastLogin||0)); break;
      case 'username': list.sort((a,b)=> (a.username||'').localeCompare(b.username||'')); break;
      case 'newest': default: list.sort((a,b)=> new Date(b.date)-new Date(a.date));
    }
    return list;
  }, [users, search, sort]);

  // Safe to early-return after all hooks have been called in this component
  if (loading) return <AdminUserListSkeleton />;

//   const allSelected = filtered.length>0 && filtered.every(u => selected.has(u._id));
//   const toggleSelectAll = () => setSelected(prev => allSelected ? new Set() : new Set(filtered.map(u=>u._id)));
//   const toggleSelect = (id) => setSelected(prev => { const n=new Set(prev); n.has(id)?n.delete(id):n.add(id); return n; });
  const exportCsv = () => {
    const header=['id','username','email','lastLogin','created'];
    const rows=filtered.map(u=>[u._id,u.username||'',u.email||'',u.lastLogin||'',u.date||'']);
    const csv=[header,...rows].map(r=>r.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(',')).join('\n');
    const blob=new Blob([csv],{type:'text/csv;charset=utf-8;'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='users.csv'; a.click(); URL.revokeObjectURL(a.href);
  };
  const userStatus = (u) => {
    const last=u.lastLogin?new Date(u.lastLogin):null; if(!last) return {label:'Never',color:'bg-dark-700 text-dark-300 border-dark-600'};
    const diffDays=(Date.now()-last.getTime())/86400000;
    if(diffDays<1) return {label:'Today',color:'bg-green-500/15 text-green-400 border-green-500/30'};
    if(diffDays<7) return {label:'Active',color:'bg-blue-500/15 text-blue-400 border-blue-500/30'};
    if(diffDays<30) return {label:'Idle',color:'bg-amber-500/15 text-amber-400 border-amber-500/30'};
    return {label:'Dormant',color:'bg-red-500/15 text-red-400 border-red-500/30'};
  };
  const showToast = (msg,variant='info') => { setToast({msg,variant}); setTimeout(()=>setToast(null),2400); };

  const askDelete = (id) => {
    setDeleteError('');
    setConfirmId(id);
    setConfirmOpen(true);
  };

  const performDelete = async () => {
    if (!confirmId) return;
    const id = confirmId;
    const token = (()=>{ try { return localStorage.getItem('adminToken'); } catch { return null; } })();
    const headers = token ? { 'x-admin-token': token } : {};
    setDeletingId(id);
    setDeleteError('');
    try {
      const res = await fetch(`${api_base_url}/api/admin/users/${id}`, { method: 'DELETE', headers, credentials: 'include' });
      let data = {}; try { data = await res.json(); } catch {}
      if (res.status === 401) { window.location.replace('/admin/login'); return; }
      if (!res.ok || !data.success) {
        setDeleteError(data.message || 'Failed to delete user');
      } else {
        setUsers(u => u.filter(x => x._id !== id));
        setConfirmOpen(false);
        setConfirmId(null);
      }
    } catch {
      setDeleteError('Network error deleting user');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      {/* Mobile Navbar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-dark-800/70 backdrop-blur-sm border-b border-dark-700/50 px-4 py-3 flex items-center justify-between">
        <div className="text-base font-semibold tracking-tight">Admin</div>
        <div className="flex items-center gap-2">
          <button onClick={exportCsv} className="px-3 py-1.5 rounded-lg bg-primary-600/80 border border-primary-500/40 text-xs font-medium">CSV</button>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-[10px] font-medium">AD</div>
        </div>
      </div>
      {/* Spacer for fixed navbar on mobile */}
      <div className="md:hidden h-14" />

      <div className="min-h-screen w-full p-4 md:p-6 text-white">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">User Management</h1>
          <p className="text-dark-300 text-sm mt-1">Monitor users, activity & manage accounts.</p>
        </div>
        <div className="hidden md:flex items-center gap-3">
          <button onClick={exportCsv} className="px-4 py-2 rounded-lg bg-dark-700 hover:bg-dark-600 text-sm border border-dark-500">Export CSV</button>
          <button disabled className="px-4 py-2 rounded-lg bg-primary-600/70 text-sm border border-primary-500/40 cursor-not-allowed">+ Add User</button>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-xs font-medium">AD</div>
        </div>
      </div>
      {error && <div className="bg-red-500/10 border border-red-500/30 text-red-300 p-4 rounded-lg mb-6">{error}</div>}
      {loading && <p className="text-dark-300">Loading...</p>}
      {!loading && !error && (
        <>
          {/* Stats Cards: 2x2 on mobile, 4 across on md+ */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 w-full place-items-center">
            <StatCard className="sm:w-20vh w-[20vh]" label="Total Users" value={stats?.totalUsers ?? 0} />
            <StatCard className="sm:w-20vh w-[20vh]" label="Projects" value={stats?.totalProjects ?? 0} />
            <StatCard className="sm:w-20vh w-[20vh]" label="Posts" value={stats?.totalPosts ?? 0} />
            <StatCard className="sm:w-20vh w-[20vh]" label="Top Language" value={(stats?.topLanguage || '—')} valueClassName="lowercase" />
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-6">
            <div className="flex items-center gap-3 flex-1">
              <div className="relative flex-1 max-w-sm">
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search users..." className="w-full bg-dark-800/70 border border-dark-600 focus:border-primary-500 rounded-lg px-4 py-2.5 text-sm outline-none" />
                {search && <button onClick={()=>setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-dark-300 hover:text-dark-100">✕</button>}
              </div>
              <select value={sort} onChange={e=>setSort(e.target.value)} className="bg-dark-800/70 border border-dark-600 rounded-lg px-3 py-2 text-sm focus:border-primary-500 outline-none">
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="lastLogin">Recent Login</option>
                <option value="username">Username A-Z</option>
              </select>
            </div>
            <div className="flex items-center gap-2 text-xs text-dark-300">
              <span>{filtered.length} shown</span>
              <span className="hidden sm:inline">/ {users.length} total</span>
            </div>
          </div>

          {/* Users Table */}
      <div className="glass rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
  <table className="w-full text-left">
  <thead className="bg-dark-800/60 text-[11px] uppercase tracking-wide">
                  <tr>
        {/* <th className="px-4 py-3 w-10">
            <input type="checkbox" className="accent-primary-500" checked={allSelected} onChange={toggleSelectAll} />
            </th> */}
        <th className="px-4 py-3">User ID</th>
                    <th className="px-4 py-3">Avatar</th>
                    <th className="px-4 py-3">Username</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span>Password Hash</span>
                         
                      </div>
                    </th>
                    <th className="px-4 py-3">Last Login</th>
                    <th className="px-4 py-3">Created</th>
          {/* <th className="px-4 py-3">Status</th> */}
          <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-700/40 text-[13px]">
                  {filtered.map(u => {
                    const status=userStatus(u);
                    return (
                    <tr key={u._id} className="hover:bg-dark-800/40">
                      {/* <td className="px-4 py-3"><input type="checkbox" className="accent-primary-500" checked={selected.has(u._id)} onChange={()=>toggleSelect(u._id)} /></td> */}
                      <td className="px-4 py-3 font-mono text-[10px] max-w-[140px] truncate" title={u._id}>{u._id}</td>
                      <td className="px-4 py-3">
                        <AvatarInline picture={u.profilePicture} username={u.username} />
                      </td>
                      <td className="px-4 py-3 cursor-pointer hover:text-primary-400" onClick={()=> navigate(`/admin/users/${u._id}`)}>{u.username || '—'}</td>
                      <td className="px-4 py-3">{u.email || '—'}</td>
                      <td className="px-4 py-3 max-w-[260px]">
                        {u.password ? (
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[11px] truncate" title={u.password}>
                              {showHashes ? u.password : u.password.slice(0,20) + '…'}
                            </span>
                            <button
                              type="button"
                              onClick={() => { navigator.clipboard.writeText(u.password).then(()=>{ setCopiedId(u._id); setTimeout(()=>setCopiedId(null),1200); }); }}
                              className="text-xs px-2 py-1 rounded bg-dark-700 hover:bg-dark-600 border border-dark-500"
                            >{copiedId === u._id ? 'Copied' : 'Copy'}</button>
                          </div>
                        ) : '—'}
                      </td>
                      <td className="px-4 py-3">{formatDate(u.lastLogin)}</td>
            <td className="px-4 py-3">{formatDate(u.date)}</td>
            {/* <td className="px-4 py-3"><span className={`inline-block px-2 py-1 rounded-full border text-[10px] font-medium ${status.color}`}>{status.label}</span></td> */}
            <td className="px-4 py-3">
                        <button
                          onClick={() => askDelete(u._id)}
                          disabled={deletingId === u._id}
                          className="text-xs px-3 py-1.5 rounded bg-red-600/80 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >Delete</button>
                      </td>
                    </tr>
          )})}
                  {users.length === 0 && (
                    <tr>
            <td colSpan="10" className="px-4 py-6 text-center text-dark-300">No users found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Confirmation Modal Component inline (simple)
        Renders at end so it overlays entire page
      */}
  <DeleteConfirmModal
        open={confirmOpen}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={performDelete}
        busy={deletingId !== null}
        error={deleteError}
      />
  {toast && <ToastInline {...toast} />}
      </div>
    </>
  );
}

// Confirmation Modal Component inline (simple)
// Renders at end so it overlays entire page
function DeleteConfirmModal({ open, onCancel, onConfirm, busy, error }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={busy ? undefined : onCancel}></div>
      <div className="relative w-full max-w-sm mx-auto glass rounded-xl p-6 border border-red-500/30">
        <h2 className="text-lg font-semibold mb-2 text-red-300">Delete User</h2>
        <p className="text-sm text-dark-300 mb-4">This action is permanent and cannot be undone. Are you sure you want to delete this user?</p>
        {error && <div className="mb-3 text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded p-2">{error}</div>}
        <div className="flex items-center justify-end gap-3 mt-2">
          <button
            onClick={onCancel}
            disabled={busy}
            className="px-4 py-2 rounded bg-dark-700 hover:bg-dark-600 disabled:opacity-50 text-sm"
          >Cancel</button>
          <button
            onClick={onConfirm}
            disabled={busy}
            className="px-4 py-2 rounded bg-red-600 hover:bg-red-500 disabled:opacity-50 text-sm font-medium"
          >{busy ? 'Deleting...' : 'Delete'}</button>
        </div>
      </div>
    </div>
  );
}


// Avatar inline uses already-provided picture
function AvatarInline({ picture, username }) {
  if (picture) {
    return (
      <div className="w-10 h-10 rounded-full overflow-hidden bg-dark-700 flex items-center justify-center">
        <img src={picture} alt={username} className="w-full h-full object-cover" />
      </div>
    );
  }
  const initial = (username?.[0] || '?').toUpperCase();
  const palette = ['#6366f1','#8b5cf6','#ec4899','#06b6d4','#10b981','#f59e0b','#ef4444'];
  const color = palette[initial.charCodeAt(0) % palette.length];
  return (
    <div
      className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-semibold"
      style={{ background: color + '33', color }}
    >
      {initial}
    </div>
  );
}

function StatCard({ label, value, className='', valueClassName='' }) {
  return (
    <div className={"relative overflow-hidden rounded-2xl p-5 border border-dark-600/60 bg-gradient-to-br from-dark-700/40 to-dark-800/60 backdrop-blur-sm flex flex-col items-center text-center " + className}>
      <p className="text-[11px] uppercase tracking-wide text-dark-300 mb-2 font-medium">{label}</p>
      <p className={"text-2xl font-semibold leading-none " + valueClassName}>{value}</p>
      <div className="absolute inset-0 pointer-events-none opacity-20 mix-blend-lighten" style={{background:'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.12), transparent 70%)'}} />
    </div>
  );
}

function ToastInline({ msg, variant }) {
  const color = variant==='success' ? 'border-green-500/40 bg-green-500/10 text-green-300' : variant==='error' ? 'border-red-500/40 bg-red-500/10 text-red-300' : 'border-blue-500/40 bg-blue-500/10 text-blue-300';
  return (
    <div className={`fixed bottom-5 right-5 z-50 px-4 py-2 rounded-lg text-sm border backdrop-blur ${color} shadow-lg`}>{msg}</div>
  );
}

export default AdminUserList;
