import React, { useEffect, useState } from "react";
import { api_base_url } from "../helper";
import Navbar from "../components/Navbar";
import CommunitySkeleton from "../components/skeletons/CommunitySkeleton";

// Utility: relative time
const relTime = (ts) => {
  const d = new Date(ts);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return Math.floor(diff / 60) + "m ago";
  if (diff < 86400) return Math.floor(diff / 3600) + "h ago";
  return d.toLocaleDateString();
};

const Community = ({ userId }) => {
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState("");
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [filterImage, setFilterImage] = useState(false);
  // Cache authorId -> base64 profile picture
  const [profilePics, setProfilePics] = useState({});

  const ensureProfilePic = async (authorId) => {
    if (!authorId || profilePics[authorId] !== undefined) return;
    try {
      const res = await fetch(`${api_base_url}/api/getProfile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: authorId })
      });
      const data = await res.json();
      const pic = data?.success ? (data.profile?.profilePicture || null) : null;
      setProfilePics(prev => ({ ...prev, [authorId]: pic }));
    } catch {
      setProfilePics(prev => ({ ...prev, [authorId]: null }));
    }
  };

  const load = async () => {
    const res = await fetch(`${api_base_url}/community/list`, {
      method: "POST",
    });
    const data = await res.json();
    if (data.success) {
      setPosts(data.posts);
      // Preload profile pictures for post authors
      const ids = Array.from(new Set((data.posts || []).map(p => p?.author?._id || p?.author).filter(Boolean)));
      ids.forEach(ensureProfilePic);
    }
  };
  const [initialLoading, setInitialLoading] = useState(true);
  useEffect(() => {
    (async () => { await load(); setInitialLoading(false); })();
  }, []);
  useEffect(() => {
    const handler = () => load();
    document.addEventListener("community:deleted", handler);
    return () => document.removeEventListener("community:deleted", handler);
  }, []);

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result);
    reader.readAsDataURL(file);
  };

  const submit = async () => {
    if (!content.trim()) return;
    setLoading(true);
    const res = await fetch(`${api_base_url}/community/createPost`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, content, imageBase64: image }),
    });
    const data = await res.json();
    if (data.success) {
      setContent("");
      setImage("");
      await load();
    }
    setLoading(false);
  };

  const addComment = async (postId, text, reset) => {
    if (!text.trim()) return;
    const res = await fetch(`${api_base_url}/community/comment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, postId, content: text }),
    });
    const data = await res.json();
    if (data.success) {
      setPosts((p) => p.map((po) => (po._id === postId ? data.post : po)));
      reset();
    }
  };

  if (!userId) return <div className="p-4 text-white">Login required.</div>;

  const visiblePosts = filterImage ? posts.filter((p) => p.imageBase64) : posts;

  if (initialLoading) {
    return (
      <>
        <div className="fixed top-0 left-0 z-50 w-full"><Navbar /></div>
        <CommunitySkeleton />
      </>
    );
  }

  return (
    <div className="w-full">
      <div className="fixed top-0 left-0 z-50 w-full">
        <Navbar />
      </div>
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-4 md:py-6 relative pb-40">
        <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-indigo-400 to-fuchsia-500 bg-clip-text text-transparent">
          Community Feed
        </h1>
        <div className=" mb-20 sm:mb-40">
          {/* Composer (hidden - replaced by bottom composer) */}
          {/* <div className='md:col-span-1 hidden'> 
        </div> */}
          {/* Feed */}
          <div className="md:col-span-3 space-y-5">
            {visiblePosts.length === 0 && (
              <div className="glass p-8 rounded-xl text-center border border-white/10 text-sm text-gray-400">
                No posts yet. Be the first to share something!
              </div>
            )}
            {visiblePosts.map((p) => (
              <Post
                key={p._id}
                post={p}
                userId={userId}
                authorImage={profilePics[p?.author?._id || p?.author]}
                onComment={addComment}
              />
            ))}
          </div>
        </div>
        {/* Bottom Composer (fixed) */}
        <div className="fixed left-0 right-0 bottom-1 flex justify-center z-50 px-3 sm:px-4">
          <div className="w-full max-w-5xl bg-[#0f1720]/80 glass backdrop-blur rounded-xl p-3 md:p-4 border border-white/10 shadow-lg">
            <div className="flex flex-col md:flex-row gap-3 items-start">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share what's on your mind..."
                className="flex-1 border border-white/10 bg-dark-700/40 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm text-white p-3 rounded-lg resize-none h-24 md:h-20"
              />
              <div className="flex flex-col gap-2 w-full md:w-52">
                {image && (
                  <img
                    src={image}
                    alt="preview"
                    className="h-24 md:h-20 w-full object-contain rounded-md border border-white/10"
                  />
                )}
                <div className="flex items-center gap-2 flex-wrap md:flex-nowrap justify-between md:justify-start">
                  <label className="cursor-pointer px-3 py-2 rounded-lg bg-dark-600/60 hover:bg-dark-500/60 text-indigo-300 font-medium text-xs">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImage}
                      className="hidden"
                    />
                    Image
                  </label>
                  <button
                    onClick={submit}
                    disabled={loading}
                    className="px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold disabled:opacity-50"
                  >
                    {loading ? "Posting..." : "Post"}
                  </button>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filterImage}
                      onChange={(e) => setFilterImage(e.target.checked)}
                      className="accent-indigo-500"
                    />
                    Only images
                  </label>
                  <button
                    onClick={load}
                    className="hover:text-indigo-300 text-xs"
                  >
                    Refresh
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Avatar = ({ name, image }) => {
  if (image) {
    return (
      <img
        src={image}
        alt={name || "avatar"}
        className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500/40 shadow"
      />
    );
  }
  const letter = (name || "?").trim()[0]?.toUpperCase() || "?";
  return (
    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 flex items-center justify-center text-white font-semibold shadow">
      {letter}
    </div>
  );
};


