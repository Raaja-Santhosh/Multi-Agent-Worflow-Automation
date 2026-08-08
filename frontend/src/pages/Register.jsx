import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Cpu, ArrowRight, AlertCircle, Loader2, User } from 'lucide-react';
import client, { setAuthToken } from '../api/client';

export default function Register({ setUser }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Register the user
      await client.post('/auth/register', {
        email,
        password,
        role,
      });

      // Automatically sign in upon successful registration
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);

      const tokenRes = await client.post('/auth/token', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      const { access_token, user } = tokenRes.data;
      setAuthToken(access_token);
      setUser(user);
      navigate('/');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Registration failed. Try using a different email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1117] flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-cyan-500/5 rounded-full blur-3xl" />

      <div className="w-full max-w-md bg-gray-900/40 border border-gray-800/80 rounded-3xl p-8 shadow-2xl backdrop-blur-md relative">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-gradient-to-tr from-cyan-500 to-blue-600 p-3.5 rounded-2xl text-white shadow-cyan-500/20 shadow-lg mb-4">
            <Cpu size={32} className="animate-pulse" />
          </div>
          <h2 className="text-2xl font-black text-white">Create Account</h2>
          <p className="text-xs text-gray-500 mt-1">Get started with our automated agent network</p>
        </div>

        {error && (
          <div className="bg-red-950/20 border border-red-500/30 text-red-400 rounded-xl p-3.5 flex items-start space-x-2 text-xs mb-6 animate-shake">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 text-gray-500" size={16} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="developer@example.com"
                className="w-full bg-[#0d1117]/80 border border-gray-800 rounded-xl pl-11 pr-4 py-3 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all duration-200"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 text-gray-500" size={16} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#0d1117]/80 border border-gray-800 rounded-xl pl-11 pr-4 py-3 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all duration-200"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Select Role</label>
            <div className="relative">
              <User className="absolute left-4 top-3.5 text-gray-500" size={16} />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-[#0d1117]/80 border border-gray-800 rounded-xl pl-11 pr-4 py-3 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all duration-200 appearance-none"
              >
                <option value="user">Standard User</option>
                <option value="admin">System Administrator</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-sm font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-cyan-500/10 hover:shadow-cyan-500/20 transition-all duration-200 flex items-center justify-center space-x-2 border border-cyan-400/20"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <span>Sign Up</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-gray-850 pt-5">
          <p className="text-xs text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="text-cyan-400 font-bold hover:text-cyan-300 transition-colors">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
