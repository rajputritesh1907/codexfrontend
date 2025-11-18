import React, { useState } from 'react';
import { api_base_url } from '../helper';

function AdminSignup() {
  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const res = await fetch(`${api_base_url}/api/admin/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ adminId, password })
      });
      let data;
      try {
        data = await res.json();
      } catch (jsonErr) {
        setMessage("Server returned an invalid response.");
        return;
      }
      if (res.ok && data.success) {
        setMessage('Signup successful! You can now login.');
      } else {
        setMessage(data.message || data.error || "Signup failed. Please try again.");
      }
    } catch (err) {
      setMessage("Network error. Please check your connection and try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-dark-950">
      <div className="w-full max-w-6xl flex items-center justify-center">
        <div className="w-full lg:w-1/2 p-8 lg:p-12">
          <div className="glass p-8 lg:p-12 rounded-3xl max-w-md mx-auto">
            <div className="text-center mb-8">
              {/* You can add a logo here if needed */}
              <h1 className="text-3xl font-bold text-white mb-2">Admin Signup</h1>
              <p className="text-dark-300">Register as an admin to manage users</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-dark-200">Admin ID</label>
                <div className="inputBox">
                  <input
                    required
                    onChange={e => setAdminId(e.target.value)}
                    value={adminId}
                    type="email"
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
                    placeholder="Create a strong password"
                    className="ml-3 flex-1"
                  />
                </div>
              </div>

              {message && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                  <p className='text-red-400 text-sm'>{message}</p>
                </div>
              )}

              <button
                type="submit"
                className="btnBlue w-full h-12 flex items-center justify-center"
              >
                Signup
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminSignup;
