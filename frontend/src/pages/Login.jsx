import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, ArrowRight, Store } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      if (err.response?.status === 404) {
        navigate('/register', { state: { email } });
      } else {
        setError(err.response?.data?.detail || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="min-h-[80vh] flex items-center justify-center p-4"
    >
      <div className="w-full max-w-md glass-card rounded-2xl shadow-2xl overflow-hidden">
        
        <div className="p-8">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 text-purple-400 mb-4 shadow-inner border border-white/10">
              <Store size={32} />
            </div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">Welcome Back</h2>
            <p className="text-white/50 mt-2 text-sm font-medium">Log in to your CampusXchange account</p>
          </div>

          {error && (
            <div className="bg-red-500/10 text-red-400 p-4 rounded-xl mb-6 text-sm font-bold border border-red-500/20 shadow-inner flex items-center">
              <span className="w-2 h-2 bg-red-400 rounded-full mr-2 shadow-[0_0_8px_rgba(248,113,113,0.8)]"></span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40 group-focus-within:text-purple-400 transition-colors">
                  <Mail size={20} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-black/20 border border-purple-300/30 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all shadow-sm"
                  placeholder="name@college.edu"
                  required
                />
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40 group-focus-within:text-purple-400 transition-colors">
                  <Lock size={20} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-black/20 border border-purple-300/30 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all shadow-sm"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between mt-2">
              <label className="flex items-center space-x-2 cursor-pointer text-sm text-white/60 font-medium hover:text-white transition-colors">
                <input type="checkbox" className="w-4 h-4 rounded border-white/20 bg-black/20 text-purple-600 focus:ring-purple-500/20 transition-all cursor-pointer" />
                <span>Remember me</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 py-3.5 px-4 border border-transparent rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.3)] text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-[0_0_25px_rgba(168,85,247,0.5)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 transition-all duration-200 uppercase tracking-wide"
            >
              <span>{loading ? 'Logging in...' : 'Sign In'}</span>
              {!loading && <ArrowRight size={18} className="ml-1" />}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-white/60 font-medium">
            Don't have an account?{' '}
            <Link to="/register" className="text-purple-400 hover:text-purple-300 hover:underline transition-all">
              Create one now
            </Link>
          </p>
        </div>
      </div>
    </motion.div>
  );
}
