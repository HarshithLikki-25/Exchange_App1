import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Store, ArrowRight, User as UserIcon, Mail, Lock, MapPin, GraduationCap } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    name: '',
    email: location.state?.email || '',
    password: '',
    college: '',
    location: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(formData);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="min-h-[80vh] flex items-center justify-center p-4 my-8"
    >
      <div className="w-full max-w-md glass-card rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-8">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 text-slate-900 mb-4 shadow-sm border border-slate-200">
              <Store size={32} />
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter lowercase">create an account</h2>
            <p className="text-slate-500 mt-2 text-[11px] font-black uppercase tracking-widest leading-relaxed">Join campusxchange today</p>
          </div>
          
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm font-bold border border-red-100 shadow-sm flex items-center">
              <span className="w-2 h-2 bg-red-500 rounded-full mr-2 shadow-[0_0_8px_rgba(239,68,68,0.4)]"></span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-slate-900 transition-colors">
                <UserIcon size={20} />
              </div>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-300 transition-all shadow-inner text-sm"
                placeholder="Full Name *"
                required
              />
            </div>
            
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-slate-900 transition-colors">
                <Mail size={20} />
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-300 transition-all shadow-inner text-sm"
                placeholder="Email Address (e.g., student@college.edu) *"
                required
              />
            </div>

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-slate-900 transition-colors">
                <Lock size={20} />
              </div>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-300 transition-all shadow-inner text-sm"
                placeholder="Password *"
                required
              />
            </div>

            <div className="relative group pt-2">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-slate-900 transition-colors mt-2">
                <GraduationCap size={20} />
              </div>
              <input
                type="text"
                name="college"
                value={formData.college}
                onChange={handleChange}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-300 transition-all shadow-inner text-sm"
                placeholder="College / University (Optional)"
              />
            </div>

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-slate-900 transition-colors">
                <MapPin size={20} />
              </div>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-300 transition-all shadow-inner text-sm"
                placeholder="Location (e.g., North Campus, Dorm A)"
              />
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center space-x-2 py-4 px-4 rounded-2xl shadow-xl text-xs font-black text-white bg-slate-900 hover:bg-black focus:outline-none focus:ring-4 focus:ring-slate-900/10 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 transition-all duration-300 uppercase tracking-[0.2em]"
              >
                <span>{loading ? 'Creating Account...' : 'Sign Up'}</span>
                {!loading && <ArrowRight size={18} className="ml-1" />}
              </button>
            </div>
          </form>

          <p className="mt-10 text-center text-[10px] text-slate-400 font-black uppercase tracking-[0.15em]">
            Already have an account?{' '}
            <Link to="/login" className="text-slate-900 hover:scale-105 inline-block transition-transform">
              Log in here
            </Link>
          </p>
        </div>
      </div>
    </motion.div>
  );
}
