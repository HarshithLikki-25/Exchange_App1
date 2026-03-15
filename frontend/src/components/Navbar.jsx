import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, PlusCircle, Heart, Store, LayoutDashboard, Menu, X, Bell } from 'lucide-react';
import api from '../services/api';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

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
      // Optional: Polling could be added here
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsOpen(false);
  };

  const NavLink = ({ to, icon: Icon, text }) => (
    <Link 
      to={to} 
      onClick={() => setIsOpen(false)}
      className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors relative group py-2"
    >
      <Icon size={18} />
      <span>{text}</span>
      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
    </Link>
  );

  return (
    <nav className="fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl bg-white/80 backdrop-blur-md rounded-full border border-gray-100/50 shadow-lg shadow-blue-900/5 z-50">
      <div className="px-6 py-3">
        <div className="flex justify-between items-center transition-all">
          <Link to="/" className="flex items-center space-x-2 text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:scale-105 transition-transform origin-left">
            <Store size={24} className="text-blue-600" />
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
                
                <div className="flex items-center space-x-4 ml-4 border-l pl-4 border-gray-200">
                  <Link to="/notifications" className="relative text-gray-600 hover:text-blue-600 transition-colors">
                    <Bell size={20} />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] bg-red-500 rounded-full flex items-center justify-center text-[10px] text-white font-bold p-0.5 border-2 border-white shadow-sm">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Link>
                  <span className="text-sm font-medium text-gray-600">Hi, {user.name.split(' ')[0]}</span>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center space-x-1 text-red-500 hover:text-red-600 transition-colors"
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex space-x-3">
                <Link to="/login" className="px-5 py-2.5 text-blue-600 hover:bg-blue-50 rounded-full transition-colors font-bold">Log in</Link>
                <Link to="/register" className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl hover:shadow-blue-500/30 transition-all hover:-translate-y-0.5 font-bold">Sign up</Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-600">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="md:hidden absolute top-20 left-1/2 -translate-x-1/2 w-[95%] bg-white/95 backdrop-blur-3xl rounded-3xl border border-gray-100 shadow-xl overflow-hidden z-40">
          <div className="px-6 py-6 space-y-4 flex flex-col items-center text-lg font-semibold">
            <NavLink to={user ? "/market" : "/"} icon={Store} text="Market" />
            {user ? (
              <>
                <NavLink to="/add-product" icon={PlusCircle} text="Post Item" />
                <NavLink to="/favorites" icon={Heart} text="Favorites" />
                <NavLink to="/dashboard" icon={LayoutDashboard} text="Dashboard" />
                <Link to="/notifications" onClick={() => setIsOpen(false)} className="flex items-center space-x-2 text-gray-700 w-full justify-center">
                  <Bell size={20} /> <span>Notifications ({unreadCount})</span>
                </Link>
                <button onClick={handleLogout} className="flex items-center space-x-1 text-red-500 py-2">
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setIsOpen(false)} className="text-gray-700 py-2">Log in</Link>
                <Link to="/register" onClick={() => setIsOpen(false)} className="text-blue-600 font-medium py-2">Sign up</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
