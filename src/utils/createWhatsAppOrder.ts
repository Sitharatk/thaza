import type { CartItem } from "@/src/context/CartContext";

const THAZA_WHATSAPP_NUMBER = "918590702430";

export function createWhatsAppOrder(cartItems: CartItem[], total: number) {
  const itemLines = cartItems.map(({ product, quantity }) => {
    const itemTotal = product.price * quantity;
    return `• ${product.name} (${product.weight}) x${quantity} - ₹${itemTotal}`;
  });

  const message = [
    "🛍️ *New Order from Thaza*",
    "",
    "📦 *Items:*",
    "",
    ...itemLines,
    "",
    `💰 *Total Amount: ₹${total}*`,
  ].join("\n");

  return `https://wa.me/${THAZA_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}