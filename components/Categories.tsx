"use client";
import { useState } from "react";

export function Categories({ onCategoryChange }: { onCategoryChange: (category: string) => void }) {
  const [active, setActive] = useState("All Products");
  const categories = ["All Products", "Chicken", "Beef", "Mutton", "Ready to Cook"];
  return <div className="flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none]">{categories.map((category) => <button key={category} onClick={() => { setActive(category); onCategoryChange(category); }} className={`whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-semibold transition-colors ${active === category ? "bg-[var(--navy)] text-white" : "bg-white text-slate-500 hover:text-[var(--navy)]"}`}>{category}</button>)}</div>;
}