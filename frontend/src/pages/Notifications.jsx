import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Bell, Check, Loader2, Package, MessageSquare, RefreshCcw } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

export default function Notifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const markAsRead = async (id, isCurrentlyRead) => {
    if (isCurrentlyRead) return;
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (type) => {
    switch(type) {
      case 'exchange_request': return <RefreshCcw className="text-blue-500 w-6 h-6" />;
      case 'exchange_accepted': return <Check className="text-green-500 w-6 h-6" />;
      case 'exchange_rejected': return <Package className="text-red-500 w-6 h-6" />;
      case 'exchange_scheduled': return <Bell className="text-purple-500 w-6 h-6" />;
      case 'message': return <MessageSquare className="text-indigo-500 w-6 h-6" />;
      default: return <Bell className="text-gray-500 w-6 h-6" />;
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-blue-600" /></div>;

  return (
    <div className="max-w-4xl mx-auto py-8">
      <Helmet><title>Notifications | CampusXchange</title></Helmet>
      
      <div className="flex items-center space-x-3 mb-8">
        <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 shadow-inner">
          <Bell size={24} />
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900">Notifications</h1>
      </div>

      <div className="space-y-4">
        {notifications.length > 0 ? (
          notifications.map(notif => (
            <div 
              key={notif.id} 
              onClick={() => markAsRead(notif.id, notif.is_read)}
              className={`flex items-start gap-4 p-5 rounded-2xl border transition-all cursor-pointer hover:shadow-md ${notif.is_read ? 'bg-white border-gray-100' : 'bg-blue-50/50 border-blue-200'}`}
            >
              <div className="flex-shrink-0 mt-1">
                {getIcon(notif.type)}
              </div>
              <div className="flex-1">
                <p className={`text-sm md:text-base ${notif.is_read ? 'text-gray-600 font-medium' : 'text-gray-900 font-bold'}`}>
                  {notif.message}
                </p>
                <span className="text-xs text-gray-400 mt-2 block font-medium">
                  {new Date(notif.created_at).toLocaleString()}
                </span>
              </div>
              {!notif.is_read && <div className="w-3 h-3 bg-blue-500 rounded-full mt-2"></div>}
            </div>
          ))
        ) : (
          <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">You're all caught up!</p>
          </div>
        )}
      </div>
    </div>
  );
}
