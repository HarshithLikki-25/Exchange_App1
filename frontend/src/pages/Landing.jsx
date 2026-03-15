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
      className="bg-white/70 border border-slate-200 backdrop-blur-sm rounded-2xl overflow-hidden flex flex-col group hover:bg-white/90 hover:border-slate-300 hover:shadow-2xl transition-all duration-300"
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
          <div className="absolute bottom-3 left-3 px-2.5 py-1 bg-white/80 backdrop-blur-md text-slate-800 text-xs font-semibold rounded-lg border border-white/40">
            {product.condition}
          </div>
        )}
        {product.category && (
          <div className="absolute top-3 right-3 px-2.5 py-1 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest rounded-lg">
            {product.category}
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <Link to={`/product/${product.id}`}>
          <h3 className="font-black text-slate-900 text-base line-clamp-1 mb-1 hover:text-slate-600 transition-colors">
            {product.title}
          </h3>
        </Link>
        <p className="text-slate-500 text-sm line-clamp-2 flex-grow mb-3">
          {product.description || 'No description provided.'}
        </p>
        <div className="flex items-center justify-between text-[10px] font-black text-slate-400 pt-3 border-t border-slate-100 uppercase tracking-widest">
          <div className="flex items-center gap-1.5">
            <Tag size={12} className="text-slate-900" />
            <span>{product.category || 'Other'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock size={12} className="text-slate-900" />
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
    <div className="min-h-screen font-sans" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 40%, #e2e8f0 100%)' }}>
      <Helmet>
        <title>CampusXchange | College Marketplace</title>
        <meta name="description" content="Buy, sell and exchange items with students on your campus." />
      </Helmet>

      {/* decorative blobs — full page */}
      <div className="fixed top-0 right-0 w-[700px] h-[700px] bg-slate-200/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-slate-300/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 pointer-events-none" />
      <div className="fixed top-1/2 left-1/2 w-[600px] h-[300px] bg-slate-100/5 rounded-full blur-3xl -translate-x-1/2 pointer-events-none" />
      {/* dot grid overlay */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #000000 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

      {/* ── HERO ── */}
      <section className="relative pt-28 pb-20 px-6 text-slate-900">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.75 }}>
            <div className="inline-flex items-center gap-2 bg-slate-100 border border-slate-200 rounded-full px-4 py-1.5 text-[10px] font-black text-slate-600 mb-7 uppercase tracking-[0.2em] shadow-sm">
              <span className="w-2 h-2 rounded-full bg-slate-900" />
              verified college trading
            </div>
            <h1 className="text-6xl md:text-8.5xl font-black tracking-tighter leading-[0.9] mb-8 text-slate-900">
              Trade Smarter.<br />
              <span className="opacity-30">On Campus.</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-12 font-medium leading-relaxed">
              CampusXchange connects students to buy, sell, and exchange items — safely, locally, and reliably.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-5">
              {user ? (
                <Link to="/market" className="inline-flex items-center justify-center gap-2 px-10 py-5 bg-slate-900 rounded-full font-black text-xs uppercase tracking-widest text-white shadow-2xl hover:bg-black transition-all duration-300">
                  Go to Market <ArrowRight size={18} />
                </Link>
              ) : (
                <Link to="/register" className="inline-flex items-center justify-center gap-2 px-10 py-5 bg-slate-900 rounded-full font-black text-xs uppercase tracking-widest text-white shadow-2xl hover:bg-black transition-all duration-300">
                  Start Trading <ArrowRight size={18} />
                </Link>
              )}
              <a href="#marketplace" className="inline-flex items-center justify-center gap-2 px-10 py-5 bg-white border border-slate-200 rounded-full font-black text-xs uppercase tracking-widest text-slate-900 hover:bg-slate-50 transition-all duration-300 shadow-sm">
                Browse Items <Package size={18} />
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
              <div key={label} className="flex flex-col items-center bg-white border border-slate-100 rounded-3xl p-5 shadow-sm group hover:scale-105 transition-transform">
                <div className="text-slate-900 mb-2 group-hover:scale-110 transition-transform">{icon}</div>
                <div className="text-2xl font-black text-slate-900 tracking-tighter">{value}</div>
                <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">{label}</div>
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
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-1">Browse Items</h2>
          <p className="text-slate-500 font-medium">Explore what students on your campus are trading right now.</p>
        </div>

        {/* Filters */}
        <div className="bg-white/80 border border-slate-200 backdrop-blur-md rounded-2xl p-3 md:p-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center mb-8 sticky top-20 z-30 shadow-sm">
          <div className="relative flex-1 min-w-0">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search products…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-300 transition-all font-medium"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
              <Filter size={14} className="text-slate-400 shrink-0" />
              <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-transparent text-sm font-medium text-slate-600 outline-none cursor-pointer">
                <option value="">All Categories</option>
                <option value="books">Books</option>
                <option value="electronics">Electronics</option>
                <option value="clothing">Clothing</option>
                <option value="furniture">Furniture</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
              <select value={conditionFilter} onChange={(e) => setConditionFilter(e.target.value)}
                className="bg-transparent text-sm font-medium text-slate-600 outline-none cursor-pointer">
                <option value="">All Conditions</option>
                <option value="New">New</option>
                <option value="Like New">Like New</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Poor">Poor</option>
              </select>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
              <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}
                className="bg-transparent text-sm font-medium text-slate-600 outline-none cursor-pointer">
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
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
            <Loader2 className="w-10 h-10 text-slate-900 animate-spin" />
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
              <div className="mt-12 text-center bg-white border border-slate-200 rounded-3xl p-10 shadow-sm">
                <h3 className="text-2xl font-extrabold text-slate-900 mb-2">Want to post your own items?</h3>
                <p className="text-slate-500 mb-6 font-medium">Create a free account and start trading with students near you.</p>
                <div className="flex justify-center gap-4">
                  <Link to="/register" className="px-7 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold shadow-lg hover:scale-105 transition-transform">
                    Sign Up Free
                  </Link>
                  <Link to="/login" className="px-7 py-3 text-slate-700 bg-slate-50 border border-slate-200 rounded-xl font-bold hover:bg-slate-100 transition-colors">
                    Log In
                  </Link>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-24 bg-white border border-slate-200 rounded-3xl shadow-sm">
            <Package size={48} className="mx-auto text-slate-200 mb-4" />
            <p className="text-slate-500 text-lg font-bold mb-2">No products found.</p>
            <p className="text-slate-400 text-sm mb-6 font-medium">{hasActiveFilters ? 'Try adjusting your filters.' : 'Be the first to post an item!'}</p>
            {hasActiveFilters ? (
              <button onClick={clearFilters} className="px-8 py-3 text-slate-900 border-2 border-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all">
                Clear Filters
              </button>
            ) : (
              <Link to="/register" className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all">
                Get Started
              </Link>
            )}
          </div>
        )}
      </section>

      {/* ── WHY SECTION ── */}
      {!user && (
        <section className="relative py-20 px-6">
          <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent mb-20 max-w-7xl mx-auto" />
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-3">Why CampusXchange?</h2>
              <p className="text-slate-500 font-medium max-w-xl mx-auto">Designed for college students — safe, local, and completely free.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: <ShieldCheck size={28} />, title: 'Safe & Verified', desc: 'Only verified students can join and interact on the platform.' },
                { icon: <MapPin size={28} />, title: 'Local & Fast', desc: 'Meet between classes — no shipping fees, no waiting.' },
                { icon: <RefreshCcw size={28} />, title: 'Eco-Friendly', desc: 'Give items a second life and reduce campus waste.' },
              ].map(({ icon, title, desc }) => (
                <motion.div key={title} whileHover={{ y: -6 }}
                  className="p-10 rounded-[2.5rem] border border-slate-100 bg-white hover:border-slate-300 transition-all duration-500 group cursor-default shadow-sm text-center md:text-left">
                  <div className="w-16 h-16 mx-auto md:mx-0 rounded-2xl bg-slate-50 border border-slate-100 text-slate-900 flex items-center justify-center mb-6 group-hover:bg-slate-900 group-hover:text-white transition-all duration-500 shadow-sm">
                    {icon}
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">{title}</h3>
                  <p className="text-slate-500 font-medium leading-relaxed">{desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── FOOTER ── */}
      <footer className="relative border-t border-slate-200 py-12 px-6 mt-12 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center font-black text-white text-sm">CX</div>
            <span className="text-xl font-black text-slate-900 tracking-tighter lowercase">
              campusxchange
            </span>
          </div>
          <div className="flex gap-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <a href="#" className="hover:text-slate-900 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-slate-900 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-slate-900 transition-colors">Support</a>
          </div>
          <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase">© {new Date().getFullYear()} CampusXchange. Built for students.</p>
        </div>
      </footer>
    </div>
  );
}
