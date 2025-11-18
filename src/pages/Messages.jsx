import React, { useEffect, useRef, useState } from "react";
import { api_base_url } from "../helper";
import { FiUserPlus, FiCheck, FiX, FiSend, FiRefreshCw, FiDownload, FiArrowLeft, FiImage } from "react-icons/fi";
import { FaComments } from "react-icons/fa";
import Navbar from "../components/Navbar";
import MessagesSkeleton from "../components/skeletons/MessagesSkeleton";
import { FiHeart, FiTrash2, FiThumbsDown } from "react-icons/fi";
import CreateGroup from "./CreateGroup";

const Messages = ({ userId }) => {
  const [contacts, setContacts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [chat, setChat] = useState(null);
  const [message, setMessage] = useState("");
  const [requests, setRequests] = useState({ incoming: [], outgoing: [] });
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  // Cache of friendId -> base64 profile picture
  const [profilePics, setProfilePics] = useState({});
  // Groups for sidebar
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  // Group last-read timestamps keyed by groupId
  const [groupLastRead, setGroupLastRead] = useState({});
  const groupLastReadKey = `groupLastRead:${userId || 'anon'}`;
  // Chat summaries keyed by otherUserId: { chatId, lastSender, lastTimestamp, updatedAt }
  const [chatSummaryByUser, setChatSummaryByUser] = useState({});
  // Last-read timestamps keyed by otherUserId, persisted to localStorage
  const [lastRead, setLastRead] = useState({});
  const messagesEndRef = useRef(null);

  // Mobile experience: show list first, open chat fullscreen like WhatsApp
  const [isMobile, setIsMobile] = useState(false);
  // list | chat | group (only relevant on mobile)
  const [mobileView, setMobileView] = useState("list");
  const [loadingChat, setLoadingChat] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    // Track viewport to toggle mobile behavior
    const mq = window.matchMedia('(max-width: 767px)');
    const onChange = (e) => setIsMobile(e.matches);
    setIsMobile(mq.matches);
    if (mq.addEventListener) mq.addEventListener('change', onChange);
    else mq.addListener(onChange);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', onChange);
      else mq.removeListener(onChange);
    };
  }, []);

  const lastReadKey = `chatLastRead:${userId || 'anon'}`;
  // Load lastRead map from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(lastReadKey);
      if (raw) setLastRead(JSON.parse(raw));
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);
  const saveLastRead = (next) => {
    setLastRead(next);
    try { localStorage.setItem(lastReadKey, JSON.stringify(next)); } catch {}
  };

  // Fetch and cache a user's profile picture from backend if not present
  const ensureProfilePic = async (friendId) => {
    if (!friendId || profilePics[friendId] !== undefined) return;
    try {
      const res = await fetch(`${api_base_url}/api/getProfile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: friendId })
      });
      const data = await res.json();
      if (data?.success) {
        const pic = data.profile?.profilePicture || null;
        setProfilePics((prev) => ({ ...prev, [friendId]: pic }));
      } else {
        setProfilePics((prev) => ({ ...prev, [friendId]: null }));
      }
    } catch {
      setProfilePics((prev) => ({ ...prev, [friendId]: null }));
    }
  };

  const loadContacts = async () => {
  const res = await fetch(`${api_base_url}/api/friends/list`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    const data = await res.json();
    if (data.success) {
      setContacts(data.contacts);
      // Preload profile pictures for listed contacts
      data.contacts.forEach((c) => ensureProfilePic(c.userId));
    }
  };
  const loadChatSummaries = async () => {
    if (!userId) return;
    try {
      const res = await fetch(`${api_base_url}/api/chat/list`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.chats)) {
        const map = {};
        for (const ch of data.chats) {
          const other = (ch.participants || []).map(p => String(p._id || p)).find(id => String(id) !== String(userId));
          if (!other) continue;
          const last = (ch.messages || [])[ch.messages.length - 1];
          map[String(other)] = {
            chatId: ch._id,
            lastSender: last ? String(last.sender?._id || last.sender) : null,
            lastTimestamp: last ? new Date(last.timestamp).getTime() : new Date(ch.updatedAt).getTime(),
            updatedAt: new Date(ch.updatedAt).getTime()
          };
        }
        setChatSummaryByUser(map);
      }
    } catch {}
  };
  const loadRequests = async () => {
  const res = await fetch(`${api_base_url}/api/friends/requests`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    const data = await res.json();
    if (data.success)
      setRequests({ incoming: data.incoming, outgoing: data.outgoing });
  };
  // Initial bootstrap
  useEffect(() => {
    (async () => {
      await Promise.all([loadContacts(), loadRequests(), loadChatSummaries()]);
      setInitialLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Do not early-return here to avoid changing Hook order between renders
  const searchUsers = async () => {
    if (!search.trim()) {
      setUsers([]);
      return;
    }
    // Backend /searchUsers expects GET with ?q=
    try {
      const res = await fetch(
  `${api_base_url}/api/searchUsers?q=${encodeURIComponent(search)}`
      );
      const data = await res.json();
      if (data.success) setUsers(data.users.filter((u) => u._id !== userId));
    } catch (e) {
      /* silent */
    }
  };
  useEffect(() => {
    loadContacts();
    loadRequests();
    loadChatSummaries();
    // Load groups for sidebar
    const loadGroups = async () => {
      if (!userId) return;
      try {
        const res = await fetch(`${api_base_url}/api/group/list`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId })
        });
        const data = await res.json();
        if (data.success) setGroups(data.groups || []);
      } catch {}
    };
    loadGroups();
  }, [userId]);
  // Load group last read
  useEffect(() => {
    try {
      const raw = localStorage.getItem(groupLastReadKey);
      if (raw) setGroupLastRead(JSON.parse(raw));
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);
  const saveGroupLastRead = (next) => {
    setGroupLastRead(next);
    try { localStorage.setItem(groupLastReadKey, JSON.stringify(next)); } catch {}
  };
  useEffect(() => {
    const t = setTimeout(searchUsers, 400);
    return () => clearTimeout(t);
  }, [search]);

  const openChat = async (otherUserId) => {
    try {
      if (isMobile) setLoadingChat(true);
      const res = await fetch(`${api_base_url}/api/chat/open`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, otherUserId }),
      });
      const data = await res.json();
      if (data.success) {
        setSelected(otherUserId);
        if (isMobile) setMobileView('chat');
        // Make sure we have the friend's profile picture cached
        ensureProfilePic(otherUserId);
        // Mark as read now
        const next = { ...lastRead, [otherUserId]: new Date().toISOString() };
        saveLastRead(next);
        // Normalize message sender to string id (server may return populated sender objects)
        const normalized = {
          ...data.chat,
          messages: (data.chat.messages || []).map(m => ({
            ...m,
            sender: String(m.sender?._id || m.sender)
          }))
        };
        setChat(normalized);
        // Refresh summaries so dot disappears
        loadChatSummaries();
      }
    } finally {
      if (isMobile) setLoadingChat(false);
    }
  };
  const sendMessage = async () => {
    if (!message.trim() || !chat) return;
    const local = {
  sender: String(userId),
      content: message,
      timestamp: new Date().toISOString(),
    };
    setChat((c) => ({ ...c, messages: [...(c.messages || []), local] }));
    const toSend = message;
    setMessage("");
  await fetch(`${api_base_url}/api/chat/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chatId: chat._id,
        senderId: userId,
        content: toSend,
      }),
    });
  };
  const act = async (requestId, action) => {
  await fetch(`${api_base_url}/api/friends/act`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId, action, userId }),
    });
    await loadContacts();
    await loadRequests();
  };
  const sendRequest = async (toId) => {
  await fetch(`${api_base_url}/api/friends/sendRequest`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fromId: userId, toId }),
    });
    setSearch("");
    setUsers([]);
    await loadRequests();
  };

    // Image modal state
  const [showImageModal, setShowImageModal] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const fileInputRef = useRef(null);
  // Image viewer state (for clicking chat images to view large)
  const [viewImageUrl, setViewImageUrl] = useState(null);

  // Close viewer on ESC
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setViewImageUrl(null); };
    if (viewImageUrl) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [viewImageUrl]);

  // Download current image (works with data URLs and remote URLs)
  const downloadImage = async (url) => {
    if (!url) return;
    const trigger = (href, filename) => {
      const a = document.createElement('a');
      a.href = href;
      a.download = filename || 'chat-image';
      document.body.appendChild(a);
      a.click();
      a.remove();
    };
    const extFromMime = (mime) => {
      if (!mime) return 'png';
      const sub = mime.split('/')[1] || 'png';
      return sub === 'jpeg' ? 'jpg' : sub;
    };
    try {
      if (url.startsWith('data:')) {
        const match = url.match(/^data:(.*?);/);
        const mime = match ? match[1] : 'image/png';
        const ext = extFromMime(mime);
        trigger(url, `chat-image.${ext}`);
      } else {
        const res = await fetch(url);
        const blob = await res.blob();
        const ext = extFromMime(blob.type || 'image/png');
        const blobUrl = URL.createObjectURL(blob);
        trigger(blobUrl, `chat-image.${ext}`);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
      }
    } catch (e) {
      // Fallback: try native download attr; if not, open in new tab
      try {
        trigger(url, 'chat-image');
      } catch {
        window.open(url, '_blank');
      }
    }
  };

    // Handle drag and drop
    const handleDrop = (e) => {
      e.preventDefault();
      if (!chat) return;
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith("image/")) {
        setImageFile(file);
        const reader = new FileReader();
        reader.onload = (ev) => setImagePreview(ev.target.result);
        reader.readAsDataURL(file);
      }
    };
    const handleFileChange = (e) => {
      const file = e.target.files[0];
      if (file && file.type.startsWith("image/")) {
        setImageFile(file);
        const reader = new FileReader();
        reader.onload = (ev) => setImagePreview(ev.target.result);
        reader.readAsDataURL(file);
      }
    };
    const sendImageBase64 = async () => {
      if (!chat || !imagePreview) return;
      setShowImageModal(false);
      setImagePreview(null);
      setImageFile(null);
      // Optimistic UI
      setChat((c) => ({ ...c, messages: [...(c.messages || []), { sender: String(userId), content: "[Image]", imageUrl: imagePreview, timestamp: new Date().toISOString() }] }));
  await fetch(`${api_base_url}/api/chat/sendImageBase64`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatId: chat._id, senderId: userId, imageBase64: imagePreview }),
      });
    };

  if (!userId) return <div className="p-4">Login required.</div>;

  useEffect(() => {
    if (messagesEndRef.current)
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [chat?.messages?.length]);

  // Poll chat summaries to keep unread indicators fresh
  useEffect(() => {
    if (!userId) return;
    const id = setInterval(() => {
      loadChatSummaries();
    }, 5000);
    return () => clearInterval(id);
  }, [userId]);

  // Poll selected chat for new messages
  useEffect(() => {
    if (!userId || !selected) return;
    let cancelled = false;
    const poll = async () => {
      try {
        const res = await fetch(`${api_base_url}/api/chat/open`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, otherUserId: selected })
        });
        const data = await res.json();
        if (!data?.success || !data.chat || cancelled) return;
        const normalized = {
          ...data.chat,
          messages: (data.chat.messages || []).map(m => ({
            ...m,
            sender: String(m.sender?._id || m.sender)
          }))
        };
        const currentLen = chat?.messages?.length || 0;
        const newLen = normalized.messages?.length || 0;
        if (newLen !== currentLen) {
          setChat(normalized);
          const next = { ...lastRead, [selected]: new Date().toISOString() };
          saveLastRead(next);
          loadChatSummaries();
        }
      } catch {}
    };
    const id = setInterval(poll, 3000);
    poll();
    return () => { cancelled = true; clearInterval(id); };
  }, [userId, selected, chat?.messages?.length]);

  // Mobile chat opening skeleton
  if (isMobile && mobileView === 'chat' && loadingChat) {
    return (
      <>
        <div className="fixed top-0 left-0 z-50 w-full"><Navbar /></div>
        <MessagesSkeleton variant="chat" />
      </>
    );
  }

  // Safe to conditionally return here (after all hooks are declared)
  if (initialLoading) {
    const variant = isMobile ? (mobileView === 'chat' ? 'chat' : 'list') : 'full';
    return (
      <>
        <div className="fixed top-0 left-0 z-50 w-full"><Navbar /></div>
        <MessagesSkeleton variant={variant} />
      </>
    );
  }

  return (
      <div className="w-full" onDrop={handleDrop} onDragOver={e => e.preventDefault()}>
        <div className="fixed top-0 left-0 z-50 w-full">
          <Navbar />
        </div>
  {/* Send Image Button next to Send */}
  {/* ...existing code... */}
        {/* Image Modal Popup */}
        {showImageModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur"
            onClick={() => setShowImageModal(false)}
          >
            <div
              className="glass p-8 rounded-2xl min-w-[320px] max-w-[90vw] shadow-2xl border border-white/10 relative"
              onClick={e => e.stopPropagation()}
              onDrop={handleDrop}
              onDragOver={e => e.preventDefault()}
            >
              <h2 className="text-xl font-bold text-indigo-400 mb-4 text-center">Send Image</h2>
              <div
                className={`group cursor-pointer border-2 ${imagePreview ? 'border-indigo-400 bg-dark-700/40' : 'border-gray-500 bg-dark-900/40'} rounded-xl p-4 text-center mb-4 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                style={{ minHeight: '120px' }}
                role="button"
                tabIndex={0}
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInputRef.current?.click(); } }}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="preview" className="max-w-full max-h-40 mx-auto mb-2 rounded-lg shadow" />
                ) : (
                  <div className="text-gray-300">
                    <div className="text-sm">Drag & drop image here</div>
                    <div className="text-xs text-gray-400 mt-1">or click to browse</div>
                  </div>
                )}
                {/* Hidden input inside the same zone */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
              </div>
              <div className="flex gap-3 justify-center">
                <button
                  className="px-5 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold"
                  onClick={sendImageBase64}
                  disabled={!imagePreview}
                >
                  Send
                </button>
                <button
                  className="px-5 py-2 rounded-lg bg-gray-400 hover:bg-gray-300 text-dark-900 font-semibold"
                  onClick={() => setShowImageModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Fullscreen Image Viewer */}
        {viewImageUrl && (
          <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80"
            onClick={() => setViewImageUrl(null)}
          >
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <img
                src={viewImageUrl}
                alt="Full size"
                className="max-w-[92vw] max-h-[86vh] rounded-lg shadow-2xl"
              />
              <div className="absolute -top-3 -right-3 flex items-center gap-2">
                <button
                  aria-label="Download"
                  title="Download"
                  className="bg-white text-dark-900 rounded-full w-8 h-8 flex items-center justify-center shadow-lg hover:bg-gray-200"
                  onClick={() => downloadImage(viewImageUrl)}
                >
                  <FiDownload />
                </button>
                <button
                  aria-label="Close"
                  title="Close"
                  className="bg-white text-dark-900 rounded-full w-8 h-8 flex items-center justify-center shadow-lg hover:bg-gray-200"
                  onClick={() => setViewImageUrl(null)}
                >
                  ×
                </button>
              </div>
            </div>
          </div>
        )}
        {/* ...existing chat UI... */}
        <div className="h-[90vh] sm:h-[calc(100vh-100px)] md:h-[calc(100vh-100px)] flex text-white max-w-7xl mx-auto rounded-xl overflow-hidden shadow-2xl border border-white/10 bg-dark-800/50 backdrop-blur sm:mt-[15vh] mt-[10vh]">
          {/* Left Sidebar (desktop) / Fullscreen list (mobile) */}
          <div
            className={`${isMobile ? (mobileView === 'list' ? 'flex w-full' : 'hidden') : 'hidden md:flex w-72'} flex-col md:border-r border-white/10 bg-dark-900/40`}
          >
            <div className="p-4 flex items-center justify-between border-b border-white/10">
              <div className="flex items-center gap-2 font-semibold text-indigo-300 text-sm">
                <FaComments /> Chats
              </div>
              <button
              onClick={() => {
                loadContacts();
                loadRequests();
              }}
              className="p-1 rounded hover:bg-dark-700/60 text-gray-400 hover:text-indigo-300"
            >
              <FiRefreshCw />
            </button>
          </div>
          <div className="p-3">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users..."
              className="w-full bg-dark-700/60 border border-white/10 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-400"
            />
          </div>
          <div className="px-3 space-y-1 overflow-y-auto custom-scrollbar">
            <button
              className="w-full mb-3 py-2 rounded bg-fuchsia-600 text-white font-semibold hover:bg-fuchsia-500"
              onClick={() => setShowCreateGroup(true)}
            >
              + Create Group
            </button>
        {/* Create Group Modal */}
        {showCreateGroup && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur" onClick={() => setShowCreateGroup(false)}>
            <div className="bg-dark-900 rounded-xl shadow-xl p-6 min-w-[340px] max-w-[95vw]" onClick={e => e.stopPropagation()}>
              <CreateGroup
                userId={userId}
                onCreated={(group) => {
                  setShowCreateGroup(false);
                  setGroups((prev) => [...prev, group]);
                }}
              />
            </div>
          </div>
        )}
            {/* Direct contacts */}
            {contacts.map((c) => (
              <div
                key={c.userId}
                onClick={() => { setSelected(c.userId); setSelectedGroup(null); openChat(c.userId); if (isMobile) setMobileView('chat'); }}
                className={`p-2 rounded cursor-pointer text-sm flex items-center gap-3 hover:bg-dark-700/60 ${
                  selected === c.userId && !selectedGroup ? "bg-indigo-600/50 text-white" : ""
                }`}
              >
                <Avatar seed={c.userId} name={c.name} src={profilePics[c.userId]} />
                <span className="truncate flex-1">{c.name || "User"}</span>
                {/* ...existing unread dot logic... */}
                {(() => {
                  const sum = chatSummaryByUser[String(c.userId)];
                  const lastTs = sum?.lastTimestamp || 0;
                  const readTs = lastRead[String(c.userId)] ? new Date(lastRead[String(c.userId)]).getTime() : 0;
                  const lastFromOther = sum?.lastSender && String(sum.lastSender) !== String(userId);
                  const unread = lastFromOther && lastTs > readTs;
                  return unread ? (
                    <span
                      title="New messages"
                      className="ml-2 inline-block w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_0_2px_rgba(0,0,0,0.3)]"
                    />
                  ) : null;
                })()}
              </div>
            ))}
            {/* Groups */}
            {groups.length > 0 && (
              <div className="mt-4 mb-2 text-xs text-indigo-300 font-bold">Groups</div>
            )}
            {groups.map((g) => (
              <div
                key={g._id}
                onClick={() => { 
                  setSelected(null); 
                  setSelectedGroup(g); 
                  // Mark group as read now
                  const lastMsg = (g.messages || [])[g.messages.length - 1];
                  const next = { ...groupLastRead, [g._id]: new Date().toISOString() };
                  saveGroupLastRead(next);
                  if (isMobile) setMobileView('group');
                }}
                className={`p-2 rounded cursor-pointer text-sm flex items-center gap-3 hover:bg-dark-700/60 ${
                  selectedGroup && selectedGroup._id === g._id ? "bg-fuchsia-700/50 text-white" : ""
                }`}
              >
                {g.profileImage ? (
                  <img src={g.profileImage} alt="group" className="w-9 h-9 rounded-full object-cover border border-white/10" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-fuchsia-500 to-indigo-500 flex items-center justify-center text-white text-sm font-semibold shadow-inner">
                    {g.name[0]}
                  </div>
                )}
                <span className="truncate flex-1">{g.name}</span>
                <span className="ml-2 text-[10px] text-gray-400">{g.members.length} members</span>
                {(() => {
                  const last = (g.messages || [])[g.messages.length - 1];
                  if (!last) return null;
                  const lastTs = new Date(last.timestamp || g.updatedAt).getTime();
                  const readTs = groupLastRead[g._id] ? new Date(groupLastRead[g._id]).getTime() : 0;
                  const lastFromOther = String(last.sender) !== String(userId);
                  const unread = lastFromOther && lastTs > readTs;
                  return unread ? (
                    <span
                      title="New group messages"
                      className="ml-2 inline-block w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_0_2px_rgba(0,0,0,0.3)]"
                    />
                  ) : null;
                })()}
              </div>
            ))}
            {contacts.length === 0 && groups.length === 0 && (
              <div className="text-xs text-gray-500 p-2 italic">
                No contacts or groups yet.
              </div>
            )}
          </div>
          <div className="mt-auto border-t border-white/10 p-3 space-y-4">
            <SectionTitle title="Incoming Requests" />
            <div className="space-y-2 max-h-32 overflow-y-auto pr-1 custom-scrollbar">
              {requests.incoming.map((r) => (
                <div
                  key={r._id}
                  className="flex items-center justify-between bg-dark-700/50 px-2 py-1 rounded text-xs"
                >
                  <span className="truncate">
                    {r.from.username || r.from.name}
                  </span>
                  <div className="flex gap-1">
                    <IconBtn
                      onClick={() => act(r._id, "accept")}
                      color="green"
                      icon={<FiCheck />}
                    />
                    <IconBtn
                      onClick={() => act(r._id, "reject")}
                      color="red"
                      icon={<FiX />}
                    />
                  </div>
                </div>
              ))}
              {requests.incoming.length === 0 && (
                <div className="text-gray-500 text-[10px] italic">None</div>
              )}
            </div>
            <SectionTitle title="Search Results" />
            <div className="space-y-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
              {users.map((u) => (
                <div
                  key={u._id}
                  className="flex items-center justify-between bg-dark-700/40 px-2 py-1 rounded text-xs"
                >
                  <span className="truncate">{u.username || u.name}</span>
                  <button
                    onClick={() => sendRequest(u._id)}
                    className="px-2 py-1 bg-indigo-600 hover:bg-indigo-500 rounded flex items-center gap-1"
                  >
                    <FiUserPlus className="text-sm" />
                    Add
                  </button>
                </div>
              ))}
              {users.length === 0 && (
                <div className="text-gray-500 text-[10px] italic">
                  Type to search users
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Chat Area */}
          <div className={`flex-1 ${isMobile && mobileView === 'list' ? 'hidden' : 'flex'} flex-col`}>
            {/* If group selected, show group chat UI */}
            {selectedGroup ? (
              <GroupChatArea
                group={selectedGroup}
                userId={userId}
                onImageClick={setViewImageUrl}
                onGroupLeft={(groupId) => {
                  setGroups(g => g.filter(gr => gr._id !== groupId));
                  setSelectedGroup(null);
                }}
                onBack={isMobile ? () => setMobileView('list') : undefined}
              />
            ) : (
              <>
                <div className="h-14 flex items-center gap-3 px-4 border-b border-white/10 bg-dark-900/60 backdrop-blur sticky top-0">
                  {isMobile && (
                    <button
                      className="md:hidden mr-1 p-1 rounded hover:bg-dark-700/60"
                      onClick={() => setMobileView('list')}
                      aria-label="Back"
                    >
                      <FiArrowLeft className="text-lg text-gray-300" />
                    </button>
                  )}
                  {selected ? (
                    <Avatar
                      seed={selected}
                      name={contacts.find((c) => c.userId === selected)?.name}
                      src={profilePics[selected]}
                    />
                  ) : (
                    <FaComments className="text-xl text-indigo-400" />
                  )}
                  <div className="font-medium text-sm">
                    {selected
                      ? contacts.find((c) => c.userId === selected)?.name || "Chat"
                      : "Select a contact"}
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-5 space-y-3 custom-scrollbar">
                  {chat ? (
                    (chat.messages || []).map((m, i) => (
                      <MessageBubble
                        key={i}
                        isOwn={String(m.sender) === String(userId)}
                        text={m.content}
                        imageUrl={m.imageUrl}
                        imageError={m.content === '[Image]' && !m.imageUrl}
                        timestamp={m.timestamp}
                        senderId={m.sender}
                        getName={id => {
                          if (id === userId) return "You";
                          const found = contacts.find(c => c.userId === id);
                          return found ? (found.name || found.username || id) : id;
                        }}
                        getProfilePic={id => profilePics[id]}
                        showTrash={String(m.sender) === String(userId)}
                        onDelete={async () => {
                          await fetch(`${api_base_url}/api/chat/deleteMessage`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ chatId: chat._id, userId, messageIdx: i })
                          });
                          // Remove from UI
                          setChat(c => ({ ...c, messages: c.messages.filter((_, idx) => idx !== i) }));
                        }}
                        onImageClick={(url) => setViewImageUrl(url)}
                      />
                    ))
                  ) : (
                    <div className="text-gray-500 text-sm flex flex-col items-center justify-center h-full opacity-70">
                      <FaComments className="text-5xl mb-4 opacity-30" />
                      <div>Select a contact to start chatting</div>
                      <div className="text-xs mt-2 text-gray-600">
                        Or search and add a new friend.
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
                <div className="p-3 border-t border-white/10 flex items-center gap-2 bg-dark-900/60 backdrop-blur">
                  <div className="relative flex-1">
                    <input
                      disabled={!chat}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                      placeholder={chat ? "Type a message" : "Open a chat to begin"}
                      className={`w-full bg-dark-700/60 border border-white/10 rounded px-4 pr-12 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-400 ${
                        !chat ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    />
                    {/* Mobile image icon inside input */}
                    <button
                      type="button"
                      aria-label="Send image"
                      title="Send image"
                      onClick={() => setShowImageModal(true)}
                      disabled={!chat}
                      className="md:hidden absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded hover:bg-dark-600 text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <FiImage />
                    </button>
                  </div>
                  <button
                    onClick={sendMessage}
                    disabled={!chat || !message.trim()}
                    className="px-3 md:px-5 h-10 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold flex items-center gap-2"
                  >
                    <FiSend />
                    <span className="hidden md:inline">Send</span>
                  </button>
                  {/* Desktop-only Send Image button */}
                  <button
                    className="hidden md:inline-flex px-5 h-10 rounded-lg bg-indigo-500 hover:bg-indigo-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold items-center gap-2"
                    style={{ marginLeft: '8px' }}
                    onClick={() => setShowImageModal(true)}
                    disabled={!chat}
                  >
                    <FiImage /> Send Image
                  </button>
                </div>
              </>
            )}
          </div>
      </div>
    </div>
  );
};
// Small components
const Avatar = ({ seed, name, src }) => {
  const letter = (name || "?").trim()[0]?.toUpperCase() || "?";
  return src ? (
    <img
      src={src}
      alt={name || "avatar"}
      className="w-9 h-9 rounded-full object-cover border border-white/10"
    />
  ) : (
    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 flex items-center justify-center text-white text-sm font-semibold shadow-inner">
      {letter}
    </div>
  );
};

