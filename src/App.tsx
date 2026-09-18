import React from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Navbar } from './components/Navbar';
import { CustomerCatalog } from './components/CustomerCatalog';
import { AdminDashboard } from './components/AdminDashboard';
import { CartDrawer } from './components/CartDrawer';
import { AdminPinModal } from './components/AdminPinModal';
import { GlobalErrorBoundary } from './components/GlobalErrorBoundary';
import { Utensils, ShoppingBag, Lock, MessageCircle } from 'lucide-react';
import { cleanPhoneNumber } from './utils/whatsapp';

const MainLayout: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    cartTotalCount,
    setIsCartOpen,
    settings,
    isAdminUnlocked,
    setIsAdminPinModalOpen,
    lockAdmin,
    logSystemError,
  } = useStore();

  const handleFooterLockClick = () => {
    if (isAdminUnlocked) {
      setActiveTab('admin');
    } else {
      setIsAdminPinModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 selection:bg-amber-200">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Content Area protected by GlobalErrorBoundary */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-4 sm:py-6">
        <GlobalErrorBoundary
          onError={(error, info) => {
            logSystemError(
              'UI Error Boundary',
              error.message || 'Unhandled component render exception',
              'critical',
              info.componentStack || undefined
            );
          }}
        >
          {activeTab === 'customer' ? (
            <CustomerCatalog />
          ) : (
            <AdminDashboard />
          )}
        </GlobalErrorBoundary>
      </main>

      {/* Cart Drawer Component */}
      <CartDrawer />

      {/* Admin Security PIN Modal */}
      <AdminPinModal />

      {/* Mobile Bottom Navigation Bar (Customer view has NO admin tab) */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-20 bg-white/95 backdrop-blur-md border-t border-stone-200 py-1.5 px-6 flex items-center justify-around shadow-lg">
        {activeTab === 'admin' ? (
          /* Mobile Controls when Admin is actively unlocked */
          <>
            <button
              type="button"
              onClick={() => setActiveTab('customer')}
              className="flex flex-col items-center gap-1 text-xs font-semibold py-1 px-4 text-stone-600 hover:text-stone-900"
            >
              <Utensils className="w-5 h-5" />
              <span className="text-[10px]">View Store</span>
            </button>
            <button
              type="button"
              onClick={lockAdmin}
              className="flex flex-col items-center gap-1 text-xs font-bold py-1 px-4 text-rose-700 hover:text-rose-800"
            >
              <Lock className="w-5 h-5" />
              <span className="text-[10px]">Lock Admin</span>
            </button>
          </>
        ) : (
          /* Customer Mobile Bar: Only Menu, Direct WhatsApp, and Cart */
          <>
            <button
              type="button"
              onClick={() => setActiveTab('customer')}
              className="flex flex-col items-center gap-1 text-xs font-semibold py-1 px-4 text-amber-700"
            >
              <Utensils className="w-5 h-5" />
              <span className="text-[10px]">Snacks</span>
            </button>

            <a
              href={`https://wa.me/${cleanPhoneNumber(settings.whatsappNumber)}?text=${encodeURIComponent(
                `Hello ${settings.shopName}, I'd like to ask about available snacks today!`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-1 text-xs font-semibold py-1 px-4 text-emerald-700 hover:text-emerald-800"
            >
              <MessageCircle className="w-5 h-5" />
              <span className="text-[10px]">WhatsApp</span>
            </a>

            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="relative flex flex-col items-center gap-1 text-xs font-semibold py-1 px-4 text-stone-700 hover:text-stone-900 transition-all"
            >
              <ShoppingBag className="w-5 h-5" />
              <span className="text-[10px]">Cart</span>
              {cartTotalCount > 0 && (
                <span className="absolute top-0 right-3 bg-amber-600 text-white text-[9px] font-bold h-4 min-w-4 px-1 rounded-full flex items-center justify-center">
                  {cartTotalCount}
                </span>
              )}
            </button>
          </>
        )}
      </div>

      {/* Footer Area with Discrete Subtle Lock Icon for Staff */}
      <footer className="bg-stone-900 text-stone-300 pt-8 pb-24 sm:pb-8 px-4 text-center text-xs mt-auto border-t border-stone-800">
        <div className="max-w-md mx-auto space-y-2">
          <p className="font-semibold text-stone-100">
            {settings.shopName} • {settings.address}
          </p>
          <p className="text-stone-300 text-[11px]">
            {settings.tagline} • Order freshly baked pies, doughnuts & crunchy chips.
          </p>
          <p className="text-[10px] text-stone-400">
            Dispatched directly across Diamond-City, Happy Home & nearby areas.
          </p>

          {/* Subtle footer bottom bar with discrete lock */}
          <div className="pt-4 mt-4 border-t border-stone-800/80 flex items-center justify-between text-[11px] text-stone-400 px-2">
            <span>© 2026 UniqueTrain. All rights reserved.</span>
            
            {/* Discrete, subtle lock icon */}
            <button
              id="btn-footer-staff-lock"
              type="button"
              onClick={handleFooterLockClick}
              className="p-1.5 text-stone-500 hover:text-stone-200 transition-colors opacity-35 hover:opacity-100 rounded-md"
              title="Staff Access"
              aria-label="Staff Access"
            >
              <Lock className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <MainLayout />
    </StoreProvider>
  );
}
