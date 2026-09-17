import { CartItem, OrderCustomerInfo, StoreSettings } from '../types';

export function formatCedis(amount: number): string {
  return `GH₵ ${amount.toFixed(2)}`;
}

export function cleanPhoneNumber(phone: string): string {
  return phone.replace(/[^\d]/g, '');
}

export function formatDisplayPhone(phone: string): string {
  const clean = cleanPhoneNumber(phone);
  if (!clean) return phone;
  return `+${clean}`;
}

export function generateOrderText(
  items: CartItem[],
  customerInfo: OrderCustomerInfo,
  settings: StoreSettings
): string {
  const subtotal = items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const deliveryCost = customerInfo.orderType === 'delivery' ? settings.deliveryFee : 0;
  const total = subtotal + deliveryCost;

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

  const lines: string[] = [];
  lines.push(`*🔔 NEW ORDER - ${settings.shopName.toUpperCase()}*`);
  lines.push(`📍 *Location / Pickup:* ${settings.address}`);
  lines.push(`📅 *Date:* ${dateStr}`);
  lines.push(`---------------------------------`);
  lines.push(`👤 *Customer:* ${customerInfo.customerName || 'Customer'}`);
  if (customerInfo.momoReference?.trim()) {
    lines.push(`🟡 *MoMo TxID / Ref:* ${customerInfo.momoReference.trim()} (GH₵ 2.00 Confirmation Fee)`);
  }
  if (customerInfo.phone?.trim()) {
    lines.push(`📞 *Phone:* ${customerInfo.phone.trim()}`);
  }

  if (customerInfo.orderType === 'delivery') {
    lines.push(`📍 *Fulfillment:* 🚗 Local Delivery`);
    if (customerInfo.deliveryAddress) {
      lines.push(`🏠 *Delivery Address:* ${customerInfo.deliveryAddress}`);
    }
  }

  if (customerInfo.specialInstructions?.trim()) {
    lines.push(`📝 *Note / Instructions:* ${customerInfo.specialInstructions.trim()}`);
  }

  lines.push(``);
  lines.push(`*📦 ORDER ITEMS:*`);
  items.forEach((item, index) => {
    const itemTotal = item.product.price * item.quantity;
    lines.push(
      `${index + 1}. *${item.quantity}x* ${item.product.name} @ ${formatCedis(item.product.price)} = *${formatCedis(itemTotal)}*`
    );
  });

  lines.push(``);
  lines.push(`---------------------------------`);
  lines.push(`*Total Order Amount: ${formatCedis(total)}*`);
  if (customerInfo.momoReference?.trim()) {
    lines.push(`*MoMo Confirmation Fee Paid:* GH₵ 2.00`);
    lines.push(`*TxID / SMS Reference:* ${customerInfo.momoReference.trim()}`);
  }
  lines.push(`---------------------------------`);
  lines.push(`_Thank you for ordering with ${settings.shopName}! Store owner: please verify this MoMo TxID before preparation & delivery._`);

  return lines.join('\n');
}

export function generateWhatsAppUrl(
  items: CartItem[],
  customerInfo: OrderCustomerInfo,
  settings: StoreSettings
): string {
  const text = generateOrderText(items, customerInfo, settings);
  const rawPhone = cleanPhoneNumber(settings.whatsappNumber);
  return `https://wa.me/${rawPhone}?text=${encodeURIComponent(text)}`;
}
