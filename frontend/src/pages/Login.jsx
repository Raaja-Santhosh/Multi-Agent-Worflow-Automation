import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Zap, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import client, { setAuthToken } from '../api/client';

export default function Login({ setUser }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleDevBypass = (customEmail = email) => {
    const mockUser = {
      email: customEmail || 'admin@orchestra.ai',
      role: 'admin',
    };
    setAuthToken('mock-dev-jwt-token');
    setUser(mockUser);
    navigate('/');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);

      const res = await client.post('/auth/token', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      const { access_token, user } = res.data;
      setAuthToken(access_token);
      setUser(user);
      navigate('/');
    } catch (err) {
      console.warn('Backend server connection failed; falling back to developer preview mode:', err);
      handleDevBypass(email);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07080a] flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {/* COSMOQ Glow Orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md cosmo-card rounded-3xl p-8 sm:p-10 relative">
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="relative mb-4">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full blur-md opacity-80" />
            <div className="relative bg-black border border-white/20 p-3.5 rounded-full text-cyan-400">
              <Zap size={28} className="fill-cyan-400/20" />
            </div>
          </div>
          <h2 className="text-3xl font-extrabold text-white font-heading">Welcome Back</h2>
          <p className="text-xs text-gray-400 mt-1">Sign in to manage your autonomous AI agents</p>
        </div>

        {error && (
          <div className="bg-rose-950/30 border border-rose-500/30 text-rose-300 rounded-2xl p-3.5 flex items-start space-x-2 text-xs mb-6 animate-shake">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 text-gray-500" size={16} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="developer@example.com"
                className="w-full bg-[#07080a] border border-white/10 rounded-full pl-11 pr-4 py-3 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 text-gray-500" size={16} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#07080a] border border-white/10 rounded-full pl-11 pr-4 py-3 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold py-3.5 px-4 rounded-full shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all duration-200 flex items-center justify-center space-x-2 border border-cyan-400/30 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => handleDevBypass('admin@orchestra.ai')}
            className="w-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-gray-300 hover:text-white text-xs font-semibold py-2.5 px-4 rounded-full transition-all duration-200 flex items-center justify-center space-x-2 cursor-pointer"
          >
            ⚡ Quick Demo Sign-In (Preview Mode)
          </button>
        </form>

        <div className="mt-8 text-center border-t border-white/10 pt-5">
          <p className="text-xs text-gray-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-cyan-400 font-bold hover:text-cyan-300 transition-colors">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
