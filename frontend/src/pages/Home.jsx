import React, { useState, useEffect } from 'react';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import { Search, Filter, Loader2, MapPin, Compass, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [nearbyProducts, setNearbyProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingNearby, setLoadingNearby] = useState(false);
  const [favorites, setFavorites] = useState(new Set());
  const { user } = useAuth();
  
  // Custom Location State
  const [userCoords, setUserCoords] = useState(null);
  const [locationError, setLocationError] = useState('');
  const [showNearby, setShowNearby] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [conditionFilter, setConditionFilter] = useState('');
  const [distanceFilter, setDistanceFilter] = useState(10); // Default 10km radius
  const [sortOrder, setSortOrder] = useState('newest');

  const categories = ['', 'books', 'electronics', 'clothing', 'furniture', 'other'];

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let url = '/products';
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (categoryFilter) params.append('category', categoryFilter);
      if (conditionFilter) params.append('condition', conditionFilter);
      params.append('sort', sortOrder);
      
      const { data } = await api.get(`${url}?${params.toString()}`);
      setProducts(data.results || []);
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchNearbyProducts = async (lat, lng, radius) => {
    setLoadingNearby(true);
    try {
      const params = new URLSearchParams();
      params.append('latitude', lat);
      params.append('longitude', lng);
      params.append('radius', radius.toString());
      // Not sorting heavily here, just grabbing what's nearby
      const { data } = await api.get(`/products?${params.toString()}`);
      setNearbyProducts(data.results || []);
    } catch (err) {
      console.error("Error fetching nearby products:", err);
    } finally {
      setLoadingNearby(false);
    }
  };

  const fetchFavorites = async () => {
    if (!user) return;
    try {
      const { data } = await api.get('/users/me/favorites');
      const favIds = new Set(data.results.map(f => f.id));
      setFavorites(favIds);
    } catch (err) {
      console.error("Error fetching favorites:", err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [searchQuery, categoryFilter, conditionFilter, sortOrder]);

  useEffect(() => {
    fetchFavorites();
  }, [user]);

  // Handle explicit nearby requests
  const handleDiscoverNearby = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }
    
    setLoadingNearby(true);
    setLocationError('');
    setShowNearby(true);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserCoords({ latitude, longitude });
        fetchNearbyProducts(latitude, longitude, distanceFilter);
      },
      (err) => {
        setLocationError('Unable to retrieve your location. Check your browser permissions.');
        setLoadingNearby(false);
      }
    );
  };

  // If distance slider changes after we already got coords, refetch nearby automatically
  useEffect(() => {
    if (userCoords && showNearby) {
      fetchNearbyProducts(userCoords.latitude, userCoords.longitude, distanceFilter);
    }
  }, [distanceFilter, userCoords]);


  const handleToggleFavorite = async (productId, isFavorited) => {
    try {
      if (isFavorited) {
        await api.delete(`/favorites/${productId}`);
        setFavorites(prev => {
          const next = new Set(prev);
          next.delete(productId);
          return next;
        });
      } else {
        await api.post(`/favorites/${productId}`);
        setFavorites(prev => new Set([...prev, productId]));
      }
    } catch (err) {
      console.error("Error toggling favorite:", err);
    }
  };

  return (
    <div className="space-y-10 pb-20 animate-in fade-in duration-500">
      <Helmet>
        <title>Marketplace | CampusXchange</title>
      </Helmet>
      
      {/* Hero Header */}
      <div className="text-center py-16 px-4 rounded-3xl bg-slate-900/40 backdrop-blur-md border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/20 blur-3xl rounded-full pointer-events-none"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/20 blur-3xl rounded-full pointer-events-none"></div>
        
        <h1 className="text-4xl md:text-6xl font-black text-white mb-6 relative z-10 tracking-tight">
          Campus Market<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">place</span>
        </h1>
        <p className="text-white/60 max-w-2xl mx-auto text-lg md:text-xl font-medium relative z-10 mb-8">
          The hub for students to discover, trade, and sustainably exchange items within your college network.
        </p>
        
        {/* Nearby Discovery CTA */}
        <button 
          onClick={handleDiscoverNearby}
          className="relative z-10 inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-8 py-3.5 rounded-full font-bold shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:shadow-[0_0_30px_rgba(168,85,247,0.6)] transform hover:-translate-y-1 transition-all duration-300"
        >
          <Compass size={20} className={loadingNearby ? "animate-spin" : ""} />
          <span>Discover Nearby Items</span>
          <ArrowRight size={18} className="ml-2" />
        </button>
      </div>

      {/* Nearby Products Section (Conditionally Rendered) */}
      <AnimatePresence>
        {showNearby && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="glass-card rounded-[2rem] border border-blue-500/30 p-8 relative shadow-[0_0_40px_rgba(59,130,246,0.1)]">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-white/10 pb-6">
                <div>
                  <h2 className="text-3xl font-extrabold text-white flex items-center gap-3">
                    <MapPin className="text-blue-400" />
                    Products Near You
                  </h2>
                  {locationError ? (
                    <p className="text-red-400 text-sm mt-2 font-medium">{locationError}</p>
                  ) : (
                    <p className="text-white/50 text-sm mt-2">Discovering items within {distanceFilter} km of your current location</p>
                  )}
                </div>
                
                {/* Distance Filter specifically for Nearby */}
                {!locationError && (
                  <div className="flex items-center gap-3 bg-black/30 border border-white/10 rounded-2xl px-5 py-3 shadow-inner">
                    <span className="text-sm font-bold text-white/70">Radius:</span>
                    <input 
                      type="range" 
                      min="1" max="50" 
                      value={distanceFilter} 
                      onChange={(e) => setDistanceFilter(Number(e.target.value))}
                      className="w-32 accent-blue-500"
                    />
                    <span className="text-sm font-black text-blue-400 min-w-[3rem] text-right">{distanceFilter} km</span>
                  </div>
                )}
              </div>

              {loadingNearby ? (
                <div className="flex justify-center items-center py-20">
                  <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                </div>
              ) : nearbyProducts.length > 0 ? (
                <div className="flex overflow-x-auto gap-6 pb-6 px-2 custom-scrollbar snap-x">
                  {nearbyProducts.map(product => (
                    <div key={product.id} className="min-w-[280px] sm:min-w-[320px] max-w-[320px] snap-center shrink-0">
                      <ProductCard 
                        product={product} 
                        isFavorite={favorites.has(product.id)}
                        onToggleFavorite={handleToggleFavorite}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-white/5 rounded-2xl border border-white/10">
                  <Compass className="w-16 h-16 text-white/20 mx-auto mb-4" />
                  <p className="text-white/60 text-lg font-medium">No products found within {distanceFilter} km.</p>
                  <p className="text-white/40 text-sm mt-2">Try expanding your search radius!</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-4 py-4">
        <div className="h-px bg-white/10 flex-1"></div>
        <h2 className="text-2xl font-bold text-white tracking-widest uppercase">Global Feed</h2>
        <div className="h-px bg-white/10 flex-1"></div>
      </div>

      {/* Filters Bar */}
      <div className="glass-card p-4 flex flex-col md:flex-row gap-4 items-center justify-between rounded-2xl sticky top-24 z-40 shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-white/10 backdrop-blur-xl">
        <div className="relative w-full md:w-96 group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-white/40 group-focus-within:text-blue-400 transition-colors">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Search products..."
            className="w-full pl-12 pr-4 py-3 bg-black/30 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all font-medium text-white placeholder-white/30 shadow-inner"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex gap-4 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 custom-scrollbar">
          <div className="flex items-center space-x-2 bg-black/30 border border-white/10 rounded-xl px-4 py-2 flex-grow sm:flex-grow-0 min-w-max">
            <Filter size={16} className="text-purple-400" />
            <select 
              className="bg-transparent border-none focus:ring-0 text-sm font-bold w-full text-white/80 outline-none p-1 cursor-pointer appearance-none"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="" className="bg-slate-900">All Categories</option>
              {categories.slice(1).map(cat => (
                <option key={cat} value={cat} className="bg-slate-900 capitalize">{cat}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2 bg-black/30 border border-white/10 rounded-xl px-4 py-2 flex-grow sm:flex-grow-0 min-w-max">
            <select 
              className="bg-transparent border-none focus:ring-0 text-sm font-bold w-full text-white/80 outline-none p-1 cursor-pointer appearance-none"
              value={conditionFilter}
              onChange={(e) => setConditionFilter(e.target.value)}
            >
              <option value="" className="bg-slate-900">All Conditions</option>
              <option value="New" className="bg-slate-900">New</option>
              <option value="Like New" className="bg-slate-900">Like New</option>
              <option value="Good" className="bg-slate-900">Good</option>
              <option value="Fair" className="bg-slate-900">Fair</option>
              <option value="Poor" className="bg-slate-900">Poor</option>
            </select>
          </div>
          
          <select 
            className="bg-blue-900/40 border border-blue-500/30 rounded-xl px-5 py-3 text-sm font-bold text-blue-200 outline-none focus:ring-2 focus:ring-blue-400 appearance-none min-w-max cursor-pointer"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="newest" className="bg-slate-900">Newest first</option>
            <option value="oldest" className="bg-slate-900">Oldest first</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-32">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {products.map((product) => (
            <ProductCard 
              key={product.id} 
              product={product} 
              isFavorite={favorites.has(product.id)}
              onToggleFavorite={handleToggleFavorite}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-32 bg-white/5 rounded-[2rem] border border-white/10 shadow-sm backdrop-blur-sm">
          <Search className="w-16 h-16 text-white/20 mx-auto mb-6" />
          <p className="text-white/60 text-xl font-medium">No products match your criteria.</p>
          <button 
            onClick={() => { setSearchQuery(''); setCategoryFilter(''); setConditionFilter(''); }}
            className="mt-6 inline-block bg-white/10 border border-white/20 hover:bg-white/20 text-white font-bold py-2 px-6 rounded-full transition-all"
          >
            Clear Search
          </button>
        </div>
      )}
    </div>
  );
}
