"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/src/lib/supabase/client";
import type { ManagedProduct, ProductCategory } from "@/types/product";

const categories: ProductCategory[] = ["Chicken", "Beef", "Mutton", "Ready to Cook"];
const inputClass = "mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--green)] focus:bg-white focus:ring-4 focus:ring-[var(--mint)]";
export const emptyProduct: ManagedProduct = { id: "", name: "", weight: "1 kg", price: 0, category: "Chicken", image: "/products/chicken-curry-cut.svg", accent: "#f6eee1", description: "", stock_quantity: 0, featured: false, is_active: true };

export function ProductForm({ product, mode }: { product: ManagedProduct; mode: "new" | "edit" }) {
  const router = useRouter();
  const [draft, setDraft] = useState(product);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState(product.image);
  useEffect(() => () => { if (imagePreview.startsWith("blob:")) URL.revokeObjectURL(imagePreview); }, [imagePreview]);

  function chooseImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 5 * 1024 * 1024) { setError("Choose a JPG, PNG or WebP image under 5 MB."); return; }
    setImageFile(file); setImagePreview(URL.createObjectURL(file)); setError("");
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    setSaving(true); setError("");
    try {
      const supabase = createSupabaseBrowserClient();
      let image = draft.image;
      if (imageFile) {
        const safeName = imageFile.name.toLowerCase().replace(/[^a-z0-9.]+/g, "-");
        const path = `${crypto.randomUUID()}-${safeName}`;
        const { error: uploadError } = await supabase.storage.from("products").upload(path, imageFile, { upsert: true, contentType: imageFile.type });
        if (uploadError) throw new Error("The image could not be uploaded. Run the latest Supabase migration, then try again.");
        image = supabase.storage.from("products").getPublicUrl(path).data.publicUrl;
      }
      const record = { name: draft.name.trim(), weight: draft.weight.trim(), price: draft.price, category: draft.category, description: draft.description.trim(), stock_quantity: Math.max(0, Math.floor(draft.stock_quantity)), featured: draft.featured, is_active: draft.is_active, image, accent: draft.accent };
      if (!record.name || !record.weight || !Number.isFinite(record.price) || record.price < 0) throw new Error("Enter a name, weight and valid price.");
      const request = mode === "edit" ? supabase.from("products").update(record).eq("id", draft.id) : supabase.from("products").insert(record);
      const { error: saveError } = await request.select("id").single();
      if (saveError) throw new Error("The product could not be saved. Check your admin access and try again.");
      router.push(`/admin/products?saved=${mode === "edit" ? "updated" : "created"}`);
      router.refresh();
    } catch (err) { setError(err instanceof Error ? err.message : "Could not save the product."); setSaving(false); }
  }

  return <>
    <Link href="/admin/products" className="text-sm font-bold text-[var(--green)]">← Back to Products</Link>
    <div className="mt-5 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_60px_rgba(21,55,76,0.08)]">
      <div className="bg-gradient-to-r from-[var(--navy)] to-[#234d63] px-6 py-6 text-white"><p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-200">Catalogue Editor</p><h1 className="mt-1 text-3xl font-bold">{mode === "edit" ? "Edit product" : "Add a new product"}</h1><p className="mt-2 text-sm text-white/70">Give customers the details they need to choose confidently.</p></div>
      <form onSubmit={save}>
        <fieldset disabled={saving} className="grid gap-6 p-6 sm:grid-cols-2 disabled:opacity-60">
          <label className="text-sm font-semibold">Name<input required maxLength={120} value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} className={inputClass} /></label>
          <label className="text-sm font-semibold">Weight / pack size<input required maxLength={40} value={draft.weight} onChange={(event) => setDraft({ ...draft, weight: event.target.value })} className={inputClass} /></label>
          <label className="text-sm font-semibold">Price (₹)<input type="number" required min="0" max="9999999" step="0.01" value={Number.isNaN(draft.price) ? "" : draft.price} onChange={(event) => setDraft({ ...draft, price: event.target.valueAsNumber })} className={inputClass} /></label>
          <label className="text-sm font-semibold">Category<select value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value as ProductCategory })} className={inputClass}>{categories.map((value) => <option key={value}>{value}</option>)}</select></label>
          <label className="text-sm font-semibold sm:col-span-2">Description<textarea rows={4} maxLength={500} value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} placeholder="Fresh, cleaned and ready for your favourite recipe" className={inputClass} /></label>
          <label className="text-sm font-semibold">Stock quantity<input type="number" min="0" step="1" value={Number.isNaN(draft.stock_quantity) ? "" : draft.stock_quantity} onChange={(event) => setDraft({ ...draft, stock_quantity: event.target.valueAsNumber })} className={inputClass} /></label>
          <div className="flex items-end gap-6 pb-2"><label className="flex items-center gap-3 text-sm font-semibold"><input type="checkbox" checked={draft.is_active} onChange={(event) => setDraft({ ...draft, is_active: event.target.checked })} className="h-5 w-5 accent-[var(--green)]" />Available in store</label><label className="flex items-center gap-3 text-sm font-semibold"><input type="checkbox" checked={draft.featured} onChange={(event) => setDraft({ ...draft, featured: event.target.checked })} className="h-5 w-5 accent-[var(--green)]" />Featured</label></div>
          <div className="sm:col-span-2"><p className="text-sm font-semibold">{mode === "edit" ? "Current product image" : "Product image"}</p><label className="mt-2 flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50 p-5 text-center transition hover:border-[var(--green)] hover:bg-[var(--mint)]/30">{imagePreview ? <Image src={imagePreview} alt="Product preview" width={180} height={130} className="mb-3 h-32 w-44 rounded-2xl object-cover" unoptimized /> : <div className="mb-3 flex h-24 w-32 items-center justify-center rounded-2xl bg-[var(--mint)] text-4xl">＋</div>}<span className="font-bold text-[var(--navy)]">{imageFile ? imageFile.name : "Choose product image"}</span><span className="mt-1 text-xs text-slate-500">JPG, PNG or WebP · max 5 MB</span><input type="file" accept="image/png,image/jpeg,image/webp" onChange={chooseImage} className="sr-only" /></label></div>
        </fieldset>
        {error && <p role="alert" className="px-6 pb-4 text-sm font-semibold text-red-700">{error}</p>}
        <div className="flex gap-3 border-t border-slate-100 bg-slate-50 px-6 py-5"><button disabled={saving} className="rounded-full bg-[var(--green)] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-900/10 disabled:opacity-60">{saving ? "Saving..." : mode === "edit" ? "Update product" : "Save product"}</button><Link href="/admin/products" className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-bold">Cancel</Link></div>
      </form>
    </div>
  </>;
}
