import React, { useEffect, useState, useMemo } from 'react'
import Navbar from '../components/Navbar'
import HomeSkeleton from '../components/skeletons/HomeSkeleton'
import ListCard from '../components/ListCard';
import GridCard from '../components/GridCard';
import { api_base_url } from '../helper';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiPlus, FiCode, FiCalendar, FiUser, FiDownload, FiFilter, FiArrowLeft, FiArrowRight, FiTrash2, FiMapPin, FiLink } from 'react-icons/fi';

const Home = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState('');
  const [projTitle, setProjTitle] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("web");
  const navigate = useNavigate();
  const [isCreateModelShow, setIsCreateModelShow] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [userError, setUserError] = useState("");
  const [isGridLayout, setIsGridLayout] = useState(true);
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [profile, setProfile] = useState(null);
  const [toast, setToast] = useState(null);
  // mobile filter toggle removed; filters always visible on mobile
  // simple toast helper: { message, type }
  const showToast = (message, type = 'info', duration = 4000) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), duration);
  };

  const [filterLanguage, setFilterLanguage] = useState('all');
  const [sortKey, setSortKey] = useState('date');
  const [sortDir, setSortDir] = useState('desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  // Language options
  const languages = [
    { value: "web", label: "Web Development (HTML/CSS/JS)", icon: "🌐" },
    { value: "python", label: "Python", icon: "🐍" },
    { value: "java", label: "Java", icon: "☕" },
    { value: "cpp", label: "C++", icon: "⚡" },
    { value: "c", label: "C", icon: "🔧" },
    { value: "nodejs", label: "Node.js", icon: "🟢" },
    { value: "typescript", label: "TypeScript", icon: "🔷" }
  ];

  // Filter data based on search query
  const filteredData = useMemo(() => {
    let list = data || [];
    if (searchQuery.trim()) {
      list = list.filter(item => item.title.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    if (filterLanguage !== 'all') {
      list = list.filter(p => p.language === filterLanguage);
    }
    // sort
    list = [...list].sort((a, b) => {
      let valA, valB;
      if (sortKey === 'title') { valA = a.title.toLowerCase(); valB = b.title.toLowerCase(); }
      else if (sortKey === 'language') { valA = a.language; valB = b.language; }
      else { // date
        valA = new Date(a.date || a._id?.toString().slice(0, 8));
        valB = new Date(b.date || b._id?.toString().slice(0, 8));
      }
      if (valA < valB) return sortDir === 'asc' ? -1 : 1;
      if (valA > valB) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [data, searchQuery, filterLanguage, sortKey, sortDir]);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, page, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));

  // distinct languages used across all projects
  const distinctLanguagesCount = useMemo(() => {
    if (!data) return 0;
    return new Set(data.map(p => p.language)).size;
  }, [data]);

  // most used language (fallback if stats not loaded)
  const topLanguageLocal = useMemo(() => {
    if (!data || !data.length) return null;
    const counts = {};
    data.forEach(p => { if (p.language) counts[p.language] = (counts[p.language] || 0) + 1; });
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    if (!sorted.length) return null;
    return { language: sorted[0][0], count: sorted[0][1] };
  }, [data]);

  const createProj = async (e) => {
    e.preventDefault();
    if (projTitle.trim() === "") {
      showToast("Please enter a project title", 'error');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(api_base_url + "/createProject", {
        mode: "cors",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: projTitle.trim(),
          userId: localStorage.getItem("userId"),
          language: selectedLanguage
        })
      });

      const data = await response.json();

      if (data.success) {
        setIsCreateModelShow(false);
        setProjTitle("");
        setSelectedLanguage("web");
        showToast("Project created successfully", 'success');
        navigate(`/editior/${data.projectId}`);
      } else {
        showToast(`Error: ${data.message || "Something went wrong"}`, 'error');
      }
    } catch (error) {
      showToast("Network error: Unable to create project", 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const getProj = () => {
    fetch(api_base_url + "/getProjects", {
      mode: "cors",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: localStorage.getItem("userId")
      })
    }).then(res => res.json()).then(data => {
      if (data.success) {
        setData(data.projects);
      } else {
        setError(data.message);
      }
    });
  };

  useEffect(() => { getProj(); }, []);

  useEffect(() => {
    fetch(api_base_url + "/getUserDetails", {
      mode: "cors",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: localStorage.getItem("userId")
      })
    }).then(res => res.json()).then(data => {
      if (data.success) {
        setUserData(data.user);
      }
      else {
        setUserError(data.message);
      }
    })
  }, []);

  // fetch profile (for avatar)
  useEffect(() => {
    const uid = localStorage.getItem('userId');
    if (!uid) return;
    fetch(api_base_url + '/getProfile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: uid })
    }).then(r => r.json()).then(d => { if (d.success) setProfile(d.profile); });
  }, []);

  // fetch profile stats
  useEffect(() => {
    const uid = localStorage.getItem('userId');
    if (!uid) return;
    const fetchStats = async () => {
      setStatsLoading(true);
      try {
        const res = await fetch(api_base_url + '/getProfileStats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: uid })
        });
        const d = await res.json();
        if (d.success) {
          setStats(d.stats);
        }
      } catch (e) { console.error(e); }
      finally { setStatsLoading(false); }
    };
    fetchStats();
  }, []);

  // reset page when filters/search change
  useEffect(() => { setPage(1); }, [searchQuery, filterLanguage, sortKey, sortDir]);

  // Always use grid layout across all viewports
  useEffect(() => { setIsGridLayout(true); }, []);

  // Use 4 items per page on mobile (2x2), 6 on md+
  useEffect(() => {
    const updatePageSize = () => setPageSize(window.innerWidth < 768 ? 4 : 6);
    updatePageSize();
    window.addEventListener('resize', updatePageSize);
    return () => window.removeEventListener('resize', updatePageSize);
  }, []);

  // Simple heuristic: show skeleton until core data and user basics arrive
  const showSkeleton = data === null || userData === null;

  if (showSkeleton) {
    return (
      <>
        <div className='fixed top-0 left-0 right-0 z-50'>
          <Navbar isGridLayout={true} setIsGridLayout={()=>{}} />
        </div>
        <HomeSkeleton />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#2d323a]/10 text-white">
      <div className='fixed top-0 left-0 right-0 z-50'>
        <Navbar isGridLayout={isGridLayout} setIsGridLayout={setIsGridLayout} />
      </div>
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-6 md:space-y-8 mt-20">
        {/* Top Panel: User Detail */}
        <div className="bg-[#1e1f22]/50 rounded-3xl p-5 md:p-8 shadow-xl border border-white/5">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex flex-col items-center text-center sm:flex-row sm:items-center sm:text-left gap-4 sm:gap-6">
              <div className="relative">
                {profile?.profilePicture ? (
                  <img
                    src={profile.profilePicture}
                    alt="avatar"
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-indigo-500 shadow"
                  />
                ) : (
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-indigo-500 to-teal-400 flex items-center justify-center text-3xl sm:text-4xl font-bold shadow-inner">
                    {(userData?.username || userData?.name)?.[0]?.toUpperCase() || <FiUser />}
                  </div>
                )}
              </div>
              <div className="space-y-1">
                <h1 className="text-lg sm:text-2xl md:text-3xl font-semibold tracking-tight">{userData?.name || 'Developer'}</h1>
                <p className="text-xs sm:text-sm text-gray-400 break-all">{userData?.email}</p>
                <p className="text-xs text-gray-500 flex items-center gap-1"><FiCalendar /> Joined {stats?.joinDate ? new Date(stats.joinDate).toLocaleDateString() : '—'}</p>
                {profile?.tagline && (<p className="text-sm text-gray-300 italic mt-1">{profile.tagline}</p>)}
                <div className="mt-2 flex items-center gap-3 text-sm">
                  {profile?.location && (
                    <div className="flex items-center gap-2 text-gray-400">
                      <FiMapPin /> <span>{profile.location}</span>
                    </div>
                  )}
                  {profile?.socialLinks && (
                    <div className="flex items-center gap-2">
                      {profile.socialLinks.github && (
                        <a href={profile.socialLinks.github} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:underline flex items-center gap-1"><FiLink /> GitHub</a>
                      )}
                      {profile.socialLinks.linkedin && (
                        <a href={profile.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:underline flex items-center gap-1"><FiLink /> LinkedIn</a>
                      )}
                      {profile.socialLinks.website && (
                        <a href={profile.socialLinks.website} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:underline flex items-center gap-1"><FiLink /> Website</a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-4 sm:gap-3 flex-wrap justify-center">
              <select className="px-4 py-3 bg-[#2a2c31] rounded-lg text-sm focus:outline-none border border-white/5">
                <option>This Year</option>
                <option>This Month</option>
                <option>All Time</option>
              </select>
              <button onClick={() => setIsCreateModelShow(true)} className="px-4 sm:px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm font-medium flex items-center gap-2"><FiPlus /> New Project</button>
              {/* <button className="px-5 py-2 rounded-lg bg-emerald-500/90 hover:bg-emerald-500 text-sm font-medium flex items-center gap-2"><FiDownload /> Download Info</button> */}
            </div>
          </div>
          {/* Stats Row */}
          <div className="mt-6 md:mt-8 w-full justify-center ">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:justify-start  justify-center">
              <StatCard label="Total Projects" value={stats?.totalProjects ?? (data?.length || 0)} icon={<FiCode />} />
              <StatCard label="Days Active" value={stats?.activeDays ?? stats?.daysCoding ?? '—'} sub={stats?.daysCoding ? `of ${stats.daysCoding} total days` : ''} icon={<FiCalendar />} />
              <StatCard label="Top Lang." value={stats?.languages?.[0]?.language || topLanguageLocal?.language || '—'} sub={topLanguageLocal?.count ? `${topLanguageLocal.count} project${topLanguageLocal.count > 1 ? 's' : ''}` : ''} icon={<span className='text-lg'>⚙️</span>} />
              <StatCard label="Lang. Used" value={distinctLanguagesCount} icon={<span className='text-lg'>🌐</span>} />
            </div>
          </div>
        </div>

        {/* Second Panel: Project History */}
        <div className="bg-[#1e1f22]/50 rounded-3xl p-5 md:p-8 shadow-xl border border-white/5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4 md:mb-6">
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 bg-emerald-500 rounded-full" />
              <h2 className="text-lg md:text-xl font-semibold">Project History</h2>
            </div>
            {/* Desktop controls */}
            <div className="hidden md:flex flex-wrap items-center gap-3">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
                <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search" className="w-64 pl-9 pr-3 py-2 rounded-lg bg-[#2a2c31] border border-white/5 text-sm focus:outline-none" />
              </div>
              <select value={filterLanguage} onChange={e => setFilterLanguage(e.target.value)} className="px-3 py-2 rounded-lg bg-[#2a2c31] border border-white/5 text-sm focus:outline-none">
                <option value='all'>All Languages</option>
                {languages.map(l => <option key={l.value} value={l.value}>{l.label.split(' ')[0]}</option>)}
              </select>
              <select value={sortKey + ':' + sortDir} onChange={e => { const [k, d] = e.target.value.split(':'); setSortKey(k); setSortDir(d); }} className="px-3 py-2 rounded-lg bg-[#2a2c31] border border-white/5 text-sm focus:outline-none">
                <option value='date:desc'>Newest</option>
                <option value='date:asc'>Oldest</option>
                <option value='title:asc'>Title A-Z</option>
                <option value='title:desc'>Title Z-A</option>
                <option value='language:asc'>Language A-Z</option>
                <option value='language:desc'>Language Z-A</option>
              </select>
              {/* Layout toggle removed; grid is enforced */}
              <button className="px-3 py-2 flex items-center gap-2 text-sm rounded-lg bg-[#2a2c31] border border-white/5 text-gray-400 hover:text-white"><FiFilter /> Filter</button>
            </div>

            {/* Mobile controls */}
            <div className="md:hidden flex flex-col gap-3">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
                <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search projects" className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-[#2a2c31] border border-white/5 text-sm focus:outline-none" />
              </div>
              <div className="flex flex-row justify-center w-full gap-3">
                <select value={filterLanguage} onChange={e => setFilterLanguage(e.target.value)} className="px-3 py-2 rounded-lg bg-[#2a2c31] border border-white/5 text-sm focus:outline-none">
                  <option value='all'>All Languages</option>
                  {languages.map(l => <option key={l.value} value={l.value}>{l.label.split(' ')[0]}</option>)}
                </select>
                <select value={sortKey + ':' + sortDir} onChange={e => { const [k, d] = e.target.value.split(':'); setSortKey(k); setSortDir(d); }} className="px-3 py-2 rounded-lg bg-[#2a2c31] border border-white/5 text-sm focus:outline-none">
                  <option value='date:desc'>Newest</option>
                  <option value='date:asc'>Oldest</option>
                  <option value='title:asc'>Title A-Z</option>
                  <option value='title:desc'>Title Z-A</option>
                  <option value='language:asc'>Language A-Z</option>
                  <option value='language:desc'>Language Z-A</option>
                </select>
              </div>
            </div>
          </div>

          {/* Projects Display */}
          <div className="min-h-[34s0px]">
            {/* Mobile section label to match visual */}
            <div className="md:hidden text-gray-300 text-sm mb-2">All Languages</div>
            {paginatedData.length ? (
              <div className='grid px-0   grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4'>
                {paginatedData.map((item) => (
                  <ProjectHistoryCard key={item._id} item={item} onOpen={() => navigate(`/editior/${item._id}`)} onDelete={getProj} showToast={showToast} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-60 text-center rounded-2xl bg-[#2a2c31] border border-dashed border-white/10">
                <FiCode className="text-5xl text-gray-600 mb-4" />
                <p className="text-gray-400 mb-4">{searchQuery || filterLanguage !== 'all' ? 'No projects match filters' : 'No projects yet. Create your first project!'}</p>
                {!searchQuery && filterLanguage === 'all' && (
                  <button onClick={() => setIsCreateModelShow(true)} className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm font-medium flex items-center gap-2"><FiPlus /> Create Project</button>
                )}
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))} className={`p-2 rounded-md border border-white/5 ${page === 1 ? 'text-gray-600 cursor-not-allowed' : 'hover:bg-[#2a2c31]'} `}><FiArrowLeft /></button>
              <div className="hidden md:flex items-center gap-2">
                {Array.from({ length: totalPages }).slice(0, 10).map((_, i) => (
                  <button key={i} onClick={() => setPage(i + 1)} className={`w-8 h-8 text-sm rounded-md border border-white/5 ${page === i + 1 ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}>{i + 1}</button>
                ))}
              </div>
              <button disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))} className={`p-2 rounded-md border border-white/5 ${page === totalPages ? 'text-gray-600 cursor-not-allowed' : 'hover:bg-[#2a2c31]'} `}><FiArrowRight /></button>
            </div>
          )}
        </div>
      </div>

      {/* Sticky create button for mobile */}
      <div className="sm:hidden fixed bottom-5 left-0 right-0 flex justify-center z-40">
        <button onClick={() => setIsCreateModelShow(true)} className="px-4 py-3 rounded-full bg-indigo-600 shadow-xl border border-white/10 text-sm font-semibold flex items-center gap-2">
          <FiPlus /> Create Project
        </button>
      </div>

      {/* Create Project Modal */}
      {isCreateModelShow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsCreateModelShow(false)}></div>
          <div className="modal-content p-8 max-w-md w-full mx-4">
            <div className="space-y-6">
              {/* Modal Header */}
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiCode className="text-white text-2xl" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Create New Project</h3>
                <p className="text-dark-300">Start coding with your preferred language</p>
              </div>

              {/* Project Form */}
              <form onSubmit={createProj} className="space-y-6">
                {/* Project Title */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-dark-200">Project Title</label>
                  <div className="inputBox">
                    <input
                      onChange={(e) => setProjTitle(e.target.value)}
                      value={projTitle}
                      type="text"
                      placeholder='Enter project title'
                      required
                    />
                  </div>
                </div>

                {/* Language Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-dark-200">Programming Language</label>
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="w-full p-4 bg-dark-700/50 border border-dark-600/50 rounded-xl text-white focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200"
                  >
                    {languages.map((lang) => (
                      <option key={lang.value} value={lang.value}>
                        {lang.icon} {lang.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreateModelShow(false);
                      setProjTitle("");
                      setSelectedLanguage("web");
                    }}
                    className="flex-1 px-6 py-3 rounded-xl bg-dark-700 hover:bg-dark-600 text-white transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading || !projTitle.trim()}
                    className="flex-1 btnBlue disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isLoading ? (
                      <div className="loading-spinner w-5 h-5"></div>
                    ) : (
                      "Create Project"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Followers/Following removed */}
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 max-w-xs px-4 py-3 rounded-lg ${toast.type === 'error' ? 'bg-red-600' : toast.type === 'success' ? 'bg-emerald-600' : 'bg-gray-800'} shadow-lg`}>
          <div className="text-sm">{toast.message}</div>
        </div>
      )}
    </div>
  );
}

// Reusable stat card
const StatCard = ({ label, value, sub, icon }) => (
  <div className="rounded-2xl bg-[#2a2c31] border border-white/5 p-3 sm:p-4 flex flex-col gap-1">
    <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-400">{icon}<span className="truncate">{label}</span></div>
    <div className="text-xl sm:text-2xl font-semibold tracking-tight leading-tight">{value}</div>
    {sub && <div className="text-[10px] sm:text-[11px] text-gray-500 font-medium truncate">{sub}</div>}
  </div>
);

// Project card (grid or list style)
const ProjectHistoryCard = ({ item, onOpen, list, onDelete, showToast }) => {
  const date = item.date ? new Date(item.date) : null;
  const languageColors = {
    web: 'from-indigo-500 to-purple-500',
    mobile: 'from-pink-500 to-fuchsia-500',
    python: 'from-green-500 to-emerald-500',
    java: 'from-orange-500 to-amber-500',
    cpp: 'from-blue-500 to-cyan-500',
    c: 'from-slate-500 to-slate-600',
    nodejs: 'from-lime-500 to-green-500',
    typescript: 'from-sky-500 to-blue-500'
  };
  const grad = languageColors[item.language] || 'from-indigo-500 to-indigo-700';
  const [isDeleteModelShow, setIsDeleteModelShow] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteProj = async (id) => {
    setIsDeleting(true);
    try {
      const res = await fetch(api_base_url + '/deleteProject', {
        mode: 'cors', method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ progId: id, userId: localStorage.getItem('userId') })
      });
      const d = await res.json();
      if (d.success) {
        setIsDeleteModelShow(false);
        showToast && showToast('Project deleted', 'success');
        onDelete && onDelete();
      } else {
        showToast && showToast(d.message || 'Unable to delete project', 'error');
      }
    } catch (e) {
      showToast && showToast('Network error. Please try again.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className={`group relative ${list ? 'flex items-center justify-between' : 'flex flex-col'} bg-[#2a2c31] border border-white/5 rounded-xl p-3 hover:border-indigo-500/40 transition`}>
      <div className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition bg-gradient-to-br ${grad} mix-blend-overlay pointer-events-none`}></div>
      <div className="flex items-center gap-2 mb-1">
        <div className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-gradient-to-r ${grad} text-white shadow`}>{item.language}</div>
        {date && <span className="text-[10px] text-gray-400 flex items-center gap-1"><FiCalendar className='text-[10px]' /> {`${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`}</span>}
      </div>
      <div className="flex-1">
        <h3 className="font-medium text-xs sm:text-sm line-clamp-2">{item.title}</h3>
      </div>
      <div className={`${list ? '' : 'mt-3'} flex items-center justify-end gap-2.5`}>
        <button onClick={onOpen} className="px-2.5 py-1 rounded-md bg-indigo-600 hover:bg-indigo-500 text-xs font-medium">Open</button>
      </div>

      {/* Delete Button (hover) */}
      <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button onClick={(e) => { e.stopPropagation(); setIsDeleteModelShow(true); }} className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors duration-200" title="Delete Project">
          <FiTrash2 className="text-base" />
        </button>
      </div>

      {/* Delete Modal */}
      {isDeleteModelShow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsDeleteModelShow(false)}></div>
          <div className="modal-content p-6 max-w-md w-full mx-4">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
                <FiTrash2 className="text-red-500 text-2xl" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Delete Project</h3>
                <p className="text-dark-300">Are you sure you want to delete <span className="text-white font-medium">"{item.title}"</span>? This action cannot be undone.</p>
              </div>
              <div className="flex space-x-3 pt-4">
                <button onClick={() => setIsDeleteModelShow(false)} className="flex-1 px-4 py-2 rounded-lg bg-dark-700 hover:bg-dark-600 text-white">Cancel</button>
                <button onClick={() => deleteProj(item._id)} disabled={isDeleting} className="flex-1 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white disabled:opacity-50 disabled:cursor-not-allowed">
                  {isDeleting ? <div className="loading-spinner w-5 h-5"></div> : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
