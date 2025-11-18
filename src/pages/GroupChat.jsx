import React, { useEffect, useState } from "react";
import { api_base_url } from "../helper";

const GroupChat = ({ userId, groupId }) => {
  const [group, setGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminMode, setAdminMode] = useState(false);
  const [members, setMembers] = useState([]);
  const [profileImage, setProfileImage] = useState(null);

  useEffect(() => {
    const fetchGroup = async () => {
      const res = await fetch(`${api_base_url}/api/group/list`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (data.success) {
        const g = data.groups.find((g) => g._id === groupId);
        setGroup(g);
        setMessages(g?.messages || []);
        setIsAdmin(String(g?.admin) === String(userId));
        setAdminMode(g?.adminMode || false);
        setMembers(g?.members || []);
        setProfileImage(g?.profileImage || null);
      }
    };
    fetchGroup();
  }, [groupId, userId]);

  const sendMessage = async () => {
    if (!input.trim() || (adminMode && !isAdmin)) return;
    await fetch(`${api_base_url}/api/group/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ groupId, senderId: userId, content: input }),
    });
    setInput("");
    // Refresh messages
    const res = await fetch(`${api_base_url}/api/group/list`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    const data = await res.json();
    if (data.success) {
      const g = data.groups.find((g) => g._id === groupId);
      setMessages(g?.messages || []);
    }
  };

  return group ? (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex items-center gap-3 mb-4">
        {profileImage ? (
          <img src={profileImage} alt="group" className="w-12 h-12 rounded-full object-cover" />
        ) : (
          <div className="w-12 h-12 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-lg">
            {group.name[0]}
          </div>
        )}
        <div>
          <div className="font-bold text-lg text-indigo-400">{group.name}</div>
          <div className="text-xs text-gray-400">Admin: {isAdmin ? "You" : group.admin}</div>
        </div>
      </div>
      <div className="mb-2 text-sm text-gray-300">Members: {members.length}</div>
      <div className="mb-4">
        <span className="text-xs text-gray-400">Admin Mode: </span>
        <span className={`font-bold ${adminMode ? "text-red-400" : "text-green-400"}`}>{adminMode ? "ON" : "OFF"}</span>
      </div>
      <div className="border rounded-lg p-3 mb-4 bg-dark-700/40" style={{ minHeight: "180px" }}>
        {messages.map((m, i) => (
          <div key={i} className="mb-2">
            <span className="font-semibold text-indigo-300">{String(m.sender) === String(userId) ? "You" : m.sender}</span>: {m.content}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          className="flex-1 px-3 py-2 rounded bg-dark-700 text-white border border-white/10"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={adminMode && !isAdmin}
          placeholder={adminMode && !isAdmin ? "Admin only can send messages" : "Type a message"}
        />
        <button
          className="px-4 py-2 rounded bg-indigo-600 text-white font-semibold hover:bg-indigo-500 disabled:opacity-50"
          onClick={sendMessage}
          disabled={adminMode && !isAdmin}
        >Send</button>
      </div>
    </div>
  ) : (
    <div className="p-6 text-center text-gray-400">Loading group...</div>
  );
};

export default GroupChat;
