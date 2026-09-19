import React from 'react';
import { ShoppingBag, UtensilsCrossed, Sparkles, Lock, ArrowLeft } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const Navbar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    cartTotalCount,
    setIsCartOpen,
    settings,
    lockAdmin,
    errorAlerts,
  } = useStore();

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-amber-100 shadow-xs">
      <div className="max-w-4xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          {/* Brand Logo & Name */}
          <div
            id="brand-header"
            onClick={() => setActiveTab('customer')}
            className="flex items-center gap-2.5 cursor-pointer select-none"
          >
            <img
              src="/logo.png"
              alt="UniqueTrain Logo"
              className="w-10 h-10 rounded-xl object-contain shadow-sm"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
                (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
              }}
            />
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white shadow-sm shadow-amber-200 hidden">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-bold text-base sm:text-lg text-stone-900 tracking-tight leading-none font-['Outfit',sans-serif]">
                  {settings.shopName}
                </h1>
                <span className="hidden sm:inline-flex items-center gap-0.5 text-[10px] font-semibold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full">
                  <Sparkles className="w-2.5 h-2.5" /> Fresh
                </span>
              </div>
              <p className="text-xs text-stone-500 hidden sm:block truncate max-w-xs">
                {settings.tagline}
              </p>
            </div>
          </div>

          {/* Action buttons (Clean public view vs Admin view) */}
          <div className="flex items-center gap-2">
            {activeTab === 'admin' ? (
              <div className="flex items-center gap-2">
                {errorAlerts && errorAlerts.length > 0 && (
                  <span
                    id="nav-admin-warning-badge"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-100 text-rose-800 border border-rose-200 text-xs font-bold animate-pulse"
                    title={`${errorAlerts.length} System Alerts active`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                    {errorAlerts.length} Alerts
                  </span>
                )}
                <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-100/70 border border-amber-300/60 text-amber-900 text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Admin Active
                </span>
                <button
                  id="btn-lock-exit-admin"
                  type="button"
                  onClick={lockAdmin}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-300 transition-colors shadow-2xs"
                >
                  <Lock className="w-3.5 h-3.5 text-stone-500" />
                  <span>Lock & Exit</span>
                </button>
              </div>
            ) : (
              /* Customer View - Only the Shopping Cart */
              <button
                id="nav-cart-button"
                type="button"
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 sm:px-3.5 sm:py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-xs"
                title="Open Cart"
                aria-label="Open Cart"
              >
                <ShoppingBag className="w-4 h-4" />
                <span className="hidden sm:inline">Order Cart</span>
                {cartTotalCount > 0 && (
                  <span
                    id="nav-cart-badge"
                    className="bg-white text-amber-900 text-[10px] font-black h-5 min-w-5 px-1.5 rounded-full flex items-center justify-center shadow-xs"
                  >
                    {cartTotalCount}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
