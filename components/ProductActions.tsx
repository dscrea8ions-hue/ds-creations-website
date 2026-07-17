"use client";

import { useState } from "react";
import { MessageCircle, ShoppingBag } from "lucide-react";
import type { Product } from "@/types/product";
import { useCart } from "@/context/CartContext";
import { whatsappUrl } from "@/lib/format";
import { useRouter } from "next/navigation";

export default function ProductActions({ product }: { product: Product }) {
  const [size, setSize] = useState(product.sizes[0]); const [colour, setColour] = useState(product.colours[0]); const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart(); const router = useRouter(); const unavailable = product.price === null || product.stockStatus === "OUT_OF_STOCK";
  const add = () => addItem(product, quantity, size, colour);
  return <div className="mt-7 space-y-5"><div className="grid gap-4 sm:grid-cols-2"><label className="form-label">Size<select className="form-control" value={size} onChange={(e) => setSize(e.target.value)}>{product.sizes.map((item) => <option key={item}>{item}</option>)}</select></label><label className="form-label">Colour<select className="form-control" value={colour} onChange={(e) => setColour(e.target.value)}>{product.colours.map((item) => <option key={item}>{item}</option>)}</select></label></div><label className="form-label">Quantity<input className="form-control max-w-40" type="number" min={1} value={quantity} onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))} /></label><div className="grid gap-3 sm:grid-cols-2"><button disabled={unavailable} onClick={add} className="btn-primary flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"><ShoppingBag size={18} />Add to Cart</button><button disabled={unavailable} onClick={() => { add(); router.push("/checkout"); }} className="btn-gold disabled:cursor-not-allowed disabled:opacity-50">Buy Now</button><a href={whatsappUrl(`Hello DS CREATIONS, I need a bulk quote for ${product.name} (${product.sku}). Size: ${size}; Colour: ${colour}; Quantity: ${quantity}.`)} target="_blank" rel="noreferrer" className="btn-secondary text-center">Request Bulk Quote</a><a href={whatsappUrl(`Hello DS CREATIONS, I would like to order ${product.name} (${product.sku}). Size: ${size}; Colour: ${colour}; Quantity: ${quantity}.`)} target="_blank" rel="noreferrer" className="btn-gold flex items-center justify-center gap-2"><MessageCircle size={18} />WhatsApp Order</a></div></div>;
}
