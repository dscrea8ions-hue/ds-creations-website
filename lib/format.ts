import type { Product, StockStatus } from "@/types/product";

export const formatPrice = (value: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);

export const effectivePrice = (product: Product) => product.offerPrice ?? product.price ?? 0;

export const stockLabels: Record<StockStatus, string> = {
  IN_STOCK: "In stock",
  LOW_STOCK: "Low stock",
  OUT_OF_STOCK: "Out of stock",
  MADE_TO_ORDER: "Made to order",
};

export const whatsappUrl = (message: string) =>
  `https://wa.me/918368045535?text=${encodeURIComponent(message)}`;
