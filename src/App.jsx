import React, { useEffect, useMemo, useState } from 'react'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import "./App.css"
import Home from './pages/Home';
import AdminLogin from './pages/AdminLogin';
import AdminSignup from './pages/AdminSignup';
import AdminUserList from './pages/AdminUserList';
import AdminUserDashboard from './pages/AdminUserDashboard';
import AdminProjectView from './pages/AdminProjectView';
import NoPage from './pages/NoPage';
import SignUp from './pages/SignUp';
import Login from './pages/Login';
import Editior from './pages/Editior';
// import GeminiChat from './pages/GeminiChat';
import Profile from './pages/Profile';
import Community from './pages/Community';
import Messages from './pages/Messages';
import Search from './pages/Search';
import PublicProfile from './pages/PublicProfile';
import OAuthCallback from './pages/OAuthCallback';
import ForgotPassword from './pages/ForgotPassword';
// Meeting feature removed; import deleted
// Theme system removed
import ChatWindow from './components/ChatWindow';
import { FaRobot } from 'react-icons/fa';

const NeonBlobsBackground = () => {
  // Generate star positions once to avoid re-renders creating new random values each time
  const stars = useMemo(() => (
    Array.from({ length: 60 }, () => ({
      cx: Math.random() * 1920,
      cy: Math.random() * 1080,
      r: Math.random() * 1.5 + 0.5,
      o: Math.random() * 0.3 + 0.1,
    }))
  ), []);

  return (
    <div className="neon-bg-blobs pointer-events-none fixed inset-0 -z-10 w-full h-full overflow-hidden">
      {/* Main gradient background is handled by App.css, this adds blobs and stars */}
      {/* Neon Blob 1 */}
      <svg className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] opacity-70 animate-float-slow" viewBox="0 0 600 600" fill="none">
        <defs>
          <radialGradient id="blob1" cx="50%" cy="50%" r="50%" fx="50%" fy="50%" gradientTransform="rotate(45)">
            <stop offset="0%" stopColor="#a21caf" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.2" />
          </radialGradient>
        </defs>
        <ellipse cx="300" cy="300" rx="280" ry="220" fill="url(#blob1)" />
      </svg>
      {/* Neon Blob 2 */}
      <svg className="absolute bottom-[-15%] right-[-10%] w-[700px] h-[700px] opacity-60 animate-float-slower" viewBox="0 0 700 700" fill="none">
        <defs>
          <radialGradient id="blob2" cx="50%" cy="50%" r="50%" fx="50%" fy="50%" gradientTransform="rotate(-30)">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#d946ef" stopOpacity="0.2" />
          </radialGradient>
        </defs>
        <ellipse cx="350" cy="350" rx="300" ry="250" fill="url(#blob2)" />
      </svg>
      {/* Subtle stars/particles */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1920 1080" fill="none">
        <g>
          {stars.map((s, i) => (
            <circle key={i} cx={s.cx} cy={s.cy} r={s.r} fill="#fff" opacity={s.o} />
          ))}
        </g>
      </svg>
    </div>
  );
};

// Shell component to access location inside Router
const RouteShell = ({ isLoggedIn, showBot, setShowBot }) => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  return (
    <>
      {!isAdminRoute && <NeonBlobsBackground />}
      <Routes>
        <Route path='/' element={isLoggedIn ? <Home /> : <Navigate to="/login"/>} />
        <Route path='/signUp' element={<SignUp />} />
        <Route path='/login' element={<Login />} />
  <Route path='/forgot-password' element={<ForgotPassword />} />
  <Route path='/oauth/callback' element={<OAuthCallback />} />
        <Route path='/admin/login' element={<AdminLogin />} />
        <Route path='/admin/signup' element={<AdminSignup />} />
        <Route path='/admin/users' element={<AdminUserList />} />
  <Route path='/admin/users/:id' element={<AdminUserDashboard />} />
  <Route path='/admin/project/:projectId' element={<AdminProjectView />} />
        <Route path='/editior/:projectID' element={isLoggedIn ? <Editior /> : <Navigate to="/login"/>} />
        <Route path='/profile' element={isLoggedIn ? <Profile userId={localStorage.getItem('userId')} /> : <Navigate to="/login"/>} />
  <Route path='/search' element={isLoggedIn ? <Search /> : <Navigate to="/login"/>} />
  <Route path='/user/:id' element={isLoggedIn ? <PublicProfile /> : <Navigate to="/login"/>} />
        <Route path='/community' element={isLoggedIn ? <Community userId={localStorage.getItem('userId')} /> : <Navigate to="/login"/>} />
  <Route path='/messages' element={isLoggedIn ? <Messages userId={localStorage.getItem('userId')} /> : <Navigate to="/login"/>} />
  {/* Meeting routes removed */}
        {/* <Route path='/chatbot' element={isLoggedIn ? <GeminiChat currentUser={localStorage.getItem('userId') || 'You'} /> : <Navigate to="/login"/>} /> */}
        <Route path="*" element={isLoggedIn ? <NoPage />: <Navigate to="/login"/>} />
      </Routes>
      {/* Chatbot button only on non-admin routes */}
      {isLoggedIn && !isAdminRoute && !showBot && (
        <button
          className="fixed sm:bottom-6 bottom-20 right-6 z-50 bg-primary-500 hover:bg-primary-600 text-white rounded-full p-4 shadow-lg flex items-center justify-center"
          onClick={() => setShowBot(true)}
          title="Open Gemini Chatbot"
        >
          <FaRobot className="text-2xl" />
        </button>
      )}
      {!isAdminRoute && showBot && (
        <ChatWindow
          chat={null}
          currentUser={localStorage.getItem('userId') || 'You'}
          onClose={() => setShowBot(false)}
          isGeminiBot={true}
        />
      )}
    </>
  );
};

const App = () => {
  // Normalize auth status to a boolean and keep it stable across renders
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('isLoggedIn') === 'true' && !!localStorage.getItem('token'));
  const [showBot, setShowBot] = useState(false);

  // Sync with storage changes (e.g., OAuth callback in another tab or programmatic updates)
  useEffect(() => {
    const syncAuth = () => {
      const logged = localStorage.getItem('isLoggedIn') === 'true' && !!localStorage.getItem('token');
      setIsLoggedIn(logged);
    };
    window.addEventListener('storage', syncAuth);
    // Also check on mount in case values changed before this component mounted
    syncAuth();
    return () => window.removeEventListener('storage', syncAuth);
  }, []);

  return (
    <BrowserRouter>
      <RouteShell isLoggedIn={isLoggedIn} showBot={showBot} setShowBot={setShowBot} />
      <ToastContainer
        position="top-center"
        autoClose={2200}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        closeButton={false}
        draggable={false}
        pauseOnFocusLoss={false}
        pauseOnHover={false}
        theme="dark"
        limit={2}
        containerClassName="app-toast-container"
        toastClassName={(context) => `app-toast ${context?.type ? `app-toast--${context.type}` : ''}`}
        bodyClassName="app-toast__body"
        progressClassName="app-toast__progress"
        style={{ top: 16 }}
      />
    </BrowserRouter>
  );
};

export default App