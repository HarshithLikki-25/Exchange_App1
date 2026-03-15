import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Bell, Check, Loader2, Package, MessageSquare, RefreshCcw } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';

export default function Notifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const res = await api.get('/notifications');
        setNotifications(res.data);
      } catch (err) {
        console.error("Failed to fetch notifications", err);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchNotifs();
  }, [user]);

  const handleNotificationClick = async (notif) => {
    if (!notif.is_read) {
      try {
        await api.patch(`/notifications/${notif.id}/read`);
        setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n));
      } catch (err) {
        console.error(err);
      }
    }
    // Navigate based on type
    if (notif.type.includes('exchange_scheduled') || notif.type.includes('exchange_request') || notif.type.includes('exchange_')) {
      navigate('/dashboard');
    }
  };

  const getIcon = (type) => {
    switch(type) {
      case 'exchange_request': return <RefreshCcw className="text-slate-900 w-6 h-6" />;
      case 'exchange_accepted': return <Check className="text-slate-900 w-6 h-6" />;
      case 'exchange_rejected': return <X className="text-slate-400 w-6 h-6" />;
      case 'exchange_scheduled': return <Bell className="text-slate-900 w-6 h-6" />;
      case 'message': return <MessageSquare className="text-slate-900 w-6 h-6" />;
      default: return <Bell className="text-slate-300 w-6 h-6" />;
    }
  };

  if (loading) return <div className="flex justify-center py-32"><Loader2 className="w-12 h-12 animate-spin text-slate-900" /></div>;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <Helmet><title>Notifications | CampusXchange</title></Helmet>
      
      <div className="flex items-center space-x-6 mb-12 pb-8 border-b border-slate-100">
        <div className="w-16 h-16 bg-slate-900 rounded-[2rem] flex items-center justify-center text-white shadow-2xl rotate-3">
          <Bell size={28} className="-rotate-3" />
        </div>
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter lowercase">your feed</h1>
          <p className="text-slate-400 mt-1 font-black uppercase tracking-widest text-[10px]">Stay updated on your exchanges.</p>
        </div>
      </div>

      <div className="space-y-4">
        {notifications.length > 0 ? (
          notifications.map(notif => (
            <div 
              key={notif.id} 
              onClick={() => handleNotificationClick(notif)}
              className={`flex items-start gap-5 p-8 rounded-[2.5rem] border transition-all cursor-pointer hover:shadow-2xl hover:scale-[1.01] ${notif.is_read ? 'bg-white/50 border-slate-100 hover:border-slate-200' : 'bg-white border-slate-200 shadow-2xl'}`}
            >
              <div className={`p-4 rounded-3xl flex-shrink-0 transition-colors ${notif.is_read ? 'bg-slate-50' : 'bg-slate-900 text-white'}`}>
                {getIcon(notif.type)}
              </div>
              <div className="flex-1">
                <p className={`text-sm md:text-base leading-relaxed ${notif.is_read ? 'text-slate-500 font-medium' : 'text-slate-900 font-black'}`}>
                  {notif.message}
                </p>
                <div className="flex items-center gap-2 mt-4">
                   <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                     {new Date(notif.created_at).toLocaleDateString()} @ {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                   </span>
                </div>
              </div>
              {!notif.is_read && <div className="w-3 h-3 bg-slate-900 rounded-full mt-4 shadow-xl"></div>}
            </div>
          ))
        ) : (
          <div className="text-center py-24 glass-card bg-white/70 border-slate-200 rounded-[3rem] shadow-xl">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-100">
               <Bell className="w-10 h-10 text-slate-200" />
            </div>
            <h2 className="text-xl font-black text-slate-900 mb-2">You're all caught up!</h2>
            <p className="text-slate-500 font-bold">New alerts will appear here as they arrive.</p>
          </div>
        )}
      </div>
    </div>
  );
}
