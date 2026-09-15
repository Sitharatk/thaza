"use client";

import Link from "next/link";
import { useCart } from "@/src/context/CartContext";

export function CartSummaryBar() {
  const { totalItems, totalPrice } = useCart();

  if (totalItems === 0) return null;

  return (
    <Link
      href="/cart"
      className="cart-summary-bar fixed bottom-4 left-4 right-4 z-50 mx-auto flex min-h-16 items-center justify-between gap-4 rounded-2xl bg-[var(--navy)] px-5 py-3 text-white shadow-[0_12px_32px_rgba(16,45,66,0.24)] transition-transform hover:-translate-y-0.5 sm:bottom-6 sm:left-auto sm:right-6 sm:mx-0 sm:w-[360px] sm:rounded-2xl sm:px-6"
      aria-label={`View cart with ${totalItems} ${totalItems === 1 ? "item" : "items"}`}
    >
      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-white"><span aria-hidden="true">🛍</span> {totalItems} {totalItems === 1 ? "ITEM" : "ITEMS"}</p>
        <p className="mt-1 text-sm font-semibold text-white/75">View Cart</p>
      </div>
      <div className="flex shrink-0 items-center gap-3"><span className="text-lg font-bold text-[var(--green)]">₹{totalPrice}</span><span aria-hidden="true" className="text-2xl leading-none text-white/80">›</span></div>
    </Link>
  );
}
