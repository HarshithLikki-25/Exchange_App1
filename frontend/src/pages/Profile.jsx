import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';
import { Loader2, MapPin, Calendar, Camera, User as UserIcon } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

export default function Profile() {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const [profileUser, setProfileUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const isOwner = currentUser?.id === parseInt(id);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const [userRes, prodRes] = await Promise.all([
          api.get(`/users/${id}`),
          api.get(`/products?owner_id=${id}`) // Requires backend support or we filter locally if api doesn't support owner_id query param natively, but we can do a hack: fetch all and filter since we didn't add an owner_id query explicitly, wait we just call /users/me/products if it is the owner
        ]);
        setProfileUser(userRes.data);
        
        // Since we didn't add an explicit owner_id endpoint for public profiles in the backend, 
        // we'll fetch all products and filter for now as a quick solution, or if it is the owner we can call /me/products
        if (isOwner) {
            const myProdRes = await api.get('/users/me/products');
            setProducts(myProdRes.data.results || []);
        } else {
            const allProdRes = await api.get(`/products?limit=100`);
            setProducts((allProdRes.data.results || []).filter(p => p.owner_id === parseInt(id)));
        }
      } catch (err) {
        console.error("Failed to fetch profile", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id, isOwner]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/users/profile-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setProfileUser({ ...profileUser, profile_image_url: res.data.profile_image_url });
      // We would ideally also update the AuthContext user if we had a set-user method
    } catch (err) {
      console.error("Upload failed", err);
      alert("Failed to upload profile image.");
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-blue-600" /></div>;
  if (!profileUser) return <div className="text-center py-20 text-gray-500">User not found.</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in duration-500">
      <Helmet>
        <title>{profileUser.name} | CampusXchange</title>
      </Helmet>

      {/* Profile Header */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mt-8">
        <div className="relative group">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-tr from-blue-100 to-purple-100 flex items-center justify-center text-4xl shadow-xl overflow-hidden border-4 border-white">
            {profileUser.profile_image_url ? (
              <img src={profileUser.profile_image_url} alt={profileUser.name} className="w-full h-full object-cover" />
            ) : (
              <span className="font-bold text-gray-400">{profileUser.name.charAt(0)}</span>
            )}
          </div>
          
          {isOwner && (
            <button 
              onClick={() => fileInputRef.current.click()}
              className="absolute bottom-0 right-0 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:scale-110 transition-transform hover:bg-blue-700"
              disabled={uploading}
            >
              {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
            </button>
          )}
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
        </div>

        <div className="flex-1 text-center md:text-left space-y-4">
          <div className="flex items-center justify-center md:justify-start gap-4">
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">{profileUser.name}</h1>
            {isOwner && <span className="px-3 py-1 bg-blue-100 text-blue-700 font-bold text-xs rounded-full">YOU</span>}
          </div>
          
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm font-medium text-gray-600">
            {profileUser.college && <span className="flex items-center"><UserIcon className="w-4 h-4 mr-1 text-blue-500"/> {profileUser.college}</span>}
            {profileUser.location && <span className="flex items-center"><MapPin className="w-4 h-4 mr-1 text-purple-500"/> {profileUser.location}</span>}
            <span className="flex items-center"><Calendar className="w-4 h-4 mr-1 text-green-500"/> Joined {new Date(profileUser.created_at).toLocaleDateString()}</span>
          </div>

          <p className="text-gray-600 max-w-2xl bg-gray-50 p-4 rounded-2xl border border-gray-100 shadow-inner">
            {profileUser.bio || "This user hasn't written a bio yet."}
          </p>

          <div className="flex gap-10 border-t border-gray-200 pt-4 mt-4 justify-center md:justify-start">
            <div className="text-center">
              <span className="block text-2xl font-black text-gray-900">{products.length}</span>
              <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Listings</span>
            </div>
            {/* Add more stats here if needed, like exchanges completed */}
          </div>
        </div>
      </div>

      {/* User's Products Grid (Instagram Style) */}
      <h3 className="text-2xl font-black text-gray-900 border-b pb-4">Listings</h3>
      {products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map(product => (
            <div key={product.id} className="aspect-square relative group overflow-hidden rounded-2xl bg-gray-100 shadow-sm border border-gray-200 cursor-pointer">
              {product.image_url ? (
                <img src={product.image_url} alt={product.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 p-4 text-center group-hover:bg-gray-200 transition-colors">
                  <span className="text-xs font-bold truncate w-full">{product.title}</span>
                </div>
              )}
              {/* Instagram style hover overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white p-4 text-center backdrop-blur-sm">
                <span className="font-bold text-lg leading-tight mb-2 truncate w-full">{product.title}</span>
                <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold border border-white/30 backdrop-blur-md">{product.category}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-gray-500 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
          No listings yet.
        </div>
      )}
    </div>
  );
}
