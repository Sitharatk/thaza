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

export type OrderMessageData = {
  orderNumber: string;
  customer: CustomerDetails;
  cartItems: CartItem[];
  subtotal: number;
  deliveryCharge: number;
  grandTotal: number;
  paymentMethod: string;
};

function createOrderMessage({ orderNumber, customer, cartItems, subtotal, deliveryCharge, grandTotal, paymentMethod }: OrderMessageData, heading: string) {
  const itemLines = cartItems.map(({ product, quantity }) => {
    const itemTotal = product.price * quantity;
    return `• ${product.name} (${product.weight}) x${quantity} - ₹${itemTotal}`;
  });

  return [
    heading,
    "",
    `*Order ID:* ${orderNumber}`,
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
    "📦 *Items*",
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
}

export function createAdminOrderMessage(data: OrderMessageData) {
  return createOrderMessage(data, "✅ *New Order from Thaza*");
}

export function createCustomerOrderMessage(data: OrderMessageData) {
  return createOrderMessage(data, "✅ *Order Confirmation from Thaza*");
}

export function createWhatsAppOrder(
  customer: CustomerDetails,
  cartItems: CartItem[],
  subtotal: number,
  deliveryCharge: number,
  grandTotal: number,
  paymentMethod: string,
  orderNumber: string,
) {
  const message = createAdminOrderMessage({ orderNumber, customer, cartItems, subtotal, deliveryCharge, grandTotal, paymentMethod });

  return `https://wa.me/${THAZA_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}