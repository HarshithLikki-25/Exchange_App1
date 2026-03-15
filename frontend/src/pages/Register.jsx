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
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 text-purple-400 mb-4 shadow-inner border border-white/10">
              <Store size={32} />
            </div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">Create an Account</h2>
            <p className="text-white/50 mt-2 text-sm font-medium">Join CampusXchange today</p>
          </div>
          
          {error && (
            <div className="bg-red-500/10 text-red-400 p-4 rounded-xl mb-6 text-sm font-bold border border-red-500/20 shadow-inner flex items-center">
              <span className="w-2 h-2 bg-red-400 rounded-full mr-2 shadow-[0_0_8px_rgba(248,113,113,0.8)]"></span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40 group-focus-within:text-purple-400 transition-colors">
                <UserIcon size={20} />
              </div>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full pl-11 pr-4 py-3 bg-black/20 border border-purple-300/30 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all shadow-sm text-sm"
                placeholder="Full Name *"
                required
              />
            </div>
            
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40 group-focus-within:text-purple-400 transition-colors">
                <Mail size={20} />
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-11 pr-4 py-3 bg-black/20 border border-purple-300/30 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all shadow-sm text-sm"
                placeholder="Email Address (e.g., student@college.edu) *"
                required
              />
            </div>

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40 group-focus-within:text-purple-400 transition-colors">
                <Lock size={20} />
              </div>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-11 pr-4 py-3 bg-black/20 border border-purple-300/30 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all shadow-sm text-sm"
                placeholder="Password *"
                required
              />
            </div>

            <div className="relative group pt-2">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40 group-focus-within:text-blue-400 transition-colors mt-2">
                <GraduationCap size={20} />
              </div>
              <input
                type="text"
                name="college"
                value={formData.college}
                onChange={handleChange}
                className="w-full pl-11 pr-4 py-3 bg-black/20 border border-blue-300/30 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all shadow-sm text-sm"
                placeholder="College / University (Optional)"
              />
            </div>

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40 group-focus-within:text-blue-400 transition-colors">
                <MapPin size={20} />
              </div>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full pl-11 pr-4 py-3 bg-black/20 border border-blue-300/30 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all shadow-sm text-sm"
                placeholder="Location (e.g., North Campus, Dorm A)"
              />
            </div>

            <div className="pt-4 mt-4 border-t border-white/10">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center space-x-2 py-3.5 px-4 border border-transparent rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.3)] text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-[0_0_25px_rgba(168,85,247,0.5)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 transition-all duration-200 uppercase tracking-wide"
              >
                <span>{loading ? 'Creating Account...' : 'Sign Up'}</span>
                {!loading && <ArrowRight size={18} className="ml-1" />}
              </button>
            </div>
          </form>

          <p className="mt-8 text-center text-sm text-white/60 font-medium">
            Already have an account?{' '}
            <Link to="/login" className="text-purple-400 hover:text-purple-300 hover:underline transition-all">
              Log in here
            </Link>
          </p>
        </div>
      </div>
    </motion.div>
  );
}
