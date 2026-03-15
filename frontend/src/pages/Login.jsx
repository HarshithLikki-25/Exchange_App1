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
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 text-slate-900 mb-4 shadow-sm border border-slate-200">
              <Store size={32} />
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter lowercase">welcome back</h2>
            <p className="text-slate-500 mt-2 text-[11px] font-black uppercase tracking-widest leading-relaxed">Log in to your campusxchange account</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm font-bold border border-red-100 shadow-sm flex items-center">
              <span className="w-2 h-2 bg-red-500 rounded-full mr-2 shadow-[0_0_8px_rgba(239,68,68,0.4)]"></span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-slate-900 transition-colors">
                  <Mail size={20} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-300 transition-all shadow-inner"
                  placeholder="name@college.edu"
                  required
                />
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-slate-900 transition-colors">
                  <Lock size={20} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-300 transition-all shadow-inner"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between mt-2">
              <label className="flex items-center space-x-2 cursor-pointer text-xs text-slate-400 font-black uppercase tracking-widest hover:text-slate-900 transition-colors">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 bg-slate-50 text-slate-900 focus:ring-slate-900/5 transition-all cursor-pointer" />
                <span>Remember me</span>
              </label>
              <Link to="/forgot-password" size="sm" className="text-xs font-black text-slate-400 hover:text-slate-900 uppercase tracking-widest transition-colors">Forgot password?</Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 py-4 px-4 border border-transparent rounded-2xl shadow-xl text-xs font-black text-white bg-slate-900 hover:bg-black focus:outline-none focus:ring-4 focus:ring-slate-900/10 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 transition-all duration-300 uppercase tracking-[0.2em]"
            >
              <span>{loading ? 'Logging in...' : 'Sign In'}</span>
              {!loading && <ArrowRight size={18} className="ml-1" />}
            </button>
          </form>

          <p className="mt-10 text-center text-[10px] text-slate-400 font-black uppercase tracking-[0.15em]">
            Don't have an account?{' '}
            <Link to="/register" className="text-slate-900 hover:scale-105 inline-block transition-transform">
              Create one now
            </Link>
          </p>
        </div>
      </div>
    </motion.div>
  );
}
