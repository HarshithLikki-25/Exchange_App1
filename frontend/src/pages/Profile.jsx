import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Loader2, MapPin, Calendar, Camera, User as UserIcon, Edit2, Check, X } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

export default function Profile() {
  const { id } = useParams();
  const { user: currentUser, setUser } = useAuth();
  const [profileUser, setProfileUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const [editingBio, setEditingBio] = useState(false);
  const [newBio, setNewBio] = useState('');
  const [savingBio, setSavingBio] = useState(false);

  const isOwner = currentUser?.id === parseInt(id);

  const handleSaveBio = async () => {
    setSavingBio(true);
    try {
      const res = await api.patch('/users/me', { bio: newBio });
      setProfileUser(res.data);
      if (isOwner) setUser(res.data);
      setEditingBio(false);
    } catch (err) {
      console.error("Failed to update bio", err);
      alert("Failed to update bio");
    } finally {
      setSavingBio(false);
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const [userRes] = await Promise.all([
          api.get(`/users/${id}`)
        ]);
        setProfileUser(userRes.data);
        setNewBio(userRes.data.bio || '');
        
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
      setProfileUser(res.data);
      if (isOwner) setUser(res.data);
    } catch (err) {
      console.error("Upload failed", err);
      alert("Failed to upload profile image.");
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="flex justify-center py-32"><Loader2 className="w-12 h-12 animate-spin text-slate-900" /></div>;
  if (!profileUser) return <div className="text-center py-20 text-white/50">User not found.</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in duration-500 px-4 pt-10">
      <Helmet>
        <title>{profileUser.name} | CampusXchange</title>
      </Helmet>

      {/* Profile Header */}
      <div className="glass-card p-10 flex flex-col md:flex-row items-center md:items-start gap-10 bg-white/70 border-slate-200 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 opacity-50 blur-3xl"></div>
        <div className="relative group shrink-0 z-10">
          <div className="w-32 h-32 md:w-44 md:h-44 rounded-3xl bg-slate-900 flex items-center justify-center text-6xl font-black text-white shadow-2xl overflow-hidden border-4 border-white rotate-3 group-hover:rotate-0 transition-transform duration-500">
            {profileUser.profile_image_url ? (
              <img src={profileUser.profile_image_url} alt={profileUser.name} className="w-full h-full object-cover -rotate-3 group-hover:rotate-0 transition-transform duration-500" />
            ) : (
              <span className="-rotate-3 group-hover:rotate-0 transition-transform duration-500">{profileUser.name.charAt(0).toUpperCase()}</span>
            )}
          </div>
          
          {isOwner && (
            <button 
              onClick={() => fileInputRef.current.click()}
              className="absolute -bottom-3 -right-3 p-4 bg-white text-slate-900 rounded-2xl shadow-xl hover:scale-110 transition-transform border border-slate-100"
              disabled={uploading}
            >
              {uploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Camera className="w-6 h-6" />}
            </button>
          )}
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
        </div>

        <div className="flex-1 text-center md:text-left space-y-6 w-full z-10">
          <div className="flex items-center justify-center md:justify-start gap-4">
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight lowercase">{profileUser.name}</h1>
            {isOwner && <span className="px-4 py-1 bg-slate-900 text-white font-black text-[10px] rounded-full uppercase tracking-widest shadow-sm">you</span>}
          </div>
          
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
            {profileUser.college && <span className="flex items-center bg-slate-50 py-2 px-4 rounded-xl border border-slate-100 shadow-sm"><UserIcon className="w-4 h-4 mr-2 text-slate-900"/> {profileUser.college}</span>}
            {profileUser.location && <span className="flex items-center bg-slate-50 py-2 px-4 rounded-xl border border-slate-100 shadow-sm"><MapPin className="w-4 h-4 mr-2 text-slate-900"/> {profileUser.location}</span>}
            <span className="flex items-center bg-slate-50 py-2 px-4 rounded-xl border border-slate-100 shadow-sm"><Calendar className="w-4 h-4 mr-2 text-slate-900"/> {new Date(profileUser.created_at).toLocaleDateString()}</span>
          </div>

          {editingBio ? (
            <div className="max-w-2xl w-full">
              <textarea
                value={newBio}
                onChange={(e) => setNewBio(e.target.value)}
                className="w-full bg-slate-50 text-slate-800 border border-slate-200 p-5 rounded-2xl focus:ring-4 focus:ring-slate-900/5 focus:border-slate-300 outline-none placeholder-slate-400 font-medium shadow-inner"
                rows={3}
                placeholder="Write something about yourself..."
                disabled={savingBio}
              />
              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() => { setEditingBio(false); setNewBio(profileUser.bio || ''); }}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors flex items-center gap-2 font-black text-xs"
                  disabled={savingBio}
                >
                  <X className="w-4 h-4" /> Cancel
                </button>
                <button
                  onClick={handleSaveBio}
                  className="px-8 py-3 rounded-2xl bg-slate-900 text-white hover:bg-black transition-all shadow-xl flex items-center gap-2 font-black text-[10px] uppercase tracking-widest"
                  disabled={savingBio}
                >
                  {savingBio ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Save Bio
                </button>
              </div>
            </div>
          ) : (
            <div className="max-w-2xl relative group w-full md:w-auto">
              <p className="text-slate-600 w-full bg-slate-50/50 p-6 rounded-3xl border border-slate-100 shadow-inner leading-relaxed min-h-[5rem] font-medium italic">
                "{profileUser.bio || "This user hasn't written a bio yet."}"
              </p>
              {isOwner && (
                <button
                  onClick={() => { setEditingBio(true); setNewBio(profileUser.bio || ''); }}
                  className="absolute top-4 right-4 p-3 bg-white hover:bg-slate-50 text-slate-400 hover:text-slate-900 rounded-xl opacity-0 group-hover:opacity-100 transition-all border border-slate-100 shadow-md backdrop-blur-md"
                  title="Edit Bio"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          <div className="flex gap-8 pt-4 justify-center md:justify-start">
            <div className="text-center bg-white px-8 py-4 rounded-3xl border border-slate-100 shadow-sm group hover:scale-105 transition-transform">
              <span className="block text-4xl font-black text-slate-900 group-hover:text-black transition-colors">{products.length}</span>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 block">Active Listings</span>
            </div>
          </div>
        </div>
      </div>

      {/* User's Products Grid */}
      <div className="px-2">
        <h3 className="text-2xl font-black text-slate-900 border-b border-slate-100 pb-6 mb-8 flex items-center justify-between">
          <span>{isOwner ? 'Your' : `${profileUser.name.split(' ')[0]}'s`} Collection</span>
          <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{products.length} Items</span>
        </h3>
        {products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map(product => (
              <div key={product.id} className="aspect-square relative group overflow-hidden rounded-3xl bg-white shadow-lg border border-slate-100 cursor-pointer hover:border-slate-900 transition-all">
                {product.image_url ? (
                  <img src={product.image_url} alt={product.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 p-6 text-center group-hover:bg-slate-50 transition-colors">
                    <UserIcon size={32} className="mb-2 opacity-20" />
                    <span className="text-xs font-black truncate w-full">{product.title}</span>
                  </div>
                )}
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-white/90 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-slate-900 p-6 text-center backdrop-blur-sm">
                  <span className="font-black text-lg leading-tight mb-3 w-full line-clamp-2">{product.title}</span>
                  <div className="flex flex-wrap justify-center gap-2">
                    <span className="px-4 py-1.5 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest border border-slate-800">{product.category}</span>
                    <span className="px-4 py-1.5 bg-slate-50 text-slate-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-slate-100">{product.condition}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 text-slate-300 bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-200">
            <Loader2 className="w-12 h-12 mx-auto mb-4 opacity-10" />
            <p className="font-black text-slate-400">No items showcased yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
