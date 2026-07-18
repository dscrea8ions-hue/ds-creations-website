"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { CartItem } from "@/types/cart";
import type { Product } from "@/types/product";
import { effectivePrice } from "@/lib/format";

type CartContextValue = {
  items: CartItem[]; count: number; subtotal: number; gst: number; total: number;
  addItem: (product: Product, quantity?: number, size?: string, colour?: string) => void;
  updateQuantity: (key: string, quantity: number) => void; removeItem: (key: string) => void; clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try { setItems(JSON.parse(localStorage.getItem("ds-creations-cart") ?? "[]") as CartItem[]); } catch { setItems([]); }
    setReady(true);
  }, []);
  useEffect(() => { if (ready) localStorage.setItem("ds-creations-cart", JSON.stringify(items)); }, [items, ready]);

  const addItem = (product: Product, quantity = 1, size = product.sizes[0], colour = product.colours[0]) => {
    const safeQuantity = Math.max(1, Number.isFinite(quantity) ? Math.floor(quantity) : 1);
    const key = `${product.id}:${size}:${colour}`;
    setItems((current) => {
      const existing = current.find((item) => item.key === key);
      return existing ? current.map((item) => item.key === key ? { ...item, quantity: item.quantity + safeQuantity } : item) : [...current, { key, product, size, colour, quantity: safeQuantity }];
    });
  };
  const updateQuantity = (key: string, quantity: number) => setItems((current) => current.map((item) => item.key === key ? { ...item, quantity: Math.max(1, Number.isFinite(quantity) ? Math.floor(quantity) : 1) } : item));
  const removeItem = (key: string) => setItems((current) => current.filter((item) => item.key !== key));
  const clearCart = () => setItems([]);
  const value = useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + effectivePrice(item.product) * item.quantity, 0);
    const gst = items.reduce((sum, item) => sum + effectivePrice(item.product) * item.quantity * item.product.gstPercentage / 100, 0);
    return { items, count: items.reduce((sum, item) => sum + item.quantity, 0), subtotal, gst, total: subtotal + gst, addItem, updateQuantity, removeItem, clearCart };
  }, [items]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}
