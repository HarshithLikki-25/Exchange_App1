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
      
      <div className="flex items-center space-x-3 mb-8 pb-4 border-b border-white/10">
        <div className="p-3 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl shadow-inner">
          <Heart size={28} className="fill-current" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Your Favorites</h1>
          <p className="text-white/50 mt-1">Items you're keeping an eye on.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-blue-500 w-10 h-10" />
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
        <div className="text-center py-24 glass-card rounded-3xl">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/5 border border-white/10 rounded-full mb-4">
            <Heart size={32} className="text-white/20" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">No favorites yet</h2>
          <p className="text-white/50">When you see an item you like, click the heart icon to save it here.</p>
        </div>
      )}
    </div>
  );
}
