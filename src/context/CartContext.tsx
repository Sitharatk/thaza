"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
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
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

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
  }), [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}