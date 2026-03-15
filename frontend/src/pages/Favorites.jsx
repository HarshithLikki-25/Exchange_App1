import React, { useState, useEffect } from 'react';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import { Heart, Loader2 } from 'lucide-react';

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = async () => {
    try {
      const { data } = await api.get('/users/me/favorites');
      setFavorites(data.results || []);
    } catch (err) {
      console.error("Failed to load favorites", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handleToggleFavorite = async (productId, isFavorited) => {
    if (isFavorited) {
      try {
        await api.delete(`/favorites/${productId}`);
        // Remove from list instantly
        setFavorites(favorites.filter(p => p.id !== productId));
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      <div className="flex items-center space-x-6 mb-12 pb-8 border-b border-slate-100">
        <div className="p-5 bg-slate-900 text-white rounded-[2rem] shadow-2xl rotate-3 transition-transform hover:rotate-0 duration-500">
          <Heart size={36} className="fill-white -rotate-3 hover:rotate-0 transition-transform duration-500" />
        </div>
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter lowercase">your wishlist</h1>
          <p className="text-slate-400 mt-1 font-black uppercase tracking-widest text-[10px]">Items you're keeping an eye on.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-32">
          <Loader2 className="animate-spin text-slate-900 w-12 h-12" />
        </div>
      ) : favorites.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {favorites.map((product) => (
            <ProductCard 
              key={product.id} 
              product={product} 
              isFavorite={true}
              onToggleFavorite={handleToggleFavorite}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 glass-card bg-white/70 border-slate-200 rounded-[3rem] shadow-2xl">
          <div className="inline-flex items-center justify-center w-28 h-28 bg-slate-50 border border-slate-100 rounded-full mb-8">
            <Heart size={44} className="text-slate-200" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tighter lowercase">no favorites yet</h2>
          <p className="text-slate-400 font-black uppercase tracking-widest text-[10px] max-w-xs mx-auto leading-relaxed">When you see an item you like, click the heart icon to save it here.</p>
        </div>
      )}
    </div>
  );
}
