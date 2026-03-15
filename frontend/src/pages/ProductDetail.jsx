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
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">{product.title}</h1>
          {isOwner && (
            <button 
              onClick={handleDelete}
              className="p-3 text-red-500 bg-red-50 hover:bg-red-100 rounded-full transition-colors"
              title="Delete Listing"
            >
              <Trash2 size={24} />
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-3 mb-8">
          <span className="inline-flex items-center space-x-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-semibold capitalize">
            <Tag size={14} />
            <span>{product.category || 'Uncategorized'}</span>
          </span>
          {product.condition && (
            <span className="inline-flex items-center space-x-1 px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-semibold">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              <span>{product.condition}</span>
            </span>
          )}
          <span className="inline-flex items-center space-x-1 px-3 py-1 bg-gray-50 text-gray-600 rounded-full text-sm font-medium">
            <Clock size={14} />
            <span>{new Date(product.created_at).toLocaleDateString()}</span>
          </span>
        </div>

        <div className="prose prose-blue max-w-none text-gray-600 mb-10">
          <p className="whitespace-pre-line text-lg leading-relaxed">{product.description || 'No description provided.'}</p>
        </div>

        <div className="mt-auto bg-gray-50 rounded-2xl p-6 border border-gray-100">
          {!user ? (
            <div className="text-center">
              <p className="text-gray-600 mb-4">You must be logged in to request an exchange.</p>
              <button onClick={() => navigate('/login')} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium inline-block hover:bg-blue-700 transition">Log in now</button>
            </div>
          ) : isOwner ? (
            <p className="text-center text-gray-500 font-medium py-4">This is your listing.</p>
          ) : (
            <form onSubmit={handleExchange} className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900 mb-2 border-b pb-2">Request an Exchange</h3>
              
              {error && <div className="text-red-600 text-sm bg-red-50 p-2 rounded">{error}</div>}
              {success && <div className="text-green-600 text-sm bg-green-50 p-2 rounded">{success}</div>}
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Select an item to offer</label>
                <select 
                  value={offeredProductId}
                  onChange={(e) => setOfferedProductId(e.target.value)}
                  className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm mb-2"
                  required
                >
                  <option value="">-- Choose from your listings --</option>
                  {myProducts.map(p => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
                {myProducts.length === 0 && (
                  <p className="text-xs text-red-500 mt-1">You don't have any items to offer. Post an item first!</p>
                )}
              </div>

              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Add a message for the owner..."
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none h-24 text-sm"
                required
              />
              <button
                type="submit"
                disabled={sending || myProducts.length === 0}
                className="w-full flex items-center justify-center space-x-2 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-transform transform hover:-translate-y-0.5 disabled:opacity-50"
              >
                <span>{sending ? 'Sending...' : 'Send Request'}</span>
                {!sending && <Send size={18} />}
              </button>
            </form>
          )}
        </div>
      </div>
    </motion.div>
  );
}
