import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Clock, Tag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ProductCard({ product, isFavorite, onToggleFavorite }) {
  const { user } = useAuth();
  
  // Format date
  const date = new Date(product.created_at).toLocaleDateString();
  
  // Fallback image
  const imgUrl = product.image_url || 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=500&q=80';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -8, scale: 1.03 }}
      transition={{ duration: 0.2, type: 'spring', stiffness: 300 }}
      className="glass-card rounded-3xl flex flex-col group relative h-full overflow-hidden border border-white/10 shadow-lg hover:shadow-slate-900/5 transition-all duration-500"
    >
      {/* Image Container */}
      <div className="relative h-48 sm:h-56 overflow-hidden rounded-t-3xl">
        <Link to={`/product/${product.id}`} className="block w-full h-full">
          <img 
            src={imgUrl} 
            alt={product.title} 
            className="w-full h-full object-cover transform group-hover:scale-110 group-hover:rotate-1 transition-all duration-700 ease-out" 
          />
          {/* Subtle light gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </Link>
        
        {/* Favorite Button Overlay */}
        {user && user.id !== product.owner_id && (
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleFavorite(product.id, isFavorite);
            }}
            className="absolute top-4 right-4 p-2.5 bg-white/60 backdrop-blur-md rounded-full shadow-lg border border-white/40 hover:bg-white/80 transition-all transform hover:scale-110 active:scale-95"
          >
            <Heart 
              size={18} 
              strokeWidth={2.5}
              className={isFavorite ? "fill-slate-900 text-slate-900" : "text-slate-600"} 
            />
          </button>
        )}
        
        {/* Condition Badge */}
        {product.condition && (
          <div className="absolute top-4 left-4 px-3 py-1 bg-white/80 backdrop-blur-md border border-white/40 text-slate-800 text-xs font-bold tracking-wider uppercase rounded-full shadow-md">
            {product.condition}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-grow bg-white/40 backdrop-blur-sm">
        <div className="flex justify-between items-start mb-3">
          <Link to={`/product/${product.id}`} className="hover:text-slate-500 transition-colors w-full">
            <h3 className="font-black text-xl text-slate-900 line-clamp-1 tracking-tight">{product.title}</h3>
          </Link>
        </div>
        
        <p className="text-slate-600 text-sm line-clamp-2 mb-6 flex-grow font-medium leading-relaxed">
          {product.description || "No description provided."}
        </p>

        <div className="flex items-center justify-between text-[10px] font-black text-slate-400 pt-4 border-t border-slate-50 uppercase tracking-widest">
          <div className="flex items-center space-x-1.5">
            <Tag size={12} className="text-slate-900" />
            <span>{product.category || "Other"}</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <Clock size={12} className="text-slate-900" />
            <span>{date}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