const SectionTitle = ({ title }) => (
  <div className="uppercase tracking-wide text-[10px] text-gray-500 font-semibold">
    {title}
  </div>
);

const IconBtn = ({ onClick, color, icon }) => (
  <button
    onClick={onClick}
    className={`w-6 h-6 flex items-center justify-center rounded bg-${color}-600 hover:bg-${color}-500 text-white text-xs`}
  >
    {icon}
  </button>
);



// Group message bubble with sender info and like button for images


// Group message bubble with sender info, like button, and delete for admins
const MessageBubble = ({ isOwn, text, imageUrl, imageError, timestamp, onImageClick, senderId, getName, getProfilePic, isAdmin, onDelete, showTrash, likes = [], dislikes = [], messageIdx, groupId, userId }) => {
  const [likeCount, setLikeCount] = React.useState(likes.length);
  const [dislikeCount, setDislikeCount] = React.useState(dislikes.length);
  const [liked, setLiked] = React.useState(likes.includes(userId));
  const [disliked, setDisliked] = React.useState(dislikes.includes(userId));
  let time = '';
  if (timestamp) {
    const d = new Date(timestamp);
    time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  const handleLike = async () => {
    if (!liked) {
      setLiked(true);
      setDisliked(false);
      try {
        const res = await fetch(`${api_base_url}/api/group/likeMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ groupId, userId, messageIdx })
        });
        const text = await res.text();
        if (!text) return;
        const data = JSON.parse(text);
        setLikeCount(data.likes || 0);
        setDislikeCount(data.dislikes || 0);
      } catch (e) {}
    }
  };
  const handleDislike = async () => {
    if (!disliked) {
      setDisliked(true);
      setLiked(false);
      try {
        const res = await fetch(`${api_base_url}/api/group/dislikeMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ groupId, userId, messageIdx })
        });
        const text = await res.text();
        if (!text) return;
        const data = JSON.parse(text);
        setLikeCount(data.likes || 0);
        setDislikeCount(data.dislikes || 0);
      } catch (e) {}
    }
  };
  return (
    <div
      className={`max-w-[70%] md:max-w-[55%] px-4 py-2 rounded-xl text-sm leading-relaxed shadow mb-2 relative ${
        isOwn
          ? "ml-auto bg-indigo-600 text-white rounded-br-sm"
          : "bg-dark-700/70 text-gray-100 rounded-bl-sm border border-white/5"
      }`}
    >
      {!isOwn && senderId && (
        <div className="flex items-center mb-1 gap-2">
          <img src={getProfilePic(senderId)} alt="avatar" className="w-7 h-7 rounded-full object-cover border border-white/10" />
          <span className="font-semibold text-indigo-300 text-xs">{getName(senderId)}</span>
        </div>
      )}
      {imageUrl ? (
        <div className="relative">
          <img
            src={imageUrl}
            alt="sent"
            style={{ maxWidth: '220px', maxHeight: '180px', borderRadius: '8px', marginBottom: text && text !== '[Image]' ? '8px' : 0, cursor: 'zoom-in' }}
            onClick={() => onImageClick && onImageClick(imageUrl)}
          />
            <div className="absolute bottom-2 right-2 flex gap-2">
              <button
                className={`bg-white/80 rounded-full p-1 flex items-center gap-1 text-red-500 hover:bg-red-200 transition`}
                style={{ fontSize: '16px' }}
                onClick={handleLike}
                title={liked ? "Liked" : "Like"}
                disabled={liked}
              >
                <FiHeart style={{ color: liked ? '#e0245e' : '#888' }} />
                <span className="text-xs font-bold">{likeCount}</span>
              </button>
              <button
                className={`bg-white/80 rounded-full p-1 flex items-center gap-1 text-blue-500 hover:bg-blue-200 transition`}
                style={{ fontSize: '16px' }}
                onClick={handleDislike}
                title={disliked ? "Disliked" : "Dislike"}
                disabled={disliked}
              >
                <FiThumbsDown style={{ color: disliked ? '#2196f3' : '#888' }} />
                <span className="text-xs font-bold">{dislikeCount}</span>
              </button>
            </div>
        </div>
      ) : imageError ? (
        <span style={{ color: 'red' }}>Image not saved in database</span>
      ) : null}
      {text && text !== '[Image]' && <span>{text}</span>}
      <div style={{ fontSize: '11px', color: isOwn ? '#e0e0ff' : '#bbb', marginTop: '4px', textAlign: isOwn ? 'right' : 'left' }}>{time}</div>
      {showTrash && onDelete && (
        <button
          className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
          style={{ fontSize: '16px' }}
          title="Delete message"
          onClick={onDelete}
        >
          <FiTrash2 />
        </button>
      )}
    </div>
  );
};

