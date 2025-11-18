import React, { useEffect, useState } from "react";
// import logo from "../images/logo.png";
import { Link, useNavigate } from "react-router-dom";
import Avatar from "react-avatar";
import codeLogo from "../images/code.png";
import { BsGridFill, BsList } from "react-icons/bs";
import {
  FiHome,
  FiUser,
  FiSettings,
  FiLogOut,
  FiMessageCircle,
} from "react-icons/fi";
import { api_base_url } from "../helper"; 
import { FaRobot } from "react-icons/fa";

const Navbar = ({ isGridLayout, setIsGridLayout }) => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // Theme UI removed
  const [isChatSearchOpen, setIsChatSearchOpen] = useState(false);
  const [isGeminiBotOpen, setIsGeminiBotOpen] = useState(false);
  const [activeChat, setActiveChat] = useState(null);
  const [profile, setProfile] = useState(null);
  const currentUserId = localStorage.getItem("userId");

  useEffect(() => {
    const uid = localStorage.getItem("userId");
    if (!uid) return;
    // fetch user details
  fetch(api_base_url + "/api/getUserDetails", {
      mode: "cors",
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: uid }),
    })
      .then((res) => res.json())
      .then((d) => {
        if (d.success) setData(d.user);
        else setError(d.message);
      });
    // fetch profile (for profilePicture)
  fetch(api_base_url + "/api/getProfile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: uid }),
    })
      .then((r) => r.json())
      .then((p) => {
        if (p.success) setProfile(p.profile);
      });
  }, []);

  // Theme shortcuts removed

  // Start chat handler
  const handleStartChat = async (user) => {
    setIsChatSearchOpen(false);
    const res = await fetch(api_base_url + "/chat/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: currentUserId, friendId: user._id }),
    });
    const data = await res.json();
    if (data.success) setActiveChat(data.chat);
  };

  const logout = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("token");
    localStorage.removeItem("isLoggedIn");
    window.location.reload();
  };

  const toggleLayout = () => {
    setIsGridLayout(!isGridLayout);
  };

  return (
    <nav className="navbar sticky top-0 z-50 px-4 md:px-6 lg:px-12 h-16 md:h-20 flex items-center justify-between">
      {/* Left: Mobile hamburger + logo, Desktop logo */}
      <div className="flex items-center gap-2">
        {/* Mobile Hamburger */}
        <button
          className="md:hidden p-2 rounded-lg bg-dark-700/50 hover:bg-dark-600/50 transition-colors duration-200 text-dark-200 hover:text-white"
          aria-label="Open menu"
          onClick={() => setIsMobileMenuOpen(v => !v)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        {/* Logo */}
        <img
          src={codeLogo}
          alt="Logo"
          className="w-8 h-8 md:w-10 md:h-10 object-contain select-none pointer-events-none"
        />
      </div>

      {/* Navigation Links */}
      <div className="hidden md:flex items-center space-x-8">
        <Link className="flex items-center space-x-2 text-dark-200 hover:text-white transition-colors duration-200" to="/">
          <FiHome className="text-lg" />
          <span>Home</span>
        </Link>
        <Link className="flex items-center space-x-2 text-dark-200 hover:text-white transition-colors duration-200" to="/search">
          <FiUser className="text-lg" />
          <span>Search</span>
        </Link>
        {/* <Link className="text-dark-200 hover:text-white transition-colors duration-200">About</Link> */}
        <Link className="text-dark-200 hover:text-white transition-colors duration-200">
          Contact
        </Link>
        <Link className="text-dark-200 hover:text-white transition-colors duration-200">
          Services
        </Link>
        <Link
          to="/community"
          className="text-dark-200 hover:text-white transition-colors duration-200"
        >
          Community
        </Link>
        <Link
          to="/messages"
          className="text-dark-200 hover:text-white transition-colors duration-200"
        >
          Messages
        </Link>
      </div>

      {/* Right side - Actions */}
      <div className="flex items-center space-x-3 md:space-x-4">
        {/* Layout Toggle */}
        <button
          onClick={toggleLayout}
          className="hidden md:inline-flex p-2 rounded-lg bg-dark-700/50 hover:bg-dark-600/50 transition-colors duration-200 text-dark-200 hover:text-white"
          title={isGridLayout ? "Switch to List View" : "Switch to Grid View"}
        >
          {isGridLayout ? (
            <BsList className="text-lg" />
          ) : (
            <BsGridFill className="text-lg" />
          )}
        </button>

        {/* Theme controls removed */}

        {/* Chat Button */}
        {/* <button
          onClick={() => setIsChatSearchOpen(true)}
          className="p-2 rounded-lg bg-dark-700/50 hover:bg-dark-600/50 transition-colors duration-200 text-dark-200 hover:text-white"
          title="Chat with Friend"
        >
          <FiMessageCircle className="text-lg" />
        </button> */}
        {/* Gemini Bot Button */}
        {/* <button
          onClick={() => setIsGeminiBotOpen(true)}
          className="p-2 rounded-lg bg-dark-700/50 hover:bg-primary-500 transition-colors duration-200 text-dark-200 hover:text-white"
          title="Gemini Chatbot"
        >
          <FaRobot className="text-lg" />
        </button> */}

        {/* Logout Button (desktop only) */}
        <button
          onClick={logout}
          className="hidden md:inline-flex items-center justify-center btnBlue !bg-red-500 hover:!bg-red-600 min-w-[84px] md:min-w-[100px] h-9 md:h-10 text-xs md:text-sm font-medium"
        >
          Logout
        </button>

        {/* User Avatar */}
        <div className="relative">
          <Avatar
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            name={data ? data.name : ""}
            size="40"
            round="50%"
            src={profile?.profilePicture || undefined}
            className="cursor-pointer transition-transform hover:scale-110 border-2 border-dark-600 hover:border-primary-500"
          />

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 top-12 w-64 glass rounded-xl shadow-2xl border border-dark-600/20 overflow-hidden animate-slide-down">
              {/* User Info */}
              <div className="p-4 border-b border-dark-600/20">
                <div className="flex items-center space-x-3">
                  <Avatar
                    name={data ? data.name : ""}
                    size="40"
                    round="50%"
                    src={profile?.profilePicture || undefined}
                  />
                  <div>
                    <h3 className="text-white font-semibold">
                      {data ? data.name : "User"}
                    </h3>
                    <p className="text-dark-300 text-sm">
                      {data ? data.email : "user@example.com"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="p-2">
                {/* <button
                  onClick={() => {
                    navigate("/profile");
                  }}
                  className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-dark-200 hover:text-white hover:bg-dark-700/50 transition-colors duration-200"
                >
                  <FiUser className="text-lg" />
                  <span>Profile</span>
                </button>  */}

                <button
                  onClick={logout}
                  className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors duration-200"
                >
                  <FiLogOut className="text-lg" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu Button moved to left next to logo */}

      {/* Mobile Dropdown Menu */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 px-4 md:hidden">
          <div className="glass rounded-xl border border-white/10 overflow-hidden shadow-xl">
            <div className="flex flex-col divide-y divide-white/5">
              <Link onClick={()=>setIsMobileMenuOpen(false)} className="px-4 py-3 text-dark-200 hover:text-white hover:bg-dark-700/40 flex items-center gap-2" to="/">
                <FiHome /> Home
              </Link>
              <Link onClick={()=>setIsMobileMenuOpen(false)} className="px-4 py-3 text-dark-200 hover:text-white hover:bg-dark-700/40" to="/community">Community</Link>
              <Link onClick={()=>setIsMobileMenuOpen(false)} className="px-4 py-3 text-dark-200 hover:text-white hover:bg-dark-700/40" to="/messages">Messages</Link>
              <Link onClick={()=>setIsMobileMenuOpen(false)} className="px-4 py-3 text-dark-200 hover:text-white hover:bg-dark-700/40" to="/search">Search</Link>
              <button onClick={()=>{ setIsMobileMenuOpen(false); navigate('/profile'); }} className="text-left px-4 py-3 text-dark-200 hover:text-white hover:bg-dark-700/40 flex items-center gap-2"><FiUser /> Profile</button>
              <button
                onClick={() => { setIsMobileMenuOpen(false); logout(); }}
                className="text-left px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 flex items-center gap-2"
              >
                <FiLogOut /> Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Theme modals removed */}

      {/* Chat Search Modal */}
      {/* <ChatSearchModal
        isOpen={isChatSearchOpen}
        onClose={() => setIsChatSearchOpen(false)}
        onStartChat={handleStartChat}
      /> */}
      {/* Chat Window */}
      {activeChat && (
        <ChatWindow
          chat={activeChat}
          currentUser={currentUserId}
          onClose={() => setActiveChat(null)}
        />
      )}
      {/* Gemini Chatbot Window */}
      {isGeminiBotOpen && (
        <ChatWindow
          chat={null}
          currentUser={currentUserId || "You"}
          onClose={() => setIsGeminiBotOpen(false)}
          isGeminiBot={true}
        />
      )}
    </nav>
  );
};

export default Navbar;
