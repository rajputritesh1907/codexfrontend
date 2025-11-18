import React, { useState } from "react";
import { api_base_url } from "../helper";

const CreateGroup = ({ userId, onCreated }) => {
  const [name, setName] = useState("");
  const [friends, setFriends] = useState([]); // List of user's friends
  const [selectedMembers, setSelectedMembers] = useState([]); // Selected friend IDs
  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch friends on mount
  React.useEffect(() => {
    const fetchFriends = async () => {
      try {
        const res = await fetch(`${api_base_url}/api/friends/list`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        });
        const data = await res.json();
        if (data.success) setFriends(data.contacts || []);
      } catch {}
    };
    fetchFriends();
  }, [userId]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (ev) => setProfileImage(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  // Backend expects adminId (will be treated as creator)
  const handleCreate = async () => {
    setLoading(true);
    setError("");
    const memberIds = selectedMembers;
    const res = await fetch(`${api_base_url}/api/group/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, adminId: userId, memberIds, profileImage }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.success) {
      onCreated && onCreated(data.group);
    } else {
      setError(data.error || "Failed to create group");
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-dark-800 rounded-xl shadow-lg">
      <h2 className="text-xl font-bold mb-4 text-indigo-400">Create Group</h2>
      <input
        className="w-full mb-3 px-3 py-2 rounded bg-dark-700 text-white border border-white/10"
        placeholder="Group Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      {/* Friend selection list */}
      <div className="mb-3">
        <label className="block text-sm text-gray-400 mb-1">Select Members</label>
        <div className="max-h-40 overflow-y-auto border border-white/10 rounded bg-dark-900 p-2">
          {friends.length === 0 ? (
            <div className="text-xs text-gray-500">No friends found.</div>
          ) : (
            friends.map(f => (
              <label key={f.userId} className="flex items-center gap-2 mb-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedMembers.includes(f.userId)}
                  onChange={e => {
                    setSelectedMembers(m =>
                      e.target.checked
                        ? [...m, f.userId]
                        : m.filter(id => id !== f.userId)
                    );
                  }}
                />
                <span className="text-sm text-white">{f.name || f.username || f.userId}</span>
              </label>
            ))
          )}
        </div>
      </div>
      <div className="mb-3">
        <label className="block text-sm text-gray-400 mb-1">Group Profile Image</label>
        <input type="file" accept="image/*" onChange={handleImageChange} />
        {profileImage && (
          <img src={profileImage} alt="preview" className="mt-2 max-h-24 rounded" />
        )}
      </div>
      {error && <div className="text-red-400 mb-2">{error}</div>}
      <button
        className="w-full py-2 rounded bg-indigo-600 text-white font-semibold hover:bg-indigo-500 disabled:opacity-50"
        onClick={handleCreate}
        disabled={loading || !name}
      >
        {loading ? "Creating..." : "Create Group"}
      </button>
    </div>
  );
};

export default CreateGroup;
