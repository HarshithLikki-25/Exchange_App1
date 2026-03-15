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
      className="max-w-2xl mx-auto glass-card rounded-2xl p-6 sm:p-10"
    >
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Post an Item</h1>
        <p className="text-gray-500 mt-2">List an item for sale or exchange on campus.</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm font-medium border border-red-100">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Basic Info */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
              placeholder="e.g., Fundamentals of Physics 10th Ed."
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all capitalize"
              >
                <option value="">Select category...</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
              <select
                name="condition"
                value={formData.condition}
                onChange={handleChange}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
              >
                <option value="">Select condition...</option>
                {conditions.map(cond => (
                  <option key={cond} value={cond}>{cond}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none"
              placeholder="Describe the item, any flaws, and what you might want in exchange..."
            ></textarea>
          </div>

          <div className="flex items-center justify-between p-4 bg-blue-50/50 border border-blue-100 rounded-xl">
            <div>
              <h4 className="text-sm font-bold text-gray-800">Item Location</h4>
              <p className="text-xs text-gray-500 mt-1">Pin your location so nearby students can find your item.</p>
              {formData.latitude && (
                <p className="text-xs font-semibold text-green-600 mt-1">Location Pinned ✓</p>
              )}
            </div>
            <button 
              type="button" 
              onClick={captureLocation}
              disabled={locationLoading}
              className="px-4 py-2 bg-white text-blue-600 text-sm font-bold rounded-lg border border-blue-200 shadow-sm hover:shadow hover:bg-blue-50 flex items-center transition-all disabled:opacity-50"
            >
              {locationLoading ? <Loader2 size={16} className="animate-spin mr-2" /> : <MapPin size={16} className="mr-2" />}
              {formData.latitude ? 'Update Pin' : 'Pin My Location'}
            </button>
          </div>
        </div>

        {/* Image Upload Area */}
        <div className="mt-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">Product Image (Optional but recommended)</label>
          <div className="flex items-center justify-center w-full">
            <label className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-2xl cursor-pointer transition-colors ${imagePreview ? 'border-blue-500 bg-blue-50/50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'}`}>
              
              {imagePreview ? (
                <div className="w-full h-full p-2 relative">
                  <img src={imagePreview} className="w-full h-full object-contain rounded-xl" alt="Preview" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-xl">
                    <p className="text-white font-medium flex items-center bg-black/50 px-4 py-2 rounded-full"><ImageIcon size={18} className="mr-2"/> Change Image</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <div className="p-4 bg-blue-50 text-blue-500 rounded-full mb-3 shadow-inner">
                    <UploadCloud size={32} />
                  </div>
                  <p className="mb-2 text-sm text-gray-500"><span className="font-semibold text-blue-600">Click to upload</span> or drag and drop</p>
                  <p className="text-xs text-gray-400">PNG, JPG or WEBP (MAX. 5MB)</p>
                </div>
              )}
              
              <input type="file" name="image" className="hidden" accept="image/*" onChange={handleChange} />
            </label>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Posting Item...' : 'Publish Listing'}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
