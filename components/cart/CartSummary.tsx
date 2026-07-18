"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/format";

export default function CartSummary({ checkout = false }: { checkout?: boolean }) {
  const { subtotal, gst, total } = useCart();
  return <aside className="content-card h-fit p-6">
    <h2 className="text-xl font-black text-[var(--dark-navy)]">Order summary</h2>
    <dl className="mt-5 space-y-3">
      <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatPrice(subtotal)}</dd></div>
      <div className="flex justify-between text-slate-600"><dt>GST estimate</dt><dd>{formatPrice(gst)}</dd></div>
      <div className="flex justify-between border-t border-slate-200 pt-4 text-xl font-black text-[var(--dark-navy)]"><dt>Total</dt><dd>{formatPrice(total)}</dd></div>
    </dl>
    <p className="mt-4 text-xs leading-5 text-slate-500">Final tax and delivery charges are confirmed by DS CREATIONS before fulfilment.</p>
    <p className="mt-2 text-xs leading-5 text-slate-500">Delivery timelines may vary according to quantity, customization and destination.</p>
    {!checkout && <Link href="/checkout" className="btn-gold mt-6 block text-center">Proceed to Checkout</Link>}
  </aside>;
}
