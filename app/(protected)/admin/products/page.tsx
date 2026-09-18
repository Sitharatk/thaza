import { createSupabaseServerClient } from "@/src/lib/supabase/server";
import { AdminProducts } from "@/components/admin/AdminProducts";
import type { ManagedProduct } from "@/types/product";

export default async function AdminProductsPage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("products").select("id, name, weight, price, category, image, accent, description, stock_quantity, featured, is_active").order("created_at");
  return <div>
    <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--green)]">Catalogue</p>
    <h1 className="serif mt-2 text-4xl">Products</h1>
    <p className="mt-3 mb-8 text-sm text-slate-500">Manage products, prices and availability in your store.</p>
    {error ? <p role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-800">Products could not be loaded. Make sure the admin orders and products database migration has been applied, then reload this page.</p>
      : <AdminProducts saved={(await searchParams).saved} products={(data ?? []).map((product) => ({ ...product, price: Number(product.price) })) as ManagedProduct[]} />}
  </div>;
}
