import { NextResponse } from "next/server";
import { getProducts } from "@/src/lib/products";
import { getSupabaseClient } from "@/src/lib/supabase";
import type { CreateOrderRequest, CreateOrderResponse } from "@/src/types/order";

const deliveryCharge = 40;
const paymentMethod = "Cash on Delivery";

type JsonRecord = Record<string, unknown>;

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requiredString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0;
}

function isCreateOrderRequest(value: unknown): value is CreateOrderRequest {
  if (!isRecord(value) || !isRecord(value.customer) || !Array.isArray(value.items)) return false;

  const customer = value.customer;
  const validCustomer = [customer.fullName, customer.phoneNumber, customer.deliveryAddress, customer.city, customer.pincode].every(requiredString);
  const validItems = value.items.length > 0 && value.items.every((item) => isRecord(item) && requiredString(item.productId) && typeof item.quantity === "number" && Number.isInteger(item.quantity) && item.quantity > 0 && item.quantity <= 100);

  return validCustomer && validItems && value.paymentMethod === paymentMethod && typeof value.expectedSubtotal === "number" && Number.isFinite(value.expectedSubtotal) && value.expectedSubtotal >= 0;
}

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();

    if (!isCreateOrderRequest(body)) {
      return NextResponse.json({ error: "Please provide valid order details." }, { status: 400 });
    }

    const products = await getProducts();
    if (body.items.some((item) => !products.some((product) => product.id === item.productId))) {
      return NextResponse.json({ error: "An item is no longer available. Your cart has been refreshed; please review it." }, { status: 409 });
    }
    const orderItems = body.items.map((item) => {
      const product = products.find((candidate) => candidate.id === item.productId);
      if (!product) throw new Error("One or more products are no longer available.");

      return {
        product_id: product.id,
        product_name: product.name,
        weight: product.weight,
        price: product.price,
        quantity: item.quantity,
        line_total: product.price * item.quantity,
      };
    });

    const subtotal = Math.round(orderItems.reduce((total, item) => total + item.line_total, 0) * 100) / 100;
    if (Math.round(body.expectedSubtotal * 100) !== Math.round(subtotal * 100)) {
      return NextResponse.json({ error: "Product prices have changed. Your cart has been refreshed; review the total and place your order again." }, { status: 409 });
    }
    const grandTotal = subtotal + deliveryCharge;
    const customer = body.customer;
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.rpc("create_order_with_items", {
      p_customer_name: customer.fullName.trim(),
      p_phone: customer.phoneNumber.trim(),
      p_address: customer.deliveryAddress.trim(),
      p_landmark: typeof customer.landmark === "string" ? customer.landmark.trim() : "",
      p_city: customer.city.trim(),
      p_pincode: customer.pincode.trim(),
      p_subtotal: subtotal,
      p_delivery_charge: deliveryCharge,
      p_grand_total: grandTotal,
      p_payment_method: paymentMethod,
      p_items: orderItems,
    });

    if (error || !data?.[0]) {
      console.error("Supabase order creation failed", error);
      return NextResponse.json({ error: "We couldn't place your order. Please try again." }, { status: 500 });
    }

    const response: CreateOrderResponse = {
      id: data[0].order_id,
      orderNumber: data[0].order_number,
      items: body.items.map((item) => ({ product: products.find((product) => product.id === item.productId)!, quantity: item.quantity })),
      subtotal,
      deliveryCharge,
      grandTotal,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("Order API request failed", error);
    return NextResponse.json({ error: "We couldn't place your order. Please try again." }, { status: 500 });
  }
}
