"use client";

import { FormEvent, useState } from "react";
import { Mail, MessageCircle } from "lucide-react";
import { products } from "@/data/products";

type EnquiryLinks = { whatsapp: string; email: string } | null;

export default function BulkOrderForm() {
  const [links, setLinks] = useState<EnquiryLinks>(null);
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.checkValidity()) { form.reportValidity(); return; }
    const data = new FormData(form);
    const value = (key: string) => String(data.get(key) || "Not specified");
    const message = [
      "Bulk order enquiry for DS CREATIONS", "", `Customer name: ${value("name")}`,
      `School, company or institution: ${value("institution")}`, `Phone: ${value("phone")}`, `Email: ${value("email")}`,
      `Product: ${value("product")}`, `Quantity: ${value("quantity")}`, `Sizes: ${value("sizes")}`, `Colours: ${value("colours")}`,
      `Logo requirement: ${value("logo")}`, `Printing requirement: ${value("printing")}`, `Embroidery requirement: ${value("embroidery")}`,
      `Delivery location: ${value("location")}`, `Expected delivery date: ${value("date")}`, `Additional details: ${value("details")}`,
    ].join("\n");
    setLinks({
      whatsapp: `https://wa.me/918368045535?text=${encodeURIComponent(message)}`,
      email: `mailto:dscrea8ions@gmail.com?subject=${encodeURIComponent(`Bulk order enquiry: ${value("product")}`)}&body=${encodeURIComponent(message)}`,
    });
  };
  const control = "form-control";
  return <form onSubmit={submit} className="content-card p-6 sm:p-10">
    <div className="grid gap-5 md:grid-cols-2">
      <label className="form-label">Customer name *<input name="name" required className={control} /></label>
      <label className="form-label">School, company or institution *<input name="institution" required className={control} /></label>
      <label className="form-label">Phone *<input name="phone" required type="tel" pattern="[0-9+ -]{8,15}" className={control} /></label>
      <label className="form-label">Email *<input name="email" required type="email" className={control} /></label>
      <label className="form-label">Product *<select name="product" required className={control} defaultValue=""><option value="" disabled>Select a product</option>{products.map((product) => <option key={product.id}>{product.name}</option>)}<option>Other requirement</option></select></label>
      <label className="form-label">Quantity *<input name="quantity" required min="1" defaultValue="1" type="number" className={control} /></label>
      <label className="form-label">Sizes<input name="sizes" className={control} placeholder="e.g. S–2XL or size-wise breakdown" /></label>
      <label className="form-label">Colours<input name="colours" className={control} placeholder="Preferred colours" /></label>
      {[{ name: "logo", label: "Logo requirement" }, { name: "printing", label: "Printing requirement" }, { name: "embroidery", label: "Embroidery requirement" }].map((field) => <label className="form-label" key={field.name}>{field.label}<select name={field.name} className={control}><option>No</option><option>Yes</option><option>Need guidance</option></select></label>)}
      <label className="form-label">Delivery location *<input name="location" required className={control} /></label>
      <label className="form-label">Expected delivery date<input name="date" type="date" className={control} /></label>
      <label className="form-label md:col-span-2">Additional details<textarea name="details" rows={5} className={control} /></label>
    </div>
    <p className="mt-5 text-sm leading-6 text-slate-600">Submitting this form prepares your enquiry for WhatsApp or email. The DS CREATIONS team will confirm price, availability and delivery.</p>
    <button type="submit" className="btn-gold mt-7 px-8">Prepare Bulk Enquiry</button>
    {links && <div role="status" className="mt-6 rounded-xl bg-green-50 p-4 text-green-900">
      <p className="font-bold">Your bulk-order details are ready. Choose WhatsApp or Email to send them to DS CREATIONS.</p>
      <div className="mt-4 flex flex-wrap gap-3">
        <a className="btn-primary inline-flex items-center gap-2" href={links.whatsapp} target="_blank" rel="noreferrer"><MessageCircle size={18} />Send by WhatsApp</a>
        <a className="btn-secondary inline-flex items-center gap-2" href={links.email}><Mail size={18} />Send by Email</a>
      </div>
    </div>}
  </form>;
}
