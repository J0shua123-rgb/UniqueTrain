import React, { useState } from 'react';
import {
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  Copy,
  Check,
  Eye,
  MessageSquare,
  AlertCircle,
  Smartphone,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { OrderCustomerInfo } from '../types';
import { formatCedis, formatDisplayPhone, generateOrderText, generateWhatsAppUrl } from '../utils/whatsapp';
import { supabase } from '../lib/supabase';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    cartSubtotal,
    settings,
  } = useStore();

  const [customerInfo, setCustomerInfo] = useState<OrderCustomerInfo>({
    customerName: '',
    momoReference: '',
  });

  const [showPreview, setShowPreview] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedMomo, setCopiedMomo] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isCartOpen) return null;

  const grandTotal = cartSubtotal;

  const handleCopyMomoNumber = async () => {
    try {
      await navigator.clipboard.writeText('0557448975');
      setCopiedMomo(true);
      setTimeout(() => setCopiedMomo(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleCheckoutWhatsApp = async () => {
    if (cart.length === 0) return;

    if (!customerInfo.customerName.trim()) {
      setValidationError('Please enter your name so the eatery knows who to prepare this order for.');
      return;
    }

    if (!customerInfo.momoReference?.trim()) {
      setValidationError('Please enter your MoMo Reference or Transaction ID to confirm your GH₵ 2 payment.');
      return;
    }

    setValidationError(null);
    setSuccessMessage(null);

    // Open WhatsApp first with current cart data
    const waUrl = generateWhatsAppUrl(cart, customerInfo, settings);
    window.open(waUrl, '_blank', 'noopener,noreferrer');

    // Save order to Supabase
    try {
      const orderItems = cart.map(({ product, quantity }) => ({
        productId: product.id,
        productName: product.name,
        quantity,
        price: product.price,
      }));

      const orderData = {
        customer_name: customerInfo.customerName,
        momo_reference: customerInfo.momoReference,
        phone: customerInfo.phone || null,
        order_type: customerInfo.orderType || 'pickup',
        delivery_address: customerInfo.deliveryAddress || null,
        special_instructions: customerInfo.specialInstructions || null,
        total_amount: cartSubtotal,
        items: orderItems,
        status: 'pending',
      };

      console.log('📦 Attempting to save order to Supabase:', orderData);

      const { data, error } = await supabase.from('orders').insert(orderData).select();

      if (error) {
        console.error('❌ Supabase insert error:', error);
        console.error('Error details:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        });
        alert(`Failed to save order to database: ${error.message}. Your WhatsApp order has been sent.`);
      } else {
        console.log('✅ Order saved successfully to Supabase:', data);
        
        // Clear cart and show success message after successful save
        clearCart();
        setCustomerInfo({
          customerName: '',
          momoReference: '',
          phone: '',
          orderType: 'pickup',
          deliveryAddress: '',
          specialInstructions: '',
        });
        setSuccessMessage('Order placed successfully! Thank you for your order.');
        
        // Close cart drawer after 3 seconds
        setTimeout(() => {
          setIsCartOpen(false);
          setSuccessMessage(null);
        }, 3000);
      }
    } catch (error) {
      console.error('❌ Unexpected error saving order:', error);
      alert('An unexpected error occurred while saving your order. Your WhatsApp order has been sent.');
    }
  };

  const handleCopyOrderText = async () => {
    const text = generateOrderText(cart, customerInfo, settings);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div
      id="cart-drawer-backdrop"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end transition-opacity duration-300 animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) setIsCartOpen(false);
      }}
    >
      <div
        id="cart-drawer-sheet"
        className="w-full max-w-lg bg-white h-full flex flex-col shadow-2xl overflow-hidden animate-slide-left"
      >
        {/* Drawer Header */}
        <div className="p-4 border-b border-stone-200 bg-amber-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-600 flex items-center justify-center text-white">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-base text-stone-900 font-['Outfit',sans-serif]">
                Your Snack Cart
              </h2>
              <p className="text-xs text-stone-500">
                {cart.length} {cart.length === 1 ? 'snack item' : 'snack items'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {cart.length > 0 && (
              <button
                type="button"
                onClick={clearCart}
                className="text-xs text-stone-500 hover:text-rose-600 px-2 py-1 rounded-md transition-colors"
              >
                Clear
              </button>
            )}
            <button
              id="btn-close-cart"
              type="button"
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 rounded-lg text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition-colors"
              title="Close Cart"
              aria-label="Close Cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Drawer Body: Cart Items & Checkout Form */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {cart.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-3 text-amber-600">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-stone-900 text-lg font-['Outfit',sans-serif]">
                Your cart is empty
              </h3>
              <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto">
                Explore our fresh meat pies, doughnuts, cookies, and crunchy chips to build your order!
              </p>
              <button
                type="button"
                onClick={() => setIsCartOpen(false)}
                className="mt-5 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
              >
                Browse Menu
              </button>
            </div>
          ) : (
            <>
              {/* Item List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                  Selected Items
                </h4>
                {cart.map(({ product, quantity }) => {
                  const lineTotal = product.price * quantity;
                  return (
                    <div
                      key={product.id}
                      id={`cart-item-${product.id}`}
                      className="flex items-center gap-3 p-2.5 rounded-xl border border-stone-200 bg-white hover:border-amber-200 transition-colors"
                    >
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-14 h-14 rounded-lg object-cover bg-amber-50 shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80';
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <h5 className="font-semibold text-stone-900 text-xs sm:text-sm truncate">
                          {product.name}
                        </h5>
                        <p className="text-[11px] text-amber-700 font-medium font-['Outfit',sans-serif]">
                          {formatCedis(product.price)} each
                        </p>
                        <p className="text-xs font-bold text-stone-900 font-['Outfit',sans-serif]">
                          Total: {formatCedis(lineTotal)}
                        </p>
                      </div>

                      {/* Quantity Stepper */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(product.id, quantity - 1)}
                          className="w-7 h-7 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center transition-colors"
                          title="Decrease"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-bold text-stone-900 font-['Outfit',sans-serif]">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(product.id, quantity + 1)}
                          className="w-7 h-7 rounded-lg bg-amber-600 hover:bg-amber-700 text-white flex items-center justify-center transition-colors shadow-2xs"
                          title="Increase"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeFromCart(product.id)}
                          className="ml-1 text-stone-400 hover:text-rose-600 p-1 transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* MoMo Order Commitment Fee Notice */}
              <div className="bg-gradient-to-br from-amber-500/15 to-amber-500/5 border border-amber-300 rounded-2xl p-3.5 space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-amber-500 text-stone-900 flex items-center justify-center font-black text-xs shadow-2xs">
                      GH₵
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-stone-900">
                        GH₵ 2.00 Order Confirmation Fee
                      </h4>
                      <p className="text-[11px] text-stone-600">
                        Commitment fee sent to shop before food preparation
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-500 text-stone-900 tracking-wide shrink-0">
                    MTN MoMo
                  </span>
                </div>

                <div className="bg-white rounded-xl p-2.5 border border-amber-200 flex items-center justify-between gap-2 shadow-2xs">
                  <div className="min-w-0">
                    <span className="text-[10px] text-stone-500 block font-medium">Send GH₵ 2.00 to Shop MoMo:</span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-mono font-extrabold text-stone-900 text-sm tracking-wider">0557448975</span>
                      <span className="text-[10px] text-stone-500 font-medium">(Joshua Tettey Wayo)</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyMomoNumber}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 font-semibold text-[11px] transition-colors shrink-0 shadow-2xs"
                    title="Copy MoMo Number"
                  >
                    {copiedMomo ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-700" />
                        <span className="text-emerald-800">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-amber-800" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>

                <p className="text-[10px] text-stone-500 leading-tight">
                  💡 Send the GH₵ 2 via Mobile Money, then enter your <strong>MoMo Reference / Transaction ID</strong> below so we can verify your payment immediately.
                </p>
              </div>

              {/* Customer Info Form */}
              <div className="space-y-3 pt-1">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label htmlFor="input-customer-name" className="block text-xs font-bold text-stone-700">
                      Your Name <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[10px] text-stone-400">Order recipient</span>
                  </div>
                  <input
                    id="input-customer-name"
                    type="text"
                    required
                    value={customerInfo.customerName}
                    onChange={(e) => {
                      setValidationError(null);
                      setSuccessMessage(null);
                      setCustomerInfo((prev) => ({ ...prev, customerName: e.target.value }));
                    }}
                    placeholder="Enter your full name (e.g. Kwame Mensah)"
                    className="w-full px-3.5 py-2.5 text-xs bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden font-medium placeholder:text-stone-400 shadow-2xs"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label htmlFor="input-momo-reference" className="block text-xs font-bold text-stone-700">
                      MoMo Reference / Transaction ID <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[10px] text-amber-700 font-semibold">Required for GH₵ 2 verification</span>
                  </div>
                  <input
                    id="input-momo-reference"
                    type="text"
                    required
                    value={customerInfo.momoReference || ''}
                    onChange={(e) => {
                      setValidationError(null);
                      setSuccessMessage(null);
                      setCustomerInfo((prev) => ({ ...prev, momoReference: e.target.value }));
                    }}
                    placeholder="Enter MoMo TxID (e.g. 29384729104 or SMS Ref)"
                    className="w-full px-3.5 py-2.5 text-xs bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden font-medium placeholder:text-stone-400 shadow-2xs"
                  />
                  <p className="text-[10px] text-stone-400 mt-1">
                    Found in your MTN / MoMo confirmation SMS message.
                  </p>
                </div>
              </div>

              {/* Error Message */}
              {validationError && (
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{validationError}</span>
                </div>
              )}

              {/* Success Message */}
              {successMessage && (
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs">
                  <Check className="w-4 h-4 shrink-0 text-emerald-500" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* WhatsApp Message Preview Toggle */}
              <div className="pt-2 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setShowPreview(!showPreview)}
                  className="w-full flex items-center justify-between text-xs text-stone-600 hover:text-stone-900 py-1"
                >
                  <span className="flex items-center gap-1.5 font-medium">
                    <Eye className="w-3.5 h-3.5 text-amber-700" />
                    {showPreview ? 'Hide WhatsApp Message Preview' : 'Preview WhatsApp Message Text'}
                  </span>
                  <span className="text-[11px] text-amber-700 font-semibold">
                    {showPreview ? '▲' : '▼'}
                  </span>
                </button>

                {showPreview && (
                  <div className="mt-2 p-3 bg-stone-900 text-emerald-400 font-mono text-[11px] rounded-xl whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto border border-stone-800">
                    {generateOrderText(cart, customerInfo, settings)}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Drawer Footer: Pricing Breakdown & Checkout Button */}
        {cart.length > 0 && (
          <div className="p-4 border-t border-stone-200 bg-amber-50/40 space-y-3">
            {/* Price lines */}
            <div className="space-y-1.5 text-xs text-stone-600">
              <div className="flex justify-between text-sm font-extrabold text-stone-900 pt-0.5">
                <span>Total Order Value</span>
                <span className="text-amber-800 font-['Outfit',sans-serif]">
                  {formatCedis(grandTotal)}
                </span>
              </div>
              <div className="flex justify-between text-[11px] text-amber-800 font-semibold bg-amber-100/60 px-2.5 py-1.5 rounded-lg border border-amber-200">
                <span>MoMo Confirmation Fee:</span>
                <span>GH₵ 2.00 (Sent to 0557448975)</span>
              </div>
            </div>

            {/* Main Action Buttons */}
            <div className="space-y-2">
              <button
                id="btn-checkout-whatsapp"
                type="button"
                onClick={handleCheckoutWhatsApp}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <MessageSquare className="w-4 h-4 fill-white" />
                <span>Order via WhatsApp ({formatCedis(grandTotal)})</span>
              </button>

              <button
                type="button"
                onClick={handleCopyOrderText}
                className="w-full py-2 px-3 rounded-xl bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700 font-bold">Order Text Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-stone-500" />
                    <span>Copy Order Text to Clipboard</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-[10px] text-center text-stone-500">
              Directly contacts <span className="font-semibold">{settings.shopName}</span> on {formatDisplayPhone(settings.whatsappNumber)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
