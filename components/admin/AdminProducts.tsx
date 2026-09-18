"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/src/lib/admin";
import type { ManagedProduct, ProductCategory } from "@/types/product";

const categories: ProductCategory[] = ["Chicken", "Beef", "Mutton", "Ready to Cook"];

export function AdminProducts({ products, saved }: { products: ManagedProduct[]; saved?: string }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const filtered = products.filter((product) => `${product.name} ${product.weight}`.toLowerCase().includes(query.trim().toLowerCase()) && (category === "All" || product.category === category));
  return <>
    {saved && <p role="status" className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-semibold text-emerald-800">{saved === "updated" ? "Product updated successfully." : "Product added successfully."}</p>}
    <div className="flex flex-wrap items-center gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_10px_35px_rgba(21,55,76,0.06)]">
      <input aria-label="Search products" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products or weight" className="min-w-48 flex-1 rounded-xl border border-[var(--line)] px-4 py-3 text-sm" />
      <select aria-label="Filter by category" value={category} onChange={(event) => setCategory(event.target.value)} className="rounded-xl border border-[var(--line)] px-3 py-3 text-sm"><option>All</option>{categories.map((value) => <option key={value}>{value}</option>)}</select>
      <button type="button" onClick={() => router.push("/admin/products/new")} className="rounded-full bg-[var(--green)] px-5 py-3 text-sm font-bold text-white transition hover:brightness-95">Add product</button>
    </div>
    <p className="mt-6 text-sm text-slate-500">{filtered.length} of {products.length} products</p>
    <div className="mt-3 overflow-x-auto rounded-3xl border border-[var(--line)] bg-white">
      <table className="w-full min-w-[720px] text-left text-sm"><thead className="border-b border-[var(--line)] bg-[var(--cream)]"><tr>{["Product", "Category", "Weight", "Price", "Availability", "Action"].map((heading) => <th key={heading} className="px-5 py-4 font-semibold">{heading}</th>)}</tr></thead>
        <tbody>{filtered.map((product) => <tr key={product.id} className="border-b border-[var(--line)] last:border-0">
          <td className="px-5 py-4"><div className="flex items-center gap-3"><Image src={product.image} alt="" width={48} height={48} unoptimized className="rounded-lg object-cover" /><span className="font-bold">{product.name}</span></div></td>
          <td className="px-5 py-4">{product.category}</td><td className="whitespace-nowrap px-5 py-4">{product.weight}</td><td className="px-5 py-4 font-bold">{formatCurrency(product.price)}</td>
          <td className="px-5 py-4"><span className={`rounded-full px-3 py-1 text-xs font-bold ${product.is_active ? "bg-emerald-50 text-emerald-800" : "bg-slate-100 text-slate-600"}`}>{product.is_active ? "Available" : "Hidden"}</span></td>
          <td className="px-5 py-4"><Link href={`/admin/products/${product.id}/edit`} className="font-bold text-[var(--green)]">Edit</Link></td>
        </tr>)}{!filtered.length && <tr><td colSpan={6} className="px-5 py-12 text-center text-slate-500">No products match your search.</td></tr>}</tbody>
      </table>
    </div>
  </>;
}
