import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
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
        const [userRes] = await Promise.all([
          api.get(`/users/${id}`)
        ]);
        setProfileUser(userRes.data);
        
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
    } catch (err) {
      console.error("Upload failed", err);
      alert("Failed to upload profile image.");
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-blue-500" /></div>;
  if (!profileUser) return <div className="text-center py-20 text-white/50">User not found.</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in duration-500 px-4 pt-10">
      <Helmet>
        <title>{profileUser.name} | CampusXchange</title>
      </Helmet>

      {/* Profile Header */}
      <div className="glass-card p-8 flex flex-col md:flex-row items-center md:items-start gap-10">
        <div className="relative group shrink-0">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-5xl font-extrabold text-white shadow-[0_0_30px_rgba(59,130,246,0.5)] overflow-hidden border-4 border-white/20">
            {profileUser.profile_image_url ? (
              <img src={profileUser.profile_image_url} alt={profileUser.name} className="w-full h-full object-cover" />
            ) : (
              <span>{profileUser.name.charAt(0).toUpperCase()}</span>
            )}
          </div>
          
          {isOwner && (
            <button 
              onClick={() => fileInputRef.current.click()}
              className="absolute bottom-2 right-2 p-3 bg-blue-600 text-white rounded-full shadow-[0_0_15px_rgba(37,99,235,0.8)] hover:scale-110 transition-transform hover:bg-blue-500"
              disabled={uploading}
            >
              {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
            </button>
          )}
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
        </div>

        <div className="flex-1 text-center md:text-left space-y-4 w-full">
          <div className="flex items-center justify-center md:justify-start gap-4">
            <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">{profileUser.name}</h1>
            {isOwner && <span className="px-3 py-1 bg-blue-500/20 text-blue-300 font-black text-xs rounded-full border border-blue-500/30">YOU</span>}
          </div>
          
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm font-medium text-white/70">
            {profileUser.college && <span className="flex items-center bg-white/5 py-1.5 px-3 rounded-lg border border-white/10"><UserIcon className="w-4 h-4 mr-2 text-blue-400"/> {profileUser.college}</span>}
            {profileUser.location && <span className="flex items-center bg-white/5 py-1.5 px-3 rounded-lg border border-white/10"><MapPin className="w-4 h-4 mr-2 text-purple-400"/> {profileUser.location}</span>}
            <span className="flex items-center bg-white/5 py-1.5 px-3 rounded-lg border border-white/10"><Calendar className="w-4 h-4 mr-2 text-green-400"/> Joined {new Date(profileUser.created_at).toLocaleDateString()}</span>
          </div>

          <p className="text-white/80 max-w-2xl bg-black/20 p-5 rounded-2xl border border-white/5 shadow-inner leading-relaxed">
            {profileUser.bio || "This user hasn't written a bio yet."}
          </p>

          <div className="flex gap-10 pt-4 justify-center md:justify-start">
            <div className="text-center bg-white/5 px-6 py-3 rounded-2xl border border-white/10">
              <span className="block text-3xl font-black text-white">{products.length}</span>
              <span className="text-xs font-bold text-white/50 uppercase tracking-widest mt-1 block">Listings</span>
            </div>
            {/* Add more stats here if needed, like exchanges completed */}
          </div>
        </div>
      </div>

      {/* User's Products Grid (Instagram Style) */}
      <div className="px-2">
        <h3 className="text-2xl font-black text-white border-b border-white/10 pb-4 mb-6">{isOwner ? 'My' : `${profileUser.name.split(' ')[0]}'s`} Listings</h3>
        {products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map(product => (
              <div key={product.id} className="aspect-square relative group overflow-hidden rounded-2xl bg-white/5 shadow-lg border border-white/10 cursor-pointer">
                {product.image_url ? (
                  <img src={product.image_url} alt={product.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-white/30 p-4 text-center group-hover:bg-white/10 transition-colors">
                    <span className="text-xs font-bold truncate w-full">{product.title}</span>
                  </div>
                )}
                {/* Instagram style hover overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white p-4 text-center backdrop-blur-sm">
                  <span className="font-bold text-lg leading-tight mb-2 w-full line-clamp-2">{product.title}</span>
                  <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold border border-white/30 backdrop-blur-md">{product.category}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-white/40 bg-white/5 rounded-3xl border border-dashed border-white/10">
            No listings yet.
          </div>
        )}
      </div>
    </div>
  );
}
