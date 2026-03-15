import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';
import { User, Package, MessageSquare, Loader2, Calendar, Check, X, MapPin, CalendarClock, Info } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

export default function Dashboard() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [requests, setRequests] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('listings');
  const [scheduleData, setScheduleData] = useState({ reqId: null, date: '', location: '', time_slot: '', pickup_or_delivery: 'pickup', description: '' });
  const [scheduling, setScheduling] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [productsRes, requestsRes, schedulesRes] = await Promise.all([
          api.get('/users/me/products'),
          api.get('/users/me/exchange-requests'),
          api.get('/exchange-schedule')
        ]);
        setProducts(productsRes.data.results || []);
        setRequests(requestsRes.data || []);
        setSchedules(schedulesRes.data || []);
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

  const handleRequestStatusChange = async (reqId, status) => {
    try {
      await api.patch(`/exchange-requests/${reqId}?status=${status}`);
      setRequests(prev => prev.map(r => r.id === reqId ? { ...r, status } : r));
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const handleScheduleStatusChange = async (scheduleId, status) => {
    try {
      const res = await api.patch(`/exchange-schedule/${scheduleId}/status?status=${status}`);
      setSchedules(prev => prev.map(s => s.id === scheduleId ? res.data : s));
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to update schedule status");
    }
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    setScheduling(true);
    try {
      const res = await api.post('/exchange-schedule', {
        exchange_request_id: scheduleData.reqId,
        pickup_or_delivery: scheduleData.pickup_or_delivery,
        location: scheduleData.location,
        date: scheduleData.date,
        time_slot: scheduleData.time_slot,
        description: scheduleData.description || null
      });
      alert("Schedule proposed successfully! Waiting for other party to accept.");
      setSchedules([...schedules, res.data]);
      setScheduleData({ reqId: null, date: '', location: '', time_slot: '', pickup_or_delivery: 'pickup', description: '' });
      setActiveTab('schedules');
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to create schedule");
    } finally {
      setScheduling(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-500 w-10 h-10" /></div>;
  }

  // Pre-calculate tab counts
  const requestsCount = requests.filter(r => r.status === 'pending' && r.requested_by !== user.id).length;
  const schedulesCount = schedules.filter(s => s.status === 'pending').length;

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pt-4 px-4 sm:px-6">
      <Helmet><title>Dashboard | CampusXchange</title></Helmet>
      
      {/* Profile Header */}
      <div className="glass-card p-8 flex flex-col md:flex-row items-center md:items-start gap-8 relative overflow-hidden">
        <div className="w-24 h-24 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.5)] text-white shrink-0">
          <span className="text-4xl font-extrabold">{user?.name ? user.name[0].toUpperCase() : 'U'}</span>
        </div>
        
        <div className="flex-grow text-center md:text-left">
          <h1 className="text-3xl font-extrabold text-white">{user?.name}</h1>
          <p className="text-white/50 font-medium mb-4">{user?.email}</p>
          
          <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-white/70">
             {user?.college && (
               <span className="bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 flex items-center">
                 <User size={16} className="mr-2 text-blue-400" /> {user.college}
               </span>
             )}
             {user?.location && (
               <span className="bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 flex items-center">
                 <User size={16} className="mr-2 text-purple-400" /> {user.location}
               </span>
             )}
             <span className="bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 flex items-center">
                 <Calendar size={16} className="mr-2 text-green-400" /> Joined {new Date(user?.created_at).toLocaleDateString()}
               </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-white/10 overflow-x-auto overflow-y-hidden pb-1 no-scrollbar">
        <button 
          onClick={() => setActiveTab('listings')}
          className={`pb-4 px-4 text-sm font-bold flex items-center transition-colors relative whitespace-nowrap ${activeTab === 'listings' ? 'text-blue-400' : 'text-white/50 hover:text-white'}`}
        >
          <Package size={18} className="mr-2" /> My Listings ({products.length})
          {activeTab === 'listings' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 rounded-t-lg shadow-[0_0_8px_rgba(59,130,246,0.8)]"></span>}
        </button>
        <button 
          onClick={() => setActiveTab('requests')}
          className={`pb-4 px-4 text-sm font-bold flex items-center transition-colors relative whitespace-nowrap ${activeTab === 'requests' ? 'text-purple-400' : 'text-white/50 hover:text-white'}`}
        >
          <MessageSquare size={18} className="mr-2" /> Exchange Requests {requestsCount > 0 && <span className="ml-1 bg-purple-500 text-white text-xs px-1.5 py-0.5 rounded-full">{requestsCount}</span>}
          {activeTab === 'requests' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-purple-500 rounded-t-lg shadow-[0_0_8px_rgba(168,85,247,0.8)]"></span>}
        </button>
        <button 
          onClick={() => setActiveTab('schedules')}
          className={`pb-4 px-4 text-sm font-bold flex items-center transition-colors relative whitespace-nowrap ${activeTab === 'schedules' ? 'text-green-400' : 'text-white/50 hover:text-white'}`}
        >
          <CalendarClock size={18} className="mr-2" /> Scheduled Pickups {schedulesCount > 0 && <span className="ml-1 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full">{schedulesCount}</span>}
          {activeTab === 'schedules' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-green-500 rounded-t-lg shadow-[0_0_8px_rgba(34,197,94,0.8)]"></span>}
        </button>
      </div>

      {/* Content */}
      <div className="pt-4">
        {/* Listings Tab */}
        {activeTab === 'listings' && (
          products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 glass-card">
              <Package className="w-12 h-12 text-white/20 mx-auto mb-4" />
              <p className="text-white/50">You haven't posted any items yet.</p>
            </div>
          )
        )}

        {/* Requests Tab */}
        {activeTab === 'requests' && (
          <div className="space-y-4 max-w-4xl">
            {requests.length > 0 ? (
              requests.map(req => {
                const hasSchedule = schedules.some(s => s.exchange_request_id === req.id && s.status !== 'rejected');
                return (
                <div key={req.id} className="glass-card p-5 border-l-4 border-l-blue-500 shadow-sm mb-4">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div className="flex-1">
                      <h4 className="font-bold text-white mb-1">Request #{req.id} for Product #{req.product_id}</h4>
                      {req.offered_product_id ? (
                         <p className="text-sm text-blue-400 font-semibold mb-2 flex items-center gap-1">
                           <Package size={14}/> User offered Product #{req.offered_product_id}
                         </p>
                      ) : (
                         <p className="text-sm text-purple-400 font-semibold mb-2 flex items-center gap-1">
                           <Tag size={14}/> Direct Purchase Request
                         </p>
                      )}
                      <p className="text-white/60 text-sm italic border-l-2 border-white/20 pl-3 my-2 space-y-1 bg-white/5 p-2 rounded-r-lg">
                        "{req.message}"
                      </p>
                      <p className="text-xs text-white/40 font-medium">Sent on {new Date(req.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                       <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${
                        req.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' : 
                        req.status === 'accepted' ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 
                        'bg-red-500/20 text-red-300 border border-red-500/30'
                      }`}>
                        {req.status}
                      </span>
                      
                      {/* Actions for Pending */}
                      {req.status === 'pending' && req.requested_by !== user.id && (
                        <div className="flex gap-2 mt-2">
                          <button onClick={() => handleRequestStatusChange(req.id, 'accepted')} className="p-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded-full hover:bg-green-500/30 transition shadow-[0_0_10px_rgba(34,197,94,0.2)]" title="Accept"><Check size={16}/></button>
                          <button onClick={() => handleRequestStatusChange(req.id, 'rejected')} className="p-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-full hover:bg-red-500/30 transition shadow-[0_0_10px_rgba(239,68,68,0.2)]" title="Reject"><X size={16}/></button>
                        </div>
                      )}

                      {/* Action for Accepted (Schedule) */}
                      {req.status === 'accepted' && scheduleData.reqId !== req.id && !hasSchedule && (
                        <button onClick={() => setScheduleData({ ...scheduleData, reqId: req.id })} className="mt-2 text-xs font-bold bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-500 transition shadow-[0_0_15px_rgba(37,99,235,0.4)]">
                          Propose Schedule
                        </button>
                      )}
                      {hasSchedule && (
                        <span className="text-xs text-green-400 font-bold mt-2">Schedule Proposed! check tab</span>
                      )}
                    </div>
                  </div>

                  {/* Scheduling Form Dropdown */}
                  {scheduleData.reqId === req.id && (
                    <form onSubmit={handleScheduleSubmit} className="mt-5 p-5 bg-black/20 border border-white/10 rounded-xl space-y-4">
                      <h5 className="font-bold text-sm text-white flex items-center"><Calendar size={16} className="mr-2 text-blue-400"/> Propose Meetup</h5>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="text-white/50 text-xs font-bold mb-1 block">Type</label>
                          <select value={scheduleData.pickup_or_delivery} onChange={e => setScheduleData({...scheduleData, pickup_or_delivery: e.target.value})} className="w-full p-2.5 text-sm bg-white/5 border border-white/10 rounded-lg text-white appearance-none outline-none focus:border-blue-500" required>
                            <option value="pickup" className="bg-slate-900">Pickup</option>
                            <option value="delivery" className="bg-slate-900">Delivery / Meetup</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-white/50 text-xs font-bold mb-1 block">Date</label>
                          <input type="date" value={scheduleData.date} onChange={e => setScheduleData({...scheduleData, date: e.target.value})} className="w-full p-2.5 text-sm bg-white/5 border border-white/10 rounded-lg text-white outline-none focus:border-blue-500" required />
                        </div>
                        <div className="md:col-span-2">
                          <label className="text-white/50 text-xs font-bold mb-1 block">Location</label>
                          <input type="text" placeholder="e.g. Student Union, Main Entrance" value={scheduleData.location} onChange={e => setScheduleData({...scheduleData, location: e.target.value})} className="w-full p-2.5 text-sm bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 outline-none focus:border-blue-500" required />
                        </div>
                        <div className="md:col-span-2">
                          <label className="text-white/50 text-xs font-bold mb-1 block">Time Slot</label>
                          <input type="text" placeholder="e.g. 2:00 PM - 2:30 PM" value={scheduleData.time_slot} onChange={e => setScheduleData({...scheduleData, time_slot: e.target.value})} className="w-full p-2.5 text-sm bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 outline-none focus:border-blue-500" required />
                        </div>
                        <div className="md:col-span-2">
                          <label className="text-white/50 text-xs font-bold mb-1 block flex items-center gap-1"><Info size={12}/> Notes / Description</label>
                          <textarea placeholder="e.g. I will be wearing a red jacket." value={scheduleData.description} onChange={e => setScheduleData({...scheduleData, description: e.target.value})} className="w-full p-2.5 text-sm bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 outline-none focus:border-blue-500 resize-none h-16" />
                        </div>
                      </div>

                      <div className="flex gap-3 justify-end pt-2">
                        <button type="button" onClick={() => setScheduleData({...scheduleData, reqId: null})} className="text-white/60 text-sm font-bold px-4 py-2 hover:bg-white/5 rounded-lg transition">Cancel</button>
                        <button type="submit" disabled={scheduling} className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-bold px-5 py-2 rounded-lg shadow-lg hover:shadow-blue-500/40 hover:-translate-y-0.5 transition disabled:opacity-50">Send Proposal</button>
                      </div>
                    </form>
                  )}
                </div>
              )})
            ) : (
              <div className="text-center py-20 glass-card">
                <MessageSquare className="w-12 h-12 text-white/20 mx-auto mb-4" />
                <p className="text-white/50">No exchange requests found.</p>
              </div>
            )}
          </div>
        )}

        {/* Schedules Tab */}
        {activeTab === 'schedules' && (
          <div className="space-y-4 max-w-4xl">
            {schedules.length > 0 ? (
              schedules.map(schedule => {
                // To determine if current user should be able to accept/reject, 
                // in reality we'd check if the other party proposed it.
                // For a simple MVP: If the status is pending, allow "Accept/Reject". 
                // In a perfect system we'd track 'proposed_by'.
                // Here we just show it for pending status.
                return (
                <div key={schedule.id} className="glass-card p-5 border-l-4 border-l-green-400 shadow-[0_4px_20px_rgba(0,0,0,0.2)] mb-4 bg-gradient-to-br from-white/5 to-white/0">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div className="flex-1">
                      <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                        <CalendarClock size={20} className="text-green-400"/> 
                        Meetup for Request #{schedule.exchange_request_id}
                      </h4>
                      
                      <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm mt-3 bg-black/20 p-3 rounded-lg border border-white/5">
                        <div className="text-white/60"><MapPin size={14} className="inline mr-1 text-purple-400"/> Location</div>
                        <div className="text-white font-medium">{schedule.location}</div>
                        
                        <div className="text-white/60"><Calendar size={14} className="inline mr-1 text-blue-400"/> Date & Time</div>
                        <div className="text-white font-medium">{schedule.date} @ {schedule.time_slot}</div>
                        
                        <div className="text-white/60"><Package size={14} className="inline mr-1 text-green-400"/> Method</div>
                        <div className="text-white font-medium capitalize">{schedule.pickup_or_delivery}</div>
                      </div>

                      {schedule.description && (
                         <div className="mt-3 text-sm text-white/80 bg-white/5 border border-white/10 p-3 rounded-lg flex items-start gap-2">
                           <Info size={16} className="text-blue-400 mt-0.5 shrink-0" />
                           <p>"{schedule.description}"</p>
                         </div>
                      )}
                      
                    </div>
                    <div className="flex flex-col items-end gap-3 justify-center min-w-[120px]">
                       <span className={`px-4 py-1.5 rounded-full text-xs font-extrabold tracking-wide uppercase ${
                        schedule.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 shadow-[0_0_10px_rgba(234,179,8,0.2)]' : 
                        schedule.status === 'accepted' ? 'bg-green-500/20 text-green-300 border border-green-500/30 shadow-[0_0_10px_rgba(34,197,94,0.2)]' : 
                        'bg-red-500/20 text-red-300 border border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.2)]'
                      }`}>
                        {schedule.status}
                      </span>
                      
                      {/* Negotiation / Accept / Reject */}
                      {schedule.status === 'pending' && (
                        <div className="flex flex-col gap-2 w-full mt-2">
                          <button onClick={() => handleScheduleStatusChange(schedule.id, 'accepted')} className="w-full text-xs font-bold py-2 bg-green-500/20 text-green-400 border border-green-500/40 rounded-lg hover:bg-green-500/40 transition">Accept Meetup</button>
                          <button onClick={() => handleScheduleStatusChange(schedule.id, 'rejected')} className="w-full text-xs font-bold py-2 bg-red-500/20 text-red-400 border border-red-500/40 rounded-lg hover:bg-red-500/40 transition">Reject / Negotiate</button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )})
            ) : (
              <div className="text-center py-20 glass-card">
                <CalendarClock className="w-12 h-12 text-white/20 mx-auto mb-4" />
                <p className="text-white/50">No scheduled meetups yet.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
