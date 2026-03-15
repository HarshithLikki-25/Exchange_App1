import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';
import { User, Package, MessageSquare, Loader2, Calendar, Check, X, MapPin, CalendarClock, Info, Tag, GraduationCap } from 'lucide-react';
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
    return <div className="flex justify-center py-32"><Loader2 className="animate-spin text-slate-900 w-12 h-12" /></div>;
  }

  // Pre-calculate tab counts
  const requestsCount = requests.filter(r => r.status === 'pending' && r.requested_by !== user.id).length;
  const schedulesCount = schedules.filter(s => s.status === 'pending').length;

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pt-4 px-4 sm:px-6">
      <Helmet><title>Dashboard | CampusXchange</title></Helmet>
      
      {/* Profile Header */}
      <div className="glass-card p-10 flex flex-col md:flex-row items-center md:items-start gap-10 relative overflow-hidden bg-white/70 border-slate-200 shadow-xl">
        <div className="w-28 h-28 bg-slate-900 rounded-3xl flex items-center justify-center shadow-2xl text-white shrink-0 rotate-3 transition-transform hover:rotate-0 duration-500">
          <span className="text-5xl font-black -rotate-3 group-hover:rotate-0 transition-transform">{user?.name ? user.name[0].toUpperCase() : 'U'}</span>
        </div>
        
        <div className="flex-grow text-center md:text-left mt-2">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">{user?.name}</h1>
          <p className="text-slate-500 font-bold mb-6 text-lg">{user?.email}</p>
          
          <div className="flex flex-wrap justify-center md:justify-start gap-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
             {user?.college && (
               <span className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 flex items-center shadow-sm">
                 <GraduationCap size={14} className="mr-2 text-slate-900" /> {user.college}
               </span>
             )}
             {user?.location && (
               <span className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 flex items-center shadow-sm">
                 <MapPin size={14} className="mr-2 text-slate-900" /> {user.location}
               </span>
             )}
             <span className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 flex items-center shadow-sm">
                 <Calendar size={14} className="mr-2 text-slate-900" /> Joined {new Date(user?.created_at).toLocaleDateString()}
               </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-slate-100 overflow-x-auto overflow-y-hidden pb-1 no-scrollbar">
        <button 
          onClick={() => setActiveTab('listings')}
          className={`pb-4 px-6 text-[10px] font-black uppercase tracking-widest flex items-center transition-all relative whitespace-nowrap ${activeTab === 'listings' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <Package size={16} className="mr-2" /> My Listings ({products.length})
          {activeTab === 'listings' && <motion.span layoutId="tab-underline" className="absolute bottom-0 left-0 w-full h-1 bg-slate-900 rounded-t-full shadow-lg"></motion.span>}
        </button>
        <button 
          onClick={() => setActiveTab('requests')}
          className={`pb-4 px-6 text-[10px] font-black uppercase tracking-widest flex items-center transition-all relative whitespace-nowrap ${activeTab === 'requests' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <MessageSquare size={16} className="mr-2" /> Exchange Requests {requestsCount > 0 && <span className="ml-1 bg-slate-900 text-white text-[9px] px-2 py-0.5 rounded-full">{requestsCount}</span>}
          {activeTab === 'requests' && <motion.span layoutId="tab-underline" className="absolute bottom-0 left-0 w-full h-1 bg-slate-900 rounded-t-full shadow-lg"></motion.span>}
        </button>
        <button 
          onClick={() => setActiveTab('schedules')}
          className={`pb-4 px-6 text-[10px] font-black uppercase tracking-widest flex items-center transition-all relative whitespace-nowrap ${activeTab === 'schedules' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <CalendarClock size={16} className="mr-2" /> Scheduled Pickups {schedulesCount > 0 && <span className="ml-1 bg-slate-900 text-white text-[9px] px-2 py-0.5 rounded-full">{schedulesCount}</span>}
          {activeTab === 'schedules' && <motion.span layoutId="tab-underline" className="absolute bottom-0 left-0 w-full h-1 bg-slate-900 rounded-t-full shadow-lg"></motion.span>}
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
            <div className="text-center py-24 glass-card bg-white/70 border-slate-200">
              <Package className="w-16 h-16 text-slate-100 mx-auto mb-6" />
              <p className="text-slate-400 font-extrabold text-sm uppercase tracking-widest mb-6">You haven't posted any items yet.</p>
              <button onClick={() => navigate('/market')} className="bg-slate-900 text-white px-10 py-4 rounded-full font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-black transition-all">Post Your First Item</button>
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
                <div key={req.id} className="glass-card p-6 border-l-4 border-l-slate-900 shadow-xl mb-6 bg-white/70 border border-slate-200">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-6">
                    <div className="flex-1">
                      <h4 className="font-black text-slate-900 text-lg mb-2 tracking-tight">Request #{req.id} <span className="text-slate-300">/</span> {req.product_title || `Product #${req.product_id}`}</h4>
                      {req.offered_product_id ? (
                         <p className="text-[10px] text-slate-900 font-black uppercase tracking-widest mb-3 flex items-center gap-1.5">
                           <Package size={14} className="text-slate-900"/> User offered Product #{req.offered_product_id}
                         </p>
                      ) : (
                         <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-3 flex items-center gap-1.5">
                           <Tag size={14} className="text-slate-400"/> Direct Purchase Request
                         </p>
                      )}
                      <div className="text-slate-600 text-sm italic border-l-4 border-slate-200 pl-4 my-4 bg-slate-50/50 p-4 rounded-r-2xl font-medium">
                        "{req.message}"
                      </div>
                      <p className="text-xs text-slate-400 font-bold flex items-center">
                        <Calendar size={12} className="mr-1"/> Sent on {new Date(req.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        req.status === 'pending' ? 'bg-amber-100 text-amber-700 border border-amber-200' : 
                        req.status === 'accepted' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 
                        'bg-rose-100 text-rose-700 border border-rose-200'
                      }`}>
                        {req.status}
                      </span>
                      
                      {/* Actions for Pending */}
                      {req.status === 'pending' && req.requested_by !== user.id && (
                        <div className="flex gap-3 mt-4">
                          <button onClick={() => handleRequestStatusChange(req.id, 'accepted')} className="p-3 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-2xl hover:bg-emerald-100 transition shadow-sm" title="Accept"><Check size={20}/></button>
                          <button onClick={() => handleRequestStatusChange(req.id, 'rejected')} className="p-3 bg-rose-50 text-rose-600 border border-rose-100 rounded-2xl hover:bg-rose-100 transition shadow-sm" title="Reject"><X size={20}/></button>
                        </div>
                      )}

                      {/* Action for Accepted (Schedule) */}
                      {req.status === 'accepted' && scheduleData.reqId !== req.id && !hasSchedule && (
                        <button onClick={() => setScheduleData({ ...scheduleData, reqId: req.id })} className="mt-4 text-[10px] font-black bg-slate-900 text-white px-6 py-3 rounded-2xl hover:bg-black transition shadow-2xl tracking-widest uppercase">
                          Propose Schedule
                        </button>
                      )}
                      {hasSchedule && (
                        <span className="text-xs text-emerald-600 font-black mt-4 bg-emerald-50 px-3 py-1 rounded-lg">Schedule Proposed!</span>
                      )}
                    </div>
                  </div>

                  {/* Scheduling Form Dropdown */}
                  {scheduleData.reqId === req.id && (
                    <form onSubmit={handleScheduleSubmit} className="mt-8 p-8 bg-slate-50 border border-slate-100 rounded-[2rem] space-y-8 shadow-inner">
                      <h5 className="font-black text-xl text-slate-900 flex items-center tracking-tight lowercase"><CalendarClock size={24} className="mr-3 text-slate-900"/> propose meetup</h5>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-3 block">Type</label>
                          <select value={scheduleData.pickup_or_delivery} onChange={e => setScheduleData({...scheduleData, pickup_or_delivery: e.target.value})} className="w-full p-4 text-sm bg-white border border-slate-100 rounded-2xl text-slate-800 font-bold outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-300 transition-all cursor-pointer appearance-none" required>
                            <option value="pickup">Pickup (You go to them)</option>
                            <option value="delivery">Delivery / Meetup (Shared location)</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-3 block">Date</label>
                          <input type="date" value={scheduleData.date} onChange={e => setScheduleData({...scheduleData, date: e.target.value})} className="w-full p-4 text-sm bg-white border border-slate-100 rounded-2xl text-slate-800 font-bold outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-300 transition-all" required />
                        </div>
                        <div className="md:col-span-2">
                          <label className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-3 block">Location</label>
                          <input type="text" placeholder="e.g. Student Union, Main Entrance" value={scheduleData.location} onChange={e => setScheduleData({...scheduleData, location: e.target.value})} className="w-full p-4 text-sm bg-white border border-slate-100 rounded-2xl text-slate-800 placeholder-slate-400 font-black outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-300 transition-all shadow-sm" required />
                        </div>
                        <div className="md:col-span-2">
                          <label className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-3 block">Time Slot</label>
                          <input type="text" placeholder="e.g. 2:00 PM - 2:30 PM" value={scheduleData.time_slot} onChange={e => setScheduleData({...scheduleData, time_slot: e.target.value})} className="w-full p-4 text-sm bg-white border border-slate-100 rounded-2xl text-slate-800 placeholder-slate-400 font-black outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-300 transition-all shadow-sm" required />
                        </div>
                        <div className="md:col-span-2">
                          <label className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-3 block flex items-center gap-1"><Info size={12}/> Notes / Description</label>
                          <textarea placeholder="e.g. I will be wearing a black jacket." value={scheduleData.description} onChange={e => setScheduleData({...scheduleData, description: e.target.value})} className="w-full p-4 text-sm bg-white border border-slate-100 rounded-2xl text-slate-800 placeholder-slate-400 font-medium outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-300 transition-all shadow-sm resize-none h-24" />
                        </div>
                      </div>

                      <div className="flex gap-4 justify-end pt-4">
                        <button type="button" onClick={() => setScheduleData({...scheduleData, reqId: null})} className="text-slate-400 text-[10px] font-black uppercase tracking-widest px-8 py-3 hover:bg-slate-100 rounded-xl transition-all">Cancel</button>
                        <button type="submit" disabled={scheduling} className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest px-10 py-4 rounded-2xl shadow-2xl hover:scale-105 transition-all disabled:opacity-50">Send Proposal</button>
                      </div>
                    </form>
                  )}
                </div>
              )})
            ) : (
            <div className="text-center py-24 glass-card bg-white/70 border-slate-200">
                <MessageSquare className="w-16 h-16 text-slate-200 mx-auto mb-6" />
                <p className="text-slate-500 font-bold text-lg">No exchange requests found.</p>
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
                <div key={schedule.id} className="glass-card p-8 border-l-4 border-l-slate-900 shadow-xl mb-6 bg-white/70 border border-slate-200 relative overflow-hidden">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-6">
                    <div className="flex-1">
                      <h4 className="font-black text-slate-900 text-xl mb-4 flex items-center gap-3">
                        <CalendarClock size={24} className="text-slate-900"/> 
                        Meetup for Request #{schedule.exchange_request_id}
                      </h4>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm mt-6 bg-slate-50/50 p-6 rounded-2xl border border-slate-100 shadow-inner">
                        <div>
                          <div className="text-slate-400 mb-1 font-black uppercase text-[10px] tracking-widest flex items-center"><MapPin size={12} className="mr-1 text-slate-900"/> Location</div>
                          <div className="text-slate-800 font-black">{schedule.location}</div>
                        </div>
                        
                        <div>
                          <div className="text-slate-400 mb-1 font-black uppercase text-[10px] tracking-widest flex items-center"><Calendar size={12} className="mr-1 text-slate-900"/> Date & Time</div>
                          <div className="text-slate-800 font-black">{schedule.date} @ {schedule.time_slot}</div>
                        </div>
                        
                        <div>
                          <div className="text-slate-400 mb-1 font-black uppercase text-[10px] tracking-widest flex items-center"><Package size={12} className="mr-1 text-slate-400"/> Method</div>
                          <div className="text-slate-800 font-black capitalize">{schedule.pickup_or_delivery}</div>
                        </div>
                      </div>

                      {schedule.description && (
                         <div className="mt-4 text-sm text-slate-600 bg-slate-50 border border-slate-100 p-4 rounded-2xl flex items-start gap-3">
                           <Info size={18} className="text-slate-900 mt-0.5 shrink-0" />
                           <p className="font-medium italic">"{schedule.description}"</p>
                         </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-4 justify-center min-w-[140px]">
                       <span className={`px-5 py-2 rounded-full text-[10px] font-black tracking-widest uppercase ${
                        schedule.status === 'pending' ? 'bg-amber-100 text-amber-700 border border-amber-200 shadow-sm' : 
                        schedule.status === 'accepted' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200 shadow-sm' : 
                        'bg-rose-100 text-rose-700 border border-rose-200 shadow-sm'
                      }`}>
                        {schedule.status}
                      </span>
                      
                      {/* Negotiation / Accept / Reject */}
                      {schedule.status === 'pending' && (
                        <div className="flex flex-col gap-2 w-full">
                          <button onClick={() => handleScheduleStatusChange(schedule.id, 'accepted')} className="w-full text-xs font-black py-3 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl hover:bg-emerald-100 transition-all">Accept Meetup</button>
                          <button onClick={() => handleScheduleStatusChange(schedule.id, 'rejected')} className="w-full text-xs font-black py-3 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl hover:bg-rose-100 transition-all">Negotiate</button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )})
            ) : (
            <div className="text-center py-24 glass-card bg-white/70 border-slate-200">
                <CalendarClock className="w-16 h-16 text-slate-200 mx-auto mb-6" />
                <p className="text-slate-500 font-bold text-lg">No scheduled meetups yet.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
