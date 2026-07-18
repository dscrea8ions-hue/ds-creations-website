"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import CartSummary from "@/components/cart/CartSummary";
import { useCart } from "@/context/CartContext";
import { formatPrice, whatsappUrl } from "@/lib/format";

export default function CheckoutForm() {
  const { items, total } = useCart();
  const [error, setError] = useState("");
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.checkValidity()) { setError("Please complete all required customer and delivery details."); form.reportValidity(); return; }
    setError("");
    const data = new FormData(form);
    const lines = items.map((item) => `• ${item.product.name} — ${Math.max(1, item.quantity)} × ${item.size}/${item.colour}\n  ${item.product.deliveryTime}`).join("\n");
    const message = `Hello DS CREATIONS, I would like to prepare an order enquiry.\n\nCustomer: ${data.get("name")}\nPhone: ${data.get("phone")}\nEmail: ${data.get("email")}\nPayment preference: ${data.get("payment")}\nDelivery: ${data.get("address")}, ${data.get("city")}, ${data.get("state")} ${data.get("pincode")}\n\n${lines}\n\nEstimated total: ${formatPrice(total)}\n\nDelivery timelines may vary according to quantity, customization and destination.`;
    window.open(whatsappUrl(message), "_blank", "noopener,noreferrer");
  };

  if (!items.length) return <div className="content-card py-16 text-center"><h2 className="text-2xl font-black text-[var(--dark-navy)]">Add products before checkout</h2><Link href="/products" className="btn-primary mt-6 inline-flex">Browse Products</Link></div>;
  const field = "form-control";
  return <form onSubmit={submit} noValidate>
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div className="content-card p-6 sm:p-8">
        <div className="mb-8 border-b border-slate-100 pb-6"><BrandLogo darkText /></div>
        <h2 className="text-2xl font-black text-[var(--dark-navy)]">Customer details</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <label className="form-label">Full name *<input className={field} name="name" required /></label>
          <label className="form-label">Phone *<input className={field} name="phone" type="tel" pattern="[0-9+ -]{8,15}" required /></label>
          <label className="form-label sm:col-span-2">Email *<input className={field} name="email" type="email" required /></label>
        </div>
        <h2 className="mt-10 text-2xl font-black text-[var(--dark-navy)]">Delivery details</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <label className="form-label sm:col-span-2">Address *<textarea className={field} name="address" rows={3} required /></label>
          <label className="form-label">City *<input className={field} name="city" required /></label>
          <label className="form-label">State *<input className={field} name="state" required /></label>
          <label className="form-label">Pincode *<input className={field} name="pincode" inputMode="numeric" pattern="[0-9]{6}" required /></label>
        </div>
        <h2 className="mt-10 text-2xl font-black text-[var(--dark-navy)]">Organization (optional)</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2"><label className="form-label sm:col-span-2">School, company or institution<input className={field} name="organization" /></label><label className="form-label">GST number<input className={field} name="gst" /></label></div>
        <fieldset className="mt-10">
          <legend className="text-2xl font-black text-[var(--dark-navy)]">Payment preference</legend>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="rounded-xl border border-slate-200 p-4 font-bold opacity-55"><input type="radio" disabled className="mr-3" />Online Payment</label>
            <label className="rounded-xl border border-slate-200 p-4 font-bold"><input type="radio" name="payment" value="Cash on Delivery" className="mr-3 accent-[var(--royal-blue)]" />Cash on Delivery</label>
            <label className="rounded-xl border border-slate-200 p-4 font-bold"><input type="radio" name="payment" value="WhatsApp Order" defaultChecked className="mr-3 accent-[var(--royal-blue)]" />WhatsApp Order</label>
          </div>
          <p className="mt-4 rounded-xl bg-[var(--soft-gold)] p-4 text-sm font-bold text-[var(--dark-navy)]">Online payment setup is in progress. Please use Cash on Delivery or WhatsApp Order.</p>
        </fieldset>
        {error && <p role="alert" className="mt-5 rounded-xl bg-red-50 p-4 font-bold text-red-800">{error}</p>}
        <button className="btn-gold mt-6 w-full" type="submit">Continue Order on WhatsApp</button>
        <p className="mt-3 text-center text-xs text-slate-500">This prepares an order enquiry in WhatsApp. Cash on Delivery does not create a permanent database order.</p>
      </div>
      <CartSummary checkout />
    </div>
  </form>;
}
