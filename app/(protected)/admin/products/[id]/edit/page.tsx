import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/ProductForm";
import { createSupabaseServerClient } from "@/src/lib/supabase/server";
import type { ManagedProduct } from "@/types/product";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("products").select("id, name, weight, price, category, image, accent, description, stock_quantity, featured, is_active").eq("id", id).maybeSingle();
  if (error || !data) notFound();
  return <ProductForm product={{ ...data, price: Number(data.price), stock_quantity: Number(data.stock_quantity ?? 0), description: data.description ?? "", featured: Boolean(data.featured), is_active: Boolean(data.is_active) } as ManagedProduct} mode="edit" />;
}
