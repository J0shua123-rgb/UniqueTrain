import React from 'react';
import { Plus, Minus, Check, Clock, Flame, Ban } from 'lucide-react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';
import { formatCedis } from '../utils/whatsapp';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { cart, addToCart, updateCartQuantity, logSystemError } = useStore();

  const cartItem = cart.find((item) => item.product.id === product.id);
  const quantity = cartItem ? cartItem.quantity : 0;

  return (
    <article
      id={`product-card-${product.id}`}
      className={`group relative flex flex-col bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${
        product.inStock
          ? 'border-amber-100 hover:border-amber-300 hover:shadow-md'
          : 'border-stone-200 bg-stone-50/70 opacity-80'
      }`}
    >
      {/* Product Image & Badges */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-amber-50">
        <img
          src={product.imageUrl}
          alt={product.name}
          loading="lazy"
          className={`w-full h-full object-cover transition-transform duration-300 ${
            product.inStock ? 'group-hover:scale-105' : 'grayscale-[40%]'
          }`}
          onError={(e) => {
            const failedSrc = (e.target as HTMLImageElement).src;
            // Fallback image if primary link fails
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80';
            logSystemError(
              'Image Asset',
              `Snack image failed to load for "${product.name}"`,
              'warning',
              `Failed URL: ${failedSrc}`
            );
          }}
        />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1.5 pointer-events-none">
          <div className="flex items-center gap-1.5 flex-wrap">
            {product.isPopular && product.inStock && (
              <span className="inline-flex items-center gap-1 bg-amber-600/90 backdrop-blur-xs text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                <Flame className="w-3 h-3 text-amber-200" /> Popular
              </span>
            )}
            {product.preparationTime && (
              <span className="inline-flex items-center gap-1 bg-black/60 backdrop-blur-xs text-white text-[11px] font-medium px-2 py-0.5 rounded-full">
                <Clock className="w-2.5 h-2.5 text-stone-300" /> {product.preparationTime}
              </span>
            )}
          </div>

          {!product.inStock && (
            <span className="inline-flex items-center gap-1 bg-rose-600/95 backdrop-blur-xs text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-xs">
              <Ban className="w-3 h-3" /> Sold Out
            </span>
          )}
        </div>
      </div>

      {/* Product Information */}
      <div className="p-3.5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider">
              {product.category}
            </span>
            <span
              id={`product-price-${product.id}`}
              className="text-base font-extrabold text-amber-900 font-['Outfit',sans-serif]"
            >
              {formatCedis(product.price)}
            </span>
          </div>

          <h3 className="font-bold text-stone-900 text-sm sm:text-base leading-snug line-clamp-1 group-hover:text-amber-700 transition-colors">
            {product.name}
          </h3>

          <p className="text-xs text-stone-500 mt-1 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Action Button / Stepper */}
        <div className="mt-3.5 pt-2 border-t border-stone-100">
          {!product.inStock ? (
            <button
              id={`btn-out-of-stock-${product.id}`}
              disabled
              className="w-full py-2 px-3 rounded-xl bg-stone-100 text-stone-400 text-xs font-semibold cursor-not-allowed flex items-center justify-center gap-1.5"
            >
              <Ban className="w-3.5 h-3.5" />
              <span>Temporarily Out of Stock</span>
            </button>
          ) : quantity > 0 ? (
            <div
              id={`cart-counter-${product.id}`}
              className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-xl p-1"
            >
              <button
                type="button"
                id={`btn-dec-${product.id}`}
                onClick={() => updateCartQuantity(product.id, quantity - 1)}
                className="w-8 h-8 rounded-lg bg-white border border-amber-200 text-amber-900 flex items-center justify-center hover:bg-amber-100 transition-colors shadow-2xs active:scale-95"
                title="Decrease quantity"
                aria-label="Decrease quantity"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-center gap-1 px-2 text-center">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-xs font-bold text-stone-800 font-['Outfit',sans-serif]">
                  {quantity} in cart
                </span>
              </div>

              <button
                type="button"
                id={`btn-inc-${product.id}`}
                onClick={() => addToCart(product, 1)}
                className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center hover:bg-amber-700 transition-colors shadow-2xs active:scale-95"
                title="Increase quantity"
                aria-label="Increase quantity"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              id={`btn-add-cart-${product.id}`}
              onClick={() => addToCart(product, 1)}
              className="w-full py-2.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-[0.98] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add to Cart</span>
            </button>
          )}
        </div>
      </div>
    </article>
  );
};
