import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { INITIAL_PRODUCTS, INITIAL_SETTINGS } from '../data/initialProducts';
import { CartItem, Product, StoreSettings, SystemErrorAlert } from '../types';

interface StoreContextType {
  products: Product[];
  cart: CartItem[];
  settings: StoreSettings;
  activeTab: 'customer' | 'admin';
  setActiveTab: (tab: 'customer' | 'admin') => void;
  isAdminUnlocked: boolean;
  unlockAdmin: (enteredPin: string) => boolean;
  lockAdmin: () => void;
  isAdminPinModalOpen: boolean;
  setIsAdminPinModalOpen: (open: boolean) => void;
  changeAdminPin: (oldPin: string, newPin: string) => { success: boolean; message: string };
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  // Product actions
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  toggleStock: (id: string) => void;
  resetProducts: () => void;
  // Cart actions
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotalCount: number;
  cartSubtotal: number;
  // Settings
  updateSettings: (newSettings: Partial<StoreSettings>) => void;
  // System Error Alert Feed
  errorAlerts: SystemErrorAlert[];
  logSystemError: (source: string, message: string, severity?: 'warning' | 'error' | 'critical', details?: string) => void;
  dismissErrorAlert: (id: string) => void;
  clearAllErrorAlerts: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const PRODUCTS_STORAGE_KEY = 'uniquetrain_snack_products_v2';
const SETTINGS_STORAGE_KEY = 'uniquetrain_snack_settings_v2';
const CART_STORAGE_KEY = 'uniquetrain_snack_cart_v2';
const ERROR_LOGS_STORAGE_KEY = 'uniquetrain_error_alerts_v1';

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(PRODUCTS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
      // Clear legacy storage keys if present
      localStorage.removeItem('eatery_snack_products_v1');
    } catch {
      // fallback to initial
    }
    return INITIAL_PRODUCTS;
  });

  const [settings, setSettings] = useState<StoreSettings>(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.shopName && parsed.shopName !== 'Golden Crust Pastry & Snacks') {
          return parsed;
        }
      }
      // Clear legacy storage keys if present
      localStorage.removeItem('eatery_snack_settings_v1');
    } catch {
      // fallback
    }
    return INITIAL_SETTINGS;
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    return [];
  });

  const [activeTab, setActiveTab] = useState<'customer' | 'admin'>('customer');
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [isAdminPinModalOpen, setIsAdminPinModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // System error alerts feed
  const [errorAlerts, setErrorAlerts] = useState<SystemErrorAlert[]>(() => {
    try {
      const saved = localStorage.getItem(ERROR_LOGS_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    return [];
  });

  const logSystemError = useCallback(
    (
      source: string,
      message: string,
      severity: 'warning' | 'error' | 'critical' = 'error',
      details?: string
    ) => {
      const timeStr = new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      setErrorAlerts((prev) => {
        // Check if an alert with identical message already exists
        const existingIndex = prev.findIndex(
          (item) => item.source === source && item.message === message
        );
        if (existingIndex >= 0) {
          const updated = [...prev];
          const item = updated[existingIndex];
          updated[existingIndex] = {
            ...item,
            timestamp: timeStr,
            count: (item.count || 1) + 1,
            details: details || item.details,
          };
          return updated;
        }

        const newAlert: SystemErrorAlert = {
          id: `err-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          timestamp: timeStr,
          source,
          message,
          severity,
          details,
          count: 1,
        };
        // Keep latest 25 alerts
        return [newAlert, ...prev].slice(0, 25);
      });
    },
    []
  );

  const dismissErrorAlert = useCallback((id: string) => {
    setErrorAlerts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const clearAllErrorAlerts = useCallback(() => {
    setErrorAlerts([]);
  }, []);

  // Save error alerts to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(ERROR_LOGS_STORAGE_KEY, JSON.stringify(errorAlerts));
    } catch {
      // ignore
    }
  }, [errorAlerts]);

  // Global browser error & unhandled rejection listener
  useEffect(() => {
    const handleGlobalError = (event: ErrorEvent) => {
      // Avoid tracking benign vite dev websocket logs
      if (event.message?.includes('vite') || event.message?.includes('websocket')) {
        return;
      }
      logSystemError(
        'Runtime Exception',
        event.message || 'An unexpected script error occurred in browser runtime',
        'error',
        event.filename ? `${event.filename}:${event.lineno}:${event.colno}` : undefined
      );
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      const msg = typeof reason === 'string' ? reason : reason?.message || 'Unhandled asynchronous Promise rejection';
      logSystemError('Async Rejection', msg, 'warning');
    };

    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [logSystemError]);

  const handleSetActiveTab = (tab: 'customer' | 'admin') => {
    if (tab === 'admin' && !isAdminUnlocked) {
      setIsAdminPinModalOpen(true);
      return;
    }
    setActiveTab(tab);
  };

  const unlockAdmin = (enteredPin: string): boolean => {
    const validPin = settings.adminPin || '1234';
    if (enteredPin.trim() === validPin.trim()) {
      setIsAdminUnlocked(true);
      setActiveTab('admin');
      setIsAdminPinModalOpen(false);
      return true;
    }
    return false;
  };

  const lockAdmin = () => {
    setIsAdminUnlocked(false);
    setActiveTab('customer');
  };

  const changeAdminPin = (oldPin: string, newPin: string): { success: boolean; message: string } => {
    const currentPin = settings.adminPin || '1234';
    if (oldPin.trim() !== currentPin.trim()) {
      return { success: false, message: 'Current PIN is incorrect.' };
    }
    if (!/^\d{4}$/.test(newPin.trim())) {
      return { success: false, message: 'New PIN must be exactly 4 numeric digits.' };
    }
    if (newPin.trim() === currentPin.trim()) {
      return { success: false, message: 'New PIN cannot be the same as current PIN.' };
    }

    setSettings((prev) => ({
      ...prev,
      adminPin: newPin.trim(),
    }));

    return { success: true, message: 'Security PIN changed successfully!' };
  };

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
    } catch {
      // ignore
    }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // ignore
    }
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // ignore
    }
  }, [cart]);

  // Product actions
  const addProduct = (newProductData: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...newProductData,
      id: `snack-${Date.now()}`,
      orderCount: newProductData.orderCount || 0,
    };
    setProducts((prev) => [newProduct, ...prev]);
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
    // Also update item details in cart if already present
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.product.id === id ? { ...item, product: { ...item.product, ...updates } } : item
      )
    );
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((item) => item.id !== id));
    setCart((prev) => prev.filter((item) => item.product.id !== id));
  };

  const toggleStock = (id: string) => {
    setProducts((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextStock = !item.inStock;
          return { ...item, inStock: nextStock };
        }
        return item;
      })
    );
  };

  const resetProducts = () => {
    setProducts(INITIAL_PRODUCTS);
    setSettings(INITIAL_SETTINGS);
    setCart([]);
  };

  // Cart actions
  const addToCart = (product: Product, quantity = 1) => {
    if (!product.inStock) return;
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const updateSettings = (newSettings: Partial<StoreSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const cartTotalCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartSubtotal = cart.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );

  return (
    <StoreContext.Provider
      value={{
        products,
        cart,
        settings,
        activeTab,
        setActiveTab: handleSetActiveTab,
        isAdminUnlocked,
        unlockAdmin,
        lockAdmin,
        isAdminPinModalOpen,
        setIsAdminPinModalOpen,
        changeAdminPin,
        isCartOpen,
        setIsCartOpen,
        addProduct,
        updateProduct,
        deleteProduct,
        toggleStock,
        resetProducts,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartTotalCount,
        cartSubtotal,
        updateSettings,
        errorAlerts,
        logSystemError,
        dismissErrorAlert,
        clearAllErrorAlerts,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
