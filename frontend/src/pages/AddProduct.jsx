import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UploadCloud, Image as ImageIcon, MapPin, Loader2 } from 'lucide-react';
import api from '../services/api';

export default function AddProduct() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    condition: '',
    image: null,
    latitude: null,
    longitude: null
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image' && files && files[0]) {
      setFormData(prev => ({ ...prev, image: files[0] }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(files[0]);
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const captureLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({ 
          ...prev, 
          latitude: position.coords.latitude, 
          longitude: position.coords.longitude 
        }));
        setLocationLoading(false);
      },
      (error) => {
        alert("Unable to retrieve your location");
        setLocationLoading(false);
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const form = new FormData();
    form.append('title', formData.title);
    if (formData.description) form.append('description', formData.description);
    if (formData.category) form.append('category', formData.category);
    if (formData.condition) form.append('condition', formData.condition);
    if (formData.image) form.append('image', formData.image);
    if (formData.latitude) form.append('latitude', formData.latitude);
    if (formData.longitude) form.append('longitude', formData.longitude);

    try {
      await api.post('/products', form, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to post product');
      setLoading(false);
    }
  };

  const categories = ['books', 'electronics', 'clothing', 'furniture', 'other'];
  const conditions = ['New', 'Like New', 'Good', 'Fair', 'Poor'];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto glass-card rounded-3xl p-6 sm:p-10 my-10 bg-white/70 border-slate-200 shadow-2xl"
    >
      <div className="mb-12 text-center">
        <h1 className="text-5xl font-black text-slate-900 tracking-tighter lowercase">post an item</h1>
        <p className="text-slate-400 mt-2 font-black uppercase tracking-widest text-[10px]">List an item for sale or exchange on campus.</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm font-bold border border-red-100 shadow-sm flex items-center">
          <span className="w-2 h-2 bg-red-500 rounded-full mr-2 shadow-[0_0_8px_rgba(239,68,68,0.4)]"></span>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Basic Info */}
        <div className="space-y-6">
          <div>
            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full p-5 bg-slate-50 border border-slate-100 rounded-[2rem] focus:ring-4 focus:ring-slate-900/5 focus:border-slate-300 outline-none text-slate-900 font-extrabold transition-all placeholder-slate-400 shadow-inner"
              placeholder="e.g., Fundamentals of Physics 10th Ed."
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-slate-900/5 focus:border-slate-300 outline-none text-slate-800 font-bold transition-all capitalize appearance-none cursor-pointer"
              >
                <option value="" className="bg-white">Select category...</option>
                {categories.map(cat => (
                  <option key={cat} value={cat} className="bg-white">{cat}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Condition</label>
              <select
                name="condition"
                value={formData.condition}
                onChange={handleChange}
                className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-slate-900/5 focus:border-slate-300 outline-none text-slate-800 font-bold transition-all appearance-none cursor-pointer"
              >
                <option value="" className="bg-white">Select condition...</option>
                {conditions.map(cond => (
                  <option key={cond} value={cond} className="bg-white">{cond}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="w-full p-6 bg-slate-50 border border-slate-100 rounded-[2.5rem] focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-300 text-slate-800 transition-all resize-none placeholder-slate-400 font-medium shadow-inner"
              placeholder="Describe the item, any flaws, and what you might want in exchange..."
            ></textarea>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between p-8 bg-slate-50 border border-slate-100 rounded-[2rem] gap-6">
            <div className="text-center sm:text-left">
              <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">item location</h4>
              <p className="text-[10px] text-slate-400 mt-2 font-black uppercase tracking-widest leading-relaxed">Pin your location so nearby students can find your item.</p>
              {formData.latitude && (
                <p className="text-[10px] font-black text-slate-900 mt-4 flex items-center justify-center sm:justify-start uppercase tracking-widest">
                  <span className="w-2 h-2 bg-slate-900 rounded-full shadow-2xl mr-2"></span>
                  pinned
                </p>
              )}
            </div>
            <button 
              type="button" 
              onClick={captureLocation}
              disabled={locationLoading}
              className="px-8 py-4 bg-white text-slate-900 text-[10px] font-black uppercase tracking-widest rounded-2xl border border-slate-200 hover:border-slate-900 hover:shadow-2xl flex items-center transition-all disabled:opacity-50 shrink-0"
            >
              {locationLoading ? <Loader2 size={16} className="animate-spin mr-2" /> : <MapPin size={16} className="mr-2" />}
              {formData.latitude ? 'update pin' : 'pin location'}
            </button>
          </div>
        </div>

        {/* Image Upload Area */}
        <div className="mt-10">
          <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-4 ml-1">Product Image (Recommended)</label>
          <div className="flex items-center justify-center w-full">
            <label className={`flex flex-col items-center justify-center w-full h-80 border-2 border-dashed rounded-[3rem] cursor-pointer transition-all ${imagePreview ? 'border-slate-900 bg-white shadow-2xl' : 'border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-900'}`}>
              
              {imagePreview ? (
                <div className="w-full h-full p-6 relative group">
                  <img src={imagePreview} className="w-full h-full object-contain rounded-3xl drop-shadow-2xl" alt="Preview" />
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-[3rem] backdrop-blur-sm">
                    <p className="text-white font-black flex items-center bg-slate-900 px-8 py-4 rounded-full shadow-2xl uppercase tracking-widest text-[10px]">
                      <ImageIcon size={20} className="mr-3"/> change image
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <div className="p-6 bg-slate-900 text-white rounded-3xl mb-6 shadow-2xl rotate-3">
                    <UploadCloud size={40} className="-rotate-3" />
                  </div>
                  <p className="mb-2 text-sm text-slate-500 font-extrabold uppercase tracking-widest"><span className="text-slate-900">Click to upload</span></p>
                  <p className="text-[10px] text-slate-300 font-black uppercase tracking-[.25em]">PNG, JPG or WEBP (MAX. 5MB)</p>
                </div>
              )}
              
              <input type="file" name="image" className="hidden" accept="image/*" onChange={handleChange} />
            </label>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-100 mt-10">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-6 text-white bg-slate-900 rounded-[2rem] font-black shadow-2xl hover:bg-black hover:-translate-y-2 transition-all focus:outline-none focus:ring-4 focus:ring-slate-900/10 disabled:opacity-50 text-xl uppercase tracking-[.2em]"
          >
            {loading ? 'Posting...' : 'Publish Listing'}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
