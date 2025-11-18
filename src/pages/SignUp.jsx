import React, { useEffect, useMemo, useState } from 'react'
import logo from "../images/code.png"
import { Link, useNavigate } from 'react-router-dom';
// import image from "../images/authPageSide.png";
import { api_base_url } from '../helper';
import { FiMail, FiLock, FiEye, FiEyeOff, FiUser, FiUserCheck } from 'react-icons/fi';
import { toast } from 'react-toastify';

const SignUp = () => {
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({ username: "", name: "", email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState('form'); // form | code
  const [code, setCode] = useState('');

  const navigate = useNavigate();

  // If user is already logged in, redirect to home
  useEffect(() => {
    try {
      const isLoggedIn = localStorage.getItem('isLoggedIn');
      const token = localStorage.getItem('token');
      if ((isLoggedIn === 'true') && token) {
        navigate('/', { replace: true });
      }
    } catch {}
  }, [navigate]);

  const submitForm = async (e) => {
    e.preventDefault();
    setError("");
    const nextErrors = { username: "", name: "", email: "", password: "" };
    if (username.trim().length < 3) nextErrors.username = "Min 3 characters";
    if (name.trim().length < 2) nextErrors.name = "Min 2 characters";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) nextErrors.email = "Enter a valid email";
    if (pwd.length < 6) nextErrors.password = "Min 6 characters";
    setFieldErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) {
      const firstErr = nextErrors.username || nextErrors.name || nextErrors.email || nextErrors.password;
      if (firstErr) toast.error(firstErr);
      return;
    }
    setIsLoading(true);
    try {
      // Step 1: request email code
      const res = await fetch(api_base_url + "/auth/signup/request-code".replace('/auth','/api/auth'), {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() })
      });
      const json = await res.json();
      if (!json.success) { setError(json.message || 'Failed to send code'); toast.error(json.message || 'Failed to send code'); return; }
      toast.success('Verification code sent to your email');
      setStep('code');
    } catch (err) {
      setError('Network error. Please try again.');
      toast.error('Network error. Please try again.');
    } finally { setIsLoading(false); }
  }

  const confirmSignup = async (e) => {
    e.preventDefault();
    setIsLoading(true); setError('');
    try {
      const res = await fetch(api_base_url + "/auth/signup/confirm".replace('/auth','/api/auth'), {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), name: name.trim(), email: email.trim(), password: pwd, code: code.trim() })
      });
      const json = await res.json();
      if (!json.success) { setError(json.message || 'Invalid code'); toast.error(json.message || 'Invalid code'); return; }
      toast.success('Account created');
      navigate('/login');
    } catch (e1) {
      setError('Network error. Please try again.'); toast.error('Network error. Please try again.');
    } finally { setIsLoading(false); }
  };

  return (
    <div className="relative h-screen flex items-center justify-center px-4 overflow-hidden bg-gradient-to-br from-dark-950 via-dark-900 to-dark-800">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-6xl flex items-center justify-center">
        {/* Left side - Sign Up Form */}
        <div className="w-full lg:w-1/2 p-4 lg:p-8">
          <div className="glass p-6 md:p-8 lg:p-10 rounded-3xl w-full sm:max-w-md md:max-w-lg lg:max-w-xl mx-auto">
            {/* Logo */}
            <div className="text-center mb-8">
              <img className='w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 mx-auto sm:mb-6 select-none pointer-events-none' src={logo} alt="Logo" />
              <h1 className="sm:text-3xl text-2xl font-bold text-white sm:mb-2">Create Account</h1>
              {/* <p className="text-dark-300">Join our coding community and start building amazing projects</p> */}
            </div>

            {/* Sign Up Form */}
            {step === 'form' ? (
            <form onSubmit={submitForm} className="space-y-6">
              {/* Username Input */}
              <div className="space-y-2">
                {/* <label className="text-sm font-medium text-dark-200">Username</label> */}
                <div className={`inputBox ${fieldErrors.username ? '!ring-1 !ring-red-500/50' : ''} `}>
                  <FiUser className="text-dark-400 ml-4 text-lg hidden sm:block" />
                  <input 
                    required 
                    onChange={(e) => setUsername(e.target.value)} 
                    value={username} 
                    type="text" 
                    placeholder='Username'
                    className="sm:ml-3 "
                  />
                </div>
                {fieldErrors.username && <div className="text-red-400 text-xs mt-1">{fieldErrors.username}</div>}
              </div>

              {/* Full Name Input */}
              <div className="space-y-2">
                {/* <label className="text-sm font-medium text-dark-200">Full Name</label> */}
            <div className={`inputBox ${fieldErrors.name ? '!ring-1 !ring-red-500/50' : ''}`}>
                  <FiUserCheck className="text-dark-400 ml-4 text-lg hidden sm:block" />
                  <input 
                    required 
                    onChange={(e) => setName(e.target.value)} 
                    value={name} 
                    type="text" 
                    placeholder='Full Name'
                    className="sm:ml-3"
                  />
                </div>
                {fieldErrors.name && <div className="text-red-400 text-xs mt-1">{fieldErrors.name}</div>}
            </div>

              {/* Email Input */}
              <div className="space-y-2">
                {/* <label className="text-sm font-medium text-dark-200">Email Address</label> */}
            <div className={`inputBox ${fieldErrors.email ? '!ring-1 !ring-red-500/50' : ''}`}>
                  <FiMail className="text-dark-400 ml-4 text-lg hidden sm:block" />
                  <input 
                    required 
                    onChange={(e) => setEmail(e.target.value)} 
                    value={email} 
                    type="email" 
                    placeholder='Email'
                    className="sm:ml-3"
                    autoComplete="email"
                  />
                </div>
                {fieldErrors.email && <div className="text-red-400 text-xs mt-1">{fieldErrors.email}</div>}
            </div>

              {/* Password Input */}
              <div className="space-y-2">
                {/* <label className="text-sm font-medium text-dark-200">Password</label> */}
                <div className={`inputBox with-toggle ${fieldErrors.password ? '!ring-1 !ring-red-500/50' : ''}`}>
                  <FiLock className="text-dark-400 ml-4 text-lg hidden sm:block" />
                  <input
                    required
                    onChange={(e) => setPwd(e.target.value)}
                    value={pwd}
                    type={showPassword ? 'text' : 'password'}
                    placeholder='Password'
                    className="sm:ml-3 flex-1"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="toggle-eye"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <FiEyeOff className="text-lg" /> : <FiEye className="text-lg" />}
                  </button>
                </div>
                {fieldErrors.password && <div className="text-red-400 text-xs mt-1">{fieldErrors.password}</div>}
            </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                  <p className='text-red-400 text-sm'>{error}</p>
                </div>
              )}

              {/* Send Code Button */}
              <button 
                type="submit" 
                disabled={isLoading}
                className="btnBlue w-full h-12 flex items-center justify-center"
              >
                {isLoading ? (
                  <div className="loading-spinner"></div>
                ) : (
                  "Send Verification Code"
                )}
              </button>

              {/* Login Link */}
              <div className="text-center">
                <p className='text-dark-300'>
                  Already have an account?{' '}
                  <Link to="/login" className='text-primary-400 hover:text-primary-300 font-medium transition-colors'>
                    Sign In
                  </Link>
                </p>
              </div>
          </form>
          ) : (
          <form onSubmit={confirmSignup} className="space-y-6">
            <div className="space-y-2">
              <div className={`inputBox`}>
                <FiMail className="text-dark-400 ml-4 text-lg hidden sm:block" />
                <input
                  required
                  value={code}
                  onChange={(e)=>setCode(e.target.value)}
                  type="text"
                  placeholder="Enter verification code"
                  className="sm:ml-3"
                />
              </div>
              <p className="text-xs text-dark-300">Check your inbox for a 6-digit code. It expires in 10 minutes.</p>
            </div>
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <p className='text-red-400 text-sm'>{error}</p>
              </div>
            )}
            <button type="submit" disabled={isLoading} className="btnBlue w-full h-12 flex items-center justify-center">
              {isLoading ? <div className="loading-spinner"></div> : 'Verify & Create Account'}
            </button>
            <button type="button" onClick={()=>setStep('form')} className="w-full h-12 flex items-center justify-center rounded-xl bg-dark-800/50 border border-dark-700/50 text-sm">Back</button>
          </form>
          )}
        </div>
        </div>

        {/* Right side - Image */}
        {/* <div className="hidden lg:block w-1/2 p-8">
          <div className="relative h-full flex items-center justify-center">
            <div className="glass rounded-3xl overflow-hidden">
              <img 
                className='h-[600px] w-full object-cover' 
                src={image} 
                alt="Coding illustration" 
              />
            </div> 
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white">
                <h2 className="text-4xl font-bold mb-4">Join the Community</h2>
                <p className="text-lg text-dark-200">Start your coding journey today</p>
              </div>
            </div>
          </div>
        </div> */}
      </div>
    </div>
  )
}

export default SignUp