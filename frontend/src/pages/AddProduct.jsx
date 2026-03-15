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
      className="max-w-2xl mx-auto glass-card rounded-2xl p-6 sm:p-10 my-10"
    >
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Post an Item</h1>
        <p className="text-white/60 mt-2 font-medium">List an item for sale or exchange on campus.</p>
      </div>

      {error && (
        <div className="bg-red-500/10 text-red-400 p-4 rounded-xl mb-6 text-sm font-bold border border-red-500/20 shadow-inner">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Basic Info */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-white/70 mb-2">Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full p-3 bg-black/20 border border-purple-300/30 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-purple-400 outline-none text-white transition-all placeholder-white/30"
              placeholder="e.g., Fundamentals of Physics 10th Ed."
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-white/70 mb-2">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full p-3 bg-black/20 border border-blue-300/30 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none text-white transition-all capitalize"
              >
                <option value="" className="text-gray-900">Select category...</option>
                {categories.map(cat => (
                  <option key={cat} value={cat} className="text-gray-900">{cat}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-white/70 mb-2">Condition</label>
              <select
                name="condition"
                value={formData.condition}
                onChange={handleChange}
                className="w-full p-3 bg-black/20 border border-green-300/30 rounded-xl focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none text-white transition-all"
              >
                <option value="" className="text-gray-900">Select condition...</option>
                {conditions.map(cond => (
                  <option key={cond} value={cond} className="text-gray-900">{cond}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-white/70 mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="w-full p-3 bg-black/20 border border-purple-300/30 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-purple-400 outline-none text-white transition-all resize-none placeholder-white/30"
              placeholder="Describe the item, any flaws, and what you might want in exchange..."
            ></textarea>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl gap-4">
            <div className="text-center sm:text-left">
              <h4 className="text-sm font-bold text-white">Item Location</h4>
              <p className="text-xs text-white/50 mt-1">Pin your location so nearby students can find your item.</p>
              {formData.latitude && (
                <p className="text-xs font-bold text-green-400 mt-2 flex items-center justify-center sm:justify-start">
                  <span className="w-2 h-2 bg-green-400 rounded-full shadow-[0_0_8px_rgba(74,222,128,0.8)] mr-2"></span>
                  Location Pinned ✓
                </p>
              )}
            </div>
            <button 
              type="button" 
              onClick={captureLocation}
              disabled={locationLoading}
              className="px-5 py-2.5 bg-white/10 text-blue-300 text-sm font-bold rounded-xl border border-blue-400/30 hover:bg-white/20 hover:border-blue-400/50 flex items-center transition-all disabled:opacity-50 shrink-0 shadow-lg whitespace-nowrap"
            >
              {locationLoading ? <Loader2 size={16} className="animate-spin mr-2" /> : <MapPin size={16} className="mr-2" />}
              {formData.latitude ? 'Update Pin' : 'Pin My Location'}
            </button>
          </div>
        </div>

        {/* Image Upload Area */}
        <div className="mt-8">
          <label className="block text-sm font-bold text-white/70 mb-3">Product Image (Optional but recommended)</label>
          <div className="flex items-center justify-center w-full">
            <label className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${imagePreview ? 'border-blue-400 bg-white/5' : 'border-white/20 bg-black/20 hover:bg-white/5 hover:border-white/40'}`}>
              
              {imagePreview ? (
                <div className="w-full h-full p-2 relative group">
                  <img src={imagePreview} className="w-full h-full object-contain rounded-xl drop-shadow-lg" alt="Preview" />
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-xl backdrop-blur-sm">
                    <p className="text-white font-bold flex items-center bg-white/20 px-5 py-2.5 rounded-full border border-white/30 shadow-xl">
                      <ImageIcon size={18} className="mr-2"/> Change Image
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <div className="p-4 bg-white/5 text-purple-400 rounded-full mb-3 shadow-inner border border-white/10">
                    <UploadCloud size={32} />
                  </div>
                  <p className="mb-2 text-sm text-white/60"><span className="font-bold text-blue-400">Click to upload</span> or drag and drop</p>
                  <p className="text-xs text-white/30 font-medium">PNG, JPG or WEBP (MAX. 5MB)</p>
                </div>
              )}
              
              <input type="file" name="image" className="hidden" accept="image/*" onChange={handleChange} />
            </label>
          </div>
        </div>

        <div className="pt-6 border-t border-white/10 mt-6">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-bold shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(168,85,247,0.5)] transform hover:-translate-y-1 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-purple-500 disabled:opacity-50 text-lg uppercase tracking-wide"
          >
            {loading ? 'Posting Item...' : 'Publish Listing'}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
