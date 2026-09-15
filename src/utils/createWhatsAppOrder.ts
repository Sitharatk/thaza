import type { CartItem } from "@/src/context/CartContext";

const THAZA_WHATSAPP_NUMBER = "918590702430";

export type CustomerDetails = {
  fullName: string;
  phoneNumber: string;
  deliveryAddress: string;
  landmark: string;
  city: string;
  pincode: string;
};

export function createWhatsAppOrder(
  customer: CustomerDetails,
  cartItems: CartItem[],
  subtotal: number,
  deliveryCharge: number,
  grandTotal: number,
  paymentMethod: string,
) {
  const itemLines = cartItems.map(({ product, quantity }) => {
    const itemTotal = product.price * quantity;
    return `• ${product.name} (${product.weight}) x${quantity} - ₹${itemTotal}`;
  });

  const message = [
    "🛍️ *New Order from Thaza*",
    "",
    "👤 *Customer Details*",
    "",
    `Name: ${customer.fullName}`,
    `Phone: ${customer.phoneNumber}`,
    "",
    "📍 *Delivery Address*",
    "",
    customer.deliveryAddress,
    customer.landmark,
    customer.city,
    `Kerala - ${customer.pincode}`,
    "",
    "📦 *Items:*",
    "",
    ...itemLines,
    "",
    "💵 *Order Summary*",
    "",
    `Subtotal: ₹${subtotal}`,
    `Delivery Charge: ₹${deliveryCharge}`,
    `Grand Total: ₹${grandTotal}`,
    "",
    "💳 *Payment Method*",
    "",
    paymentMethod,
  ].join("\n");

  return `https://wa.me/${THAZA_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}