import React from 'react';
import { Heart, ShoppingBag, Clock, Sparkles } from 'lucide-react';
import { Product } from '../types';
import { formatPKR } from '../utils/pricing';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addItem } = useCart();

  const isFavorited = isInWishlist(product.id);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem(product, 1);
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  return (
    <div
      onClick={() => onSelect(product)}
      className="group bg-white rounded-3xl overflow-hidden border border-[#F5EFEB] hover:border-[#E5C365]/50 hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer"
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-[#FAF6F0]">
        <img
          src={product.images[0] || 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=600&q=80'}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-106 transition-transform duration-500"
          loading="lazy"
        />

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistToggle}
          className={`absolute top-3.5 right-3.5 p-2 rounded-full backdrop-blur-md transition-all ${
            isFavorited
              ? 'bg-[#D4737B] text-white shadow-md'
              : 'bg-white/80 text-[#3D3336] hover:bg-white hover:text-[#D4737B]'
          }`}
          aria-label={isFavorited ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
        </button>

        {/* Badges */}
        <div className="absolute top-3.5 left-3.5 flex flex-col gap-1.5 items-start">
          {product.isReadyMade ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#FAF6F0]/90 backdrop-blur-md text-[#2D2527] border border-[#EFE7DE]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Ready to Ship
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#F9EEF0]/90 backdrop-blur-md text-[#D4737B] border border-[#F5DADB]">
              <Clock className="w-3 h-3" />
              Made to Order ({product.estimatedProductionDays}d)
            </span>
          )}

          {product.isBestSeller && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#E5C365] text-[#2D2527]">
              <Sparkles className="w-2.5 h-2.5" /> Best Seller
            </span>
          )}
        </div>

        {/* Quick Add Overlay on hover */}
        <div className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={handleQuickAdd}
            className="w-full py-2.5 px-4 rounded-2xl bg-[#2D2527]/90 hover:bg-[#2D2527] text-[#FAF6F0] text-xs font-semibold backdrop-blur-md flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-[#E5C365]" />
            <span>Add to Cart</span>
          </button>
        </div>
      </div>

      {/* Details */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Colors Swatch hint */}
          {product.colors && product.colors.length > 0 && (
            <div className="text-[10px] text-[#7D6E73] font-medium mb-1 truncate">
              {product.colors.join(' • ')}
            </div>
          )}

          <h3 className="font-serif-luxury text-base sm:text-lg font-semibold text-[#2D2527] group-hover:text-[#9A7B1C] transition-colors line-clamp-1">
            {product.name}
          </h3>

          <p className="text-xs text-[#7D6E73] line-clamp-2 mt-1">
            {product.description}
          </p>
        </div>

        <div className="pt-3 mt-2 border-t border-[#F5EFEB] flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wider text-[#7D6E73] font-medium">Price</span>
            <span className="font-serif-luxury text-lg font-bold text-[#2D2527]">
              {formatPKR(product.price)}
            </span>
          </div>

          <div className="text-right">
            {product.isReadyMade ? (
              <span className={`text-[10px] font-medium ${product.stock <= 3 ? 'text-amber-600 font-semibold' : 'text-[#7D6E73]'}`}>
                {product.stock <= 3 ? `Only ${product.stock} left!` : `${product.stock} in stock`}
              </span>
            ) : (
              <span className="text-[10px] text-[#7D6E73] font-medium">
                Est. {product.estimatedProductionDays} days
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