const Post = ({ post, userId, onComment, authorImage }) => {
  const [text, setText] = useState("");
  const [showComments, setShowComments] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [likes, setLikes] = useState(post.likes || []);
  const [likeLoading, setLikeLoading] = useState(false);
  const commentCount = post.comments?.length || 0;
  const isOwner = post.author?.toString?.() === userId || post.author === userId;
  const isLiked = likes.some((id) => id === userId || id?.toString?.() === userId);

  useEffect(() => {
    setLikes(post.likes || []);
  }, [post.likes]);

  useEffect(() => {
    const handler = (e) => {
      if (e.detail.postId === post._id) {
        // parent may refresh
      }
    };
    document.addEventListener("community:deleted", handler);
    return () => document.removeEventListener("community:deleted", handler);
  }, [post._id]);

  const onDeleteClick = () => {
    if (!isOwner || deleting) return;
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`${api_base_url}/community/post/${post._id}?userId=${encodeURIComponent(userId)}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        document.dispatchEvent(new CustomEvent('community:deleted', { detail: { postId: post._id } }));
      }
    } catch (e) {
      console.error('delete error', e);
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleLike = async () => {
    if (likeLoading) return;
    setLikeLoading(true);
    try {
      const res = await fetch(`${api_base_url}/community/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, postId: post._id })
      });
      const data = await res.json();
      if (data.success && data.post) {
        setLikes(data.post.likes || []);
      }
    } catch (e) {
      // handle error
    } finally {
      setLikeLoading(false);
    }
  };

  return (
    <div className="glass rounded-xl p-4 md:p-5 border border-white/10 shadow-lg hover:shadow-fuchsia-500/20 transition-shadow">
      <div className="flex items-start gap-3">
        <Avatar name={post.authorName} image={authorImage} />
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <div className="font-semibold text-white leading-tight">{post.authorName || 'User'}</div>
              <div className="text-xs text-gray-400">{relTime(post.createdAt)}</div>
            </div>
            {isOwner && (
              <button onClick={onDeleteClick} disabled={deleting} className="text-xs text-red-400 hover:text-red-300 disabled:opacity-50">
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            )}
          </div>

          <div className="mt-3 whitespace-pre-wrap text-sm text-gray-100">{post.content}</div>
          {post.imageBase64 && <img src={post.imageBase64} alt="" className="mt-3 max-h-60 md:max-h-72 w-full object-contain rounded-lg border border-white/10" />}

          <div className="mt-4 flex items-center gap-4 md:gap-6 text-xs text-gray-400">
            <button onClick={handleLike} disabled={likeLoading} className={"flex items-center gap-1 " + (isLiked ? "text-pink-400" : "hover:text-pink-300")}>{isLiked ? '♥' : '♡'} {likes.length} Like{likes.length !== 1 && 's'}</button>
            <button onClick={() => setShowComments(s => !s)} className="hover:text-indigo-300">{commentCount} comment{commentCount !== 1 && 's'}</button>
            {/* <div className="cursor-default bg-white/5 px-2 py-1 rounded border border-white/10 text-[10px] tracking-wide">POST ID {post._id.slice(-5)}</div> */}
          </div>

          {showComments && (
            <div className="mt-4 bg-dark-800/40 rounded-lg p-3 border border-white/5">
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
                {post.comments?.map(c => (
                  <div key={c._id + String(c.createdAt || c.timestamp || '')} className="text-xs bg-white/5 rounded-md px-2 py-1 flex gap-2">
                    <span className="font-medium text-indigo-300">{c.username || 'User'}:</span>
                    <span className="text-gray-200">{c.content}</span>
                  </div>
                ))}
                {(!post.comments || post.comments.length === 0) && (
                  <div className="text-gray-500 text-xs italic">No comments yet.</div>
                )}
              </div>

              <div className="flex gap-2 mt-3 flex-col sm:flex-row">
                <input value={text} onChange={e => setText(e.target.value)} placeholder="Write a comment..." className="flex-1 bg-dark-700/60 border border-white/10 rounded px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                <button onClick={() => { onComment(post._id, text, () => setText('')); }} className="px-4 py-2 sm:py-0 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold">Send</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowDeleteModal(false)}></div>
          <div className="bg-[#1e1f22] rounded-xl p-6 z-10 border border-white/10 w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-2">Delete Post</h3>
            <p className="text-sm text-gray-400 mb-4">Are you sure you want to delete this post? This action cannot be undone.</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 rounded bg-dark-700 text-sm text-gray-300">Cancel</button>
              <button onClick={confirmDelete} disabled={deleting} className="px-4 py-2 rounded bg-red-600 hover:bg-red-500 text-white text-sm">{deleting ? 'Deleting...' : 'Delete'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Community;
