import React, { useMemo, useState } from 'react';
import { Search, X, ShoppingBag, ArrowRight, Sparkles, MapPin, Phone } from 'lucide-react';
import { ProductCategory } from '../types';
import { useStore } from '../context/StoreContext';
import { ProductCard } from './ProductCard';
import { formatCedis, formatDisplayPhone } from '../utils/whatsapp';

const CATEGORIES: ProductCategory[] = [
  'All',
  'Pastries',
  'Savory Snacks',
  'Sweet Treats',
  'Drinks & Sides',
];

export const CustomerCatalog: React.FC = () => {
  const { products, cartTotalCount, cartSubtotal, setIsCartOpen, settings } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('All');

  // Filter products by search and category
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory =
        selectedCategory === 'All' || product.category === selectedCategory;
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: products.length };
    products.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, [products]);

  return (
    <div className="pb-28">
      {/* Mobile-first Header Banner */}
      <section className="bg-gradient-to-br from-amber-600 to-amber-800 text-white rounded-3xl p-5 mb-5 shadow-sm relative overflow-hidden">
        {/* Subtle decorative background circle */}
        <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-white/10 rounded-full blur-xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-1.5 text-amber-200 text-xs font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" /> Freshly Made Daily
          </div>
          <h2 className="text-xl sm:text-2xl font-black font-['Outfit',sans-serif] tracking-tight leading-tight">
            Craving Fresh Meat Pies, Doughnuts & Snacks?
          </h2>
          <p className="text-xs sm:text-sm text-amber-100 mt-1 max-w-md leading-relaxed">
            Order your favorite Ghanaian snacks and pastries right now. Instant WhatsApp order dispatch!
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t border-amber-500/50 text-[11px] text-amber-100">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-amber-300" /> {settings.address}
            </span>
            <span className="flex items-center gap-1">
              <Phone className="w-3 h-3 text-amber-300" /> WhatsApp Orders: {formatDisplayPhone(settings.whatsappNumber)}
            </span>
          </div>
        </div>
      </section>

      {/* Search Bar */}
      <div className="sticky top-[61px] z-20 bg-amber-50/90 backdrop-blur-md pt-1 pb-3">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-stone-400" />
          </div>
          <input
            id="search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search meat pie, doughnut, cookies, chips..."
            className="w-full pl-10 pr-10 py-2.5 bg-white border border-stone-200 rounded-2xl text-sm placeholder-stone-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:border-amber-500 shadow-2xs transition-all"
          />
          {searchQuery && (
            <button
              id="clear-search-btn"
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-600"
              title="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Category Pills Slider */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-3 pb-1 -mx-1 px-1">
          {CATEGORIES.map((cat) => {
            const count = categoryCounts[cat] || 0;
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                id={`cat-filter-${cat.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 active:scale-95 ${
                  isSelected
                    ? 'bg-amber-700 text-white shadow-xs'
                    : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
                }`}
              >
                <span>{cat}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isSelected
                      ? 'bg-amber-800 text-amber-200'
                      : 'bg-stone-100 text-stone-500'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Catalog List Header */}
      <div className="flex items-center justify-between mb-3 mt-2 px-1">
        <span className="text-xs font-semibold text-stone-500">
          Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'snack' : 'snacks'}
        </span>
        {selectedCategory !== 'All' && (
          <button
            type="button"
            onClick={() => setSelectedCategory('All')}
            className="text-xs text-amber-700 font-semibold hover:underline"
          >
            Reset filter
          </button>
        )}
      </div>

      {/* Product Grid */}
      {filteredProducts.length > 0 ? (
        <div
          id="product-grid"
          className="grid grid-cols-1 sm:grid-cols-2 gap-3.5"
        >
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div
          id="catalog-empty-state"
          className="text-center py-16 bg-white rounded-3xl border border-stone-200 p-6 mt-4"
        >
          <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-3 text-amber-600">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-stone-900 text-base font-['Outfit',sans-serif]">
            No snacks found
          </h3>
          <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto">
            We couldn't find anything matching "{searchQuery}". Try a different snack or clear filters.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
            }}
            className="mt-4 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold transition-colors"
          >
            View All Snacks
          </button>
        </div>
      )}

      {/* Sticky Bottom Cart Floating Bar (Mobile & Desktop) */}
      {cartTotalCount > 0 && (
        <div
          id="floating-cart-bar"
          className="fixed bottom-3 left-0 right-0 z-25 px-4 max-w-md mx-auto pointer-events-none"
        >
          <div className="pointer-events-auto bg-stone-900 text-white rounded-2xl p-3 shadow-xl border border-stone-800 flex items-center justify-between gap-3 animate-slide-up">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-stone-300 font-medium">
                    {cartTotalCount} {cartTotalCount === 1 ? 'item' : 'items'}
                  </span>
                  <span className="text-stone-500">•</span>
                  <span className="text-sm font-extrabold text-amber-400 font-['Outfit',sans-serif]">
                    {formatCedis(cartSubtotal)}
                  </span>
                </div>
                <p className="text-[11px] text-stone-400 truncate">
                  Ready to order via WhatsApp
                </p>
              </div>
            </div>

            <button
              id="btn-view-cart-bottom"
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 active:scale-95 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all shrink-0"
            >
              <span>View Cart</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
