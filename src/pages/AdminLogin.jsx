import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api_base_url } from '../helper';

function AdminLogin() {

  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    let data;
    try {
      const res = await fetch(`${api_base_url}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ adminId, password })
      });
      try {
        data = await res.json();
      } catch (jsonErr) {
        setError("Server returned an invalid response.");
        return;
      }
      if (res.ok && data.success) {
        // Persist admin token (JWT fallback) so subsequent requests can authenticate
        if (data.adminToken) {
          try { localStorage.setItem('adminToken', data.adminToken); } catch { }
        }
        navigate('/admin/users');
      } else {
        setError(data.message || data.error || "Login failed. Please try again.");
      }
    } catch (err) {
      setError("Network error. Please check your connection and try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-dark-950">
      <div className="w-full max-w-6xl flex items-center justify-center">
        <div className="w-full lg:w-1/2 p-8 lg:p-12">
          <div className="glass p-8 lg:p-12 rounded-3xl max-w-md mx-auto">
            <div className="text-center mb-8">
              {/* You can add a logo here if needed */}
              <h1 className="text-3xl font-bold text-white mb-2">Admin Login</h1>
              <p className="text-dark-300">Sign in as admin to manage users</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-dark-200">Admin ID</label>
                <div className="inputBox">
                  <input
                    required
                    onChange={e => setAdminId(e.target.value)}
                    value={adminId}
                    type="text"
                    placeholder="Enter admin ID"
                    className="ml-3"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-dark-200">Password</label>
                <div className="inputBox">
                  <input
                    required
                    onChange={e => setPassword(e.target.value)}
                    value={password}
                    type="password"
                    placeholder="Enter your password"
                    className="ml-3 flex-1"
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                  <p className='text-red-400 text-sm'>{error}</p>
                </div>
              )}

              <button
                type="submit"
                className="btnBlue w-full h-12 flex items-center justify-center"
              >
                Login
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
