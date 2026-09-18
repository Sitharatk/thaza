import { getSupabaseClient } from "@/src/lib/supabase";
import type { Product } from "@/types/product";

export async function getProducts(): Promise<Product[]> {
  const { data, error } = await getSupabaseClient()
    .from("products")
    .select("id, name, weight, price, category, image, accent, description, stock_quantity, featured")
    .eq("is_active", true)
    .order("created_at");
  if (error) throw new Error("The product catalogue could not be loaded. Please try again shortly.");
  return (data ?? []).map((product) => ({ ...product, price: Number(product.price) })) as Product[];
}
