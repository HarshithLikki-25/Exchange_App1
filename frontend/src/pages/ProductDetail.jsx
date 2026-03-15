import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Tag, Clock, Send, Trash2, MapPin, GraduationCap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [product, setProduct] = useState(null);
  const [myProducts, setMyProducts] = useState([]);
  const [offeredProductId, setOfferedProductId] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await api.get(`/products/${id}`);
        setProduct(data);
      } catch (err) {
        setError('Failed to load product details.');
      }
    };
    const fetchMyProducts = async () => {
      if (user) {
        try {
          const { data } = await api.get('/users/me/products');
          setMyProducts(data.results || []);
        } catch (err) {
          console.error(err);
        }
      }
    };
    fetchProduct();
    fetchMyProducts();
  }, [id, user]);

  const handleExchange = async (e) => {
    e.preventDefault();
    setSending(true);
    setError('');
    setSuccess('');
    try {
      await api.post('/exchange-requests', { 
         product_id: product.id, 
         offered_product_id: offeredProductId ? parseInt(offeredProductId) : null,
         message 
      });
      setSuccess('Exchange request sent successfully!');
      setMessage('');
    } catch (err) {
      let errorMsg = 'Failed to send request';
      if (err.response?.data?.detail) {
        if (Array.isArray(err.response.data.detail)) {
          errorMsg = err.response.data.detail[0].msg;
        } else {
          errorMsg = err.response.data.detail;
        }
      }
      setError(errorMsg);
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this listing?")) {
      try {
        await api.delete(`/products/${id}`);
        navigate('/');
      } catch (err) {
        alert("Failed to delete product");
      }
    }
  };

  if (error && !product) return <div className="text-red-500 text-center py-10">{error}</div>;
  if (!product) return <div className="text-center py-10 animate-pulse text-gray-500">Loading...</div>;

  const isOwner = user?.id === product.owner_id;
  const imgUrl = product.image_url || 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=1000&q=80';

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12"
    >
      {/* Image Section */}
      <div className="rounded-3xl overflow-hidden glass-card aspect-square md:aspect-auto md:h-[600px] group">
        <img 
          src={imgUrl} 
          alt={product.title} 
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-in-out" 
        />
      </div>

      {/* Details Section */}
      <div className="flex flex-col py-4">
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter lowercase">{product.title}</h1>
          {isOwner && (
            <button 
              onClick={handleDelete}
              className="p-4 text-slate-400 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-2xl transition-all shadow-sm"
              title="Delete Listing"
            >
              <Trash2 size={24} />
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-3 mb-10">
          <span className="inline-flex items-center space-x-2 px-5 py-2 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
            <Tag size={14} />
            <span>{product.category || 'Uncategorized'}</span>
          </span>
          {product.condition && (
            <span className="inline-flex items-center space-x-2 px-5 py-2 bg-white border border-slate-100 text-slate-400 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-200"></span>
              <span>{product.condition}</span>
            </span>
          )}
          <span className="inline-flex items-center space-x-2 px-5 py-2 bg-slate-50 text-slate-400 rounded-full text-[10px] font-black uppercase tracking-widest">
            <Clock size={14} />
            <span>{new Date(product.created_at).toLocaleDateString()}</span>
          </span>
        </div>

        <div className="max-w-none text-slate-600 mb-10">
          <p className="whitespace-pre-line text-lg leading-relaxed font-medium">{product.description || 'No description provided.'}</p>
        </div>

        <div className="mt-auto bg-white/70 backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-slate-200 shadow-2xl">
          {!user ? (
            <div className="text-center py-6">
              <p className="text-slate-400 mb-8 font-black uppercase tracking-widest text-[10px]">You must be logged in to request an exchange.</p>
              <button onClick={() => navigate('/login')} className="px-12 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-2xl">Log in</button>
            </div>
          ) : isOwner ? (
            <div className="text-center bg-slate-50 border border-slate-100 py-8 rounded-[2rem]">
              <p className="text-slate-900 font-black text-[10px] uppercase tracking-widest">this is your listing</p>
            </div>
          ) : (
            <form onSubmit={handleExchange} className="space-y-5">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-black text-slate-900 border-b-2 border-black pb-2 tracking-tighter lowercase">
                    {myProducts.length > 0 ? 'request exchange' : 'direct request'}
                  </h3>
                  {myProducts.length === 0 && (
                    <span className="text-[9px] bg-slate-900 text-white px-3 py-1 rounded-full uppercase font-black tracking-widest shadow-xl">no items</span>
                  )}
                </div>
                {myProducts.length === 0 && (
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    You don't have any items to exchange. You can still send a direct request.
                  </p>
                )}
              </div>
              
              {error && <div className="text-white text-[10px] bg-black p-4 rounded-xl font-black uppercase tracking-widest flex items-center shadow-2xl">{error}</div>}
              {success && <div className="text-white text-[10px] bg-slate-900 p-4 rounded-xl font-black uppercase tracking-widest flex items-center shadow-2xl">{success}</div>}
              
              {myProducts.length > 0 && (
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Select an item to offer (Optional)</label>
                  <select 
                    value={offeredProductId}
                    onChange={(e) => setOfferedProductId(e.target.value)}
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-slate-900/5 focus:border-slate-300 outline-none text-slate-900 text-sm font-bold transition-all shadow-inner appearance-none cursor-pointer"
                  >
                    <option value="" className="bg-white text-slate-700">-- No item (Direct Request) --</option>
                    {myProducts.map(p => (
                      <option key={p.id} value={p.id} className="bg-white text-slate-700">{p.title}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-3">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Add a message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Hey, I'd love to trade this..."
                  className="w-full p-5 bg-slate-50 border border-slate-100 rounded-[2rem] focus:ring-4 focus:ring-slate-900/5 focus:border-slate-300 outline-none resize-none h-32 text-sm text-slate-800 placeholder-slate-400 font-medium transition-all shadow-inner"
                  required
                  minLength={2}
                />
              </div>
              
              <button
                type="submit"
                disabled={sending}
                className="w-full flex items-center justify-center space-x-3 py-5 bg-slate-900 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-2xl hover:bg-black transition-all transform hover:-translate-y-1 disabled:opacity-50 mt-4"
              >
                <span>
                  {sending ? 'Sending...' : (offeredProductId ? 'Send Exchange Request' : 'Send Direct Request')}
                </span>
                {!sending && <Send size={20} className="ml-2" />}
              </button>
            </form>
          )}
        </div>
      </div>
    </motion.div>
  );
}
