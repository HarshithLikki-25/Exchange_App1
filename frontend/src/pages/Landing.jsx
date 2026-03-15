import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Search, Filter, ArrowRight, ShieldCheck, RefreshCcw,
  MapPin, Loader2, Tag, Clock, Package, Zap, Users
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

/* ─── Public Product Card (dark theme) ─── */
function PublicProductCard({ product }) {
  const imgUrl = product.image_url ||
    'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=500&q=80';
  const date = new Date(product.created_at).toLocaleDateString();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ duration: 0.25 }}
      className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-2xl overflow-hidden flex flex-col group hover:bg-white/10 hover:border-white/20 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300"
    >
      <div className="relative h-48 overflow-hidden">
        <Link to={`/product/${product.id}`}>
          <img
            src={imgUrl}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        </Link>
        {product.condition && (
          <div className="absolute bottom-3 left-3 px-2.5 py-1 bg-black/60 backdrop-blur-md text-white text-xs font-semibold rounded-lg">
            {product.condition}
          </div>
        )}
        {product.category && (
          <div className="absolute top-3 right-3 px-2.5 py-1 bg-blue-500/80 backdrop-blur-md text-white text-xs font-semibold rounded-lg capitalize">
            {product.category}
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <Link to={`/product/${product.id}`}>
          <h3 className="font-bold text-white text-base line-clamp-1 mb-1 hover:text-blue-300 transition-colors">
            {product.title}
          </h3>
        </Link>
        <p className="text-white/40 text-sm line-clamp-2 flex-grow mb-3">
          {product.description || 'No description provided.'}
        </p>
        <div className="flex items-center justify-between text-xs text-white/30 pt-3 border-t border-white/10">
          <div className="flex items-center gap-1">
            <Tag size={12} />
            <span className="capitalize">{product.category || 'Other'}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock size={12} />
            <span>{date}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Main Landing Page ─── */
export default function Landing() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [conditionFilter, setConditionFilter] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  const { user } = useAuth();

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (categoryFilter) params.append('category', categoryFilter);
      if (conditionFilter) params.append('condition', conditionFilter);
      params.append('sort', sortOrder);
      params.append('limit', '12');
      const { data } = await api.get(`/products?${params.toString()}`);
      setProducts(data.results || []);
    } catch (err) {
      console.error('Error fetching products:', err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, [searchQuery, categoryFilter, conditionFilter, sortOrder]);

  const clearFilters = () => { setSearchQuery(''); setCategoryFilter(''); setConditionFilter(''); setSortOrder('newest'); };
  const hasActiveFilters = searchQuery || categoryFilter || conditionFilter;

  return (
    <div className="min-h-screen font-sans" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 40%, #1e3a8a 70%, #0f172a 100%)' }}>
      <Helmet>
        <title>CampusXchange | College Marketplace</title>
        <meta name="description" content="Buy, sell and exchange items with students on your campus." />
      </Helmet>

      {/* decorative blobs — full page */}
      <div className="fixed top-0 right-0 w-[700px] h-[700px] bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 pointer-events-none" />
      <div className="fixed top-1/2 left-1/2 w-[600px] h-[300px] bg-indigo-500/5 rounded-full blur-3xl -translate-x-1/2 pointer-events-none" />
      {/* dot grid overlay */}
      <div className="fixed inset-0 opacity-[0.07] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

      {/* ── HERO ── */}
      <section className="relative pt-28 pb-20 px-6 text-white">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.75 }}>
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm font-semibold text-blue-200 mb-7">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              The #1 College Trading Platform
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight mb-5">
              Trade Smarter,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">On Campus.</span>
            </h1>
            <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-10">
              CampusXchange connects college students to buy, sell, and exchange items — safely, locally, and for free.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              {user ? (
                <Link to="/market" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl font-bold text-lg shadow-2xl shadow-blue-500/30 hover:scale-105 transition-transform duration-200">
                  Go to Market <ArrowRight size={20} />
                </Link>
              ) : (
                <Link to="/register" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl font-bold text-lg shadow-2xl shadow-blue-500/30 hover:scale-105 transition-transform duration-200">
                  Start Trading <ArrowRight size={20} />
                </Link>
              )}
              <a href="#marketplace" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 border border-white/20 backdrop-blur-sm rounded-2xl font-bold text-lg hover:bg-white/20 transition-colors duration-200">
                Browse Items <Package size={20} />
              </a>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.6 }}
            className="mt-16 grid grid-cols-3 gap-4 max-w-lg mx-auto">
            {[
              { label: 'Students', value: '2,000+', icon: <Users size={18} /> },
              { label: 'Items Listed', value: `${products.length}+`, icon: <Package size={18} /> },
              { label: 'Free to Use', value: '100%', icon: <Zap size={18} /> },
            ].map(({ label, value, icon }) => (
              <div key={label} className="flex flex-col items-center bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
                <div className="text-blue-300 mb-1">{icon}</div>
                <div className="text-2xl font-extrabold text-white">{value}</div>
                <div className="text-xs text-white/50 font-medium">{label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── MARKETPLACE ── */}
      <section id="marketplace" className="relative max-w-7xl mx-auto px-4 sm:px-6 py-14">
        {/* section divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-14" />

        <div className="mb-8">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-1">Browse Items</h2>
          <p className="text-white/40">Explore what students on your campus are trading right now.</p>
        </div>

        {/* Filters */}
        <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-3 md:p-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center mb-8 sticky top-20 z-30">
          <div className="relative flex-1 min-w-0">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="text"
              placeholder="Search products…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400/50 transition-all font-medium"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
              <Filter size={14} className="text-white/30 shrink-0" />
              <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-transparent text-sm font-medium text-white/70 outline-none cursor-pointer">
                <option value="" className="bg-slate-900">All Categories</option>
                <option value="books" className="bg-slate-900">Books</option>
                <option value="electronics" className="bg-slate-900">Electronics</option>
                <option value="clothing" className="bg-slate-900">Clothing</option>
                <option value="furniture" className="bg-slate-900">Furniture</option>
                <option value="other" className="bg-slate-900">Other</option>
              </select>
            </div>
            <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
              <select value={conditionFilter} onChange={(e) => setConditionFilter(e.target.value)}
                className="bg-transparent text-sm font-medium text-white/70 outline-none cursor-pointer">
                <option value="" className="bg-slate-900">All Conditions</option>
                <option value="New" className="bg-slate-900">New</option>
                <option value="Like New" className="bg-slate-900">Like New</option>
                <option value="Good" className="bg-slate-900">Good</option>
                <option value="Fair" className="bg-slate-900">Fair</option>
                <option value="Poor" className="bg-slate-900">Poor</option>
              </select>
            </div>
            <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
              <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}
                className="bg-transparent text-sm font-medium text-white/70 outline-none cursor-pointer">
                <option value="newest" className="bg-slate-900">Newest First</option>
                <option value="oldest" className="bg-slate-900">Oldest First</option>
              </select>
            </div>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="px-4 py-2 text-sm font-semibold text-red-300 bg-red-500/10 border border-red-400/20 rounded-xl hover:bg-red-500/20 transition-colors">
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-24">
            <Loader2 className="w-10 h-10 text-blue-400 animate-spin" />
          </div>
        ) : products.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {products.map((product) => (
                <PublicProductCard key={product.id} product={product} />
              ))}
            </div>
            {/* CTA */}
            {!user && (
              <div className="mt-12 text-center bg-white/5 border border-white/10 backdrop-blur-sm rounded-3xl p-10">
                <h3 className="text-2xl font-extrabold text-white mb-2">Want to post your own items?</h3>
                <p className="text-white/50 mb-6">Create a free account and start trading with students near you.</p>
                <div className="flex justify-center gap-4">
                  <Link to="/register" className="px-7 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-bold shadow-lg hover:scale-105 transition-transform">
                    Sign Up Free
                  </Link>
                  <Link to="/login" className="px-7 py-3 text-white/80 bg-white/5 border border-white/20 rounded-xl font-bold hover:bg-white/10 transition-colors">
                    Log In
                  </Link>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-24 bg-white/5 border border-white/10 rounded-3xl">
            <Package size={48} className="mx-auto text-white/20 mb-4" />
            <p className="text-white/50 text-lg font-medium mb-2">No products found.</p>
            <p className="text-white/30 text-sm mb-6">{hasActiveFilters ? 'Try adjusting your filters.' : 'Be the first to post an item!'}</p>
            {hasActiveFilters ? (
              <button onClick={clearFilters} className="px-6 py-2.5 text-blue-300 border border-blue-400/30 rounded-xl font-semibold hover:bg-white/5">
                Clear Filters
              </button>
            ) : (
              <Link to="/register" className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-500 transition-colors">
                Get Started
              </Link>
            )}
          </div>
        )}
      </section>

      {/* ── WHY SECTION ── */}
      {!user && (
        <section className="relative py-20 px-6">
          <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-20 max-w-7xl mx-auto" />
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-3">Why CampusXchange?</h2>
              <p className="text-white/40 max-w-xl mx-auto">Designed for college students — safe, local, and completely free.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: <ShieldCheck size={28} />, title: 'Safe & Verified', desc: 'Only verified students can join and interact on the platform.' },
                { icon: <MapPin size={28} />, title: 'Local & Fast', desc: 'Meet between classes — no shipping fees, no waiting.' },
                { icon: <RefreshCcw size={28} />, title: 'Eco-Friendly', desc: 'Give items a second life and reduce campus waste.' },
              ].map(({ icon, title, desc }) => (
                <motion.div key={title} whileHover={{ y: -6 }}
                  className="p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 hover:border-white/20 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 group cursor-default">
                  <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-400/20 text-blue-300 flex items-center justify-center mb-5 group-hover:bg-gradient-to-br group-hover:from-blue-500 group-hover:to-purple-500 group-hover:text-white group-hover:border-transparent transition-all duration-300">
                    {icon}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
                  <p className="text-white/40 leading-relaxed">{desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── FOOTER ── */}
      <footer className="relative border-t border-white/10 py-10 px-6 mt-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center font-black text-white text-sm shadow-lg">CX</div>
            <span className="text-xl font-black text-white tracking-tight">
              Campus<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Xchange</span>
            </span>
          </div>
          <div className="flex gap-6 text-sm text-white/40">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Support</a>
          </div>
          <p className="text-xs text-white/30">© {new Date().getFullYear()} CampusXchange. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
