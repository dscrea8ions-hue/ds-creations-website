"use client";

import Image from "next/image";
import Link from "next/link";
import { MessageSquareText, ShoppingCart } from "lucide-react";
import type { Product } from "@/types/product";
import { effectivePrice, formatPrice, stockLabels, whatsappUrl } from "@/lib/format";
import { useCart } from "@/context/CartContext";

export default function ProductCard({ product, compact = false }: { product: Product; compact?: boolean }) {
  const { addItem } = useCart();
  const discount = product.price && product.offerPrice ? Math.round((1 - product.offerPrice / product.price) * 100) : 0;
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_12px_35px_rgba(6,31,73,.08)] transition hover:-translate-y-1 hover:border-[var(--gold)]">
      <Link href={`/products/${product.slug}`} className="relative block aspect-[4/3] overflow-hidden bg-[var(--light-bg)]">
        <Image src={product.mainImage} alt={`${product.name} by DS CREATIONS`} fill className="object-cover transition duration-500 group-hover:scale-105" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw" />
        {discount > 0 && <span className="absolute left-3 top-3 rounded-full bg-[var(--gold)] px-3 py-1 text-xs font-black text-[var(--dark-navy)]">{discount}% OFF</span>}
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between gap-3 text-xs font-bold uppercase tracking-wider text-[var(--royal-blue)]"><span>{product.category}</span><span className="rounded-full bg-slate-100 px-2 py-1 normal-case text-slate-600">{stockLabels[product.stockStatus]}</span></div>
        <Link href={`/products/${product.slug}`}><h2 className="mt-3 text-lg font-black text-[var(--dark-navy)] group-hover:text-[var(--royal-blue)]">{product.name}</h2></Link>
        {!compact && <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{product.shortDescription}</p>}
        {!compact && <p className="mt-2 text-xs font-semibold leading-5 text-slate-500">{product.deliveryTime}</p>}
        {product.schoolName && <p className="mt-2 text-xs font-semibold text-slate-500">{product.schoolName}</p>}
        <div className="mt-4 flex items-end justify-between gap-3">
          <div>{product.price === null ? <strong className="text-base text-[var(--dark-navy)]">Contact for price</strong> : <><strong className="text-xl text-[var(--dark-navy)]">{formatPrice(effectivePrice(product))}</strong>{product.offerPrice && <del className="ml-2 text-sm text-slate-400">{formatPrice(product.price)}</del>}</>}</div>
          <span className="text-xs text-slate-500">Minimum order: 1 piece</span>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-2">
          <Link href={`/products/${product.slug}`} className="btn-secondary col-span-2 text-center">View Details</Link>
          <button type="button" className="btn-primary flex items-center justify-center gap-2 disabled:opacity-50" disabled={product.stockStatus === "OUT_OF_STOCK" || product.price === null} onClick={() => addItem(product)}><ShoppingCart size={16} /> Add</button>
          <a className="btn-gold flex items-center justify-center gap-2" target="_blank" rel="noreferrer" href={whatsappUrl(`Hello DS CREATIONS, I would like a quote for ${product.name} (${product.sku}).`)}><MessageSquareText size={16} /> Quote</a>
        </div>
      </div>
    </article>
  );
}
