"use client";
import Image from "next/image";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import type { CartItem } from "@/types/cart";
import { effectivePrice, formatPrice } from "@/lib/format";
import { useCart } from "@/context/CartContext";

export default function CartItemRow({ item }: { item: CartItem }) { const { updateQuantity, removeItem } = useCart(); return <article className="grid gap-5 border-b border-slate-100 py-6 sm:grid-cols-[120px_1fr_auto]"><Link href={`/products/${item.product.slug}`} className="relative aspect-square overflow-hidden rounded-xl bg-[var(--light-bg)]"><Image src={item.product.mainImage} alt={item.product.name} fill className="object-cover" sizes="120px" /></Link><div><Link href={`/products/${item.product.slug}`} className="text-lg font-black text-[var(--dark-navy)] hover:text-[var(--royal-blue)]">{item.product.name}</Link><p className="mt-1 text-sm text-slate-500">{item.size} · {item.colour}</p><p className="mt-3 font-bold">{formatPrice(effectivePrice(item.product))} each</p></div><div className="flex items-center gap-3 sm:flex-col sm:items-end"><label className="text-sm font-bold">Qty <input aria-label={`Quantity for ${item.product.name}`} className="ml-2 w-20 rounded-lg border border-slate-200 px-3 py-2" type="number" min="1" value={item.quantity} onChange={(e) => updateQuantity(item.key, Number(e.target.value))} /></label><strong>{formatPrice(effectivePrice(item.product) * item.quantity)}</strong><button onClick={() => removeItem(item.key)} aria-label={`Remove ${item.product.name}`} className="flex items-center gap-1 text-sm font-bold text-red-700 hover:text-red-900"><Trash2 size={16} />Remove</button></div></article>; }
