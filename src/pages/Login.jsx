import React, { useEffect, useMemo, useState } from 'react'
import logo from "../images/code.png"
import { Link, useNavigate } from 'react-router-dom';
// import image from "../images/authPageSide.png";
import { api_base_url } from '../helper';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { FcGoogle } from 'react-icons/fc';
import { FaGithub } from 'react-icons/fa';

const Login = () => {
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);

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

  // Parse oauth error from query string if any
  useEffect(() => {
    try {
      const sp = new URLSearchParams(window.location.search);
      const err = sp.get('error');
      if (err) setError(err.replace(/_/g, ' '));
    } catch {}
  }, []);

  const validateEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  const formValid = useMemo(() => validateEmail(email) && pwd.length >= 6, [email, pwd]);

  const submitForm = async (e) => {
    e.preventDefault();
    setError("");
    // simple client-side validation
    const nextFieldErrors = { email: "", password: "" };
    if (!validateEmail(email)) nextFieldErrors.email = "Enter a valid email";
    if (pwd.length < 6) nextFieldErrors.password = "Minimum 6 characters";
    setFieldErrors(nextFieldErrors);
    if (nextFieldErrors.email || nextFieldErrors.password) {
      // Show toast for first validation error
      const firstErr = nextFieldErrors.email || nextFieldErrors.password;
      if (firstErr) toast.error(firstErr);
      return;
    }
    setIsLoading(true);

    try {
      const response = await fetch(api_base_url + "/login", {
      mode: "cors",
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: email,
        password: pwd
      })
      });

      const data = await response.json();
      
      if (data.success === true) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("isLoggedIn", true);
        localStorage.setItem("userId", data.userId);
        // Cache minimal user object for profile header usage
        try {
          localStorage.setItem("user", JSON.stringify({ userId: data.userId }));
        } catch {}
        setTimeout(() => {
          window.location.href = "/"
        }, 200);
      } else {
        setError(data.message);
        if (data.message) toast.error(data.message);
      }
    } catch (error) {
      setError("Network error. Please try again.");
      toast.error("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="relative h-full flex items-center  justify-center px-4 overflow-hidden bg-gradient-to-br from-dark-950 via-dark-900 to-dark-800">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-6xl flex items-center justify-center">
        {/* Left side - Login Form */}
        <div className="w-full lg:w-1/2 p-4 lg:p-8">
          <div className="glass p-6 md:p-8 lg:px-20 rounded-3xl w-full sm:max-w-md md:max-w-lg lg:max-w-xl mx-auto">
            {/* Logo */}
            <div className="text-center mb-6">
                <img className='w-20= h-20 sm:w-28 sm:h-28 md:w-20 md:h-20 mx-auto sm:mb-6 select-none pointer-events-none' src={logo} alt="Logo" />
              <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
              {/* <p className="text-dark-300">Sign in to your account to continue coding</p> */}
            </div>

            {/* Login Form */}
            <form onSubmit={submitForm} className="space-y-4">
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
                    placeholder="Password"
                    className="sm:ml-3 flex-1"
                    autoComplete="current-password"
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
              <div className="flex justify-end -mt-2">
                <Link to="/forgot-password" className="text-xs text-primary-400 hover:text-primary-300">Forgot password?</Link>
              </div>

              {/* Login Button */}
              <button 
                type="submit" 
                disabled={isLoading}
                className="btnBlue w-full h-12 flex items-center justify-center"
              >
                {isLoading ? (
                  <div className="loading-spinner"></div>
                ) : (
                  "Sign In"
                )}
              </button>

              {/* Or divider */}
              <div className="flex items-center gap-3 text-dark-400 mt-2">
                <div className="h-px bg-white/10 flex-1" />
                <span className="text-xs">OR</span>
                <div className="h-px bg-white/10 flex-1" />
              </div>

              {/* OAuth Buttons - centered, stacked with icons */}
              <div className="flex flex-col items-center gap-3">
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); const isLoggedIn = localStorage.getItem('isLoggedIn')==='true' && localStorage.getItem('token'); if (isLoggedIn) { navigate('/'); } else { window.location.href = `${api_base_url}/auth/google`; } }}
                  className="w-full h-12 rounded-lg border border-white/10 bg-white text-dark-900 hover:bg-gray-50 flex items-center justify-center gap-3 font-medium shadow-sm transition-colors"
                  aria-label="Continue with Google"
                >
                  <FcGoogle className="text-2xl" />
                  <span>Continue with Google</span>
                </a>
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); const isLoggedIn = localStorage.getItem('isLoggedIn')==='true' && localStorage.getItem('token'); if (isLoggedIn) { navigate('/'); } else { window.location.href = `${api_base_url}/auth/github`; } }}
                  className="w-full h-12 rounded-lg bg-[#24292e] hover:bg-black text-white flex items-center justify-center gap-3 font-medium shadow-sm transition-colors"
                  aria-label="Continue with GitHub"
                >
                  <FaGithub className="text-xl" />
                  <span>Continue with GitHub</span>
                </a>
              </div>

              {/* Sign Up Link */}
              <div className="text-center">
                <p className='text-dark-300'>
                  Don't have an account?{' '}
                  <Link to="/signUp" className='text-primary-400 hover:text-primary-300 font-medium transition-colors'>
                    Sign Up
                  </Link>
                </p>
              </div>
          </form>
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
                <h2 className="text-4xl font-bold mb-4">Code. Create. Innovate.</h2>
                <p className="text-lg text-dark-200">Your online development environment</p>
              </div>
            </div>
          </div>
        </div> */}
      </div>
    </div>
  )
}

export default Login