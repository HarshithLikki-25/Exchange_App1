import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';
import { User, Package, MessageSquare, Loader2, Calendar, Check, X, MapPin } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('listings');
  const [scheduleData, setScheduleData] = useState({ reqId: null, date: '', location: '', time_slot: '', pickup_or_delivery: 'pickup' });
  const [scheduling, setScheduling] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [productsRes, requestsRes] = await Promise.all([
          api.get('/users/me/products'),
          api.get('/users/me/exchange-requests')
        ]);
        setProducts(productsRes.data.results || []);
        setRequests(requestsRes.data || []);
      } catch (err) {
        console.error("Dashboard error", err);
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const handleStatusChange = async (reqId, status) => {
    try {
      await api.patch(`/exchange-requests/${reqId}?status=${status}`);
      setRequests(prev => prev.map(r => r.id === reqId ? { ...r, status } : r));
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    setScheduling(true);
    try {
      await api.post('/exchange-schedule', {
        exchange_request_id: scheduleData.reqId,
        pickup_or_delivery: scheduleData.pickup_or_delivery,
        location: scheduleData.location,
        date: scheduleData.date,
        time_slot: scheduleData.time_slot
      });
      alert("Schedule created successfully!");
      setScheduleData({ reqId: null, date: '', location: '', time_slot: '', pickup_or_delivery: 'pickup' });
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to create schedule");
    } finally {
      setScheduling(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-500 w-10 h-10" /></div>;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Profile Header */}
      <div className="glass-card rounded-3xl p-8 flex flex-col md:flex-row items-center md:items-start gap-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl -z-10 -m-10"></div>
        
        <div className="w-24 h-24 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg text-white shrink-0">
          <span className="text-4xl font-bold">{user?.name ? user.name[0].toUpperCase() : 'U'}</span>
        </div>
        
        <div className="flex-grow text-center md:text-left">
          <h1 className="text-3xl font-extrabold text-gray-900">{user?.name}</h1>
          <p className="text-gray-500 font-medium mb-4">{user?.email}</p>
          
          <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-gray-600">
             {user?.college && (
               <span className="bg-white/60 px-3 py-1.5 rounded-lg border border-gray-100 flex items-center">
                 <User size={16} className="mr-2 text-blue-500" /> {user.college}
               </span>
             )}
             {user?.location && (
               <span className="bg-white/60 px-3 py-1.5 rounded-lg border border-gray-100 flex items-center">
                 <User size={16} className="mr-2 text-purple-500" /> {user.location}
               </span>
             )}
             <span className="bg-white/60 px-3 py-1.5 rounded-lg border border-gray-100 flex items-center">
                 <Calendar size={16} className="mr-2 text-green-500" /> Joined {new Date(user?.created_at).toLocaleDateString()}
               </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-gray-200">
        <button 
          onClick={() => setActiveTab('listings')}
          className={`pb-4 px-4 text-sm font-bold flex items-center transition-colors relative ${activeTab === 'listings' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}
        >
          <Package size={18} className="mr-2" /> My Listings ({products.length})
          {activeTab === 'listings' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-lg"></span>}
        </button>
        <button 
          onClick={() => setActiveTab('requests')}
          className={`pb-4 px-4 text-sm font-bold flex items-center transition-colors relative ${activeTab === 'requests' ? 'text-purple-600' : 'text-gray-500 hover:text-gray-900'}`}
        >
          <MessageSquare size={18} className="mr-2" /> Exchange Requests ({requests.length})
          {activeTab === 'requests' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-purple-600 rounded-t-lg"></span>}
        </button>
      </div>

      {/* Content */}
      <div className="pt-4">
        {activeTab === 'listings' && (
          products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map(product => (
                <ProductCard key={product.id} product={product} isFavorite={false} onToggleFavorite={() => {}} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">You haven't posted any items yet.</p>
            </div>
          )
        )}

        {activeTab === 'requests' && (
          <div className="space-y-4 max-w-4xl">
            {requests.length > 0 ? (
              requests.map(req => (
                <div key={req.id} className="glass-card rounded-xl p-5 border-l-4 border-l-blue-500 shadow-sm mb-4">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 mb-1">Request #{req.id} for Product #{req.product_id}</h4>
                      {req.offered_product_id && (
                         <p className="text-sm text-blue-600 font-semibold">User offered Product #{req.offered_product_id}</p>
                      )}
                      <p className="text-gray-600 text-sm italic border-l-2 border-gray-200 pl-3 my-2 space-y-1">
                        "{req.message}"
                      </p>
                      <p className="text-xs text-gray-400 font-medium">Sent on {new Date(req.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                       <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${
                        req.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 
                        req.status === 'accepted' ? 'bg-green-100 text-green-700' : 
                        'bg-red-100 text-red-700'
                      }`}>
                        {req.status}
                      </span>
                      
                      {/* Actions for Pending */}
                      {req.status === 'pending' && req.requested_by !== user.id && (
                        <div className="flex gap-2 mt-2">
                          <button onClick={() => handleStatusChange(req.id, 'accepted')} className="p-2 bg-green-100 text-green-600 rounded-full hover:bg-green-200" title="Accept"><Check size={16}/></button>
                          <button onClick={() => handleStatusChange(req.id, 'rejected')} className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200" title="Reject"><X size={16}/></button>
                        </div>
                      )}

                      {/* Action for Accepted (Schedule) */}
                      {req.status === 'accepted' && scheduleData.reqId !== req.id && (
                        <button onClick={() => setScheduleData({ ...scheduleData, reqId: req.id })} className="mt-2 text-xs font-bold bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700">
                          Schedule Pickup
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Scheduling Form Dropdown */}
                  {scheduleData.reqId === req.id && (
                    <form onSubmit={handleScheduleSubmit} className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-3">
                      <h5 className="font-bold text-sm text-gray-800 flex items-center"><Calendar size={16} className="mr-2 text-blue-500"/> Plan Meetup</h5>
                      <div className="grid grid-cols-2 gap-3">
                        <select value={scheduleData.pickup_or_delivery} onChange={e => setScheduleData({...scheduleData, pickup_or_delivery: e.target.value})} className="p-2 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500" required>
                          <option value="pickup">Pickup</option>
                          <option value="delivery">Delivery / Meetup</option>
                        </select>
                        <input type="date" value={scheduleData.date} onChange={e => setScheduleData({...scheduleData, date: e.target.value})} className="p-2 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500" required />
                        <input type="text" placeholder="Location e.g. Student Union" value={scheduleData.location} onChange={e => setScheduleData({...scheduleData, location: e.target.value})} className="p-2 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 col-span-2" required />
                        <input type="text" placeholder="Time Slot e.g. 2:00 PM" value={scheduleData.time_slot} onChange={e => setScheduleData({...scheduleData, time_slot: e.target.value})} className="p-2 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 col-span-2" required />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <button type="button" onClick={() => setScheduleData({...scheduleData, reqId: null})} className="text-gray-500 text-xs font-bold px-3 py-2 hover:bg-gray-200 rounded-lg">Cancel</button>
                        <button type="submit" disabled={scheduling} className="bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50">Confirm Plan</button>
                      </div>
                    </form>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No exchange requests found.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
