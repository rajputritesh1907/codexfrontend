import React, { useState } from 'react';
import { api_base_url } from '../helper';
import { FiMail, FiLock } from 'react-icons/fi';
import { toast } from 'react-toastify';

export default function ForgotPassword() {
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [pwd, setPwd] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const requestCode = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const res = await fetch(api_base_url + "/auth/forgot/request-code".replace('/auth','/api/auth'), {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: email.trim() })
      });
      const json = await res.json();
      if (!json.success) { toast.error(json.message || 'Failed to send code'); setError(json.message || 'Failed to send code'); }
      else { toast.success('Code sent'); setStep('code'); }
    } catch { setError('Network error'); toast.error('Network error'); }
    finally { setLoading(false); }
  };

  const resetPassword = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const res = await fetch(api_base_url + "/auth/forgot/confirm".replace('/auth','/api/auth'), {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: email.trim(), code: code.trim(), newPassword: pwd })
      });
      const json = await res.json();
      if (!json.success) { toast.error(json.message || 'Invalid code'); setError(json.message || 'Invalid code'); }
      else { toast.success('Password updated'); window.location.href = '/login'; }
    } catch { setError('Network error'); toast.error('Network error'); }
    finally { setLoading(false); }
  };

  return (
    <div className="relative h-screen flex items-center justify-center px-4 overflow-hidden bg-gradient-to-br from-dark-950 via-dark-900 to-dark-800">
      <div className="glass p-6 md:p-8 rounded-3xl w-full max-w-md">
        <h1 className="text-2xl font-semibold text-center mb-4">Forgot Password</h1>
        {step === 'email' ? (
          <form onSubmit={requestCode} className="space-y-4">
            <div className="inputBox">
              <FiMail className="text-dark-400 ml-4 text-lg hidden sm:block" />
              <input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required className="sm:ml-3" />
            </div>
            {error && <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-sm">{error}</div>}
            <button type="submit" disabled={loading} className="btnBlue w-full h-12 flex items-center justify-center">{loading ? <div className="loading-spinner"></div> : 'Send Code'}</button>
          </form>
        ) : (
          <form onSubmit={resetPassword} className="space-y-4">
            <div className="inputBox">
              <FiMail className="text-dark-400 ml-4 text-lg hidden sm:block" />
              <input type="text" placeholder="Enter code" value={code} onChange={e=>setCode(e.target.value)} required className="sm:ml-3" />
            </div>
            <div className="inputBox with-toggle">
              <FiLock className="text-dark-400 ml-4 text-lg hidden sm:block" />
              <input type="password" placeholder="New password" value={pwd} onChange={e=>setPwd(e.target.value)} required className="sm:ml-3 flex-1" />
            </div>
            {error && <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-sm">{error}</div>}
            <button type="submit" disabled={loading} className="btnBlue w-full h-12 flex items-center justify-center">{loading ? <div className="loading-spinner"></div> : 'Reset Password'}</button>
            <button type="button" onClick={()=>setStep('email')} className="w-full h-12 flex items-center justify-center rounded-xl bg-dark-800/50 border border-dark-700/50 text-sm">Back</button>
          </form>
        )}
      </div>
    </div>
  );
}
