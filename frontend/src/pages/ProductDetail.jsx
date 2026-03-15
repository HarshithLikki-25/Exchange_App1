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
      setError(err.response?.data?.detail || 'Failed to send request');
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
          <h1 className="text-4xl font-extrabold text-white tracking-tight">{product.title}</h1>
          {isOwner && (
            <button 
              onClick={handleDelete}
              className="p-3 text-red-500 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-full transition-colors"
              title="Delete Listing"
            >
              <Trash2 size={24} />
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-3 mb-8">
          <span className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-blue-500/20 border border-blue-400/20 text-blue-300 rounded-full text-sm font-semibold capitalize tracking-wide">
            <Tag size={15} />
            <span>{product.category || 'Uncategorized'}</span>
          </span>
          {product.condition && (
            <span className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-green-500/20 border border-green-400/20 text-green-300 rounded-full text-sm font-semibold tracking-wide">
              <span className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.8)]"></span>
              <span>{product.condition}</span>
            </span>
          )}
          <span className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-white/5 border border-white/10 text-white/70 rounded-full text-sm font-medium tracking-wide">
            <Clock size={15} />
            <span>{new Date(product.created_at).toLocaleDateString()}</span>
          </span>
        </div>

        <div className="max-w-none text-white/70 mb-10">
          <p className="whitespace-pre-line text-lg leading-relaxed font-medium">{product.description || 'No description provided.'}</p>
        </div>

        <div className="mt-auto bg-white/5 backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-white/10 shadow-2xl">
          {!user ? (
            <div className="text-center py-4">
              <p className="text-white/60 mb-5 font-medium">You must be logged in to request an exchange.</p>
              <button onClick={() => navigate('/login')} className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold inline-block hover:scale-105 transition-transform shadow-lg shadow-purple-500/20 tracking-wide uppercase text-sm">Log in now</button>
            </div>
          ) : isOwner ? (
            <div className="text-center bg-blue-500/10 border border-blue-500/20 py-6 rounded-2xl">
              <p className="text-blue-300 font-bold text-lg">This is your listing.</p>
            </div>
          ) : (
            <form onSubmit={handleExchange} className="space-y-5">
              <h3 className="text-2xl font-extrabold text-white mb-2 border-b border-white/10 pb-4">Request an Exchange</h3>
              
              {error && <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 p-3 rounded-lg font-semibold flex items-center shadow-inner"><span className="w-2 h-2 bg-red-400 rounded-full mr-2 shadow-[0_0_8px_rgba(248,113,113,0.8)]"></span>{error}</div>}
              {success && <div className="text-green-400 text-sm bg-green-500/10 border border-green-500/20 p-3 rounded-lg font-semibold flex items-center shadow-inner"><span className="w-2 h-2 bg-green-400 rounded-full mr-2 shadow-[0_0_8px_rgba(74,222,128,0.8)]"></span>{success}</div>}
              
              <div className="space-y-2">
                <label className="block text-sm font-bold text-white/80">Select an item to offer</label>
                <select 
                  value={offeredProductId}
                  onChange={(e) => setOfferedProductId(e.target.value)}
                  className="w-full p-4 bg-black/20 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-white text-sm transition-all shadow-inner appearance-none custom-select-arrow cursor-pointer"
                  required
                >
                  <option value="" className="bg-slate-900 text-white">-- Choose from your listings --</option>
                  {myProducts.map(p => (
                    <option key={p.id} value={p.id} className="bg-slate-900 text-white">{p.title}</option>
                  ))}
                </select>
                {myProducts.length === 0 && (
                  <p className="text-xs text-red-400 mt-2 font-medium">You don't have any items to offer. Post an item first!</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-bold text-white/80">Add a message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Hey, I'd love to trade this..."
                  className="w-full p-4 bg-black/20 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none h-28 text-sm text-white placeholder-white/30 transition-all shadow-inner"
                  required
                />
              </div>
              
              <button
                type="submit"
                disabled={sending || myProducts.length === 0}
                className="w-full flex items-center justify-center space-x-2 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-extrabold uppercase tracking-wide rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_25px_rgba(168,85,247,0.5)] transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                <span>{sending ? 'Sending...' : 'Send Request'}</span>
                {!sending && <Send size={20} className="ml-1" />}
              </button>
            </form>
          )}
        </div>
      </div>
    </motion.div>
  );
}
