import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, PlusCircle, Heart, Store, LayoutDashboard, Menu, X, Bell, RefreshCcw, Check, Package, MessageSquare } from 'lucide-react';
import api from '../services/api';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Notifications Dropdown State
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const notifRef = useRef(null);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await api.get('/notifications/unread-count');
        setUnreadCount(res.data.unread);
      } catch (err) {
        console.error("Failed to fetch notifications count", err);
      }
    };
    if (user) {
      fetchUnread();
    }
  }, [user]);

  // Click outside listener for the notification dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [notifRef]);

  const toggleNotifications = async () => {
    if (!notifOpen) {
      try {
        const res = await api.get('/notifications');
        // Sort to show unread first, then by date
        const sorted = res.data.sort((a, b) => {
          if (a.is_read === b.is_read) {
            return new Date(b.created_at) - new Date(a.created_at);
          }
          return a.is_read ? 1 : -1;
        });
        setNotifications(sorted.slice(0, 5)); // Show top 5
      } catch (err) {
        console.error("Failed to load notifications", err);
      }
    }
    setNotifOpen(!notifOpen);
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.is_read) {
      try {
        await api.patch(`/notifications/${notif.id}/read`);
        setUnreadCount(prev => Math.max(0, prev - 1));
        setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n));
      } catch (err) {
        console.error(err);
      }
    }
    setNotifOpen(false);
    
    // Navigate based on type
    if (notif.type === 'message') {
      navigate('/chat');
    } else if (notif.type.includes('exchange_')) {
      navigate('/dashboard');
    }
  };

  const getNotifIcon = (type) => {
    switch(type) {
      case 'exchange_request': return <RefreshCcw className="text-blue-400 w-4 h-4" />;
      case 'exchange_accepted': return <Check className="text-green-400 w-4 h-4" />;
      case 'exchange_rejected': return <Package className="text-red-400 w-4 h-4" />;
      case 'exchange_scheduled': return <Bell className="text-purple-400 w-4 h-4" />;
      case 'message': return <MessageSquare className="text-indigo-400 w-4 h-4" />;
      default: return <Bell className="text-white/50 w-4 h-4" />;
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsOpen(false);
    setNotifOpen(false);
  };

  const NavLink = ({ to, icon: Icon, text }) => (
    <Link 
      to={to} 
      onClick={() => { setIsOpen(false); setNotifOpen(false); }}
      className="flex items-center space-x-1 text-white/70 hover:text-blue-400 transition-colors relative group py-2"
    >
      <Icon size={18} />
      <span>{text}</span>
      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
    </Link>
  );

  return (
    <nav className="fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl bg-white/10 backdrop-blur-md rounded-full border border-white/10 shadow-lg shadow-blue-500/10 z-50">
      <div className="px-6 py-3">
        <div className="flex justify-between items-center transition-all">
          <Link to="/" onClick={() => setNotifOpen(false)} className="flex items-center space-x-2 text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent hover:scale-105 transition-transform origin-left">
            <Store size={24} className="text-blue-400" />
            <span className="hidden sm:inline-block">CampusXchange</span>
            <span className="sm:hidden">CX</span>
          </Link>

          <div className="hidden md:flex items-center space-x-6 text-sm font-semibold">
            <NavLink to={user ? "/market" : "/"} icon={Store} text="Market" />
            
            {user ? (
              <>
                <NavLink to="/add-product" icon={PlusCircle} text="Post Item" />
                <NavLink to="/favorites" icon={Heart} text="Favorites" />
                <NavLink to="/dashboard" icon={LayoutDashboard} text="Dashboard" />
                
                <div className="flex items-center space-x-4 ml-4 border-l pl-4 border-white/20">
                  <Link to={`/profile/${user.id}`} className="text-white/70 hover:text-blue-400 font-medium">Profile</Link>
                  
                  {/* Notification Dropdown Container */}
                  <div className="relative" ref={notifRef}>
                    <button 
                      onClick={toggleNotifications}
                      className="relative text-white/70 hover:text-blue-400 transition-colors focus:outline-none"
                    >
                      <Bell size={20} />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] bg-red-500 rounded-full flex items-center justify-center text-[10px] text-white font-bold p-0.5 border-2 border-slate-900 shadow-sm animate-pulse">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </button>
                    
                    {/* Dropdown Panel */}
                    {notifOpen && (
                      <div className="absolute top-12 right-[-20px] sm:right-0 w-80 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 transform origin-top transition-all">
                        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                          <h3 className="text-white font-bold">Notifications</h3>
                          {unreadCount > 0 && <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full font-semibold">{unreadCount} New</span>}
                        </div>
                        <div className="max-h-80 overflow-y-auto custom-scrollbar">
                          {notifications.length > 0 ? (
                            notifications.map(notif => (
                              <div 
                                key={notif.id}
                                onClick={() => handleNotificationClick(notif)}
                                className={`p-4 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors flex gap-3 ${notif.is_read ? 'opacity-70' : 'bg-blue-500/10'}`}
                              >
                                <div className="mt-1 flex-shrink-0 bg-white/10 p-2 rounded-full h-8 w-8 flex items-center justify-center">
                                  {getNotifIcon(notif.type)}
                                </div>
                                <div>
                                  <p className={`text-sm ${notif.is_read ? 'text-white/80' : 'text-white font-semibold'}`}>{notif.message}</p>
                                  <p className="text-[10px] text-white/40 mt-1 uppercase tracking-wider">{new Date(notif.created_at).toLocaleString()}</p>
                                </div>
                                {!notif.is_read && <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 ml-auto shadow-[0_0_8px_rgba(59,130,246,0.8)]"></div>}
                              </div>
                            ))
                          ) : (
                            <div className="p-8 text-center text-white/40">
                              <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                              <p className="text-sm">No new notifications</p>
                            </div>
                          )}
                        </div>
                        <div className="p-2 border-t border-white/10 bg-black/20 text-center">
                          <Link 
                            to="/notifications" 
                            onClick={() => setNotifOpen(false)}
                            className="text-xs text-blue-400 hover:text-blue-300 font-semibold hover:underline"
                          >
                            View All Notifications
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                  {/* End Notification Dropdown */}

                  <span className="text-sm font-medium text-white/70 flex items-center gap-2">
                    <img src={user.profile_image_url || `https://ui-avatars.com/api/?name=${user.name}&background=random`} alt="Profile" className="w-6 h-6 rounded-full border border-white/20" />
                    Hi, {user.name.split(' ')[0]}
                  </span>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center space-x-1 text-red-400 hover:text-red-300 transition-colors"
                  >
                    <LogOut size={18} />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="flex space-x-3">
                <Link to="/login" className="px-5 py-2.5 text-blue-400 hover:bg-white/5 rounded-full transition-colors font-bold">Log in</Link>
                <Link to="/register" className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full shadow-lg hover:shadow-xl hover:shadow-blue-500/30 transition-all hover:-translate-y-0.5 font-bold">Sign up</Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-white/80">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="md:hidden absolute top-20 left-1/2 -translate-x-1/2 w-[95%] bg-slate-900/95 backdrop-blur-3xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden z-40">
          <div className="px-6 py-6 space-y-4 flex flex-col items-center text-lg font-semibold">
            <NavLink to={user ? "/market" : "/"} icon={Store} text="Market" />
            {user ? (
              <>
                <NavLink to="/add-product" icon={PlusCircle} text="Post Item" />
                <NavLink to="/favorites" icon={Heart} text="Favorites" />
                <NavLink to="/dashboard" icon={LayoutDashboard} text="Dashboard" />
                <Link to="/notifications" onClick={() => setIsOpen(false)} className="flex items-center space-x-2 text-white/80 w-full justify-center py-2">
                  <Bell size={20} /> 
                  <span>Notifications {unreadCount > 0 && <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full ml-1">{unreadCount}</span>}</span>
                </Link>
                <button onClick={handleLogout} className="flex items-center space-x-1 text-red-400 py-2">
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setIsOpen(false)} className="text-white/80 py-2">Log in</Link>
                <Link to="/register" onClick={() => setIsOpen(false)} className="text-blue-400 font-medium py-2">Sign up</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
