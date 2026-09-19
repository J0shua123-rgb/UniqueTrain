export type ProductCategory = 'All' | 'Pastries' | 'Savory Snacks' | 'Sweet Treats' | 'Drinks & Sides';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  price: number; // in Ghana Cedis (GH₵)
  description: string;
  imageUrl: string;
  inStock: boolean;
  isPopular?: boolean;
  preparationTime?: string; // e.g. "10 mins" or "Ready"
  orderCount?: number; // for popularity metrics
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface StoreSettings {
  shopName: string;
  tagline: string;
  whatsappNumber: string; // e.g., "233551234567" (country code without + for wa.me)
  address: string;
  openingHours: string;
  currencySymbol: string; // "GH₵"
  deliveryFee: number; // in GH₵
  adminPin?: string; // 4-digit PIN for admin dashboard access
}

export interface OrderCustomerInfo {
  customerName: string;
  momoReference?: string;
  phone?: string;
  orderType?: 'pickup' | 'delivery';
  deliveryAddress?: string;
  specialInstructions?: string;
}

export type ErrorSeverity = 'warning' | 'error' | 'critical';

export interface SystemErrorAlert {
  id: string;
  timestamp: string;
  source: string; // e.g., 'Image Asset', 'Component Boundary', 'Order Dispatch', 'Store Engine'
  message: string;
  severity: ErrorSeverity;
  details?: string;
  count?: number;
}

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  customer_name: string;
  momo_reference: string;
  phone?: string;
  order_type: 'pickup' | 'delivery';
  delivery_address?: string;
  special_instructions?: string;
  total_amount: number;
  items: OrderItem[];
  status: OrderStatus;
  created_at: string;
  updated_at: string;
}
