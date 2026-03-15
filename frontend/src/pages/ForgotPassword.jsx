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
              <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/20 shadow-inner">
                <Mail className="text-blue-400" size={32} />
              </div>
              <h2 className="text-2xl font-bold text-white">Forgot Password?</h2>
              <p className="text-white/50 text-sm mt-2">Enter your email and we'll send you a 4-digit OTP to reset your password.</p>
            </div>

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40 group-focus-within:text-blue-400 transition-colors">
                <Mail size={20} />
              </div>
              <input
                type="email"
                placeholder="registered-email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all shadow-sm"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl text-white font-bold shadow-lg hover:shadow-blue-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
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
              <div className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-purple-500/20 shadow-inner">
                <ShieldCheck className="text-purple-400" size={32} />
              </div>
              <h2 className="text-2xl font-bold text-white">Verify OTP</h2>
              <p className="text-white/50 text-sm mt-2">Check your email for a 4-digit code. (Check console if testing locally!)</p>
            </div>

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40 group-focus-within:text-purple-400 transition-colors">
                <KeyRound size={20} />
              </div>
              <input
                type="text"
                maxLength="4"
                placeholder="Enter 4-digit code"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all shadow-sm text-center tracking-[1em] font-mono text-xl"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white font-bold shadow-lg hover:shadow-purple-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : 'Verify Code'}
              {!loading && <CheckCircle2 size={18} />}
            </button>
            <button type="button" onClick={() => setStep(1)} className="w-full text-white/40 text-xs hover:text-white transition-colors">Back to email</button>
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
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/20 shadow-inner">
                <Lock className="text-green-400" size={32} />
              </div>
              <h2 className="text-2xl font-bold text-white">Reset Password</h2>
              <p className="text-white/50 text-sm mt-2">Almost there! Choose a strong password for your account.</p>
            </div>

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40 group-focus-within:text-green-400 transition-colors">
                <Lock size={20} />
              </div>
              <input
                type="password"
                placeholder="Enter your new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all shadow-sm"
                required
                minLength="6"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-green-600 to-teal-600 rounded-xl text-white font-bold shadow-lg hover:shadow-green-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
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
      <div className="w-full max-w-md glass-card p-8 relative overflow-hidden">
        {/* Animated Background Blob */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl"></div>

        <AnimatePresence mode='wait'>
          {renderStep()}
        </AnimatePresence>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-medium text-center"
          >
            {error}
          </motion.div>
        )}

        {success && !error && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm font-medium text-center"
          >
            {success}
          </motion.div>
        )}

        <div className="mt-8 text-center text-sm text-white/40 font-medium border-t border-white/5 pt-6">
          Remembered your password?{' '}
          <Link to="/login" className="text-white/60 hover:text-white hover:underline transition-all">Back to Login</Link>
        </div>
      </div>
    </div>
  );
}
