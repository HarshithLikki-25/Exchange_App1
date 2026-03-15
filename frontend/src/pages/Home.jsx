import React, { useState, useEffect } from 'react';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import { Search, Filter, Loader2, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Helmet } from 'react-helmet-async';
import Landing from './Landing';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState(new Set());
  const { user } = useAuth();
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [conditionFilter, setConditionFilter] = useState('');
  const [distanceFilter, setDistanceFilter] = useState(10); // Default 10km
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
      
      // If distance filter is applied, we need the user's coordinates.
      // (For this mockup we assume the user's location is available in user profile or mocked)
      // We will skip actual browser geocoding request in the list view for speed, but
      // pass distanceFilter if lat/lng exists in user object.
      if (user?.latitude && user?.longitude) {
         params.append('latitude', user.latitude);
         params.append('longitude', user.longitude);
         params.append('radius', distanceFilter.toString());
      }
      
      const { data } = await api.get(`${url}?${params.toString()}`);
      setProducts(data.results || []);
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
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
  }, [searchQuery, categoryFilter, conditionFilter, sortOrder, user?.latitude, user?.longitude]);

  useEffect(() => {
    fetchFavorites();
  }, [user]);

  // If user is not logged in, show the Landing Page instead of Marketplace
  if (!user && !loading) {
    return <Landing />;
  }

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
    <div className="space-y-8 animate-in fade-in duration-500">
      <Helmet>
        <title>Marketplace | CampusXchange</title>
      </Helmet>
      
      {/* Hero Header */}
      <div className="text-center py-10 px-4 rounded-3xl bg-gradient-to-br from-blue-50 to-purple-50 border border-white shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 relative z-10">
          Campus Market<span className="text-blue-600">place</span>
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto text-lg relative z-10">
          Buy, sell, and exchange items with students on your campus.
        </p>
      </div>

      {/* Filters Bar */}
      <div className="glass-card p-4 flex flex-col md:flex-row gap-4 items-center justify-between rounded-xl sticky top-20 z-40">
        <div className="relative w-full md:w-96 group">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex gap-4 w-full md:w-auto">
          <div className="flex items-center space-x-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1 flex-1">
            <Filter size={16} className="text-gray-400" />
            <select 
              className="bg-transparent border-none focus:ring-0 text-sm font-medium w-full text-gray-700 outline-none p-1.5"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.slice(1).map(cat => (
                <option key={cat} value={cat} className="capitalize">{cat}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1 flex-1">
            <select 
              className="bg-transparent border-none focus:ring-0 text-sm font-medium w-full text-gray-700 outline-none p-1.5"
              value={conditionFilter}
              onChange={(e) => setConditionFilter(e.target.value)}
            >
              <option value="">All Conditions</option>
              <option value="New">New</option>
              <option value="Like New">Like New</option>
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
              <option value="Poor">Poor</option>
            </select>
          </div>
          
          {user?.latitude && (
            <div className="flex items-center gap-2 border bg-gray-50 border-gray-200 rounded-xl px-3 py-2 w-full sm:w-auto">
              <MapPin className="text-gray-400 w-5 h-5" />
              <span className="text-sm font-medium text-gray-600 whitespace-nowrap">Radius:</span>
              <input 
                type="range" 
                min="1" max="50" 
                value={distanceFilter} 
                onChange={(e) => setDistanceFilter(Number(e.target.value))}
                className="w-24 accent-blue-600"
              />
              <span className="text-xs font-bold text-gray-700 w-8">{distanceFilter}km</span>
            </div>
          )}
          
          <select 
            className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-gray-700 outline-none"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-gray-500 text-lg">No products found.</p>
          <button 
            onClick={() => {setSearch(''); setCategory('');}}
            className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
