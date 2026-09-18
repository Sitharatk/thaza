export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  phone: string;
  address: string;
  landmark: string | null;
  city: string;
  pincode: string;
  subtotal: number;
  delivery_charge: number;
  grand_total: number;
  payment_method: string;
  status: string;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  weight: string;
  price: number;
  quantity: number;
  line_total: number;
  created_at: string;
}

export interface CreateOrderItemRequest {
  productId: string;
  quantity: number;
}

export interface CreateOrderRequest {
  expectedSubtotal: number;
  customer: {
    fullName: string;
    phoneNumber: string;
    deliveryAddress: string;
    landmark?: string;
    city: string;
    pincode: string;
  };
  items: CreateOrderItemRequest[];
  paymentMethod: string;
}

export interface CreateOrderResponse {
  id: string;
  orderNumber: string;
  items: { product: import("@/types/product").Product; quantity: number }[];
  subtotal: number;
  deliveryCharge: number;
  grandTotal: number;
}