// Group chat area for Messages page
const GroupChatArea = ({ group, userId, onImageClick, onGroupLeft }) => {
  
  // onBack is optional; when provided (mobile), show a back button like WhatsApp
  // eslint-disable-next-line react/prop-types
  const onBack = arguments[4]?.onBack; // keep signature stable while adding support
  const [leaveError, setLeaveError] = useState("");
  const [messages, setMessages] = useState(group.messages || []);
  const [input, setInput] = useState("");
  const [admins, setAdmins] = useState(group.admins || []);
  const [creator, setCreator] = useState(group.creator);
  const [isAdmin, setIsAdmin] = useState((group.admins || []).some(a => String(a) === String(userId)));
  const [adminMode, setAdminMode] = useState(group.adminMode || false);
  const [members, setMembers] = useState(group.members || []);
  const [profileImage, setProfileImage] = useState(group.profileImage || null);
  const [loading, setLoading] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const [friends, setFriends] = useState([]); // List of user's friends
  const [contacts, setContacts] = useState([]); // For name lookup
  const [profilePics, setProfilePics] = useState({}); // userId -> base64
  // Helper to get profile pic from userId
  const getProfilePic = (id) => {
    if (!id) return null;
    if (profilePics[id]) return profilePics[id];
    // Try to fetch if not cached
    fetchProfilePic(id);
    return null;
  };
  const fetchProfilePic = async (id) => {
    if (!id || profilePics[id] !== undefined) return;
    try {
      const res = await fetch(`${api_base_url}/api/getProfile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: id })
      });
      const data = await res.json();
      if (data?.success) {
        const pic = data.profile?.profilePicture || null;
        setProfilePics((prev) => ({ ...prev, [id]: pic }));
      } else {
        setProfilePics((prev) => ({ ...prev, [id]: null }));
      }
    } catch {
      setProfilePics((prev) => ({ ...prev, [id]: null }));
    }
  };
  const [editingName, setEditingName] = useState(false);
  const [newGroupName, setNewGroupName] = useState(group.name);
  const [changingImage, setChangingImage] = useState(false);
  const imageInputRef = useRef(null);

  useEffect(() => {
    setMessages(group.messages || []);
    setAdmins(group.admins || []);
    setCreator(group.creator);
    setIsAdmin((group.admins || []).some(a => String(a) === String(userId)));
    setAdminMode(group.adminMode || false);
    setMembers(group.members || []);
    setProfileImage(group.profileImage || null);
    setNewGroupName(group.name);
  }, [group, userId]);

  useEffect(() => {
    if (messagesEndRef.current)
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  // Fetch friends and contacts on mount
  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const res = await fetch(`${api_base_url}/api/friends/list`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        });
        const data = await res.json();
        if (data.success) {
          setFriends(data.contacts || []);
          setContacts(data.contacts || []);
        }
      } catch {}
    };
    fetchFriends();
  }, [userId]);

  // Poll group messages for live updates
  useEffect(() => {
    if (!group?._id) return;
    let cancelled = false;
  const poll = async () => {
      try {
        const res = await fetch(`${api_base_url}/api/group/list`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        });
        const data = await res.json();
        if (!data?.success || cancelled) return;
        const g = data.groups.find((g) => g._id === group._id);
        if (g) {
      setMessages(g.messages || []);
      setAdmins(g.admins || []);
      setCreator(g.creator);
      setIsAdmin((g.admins || []).some(a => String(a) === String(userId)));
      setAdminMode(g.adminMode || false);
      setMembers(g.members || []);
      setProfileImage(g.profileImage || null);
        }
      } catch {}
    };
    const id = setInterval(poll, 3000);
    poll();
    return () => { cancelled = true; clearInterval(id); };
  }, [group?._id, userId]);

  // Helper to get name from userId
  const getName = (id) => {
    if (id === userId) return "You";
    const found = contacts.find(c => c.userId === id);
    return found ? (found.name || found.username || id) : id;
  };

  const sendMessage = async () => {
  if (!input.trim() || (adminMode && !isAdmin)) return;
    setLoading(true);
    await fetch(`${api_base_url}/api/group/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ groupId: group._id, senderId: userId, content: input }),
    });
    setInput("");
    // Refresh messages
    const res = await fetch(`${api_base_url}/api/group/list`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.success) {
      const g = data.groups.find((g) => g._id === group._id);
      setMessages(g?.messages || []);
      setAdminMode(g?.adminMode || false);
      setMembers(g?.members || []);
      setProfileImage(g?.profileImage || null);
    }
  };

  // Image send logic (same as friends chat)
  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreview(ev.target.result);
      reader.readAsDataURL(file);
    }
  };
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreview(ev.target.result);
      reader.readAsDataURL(file);
    }
  };
  const sendImageBase64 = async () => {
    if (!imagePreview) return;
    setShowImageModal(false);
    setImagePreview(null);
    setImageFile(null);
    // Optimistic UI
    setMessages((msgs) => [...msgs, { sender: String(userId), content: "[Image]", imageUrl: imagePreview, timestamp: new Date().toISOString() }]);
    await fetch(`${api_base_url}/api/group/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ groupId: group._id, senderId: userId, imageUrl: imagePreview }),
    });
    // Refresh messages
    const res = await fetch(`${api_base_url}/api/group/list`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    const data = await res.json();
    if (data.success) {
      const g = data.groups.find((g) => g._id === group._id);
      setMessages(g?.messages || []);
    }
  };

  // Remove member (admin only) - cannot remove creator
  const handleRemoveMember = async (memberId) => {
    if (!isAdmin || memberId === userId) return;
    if (String(memberId) === String(creator)) return;
    await fetch(`${api_base_url}/api/group/update`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ groupId: group._id, adminId: userId, updates: { members: members.filter(m => m !== memberId) } }),
    });
    // Refresh group info
    const res = await fetch(`${api_base_url}/api/group/list`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    const data = await res.json();
    if (data.success) {
      const g = data.groups.find((g) => g._id === group._id);
      setMembers(g?.members || []);
    }
  };

  // Add member (admin only)
  const promoteAdmin = async (targetId) => {
    if (!isAdmin) return;
    await fetch(`${api_base_url}/api/group/addAdmin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ groupId: group._id, requesterId: userId, targetUserId: targetId })
    });
  };
  const demoteAdmin = async (targetId) => {
    if (!isAdmin) return;
    if (String(targetId) === String(creator)) return; // can't demote creator
    await fetch(`${api_base_url}/api/group/removeAdmin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ groupId: group._id, requesterId: userId, targetUserId: targetId })
    });
  };

  // Toggle admin mode (admin only)
  const handleToggleAdminMode = async () => {
    if (!isAdmin) return;
    await fetch(`${api_base_url}/api/group/update`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ groupId: group._id, adminId: userId, updates: { adminMode: !adminMode } }),
    });
    // Refresh group info
    const res = await fetch(`${api_base_url}/api/group/list`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    const data = await res.json();
    if (data.success) {
      const g = data.groups.find((g) => g._id === group._id);
      setAdminMode(g?.adminMode || false);
    }
  };

  // Add member by ID (used by checkbox logic)
  const handleAddMemberId = async (friendId) => {
    if (!isAdmin || !friendId) return;
    if (members.includes(friendId)) return;
    await fetch(`${api_base_url}/api/group/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ groupId: group._id, adminId: userId, updates: { members: [...members, friendId] } })
    });
  };

  const handleRename = async () => {
    if (!isAdmin || !newGroupName.trim()) return;
    await fetch(`${api_base_url}/api/group/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ groupId: group._id, adminId: userId, updates: { name: newGroupName.trim() } })
    });
    setEditingName(false);
  };
  const handleChangeImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !isAdmin) return;
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64 = ev.target.result;
      await fetch(`${api_base_url}/api/group/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupId: group._id, adminId: userId, updates: { profileImage: base64 } })
      });
      setChangingImage(false);
    };
    reader.readAsDataURL(file);
  };
  const handleLeaveGroup = async () => {
    setLeaveError("");
    if (String(creator) === String(userId)) {
      setLeaveError("Creator cannot leave the group");
      return;
    }
    try {
      const res = await fetch(`${api_base_url}/api/group/leave`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupId: group._id, userId })
      });
      const data = await res.json();
      if (data.success) {
        setShowGroupInfo(false);
        onGroupLeft && onGroupLeft(group._id);
      } else {
        setLeaveError(data.error || 'Failed to leave group');
      }
    } catch (e) {
      setLeaveError('Network error');
    }
  };

  return (
    <div className="h-full flex flex-col" onDrop={handleDrop} onDragOver={e => e.preventDefault()}>
      {/* Header: group avatar and name */}
      <div className="h-14 flex items-center gap-3 px-4 border-b border-white/10 bg-dark-900/60 backdrop-blur sticky top-0">
        {onBack && (
          <button
            className="md:hidden mr-1 p-1 rounded hover:bg-dark-700/60"
            onClick={onBack}
            aria-label="Back"
          >
            <FiArrowLeft className="text-lg text-gray-300" />
          </button>
        )}
        <div className="relative">
          {profileImage ? (
            <img src={profileImage} alt="group" className="w-9 h-9 rounded-full object-cover border border-white/10 cursor-pointer" onClick={() => setShowGroupInfo(true)} />
          ) : (
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-fuchsia-500 to-indigo-500 flex items-center justify-center text-white text-sm font-semibold shadow-inner cursor-pointer" onClick={() => setShowGroupInfo(true)}>
              {group.name[0]}
            </div>
          )}
        </div>
        <div className="font-medium text-sm flex items-center gap-2">
          {editingName ? (
            <>
              <input
                value={newGroupName}
                onChange={e => setNewGroupName(e.target.value)}
                className="bg-dark-700/70 border border-white/10 rounded px-2 py-1 text-xs focus:outline-none"
              />
              <button onClick={handleRename} className="text-xs px-2 py-1 bg-indigo-600 rounded text-white">Save</button>
              <button onClick={() => { setEditingName(false); setNewGroupName(group.name); }} className="text-xs px-2 py-1 bg-gray-500 rounded text-white">X</button>
            </>
          ) : (
            <>
              <span>{group.name}</span>
              {isAdmin && <button onClick={() => setEditingName(true)} className="text-[10px] px-2 py-1 bg-dark-700/70 rounded hover:bg-dark-600">Edit</button>}
            </>
          )}
        </div>
        <div className="ml-2 text-xs text-gray-400">{members.length} members</div>
        <div className="ml-4 text-xs text-gray-400">Admin Mode: <span className={adminMode ? "text-red-400" : "text-green-400"}>{adminMode ? "ON" : "OFF"}</span></div>
      </div>
      {/* Group Info Popup */}
      {showGroupInfo && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur" onClick={() => setShowGroupInfo(false)}>
          <div className="bg-dark-900 rounded-xl shadow-xl p-6 min-w-[320px] max-w-[95vw]" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-indigo-400 mb-3">Group Members</h3>
            {leaveError && <div className="mb-2 text-xs text-red-400">{leaveError}</div>}
            <div className="mb-3 text-xs text-gray-400">Creator: {getName(String(creator))}</div>
            <div className="max-h-60 overflow-y-auto mb-4">
              {members.map((m) => {
                const isMemberAdmin = admins.some(a => String(a) === String(m));
                return (
                  <div key={m} className="flex items-center justify-between mb-2 bg-dark-700/40 rounded px-3 py-2">
                    <span className="text-white text-sm flex-1 truncate">{getName(m)} {String(m) === String(creator) && <span className="text-[10px] text-fuchsia-400 ml-1">(Creator)</span>} {isMemberAdmin && String(m) !== String(creator) && <span className="text-[10px] text-indigo-400 ml-1">(Admin)</span>}</span>
                    {isAdmin && String(m) !== String(userId) && String(m) !== String(creator) && (
                      <div className="flex gap-1">
                        {isMemberAdmin ? (
                          <button onClick={() => demoteAdmin(m)} className="text-[10px] px-2 py-1 bg-yellow-600 rounded text-white hover:bg-yellow-500">Demote</button>
                        ) : (
                          <button onClick={() => promoteAdmin(m)} className="text-[10px] px-2 py-1 bg-indigo-600 rounded text-white hover:bg-indigo-500">Promote</button>
                        )}
                        <button className="text-[10px] px-2 py-1 bg-red-600 rounded text-white hover:bg-red-500" onClick={() => handleRemoveMember(m)}>Remove</button>
                      </div>
                    )}
                  </div>
                );
              })}
              {members.length === 0 && <div className="text-xs text-gray-400">No members</div>}
            </div>
            {isAdmin && (
              <div className="mb-4">
                <label className="block text-sm text-gray-400 mb-1">Add/Remove Members</label>
                <div className="max-h-40 overflow-y-auto border border-white/10 rounded bg-dark-900 p-2">
                  {friends.length === 0 ? (
                    <div className="text-xs text-gray-500">No friends found.</div>
                  ) : (
                    friends.map(f => (
                      <label key={f.userId} className="flex items-center gap-2 mb-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={members.includes(f.userId)}
                          onChange={e => {
                            if (e.target.checked && !members.includes(f.userId)) {
                              handleAddMemberId(f.userId);
                            } else if (!e.target.checked && members.includes(f.userId)) {
                              handleRemoveMember(f.userId);
                            }
                          }}
                        />
                        <span className="text-sm text-white">{getName(f.userId)}</span>
                      </label>
                    ))
                  )}
                </div>
              </div>
            )}
            {isAdmin && (
              <div className="mb-4">
                <div className="text-sm text-gray-400 mb-1">Group Image</div>
                {profileImage ? (
                  <img 
                    src={profileImage} 
                    alt="group" 
                    className="w-20 h-20 object-cover rounded mb-2 cursor-pointer hover:opacity-90 transition" 
                    title="View large"
                    onClick={() => onImageClick && onImageClick(profileImage)}
                  />
                ) : (
                  <div className="w-20 h-20 rounded bg-gradient-to-br from-fuchsia-500 to-indigo-500 flex items-center justify-center text-white mb-2">{group.name[0]}</div>
                )}
                <button onClick={() => imageInputRef.current?.click()} className="px-3 py-1 text-xs bg-dark-700/70 rounded hover:bg-dark-600">Change Image</button>
                <input ref={imageInputRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handleChangeImage} />
              </div>
            )}
            {isAdmin && (
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm text-gray-300">Admin Mode:</span>
                <button
                  className={`px-3 py-1 rounded font-semibold ${adminMode ? "bg-red-600 text-white" : "bg-green-600 text-white"}`}
                  onClick={handleToggleAdminMode}
                >
                  {adminMode ? "ON (Only admin can send)" : "OFF (All members can send)"}
                </button>
              </div>
            )}
            {String(creator) !== String(userId) && (
              <button onClick={handleLeaveGroup} className="w-full py-2 rounded bg-red-600 text-white font-semibold mt-2 hover:bg-red-500 text-sm">Leave Group</button>
            )}
            <button className="w-full py-2 rounded bg-gray-500 text-white font-semibold mt-2" onClick={() => setShowGroupInfo(false)}>Close</button>
          </div>
        </div>
      )}
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5 space-y-3 custom-scrollbar">
          {messages.length > 0 ? (
            messages.map((m, i) => {
              const isSender = String(m.sender) === String(userId);
              const canDelete = isAdmin || isSender;
              return (
                <MessageBubble
                  key={i}
                  isOwn={isSender}
                  text={m.content}
                  imageUrl={m.imageUrl}
                  imageError={m.content === '[Image]' && !m.imageUrl}
                  timestamp={m.timestamp}
                  senderId={m.sender}
                  getName={getName}
                  getProfilePic={getProfilePic}
                  onImageClick={onImageClick}
                  isAdmin={isAdmin}
                  showTrash={canDelete}
                  likes={m.likes || []}
                  dislikes={m.dislikes || []}
                  messageIdx={i}
                  groupId={group._id}
                  userId={userId}
                  onDelete={canDelete ? async () => {
                    const payload = isAdmin
                      ? { groupId: group._id, adminId: userId, messageIdx: i }
                      : { groupId: group._id, userId, messageIdx: i };
                    await fetch(`${api_base_url}/api/group/deleteMessage`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(payload)
                    });
                    // Refresh messages
                    const res = await fetch(`${api_base_url}/api/group/list`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ userId })
                    });
                    const data = await res.json();
                    if (data.success) {
                      const g = data.groups.find((g) => g._id === group._id);
                      setMessages(g?.messages || []);
                    }
                  } : undefined}
                />
              );
            })
          ) : (
          <div className="text-gray-500 text-sm flex flex-col items-center justify-center h-full opacity-70">
            <div className="text-5xl mb-4 opacity-30">💬</div>
            <div>No messages yet</div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      {/* Image Modal Popup */}
      {showImageModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur"
          onClick={() => setShowImageModal(false)}
        >
          <div
            className="glass p-8 rounded-2xl min-w-[320px] max-w-[90vw] shadow-2xl border border-white/10 relative"
            onClick={e => e.stopPropagation()}
            onDrop={handleDrop}
            onDragOver={e => e.preventDefault()}
          >
            <h2 className="text-xl font-bold text-indigo-400 mb-4 text-center">Send Image</h2>
            <div
              className={`group cursor-pointer border-2 ${imagePreview ? 'border-indigo-400 bg-dark-700/40' : 'border-gray-500 bg-dark-900/40'} rounded-xl p-4 text-center mb-4 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              style={{ minHeight: '120px' }}
              role="button"
              tabIndex={0}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInputRef.current?.click(); } }}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
            >
              {imagePreview ? (
                <img src={imagePreview} alt="preview" className="max-w-full max-h-40 mx-auto mb-2 rounded-lg shadow" />
              ) : (
                <div className="text-gray-300">
                  <div className="text-sm">Drag & drop image here</div>
                  <div className="text-xs text-gray-400 mt-1">or click to browse</div>
                </div>
              )}
              {/* Hidden input inside the same zone */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </div>
            <div className="flex gap-3 justify-center">
              <button
                className="px-5 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold"
                onClick={sendImageBase64}
                disabled={!imagePreview}
              >
                Send
              </button>
              <button
                className="px-5 py-2 rounded-lg bg-gray-400 hover:bg-gray-300 text-dark-900 font-semibold"
                onClick={() => setShowImageModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Input and send buttons */}
      <div className="p-3 border-t border-white/10 flex items-center gap-2 bg-dark-900/60 backdrop-blur">
        <div className="relative flex-1">
          <input
            disabled={adminMode && !isAdmin}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder={adminMode && !isAdmin ? "Admin only can send messages" : "Type a message"}
            className={`w-full bg-dark-700/60 border border-white/10 rounded px-4 pr-12 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-400 ${
              adminMode && !isAdmin ? "opacity-50 cursor-not-allowed" : ""
            }`}
          />
          {/* Mobile image icon inside input */}
          <button
            type="button"
            aria-label="Send image"
            title="Send image"
            onClick={() => setShowImageModal(true)}
            disabled={adminMode && !isAdmin}
            className="md:hidden absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded hover:bg-dark-600 text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <FiImage />
          </button>
        </div>
        <button
          onClick={sendMessage}
          disabled={adminMode && !isAdmin || !input.trim()}
          className="px-3 md:px-5 h-10 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold flex items-center gap-2"
        >
          <FiSend />
          <span className="hidden md:inline">Send</span>
        </button>
        {/* Desktop-only Send Image button */}
        <button
          className="hidden md:inline-flex px-5 h-10 rounded-lg bg-indigo-500 hover:bg-indigo-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold items-center gap-2"
          style={{ marginLeft: '8px' }}
          onClick={() => setShowImageModal(true)}
          disabled={adminMode && !isAdmin}
        >
          <FiImage /> Send Image
        </button>
      </div>
    </div>
  );
};

export default Messages;