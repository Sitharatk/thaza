"use client";

import { useState } from "react";
import { products } from "@/data/products";
import { useCart } from "@/src/context/CartContext";
import { ProductCard } from "./ProductCard";

const categories = ["All Items", "Chicken", "Beef", "Mutton", "Ready to Cook"] as const;

export function ProductCatalogue() {
  const [activeCategory, setActiveCategory] = useState<(typeof categories)[number]>("All Items");
  const filteredProducts = activeCategory === "All Items" ? products : products.filter((product) => product.category === activeCategory);
  const { totalItems, totalPrice } = useCart();

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
    <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-[var(--line)] bg-white/95 px-4 py-3 shadow-[0_-8px_24px_rgba(16,45,66,0.1)] backdrop-blur sm:hidden"><div className="mx-auto flex max-w-md items-center justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">{totalItems} {totalItems === 1 ? "item" : "items"}</p><p className="mt-0.5 text-lg font-bold text-[var(--navy)]">₹{totalPrice}</p></div><a href="/cart" className="flex items-center gap-3 rounded-full bg-[var(--green)] px-5 py-3 text-sm font-bold text-white">View Cart <span aria-hidden="true">→</span></a></div></div>
  </>;
}