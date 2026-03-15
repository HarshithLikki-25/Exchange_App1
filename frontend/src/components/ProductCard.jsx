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
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className="glass-card rounded-2xl overflow-hidden flex flex-col group relative h-full"
    >
      {/* Image Container */}
      <div className="relative h-48 sm:h-56 overflow-hidden">
        <Link to={`/product/${product.id}`}>
          <img 
            src={imgUrl} 
            alt={product.title} 
            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" 
          />
        </Link>
        
        {/* Favorite Button Overlay */}
        {user && user.id !== product.owner_id && (
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleFavorite(product.id, isFavorite);
            }}
            className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-all transform hover:scale-110 active:scale-95"
          >
            <Heart 
              size={20} 
              className={isFavorite ? "fill-red-500 text-red-500" : "text-gray-600"} 
            />
          </button>
        )}
        
        {/* Condition Badge */}
        {product.condition && (
          <div className="absolute bottom-3 left-3 px-2.5 py-1 bg-black/60 backdrop-blur-md text-white text-xs font-semibold rounded-lg">
            {product.condition}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <Link to={`/product/${product.id}`} className="hover:text-blue-600 transition-colors">
            <h3 className="font-bold text-lg text-gray-900 line-clamp-1">{product.title}</h3>
          </Link>
        </div>
        
        <p className="text-gray-500 text-sm line-clamp-2 mb-4 flex-grow">
          {product.description || "No description provided."}
        </p>

        <div className="flex items-center justify-between text-xs text-gray-400 mt-auto pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-1">
            <Tag size={14} />
            <span className="capitalize">{product.category || "Uncategorized"}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock size={14} />
            <span>{date}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
