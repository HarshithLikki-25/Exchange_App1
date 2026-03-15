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
      case 'exchange_request': return <RefreshCcw className="text-blue-400 w-6 h-6" />;
      case 'exchange_accepted': return <Check className="text-green-400 w-6 h-6" />;
      case 'exchange_rejected': return <Package className="text-red-400 w-6 h-6" />;
      case 'exchange_scheduled': return <Bell className="text-purple-400 w-6 h-6" />;
      case 'message': return <MessageSquare className="text-indigo-400 w-6 h-6" />;
      default: return <Bell className="text-white/50 w-6 h-6" />;
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-blue-500" /></div>;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <Helmet><title>Notifications | CampusXchange</title></Helmet>
      
      <div className="flex items-center space-x-3 mb-8">
        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-blue-400 border border-white/20">
          <Bell size={24} />
        </div>
        <h1 className="text-3xl font-extrabold text-white">Notifications</h1>
      </div>

      <div className="space-y-4">
        {notifications.length > 0 ? (
          notifications.map(notif => (
            <div 
              key={notif.id} 
              onClick={() => handleNotificationClick(notif)}
              className={`flex items-start gap-4 p-5 rounded-2xl border transition-all cursor-pointer hover:shadow-lg hover:shadow-blue-500/10 ${notif.is_read ? 'bg-white/5 border-white/10' : 'bg-blue-900/40 border-blue-500/30'}`}
            >
              <div className="flex-shrink-0 mt-1">
                {getIcon(notif.type)}
              </div>
              <div className="flex-1">
                <p className={`text-sm md:text-base ${notif.is_read ? 'text-white/60 font-medium' : 'text-white font-bold'}`}>
                  {notif.message}
                </p>
                <span className="text-xs text-white/40 mt-2 block font-medium">
                  {new Date(notif.created_at).toLocaleString()}
                </span>
              </div>
              {!notif.is_read && <div className="w-3 h-3 bg-blue-500 rounded-full mt-2 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></div>}
            </div>
          ))
        ) : (
          <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/10">
            <Bell className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <p className="text-white/50 font-medium">You're all caught up!</p>
          </div>
        )}
      </div>
    </div>
  );
}
