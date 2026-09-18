import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { INITIAL_PRODUCTS, INITIAL_SETTINGS } from '../data/initialProducts';
import { CartItem, Product, StoreSettings, SystemErrorAlert } from '../types';
import { supabase } from '../lib/supabase';

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

const CART_STORAGE_KEY = 'uniquetrain_snack_cart_v2';
const ERROR_LOGS_STORAGE_KEY = 'uniquetrain_error_alerts_v1';
const SETTINGS_STORAGE_KEY = 'uniquetrain_snack_settings_v2';
const PRODUCTS_STORAGE_KEY = 'uniquetrain_snack_products_v2';

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
    } catch {
      // fallback
    }
    return INITIAL_SETTINGS;
  });

  const [isLoading, setIsLoading] = useState(true);
  const [supabaseConnected, setSupabaseConnected] = useState(false);

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

  // Fetch products from Supabase
  const fetchProducts = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .order('order_count', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        const transformedProducts: Product[] = data.map((item: any) => ({
          id: item.id,
          name: item.name,
          category: item.category,
          price: Number(item.price),
          description: item.description,
          imageUrl: item.image_url,
          inStock: item.in_stock,
          isPopular: item.is_popular,
          preparationTime: item.preparation_time,
          orderCount: item.order_count,
        }));
        setProducts(transformedProducts);
        setSupabaseConnected(true);
      } else {
        setSupabaseConnected(true);
      }
    } catch (error) {
      console.error('Error fetching products from Supabase, using localStorage:', error);
      setSupabaseConnected(false);
      // Keep using localStorage products
    }
  }, []);

  // Fetch settings from Supabase
  const fetchSettings = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('store_settings')
        .select('*')
        .eq('id', 'default')
        .single();

      if (error) throw error;

      if (data) {
        const transformedSettings: StoreSettings = {
          shopName: data.shop_name,
          tagline: data.tagline,
          whatsappNumber: data.whatsapp_number,
          address: data.address,
          openingHours: data.opening_hours,
          currencySymbol: data.currency_symbol,
          deliveryFee: Number(data.delivery_fee),
          adminPin: data.admin_pin,
        };
        setSettings(transformedSettings);
        setSupabaseConnected(true);
      }
    } catch (error) {
      console.error('Error fetching settings from Supabase, using localStorage:', error);
      setSupabaseConnected(false);
      // Keep using localStorage settings
    }
  }, []);

  // Load initial data from Supabase
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchProducts(), fetchSettings()]);
      setIsLoading(false);
    };
    loadData();
  }, [fetchProducts, fetchSettings]);

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

  // Sync products to Supabase when they change (only if connected)
  useEffect(() => {
    if (isLoading || !supabaseConnected) return;

    const syncProducts = async () => {
      try {
        // Use upsert to handle existing products (update if exists, insert if new)
        const productsToUpsert = products.map((p) => ({
          id: p.id,
          name: p.name,
          category: p.category,
          price: p.price,
          description: p.description,
          image_url: p.imageUrl,
          in_stock: p.inStock,
          is_popular: p.isPopular,
          preparation_time: p.preparationTime,
          order_count: p.orderCount || 0,
        }));

        if (productsToUpsert.length > 0) {
          const { error } = await supabase
            .from('menu_items')
            .upsert(productsToUpsert, { onConflict: 'id' });
          if (error) throw error;
        }
      } catch (error) {
        console.error('Error syncing products to Supabase:', error);
        setSupabaseConnected(false);
      }
    };

    syncProducts();
  }, [products, isLoading, supabaseConnected]);

  // Sync settings to Supabase when they change (only if connected)
  useEffect(() => {
    if (isLoading || !supabaseConnected) return;

    const syncSettings = async () => {
      try {
        const { error } = await supabase
          .from('store_settings')
          .upsert({
            id: 'default',
            shop_name: settings.shopName,
            tagline: settings.tagline,
            whatsapp_number: settings.whatsappNumber,
            address: settings.address,
            opening_hours: settings.openingHours,
            currency_symbol: settings.currencySymbol,
            delivery_fee: settings.deliveryFee,
            admin_pin: settings.adminPin,
            updated_at: new Date().toISOString(),
          });
        if (error) throw error;
      } catch (error) {
        console.error('Error syncing settings to Supabase:', error);
        setSupabaseConnected(false);
      }
    };

    syncSettings();
  }, [settings, isLoading, supabaseConnected]);

  // Always sync to localStorage as fallback
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // ignore
    }
  }, [cart]);

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

  const resetProducts = useCallback(async () => {
    try {
      if (supabaseConnected) {
        await supabase.from('menu_items').delete().neq('id', 'placeholder');
        await supabase.from('store_settings').delete().eq('id', 'default');
      }
      setProducts(INITIAL_PRODUCTS);
      setSettings(INITIAL_SETTINGS);
      setCart([]);
      if (supabaseConnected) {
        await fetchProducts();
        await fetchSettings();
      }
    } catch (error) {
      console.error('Error resetting products:', error);
    }
  }, [supabaseConnected, fetchProducts, fetchSettings]);

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
