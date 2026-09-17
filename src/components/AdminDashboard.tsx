import React, { useMemo, useState } from 'react';
import {
  Plus,
  Settings,
  RotateCcw,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Package,
  TrendingUp,
  Search,
  Sparkles,
  Flame,
  PhoneCall,
  DollarSign,
  MapPin,
  ExternalLink,
  Lock,
  AlertTriangle,
  KeyRound,
  ShieldAlert,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Product } from '../types';
import { ProductModal } from './ProductModal';
import { SettingsModal } from './SettingsModal';
import { PinChangeCard } from './PinChangeCard';
import { ErrorAlertFeed } from './ErrorAlertFeed';
import { cleanPhoneNumber, formatCedis, formatDisplayPhone } from '../utils/whatsapp';

export const AdminDashboard: React.FC = () => {
  const {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    toggleStock,
    resetProducts,
    settings,
    lockAdmin,
    errorAlerts,
  } = useStore();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [stockFilter, setStockFilter] = useState<'all' | 'in_stock' | 'out_of_stock'>('all');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [activeAdminSubTab, setActiveAdminSubTab] = useState<'catalog' | 'security' | 'alerts'>('catalog');

  // Metrics calculations
  const totalItems = products.length;
  const inStockCount = products.filter((p) => p.inStock).length;
  const outOfStockCount = products.filter((p) => !p.inStock).length;

  const popularProducts = useMemo(() => {
    return [...products]
      .sort((a, b) => (b.orderCount || 0) - (a.orderCount || 0))
      .slice(0, 4);
  }, [products]);

  const avgPrice = useMemo(() => {
    if (products.length === 0) return 0;
    const sum = products.reduce((acc, p) => acc + p.price, 0);
    return sum / products.length;
  }, [products]);

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        !searchQuery.trim() ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStock =
        stockFilter === 'all'
          ? true
          : stockFilter === 'in_stock'
          ? product.inStock
          : !product.inStock;

      return matchesSearch && matchesStock;
    });
  }, [products, searchQuery, stockFilter]);

  const handleSaveProduct = (productData: Omit<Product, 'id'>) => {
    if (editingProduct) {
      updateProduct(editingProduct.id, productData);
      setEditingProduct(null);
    } else {
      addProduct(productData);
    }
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 sm:p-5 rounded-3xl border border-stone-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="font-extrabold text-lg sm:text-xl text-stone-900 font-['Outfit',sans-serif]">
              Owner Management Dashboard
            </h2>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Manage your snack catalog, adjust Cedis prices, toggle stock, and receive WhatsApp orders.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            id="btn-admin-lock-exit"
            type="button"
            onClick={lockAdmin}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-stone-200 hover:bg-stone-100 text-stone-700 text-xs font-semibold transition-colors"
            title="Lock Dashboard & Return to Store"
          >
            <Lock className="w-3.5 h-3.5 text-stone-500" />
            <span>Lock & Exit</span>
          </button>

          <button
            id="btn-admin-settings"
            type="button"
            onClick={() => setIsSettingsModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-semibold transition-colors"
          >
            <Settings className="w-3.5 h-3.5 text-stone-500" />
            <span>Store Info</span>
          </button>

          <button
            id="btn-admin-add-product"
            type="button"
            onClick={() => {
              setEditingProduct(null);
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-95 text-white text-xs font-bold transition-all shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Snack</span>
          </button>
        </div>
      </div>

      {/* Active Store & WhatsApp Configuration Summary */}
      <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
          <div className="flex items-center gap-1.5 font-bold text-amber-950">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Store: {settings.shopName}</span>
          </div>
          <div className="flex items-center gap-1 text-stone-700">
            <MapPin className="w-3.5 h-3.5 text-amber-700 shrink-0" />
            <span>Pickup: <strong className="font-semibold text-stone-900">{settings.address}</strong></span>
          </div>
          <div className="flex items-center gap-1 text-stone-700">
            <PhoneCall className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>WhatsApp Orders: <strong className="font-semibold text-stone-900">{formatDisplayPhone(settings.whatsappNumber)}</strong></span>
          </div>
        </div>

        <a
          href={`https://wa.me/${cleanPhoneNumber(settings.whatsappNumber)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-semibold underline underline-offset-2 shrink-0 self-start sm:self-auto"
        >
          <span>Test WhatsApp link</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Basic Metrics Cards */}
      <div id="admin-metrics-grid" className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Metric: Total Snacks */}
        <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold">Total Menu Snacks</span>
            <Package className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-stone-900 font-['Outfit',sans-serif]">
            {totalItems}
          </div>
          <p className="text-[11px] text-stone-400 mt-0.5">
            Across 4 categories
          </p>
        </div>

        {/* Metric: In Stock */}
        <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold">In Stock</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600 font-['Outfit',sans-serif]">
            {inStockCount}
          </div>
          <p className="text-[11px] text-emerald-700/80 mt-0.5">
            Ready for customer orders
          </p>
        </div>

        {/* Metric: Out of Stock */}
        <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold">Out of Stock</span>
            <XCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-rose-600 font-['Outfit',sans-serif]">
            {outOfStockCount}
          </div>
          <p className="text-[11px] text-rose-600/80 mt-0.5">
            {outOfStockCount > 0 ? 'Needs baking / restock' : 'All snacks in stock!'}
          </p>
        </div>

        {/* Metric: Average Snack Price */}
        <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold">Average Price</span>
            <DollarSign className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-900 font-['Outfit',sans-serif]">
            {formatCedis(avgPrice)}
          </div>
          <p className="text-[11px] text-stone-400 mt-0.5">
            Ghana Cedis (GH₵)
          </p>
        </div>
      </div>

      {/* Popular Products Showcase Card */}
      <div className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-5 shadow-2xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-stone-900 font-['Outfit',sans-serif]">
                Top Popular Snacks (Most Ordered)
              </h3>
              <p className="text-[11px] text-stone-500">
                Customer favorites driving high sales
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {popularProducts.map((p, index) => (
            <div
              key={p.id}
              className="flex items-center gap-2.5 p-2 rounded-xl bg-amber-50/50 border border-amber-100"
            >
              <span className="w-5 h-5 rounded-full bg-amber-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                {index + 1}
              </span>
              <img
                src={p.imageUrl}
                alt={p.name}
                className="w-10 h-10 rounded-lg object-cover bg-amber-100 shrink-0"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80';
                }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-stone-900 truncate">
                  {p.name}
                </p>
                <div className="flex items-center gap-2 text-[11px]">
                  <span className="text-amber-800 font-semibold font-['Outfit',sans-serif]">
                    {formatCedis(p.price)}
                  </span>
                  <span className="text-stone-400">•</span>
                  <span className="text-stone-500">
                    {p.orderCount || 0} ordered
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Admin Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveAdminSubTab('catalog')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeAdminSubTab === 'catalog'
              ? 'bg-stone-900 text-white shadow-xs'
              : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          <Package className="w-3.5 h-3.5" />
          <span>Snack Catalog ({products.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveAdminSubTab('security')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeAdminSubTab === 'security'
              ? 'bg-stone-900 text-white shadow-xs'
              : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          <KeyRound className="w-3.5 h-3.5" />
          <span>Security PIN</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveAdminSubTab('alerts')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeAdminSubTab === 'alerts'
              ? 'bg-stone-900 text-white shadow-xs'
              : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>System Alerts</span>
          {errorAlerts.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-rose-500 text-white">
              {errorAlerts.length}
            </span>
          )}
        </button>
      </div>

      {/* Sub-Tab: Security PIN Management */}
      {activeAdminSubTab === 'security' && (
        <div className="space-y-4">
          <PinChangeCard />
        </div>
      )}

      {/* Sub-Tab: System Alerts & Error Log Feed */}
      {activeAdminSubTab === 'alerts' && (
        <div className="space-y-4">
          <ErrorAlertFeed />
        </div>
      )}

      {/* Sub-Tab: Main Catalog Management */}
      {activeAdminSubTab === 'catalog' && (
        <>
          {/* Always display PinChangeCard and ErrorAlertFeed when active */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <PinChangeCard />
            <ErrorAlertFeed />
          </div>

          {/* Product Management Section */}
          <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
        {/* Controls Bar: Search & Status Filter */}
        <div className="p-4 border-b border-stone-200 bg-stone-50/60 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="w-full sm:w-72 relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            <input
              id="admin-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products by name or category..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto justify-between sm:justify-end">
            <div className="flex items-center bg-stone-200/70 p-0.5 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setStockFilter('all')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  stockFilter === 'all'
                    ? 'bg-white text-stone-900 shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                All ({products.length})
              </button>
              <button
                type="button"
                onClick={() => setStockFilter('in_stock')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  stockFilter === 'in_stock'
                    ? 'bg-white text-emerald-700 shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                In Stock ({inStockCount})
              </button>
              <button
                type="button"
                onClick={() => setStockFilter('out_of_stock')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  stockFilter === 'out_of_stock'
                    ? 'bg-white text-rose-700 shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Sold Out ({outOfStockCount})
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                if (window.confirm('Reset catalog to sample Ghanaian snacks and pastries?')) {
                  resetProducts();
                }
              }}
              className="p-1.5 text-stone-400 hover:text-amber-800 hover:bg-stone-100 rounded-lg transition-colors shrink-0"
              title="Reset to default snack catalog"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Product Items List */}
        <div className="divide-y divide-stone-100">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12 px-4">
              <p className="text-xs text-stone-500">
                No products match your filter criteria.
              </p>
            </div>
          ) : (
            filteredProducts.map((product) => (
              <div
                key={product.id}
                id={`admin-product-row-${product.id}`}
                className={`p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                  product.inStock ? 'hover:bg-amber-50/30' : 'bg-stone-50/70'
                }`}
              >
                {/* Left: Image, Name, Category & Price */}
                <div className="flex items-center gap-3">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-14 h-14 rounded-xl object-cover bg-amber-50 shrink-0 border border-stone-200"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80';
                    }}
                  />

                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="font-bold text-sm text-stone-900 font-['Outfit',sans-serif]">
                        {product.name}
                      </h4>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
                        {product.category}
                      </span>
                      {product.isPopular && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-full">
                          <Flame className="w-2.5 h-2.5" /> Popular
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-stone-500 line-clamp-1 mt-0.5">
                      {product.description}
                    </p>

                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-black text-amber-900 font-['Outfit',sans-serif]">
                        {formatCedis(product.price)}
                      </span>
                      <span className="text-stone-300">•</span>
                      <span className="text-[11px] text-stone-500">
                        Prep: {product.preparationTime || 'Ready'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Instant Stock Toggle Switch & Action Buttons */}
                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                  {/* Stock Toggle Switch */}
                  <div className="flex items-center gap-2">
                    <button
                      id={`toggle-stock-${product.id}`}
                      type="button"
                      onClick={() => toggleStock(product.id)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                        product.inStock ? 'bg-emerald-600' : 'bg-stone-300'
                      }`}
                      role="switch"
                      aria-checked={product.inStock}
                      title={product.inStock ? 'Mark as Out of Stock' : 'Mark as In Stock'}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                          product.inStock ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>

                    <span
                      className={`text-xs font-bold min-w-20 ${
                        product.inStock ? 'text-emerald-700' : 'text-rose-600'
                      }`}
                    >
                      {product.inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>

                  {/* Edit & Delete Buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      id={`btn-edit-product-${product.id}`}
                      type="button"
                      onClick={() => {
                        setEditingProduct(product);
                        setIsAddModalOpen(true);
                      }}
                      className="p-2 text-stone-600 hover:text-amber-800 hover:bg-amber-50 rounded-xl transition-colors"
                      title="Edit Price & Details"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    {deleteConfirmId === product.id ? (
                      <div className="flex items-center gap-1 bg-rose-50 p-1 rounded-xl border border-rose-200">
                        <button
                          type="button"
                          onClick={() => {
                            deleteProduct(product.id);
                            setDeleteConfirmId(null);
                          }}
                          className="px-2 py-1 bg-rose-600 text-white text-[10px] font-bold rounded-lg"
                        >
                          Confirm
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(null)}
                          className="px-1.5 py-1 text-stone-600 text-[10px] rounded-lg"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        id={`btn-delete-product-${product.id}`}
                        type="button"
                        onClick={() => setDeleteConfirmId(product.id)}
                        className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                        title="Delete Product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  )}

  {/* Add / Edit Modal */}
      <ProductModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingProduct(null);
        }}
        onSave={handleSaveProduct}
        initialProduct={editingProduct}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />
    </div>
  );
};
