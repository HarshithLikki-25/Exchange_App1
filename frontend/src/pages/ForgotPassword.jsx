import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Mail, Lock, CheckCircle2, ArrowRight, ShieldCheck, KeyRound, Loader2 } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/forgot-password', { email });
      setStep(2);
      setSuccess('OTP sent successfully to your email.');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to send OTP. Please check your email.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/verify-otp', { email, otp });
      setStep(3);
      setSuccess('OTP verified! Now set your new password.');
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid or expired OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/reset-password', { email, otp, new_password: newPassword });
      setSuccess('Password reset successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.form 
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            onSubmit={handleSendOTP} 
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-200 shadow-sm">
                <Mail className="text-slate-900" size={32} />
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tighter lowercase">forgot password?</h2>
              <p className="text-slate-500 text-[11px] mt-2 font-black uppercase tracking-widest leading-relaxed">Enter your email and we'll send you a 4-digit OTP to reset your password.</p>
            </div>

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-slate-900 transition-colors">
                <Mail size={20} />
              </div>
              <input
                type="email"
                placeholder="registered-email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-300 transition-all shadow-inner"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-slate-900 rounded-2xl text-white font-black text-xs uppercase tracking-widest shadow-xl hover:bg-black transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : 'Send 4-Digit OTP'}
              {!loading && <ArrowRight size={18} />}
            </button>
          </motion.form>
        );
      case 2:
        return (
          <motion.form 
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            onSubmit={handleVerifyOTP} 
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-200 shadow-sm">
                <ShieldCheck className="text-slate-900" size={32} />
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tighter lowercase">verify otp</h2>
              <p className="text-slate-500 text-[11px] mt-2 font-black uppercase tracking-widest leading-relaxed">Check your email for a 4-digit code.</p>
            </div>

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-slate-900 transition-colors">
                <KeyRound size={20} />
              </div>
              <input
                type="text"
                maxLength="4"
                placeholder="Enter 4-digit code"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-slate-900/5 transition-all shadow-inner text-center tracking-[1em] font-black text-xl"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-slate-900 rounded-2xl text-white font-black text-xs uppercase tracking-widest shadow-xl hover:bg-black transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : 'Verify Code'}
              {!loading && <CheckCircle2 size={18} />}
            </button>
            <button type="button" onClick={() => setStep(1)} className="w-full text-slate-400 text-[10px] font-black uppercase tracking-widest hover:text-slate-900 transition-colors">Back to email</button>
          </motion.form>
        );
      case 3:
        return (
          <motion.form 
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            onSubmit={handleResetPassword} 
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-200 shadow-sm">
                <Lock className="text-slate-900" size={32} />
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tighter lowercase">reset password</h2>
              <p className="text-slate-500 text-[11px] mt-2 font-black uppercase tracking-widest leading-relaxed">Almost there! Choose a strong password.</p>
            </div>

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-slate-900 transition-colors">
                <Lock size={20} />
              </div>
              <input
                type="password"
                placeholder="Enter your new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-slate-900/5 transition-all shadow-inner"
                required
                minLength="6"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-slate-900 rounded-2xl text-white font-black text-xs uppercase tracking-widest shadow-xl hover:bg-black transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : 'Update Password'}
              {!loading && <ArrowRight size={18} />}
            </button>
          </motion.form>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4">
      <Helmet><title>Reset Password | CampusXchange</title></Helmet>
      <div className="w-full max-w-md glass-card p-10 relative overflow-hidden bg-white/80 rounded-3xl border border-slate-200 shadow-2xl">
        {/* Animated Background Blobs */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-slate-100/50 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-slate-50/50 rounded-full blur-3xl"></div>

        <AnimatePresence mode='wait'>
          {renderStep()}
        </AnimatePresence>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-bold text-center"
          >
            {error}
          </motion.div>
        )}

        {success && !error && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest text-center shadow-lg"
          >
            {success}
          </motion.div>
        )}

        <div className="mt-10 text-center text-[10px] text-slate-400 font-black uppercase tracking-[0.15em] border-t border-slate-100 pt-8">
          Remembered your password?{' '}
          <Link to="/login" className="text-slate-900 hover:scale-105 inline-block transition-transform">Back to Login</Link>
        </div>
      </div>
    </div>
  );
}
