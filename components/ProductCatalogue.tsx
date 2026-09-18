"use client";

import { useState } from "react";
import type { Product } from "@/types/product";
import { ProductCard } from "./ProductCard";

const categories = ["All Items", "Chicken", "Beef", "Mutton", "Ready to Cook"] as const;

export function ProductCatalogue({ products }: { products: Product[] }) {
  const [activeCategory, setActiveCategory] = useState<(typeof categories)[number]>("All Items");
  const filteredProducts = activeCategory === "All Items" ? products : products.filter((product) => product.category === activeCategory);

  return <>
    <section className="bg-[var(--cream)] pb-28 pt-10 sm:pb-16 sm:pt-14">
      <div className="section-shell">
        <div className="max-w-2xl"><p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--green)]">Fresh to your door</p><h1 className="serif mt-3 text-5xl font-medium leading-none tracking-[-0.05em] text-[var(--navy)] sm:text-6xl">Everything good,<br /><em className="text-[var(--green)]">all in one place.</em></h1><p className="mt-5 max-w-lg text-sm leading-7 text-slate-500">Pick your favourites, choose your cut and we&apos;ll take care of the rest. Freshly packed for your kitchen.</p></div>
        <div className="mt-12 flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none]">{categories.map((category) => <button key={category} onClick={() => setActiveCategory(category)} className={`whitespace-nowrap rounded-full px-5 py-3 text-sm font-bold transition-colors ${activeCategory === category ? "bg-[var(--navy)] text-white shadow-lg shadow-slate-300/30" : "bg-white text-slate-500 hover:text-[var(--navy)]"}`}>{category}</button>)}</div>
        <div className="mt-8 flex items-center justify-between"><h2 className="text-lg font-bold text-[var(--navy)]">{activeCategory}</h2><p className="text-xs font-medium text-slate-400">{filteredProducts.length} products</p></div>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">{filteredProducts.map((product) => <ProductCard key={product.id} product={product} />)}</div>
        {filteredProducts.length === 0 && <p className="py-16 text-center text-sm text-slate-500">More fresh cuts are coming soon.</p>}
      </div>
    </section>
  </>;
}
