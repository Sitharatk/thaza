"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import type { Product } from "@/types/product";

export type CartItem = { product: Product; quantity: number };

type CartContextValue = {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  increaseQuantity: (productId: string) => void;
  decreaseQuantity: (productId: string) => void;
  totalItems: number;
  totalPrice: number;
  refreshPrices: () => Promise<void>;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const pathname = usePathname();
  const refreshPrices = useCallback(async () => {
    const response = await fetch("/api/products", { cache: "no-store" });
    if (!response.ok) throw new Error("Current prices could not be loaded. Please try again.");
    const products: Product[] = await response.json();
    setItems((current) => current.flatMap((item) => {
      const product = products.find((candidate) => candidate.id === item.product.id);
      return product ? [{ ...item, product }] : [];
    }));
  }, []);

  useEffect(() => {
    const hydrateCart = () => {
      try {
        const storedItems = window.localStorage.getItem("thaza-cart");
        if (storedItems) setItems(JSON.parse(storedItems) as CartItem[]);
      } catch {
        window.localStorage.removeItem("thaza-cart");
      } finally {
        setIsHydrated(true);
      }
    };
    const hydrationTimer = window.setTimeout(hydrateCart, 0);
    return () => window.clearTimeout(hydrationTimer);
  }, []);

  useEffect(() => {
    if (isHydrated) window.localStorage.setItem("thaza-cart", JSON.stringify(items));
  }, [isHydrated, items]);

  useEffect(() => {
    if (!isHydrated || pathname.startsWith("/admin")) return;
    const refresh = () => { void refreshPrices().catch(() => { /* Checkout validates current prices before saving. */ }); };
    refresh();
    window.addEventListener("focus", refresh);
    return () => window.removeEventListener("focus", refresh);
  }, [isHydrated, pathname, refreshPrices]);

  const addItem = (product: Product) => {
    setItems((current) => {
      const existing = current.find((item) => item.product.id === product.id);
      if (existing) return current.map((item) => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...current, { product, quantity: 1 }];
    });
  };

  const removeItem = (productId: string) => setItems((current) => current.filter((item) => item.product.id !== productId));
  const increaseQuantity = (productId: string) => setItems((current) => current.map((item) => item.product.id === productId ? { ...item, quantity: item.quantity + 1 } : item));
  const decreaseQuantity = (productId: string) => setItems((current) => current.flatMap((item) => {
    if (item.product.id !== productId) return [item];
    return item.quantity > 1 ? [{ ...item, quantity: item.quantity - 1 }] : [];
  }));

  const value = useMemo(() => ({
    items,
    addItem,
    removeItem,
    increaseQuantity,
    decreaseQuantity,
    totalItems: items.reduce((total, item) => total + item.quantity, 0),
    totalPrice: items.reduce((total, item) => total + item.product.price * item.quantity, 0),
    refreshPrices,
  }), [items, refreshPrices]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}
