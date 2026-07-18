"use client";

import { FormEvent, useState } from "react";
import { Mail, MessageCircle } from "lucide-react";

type EnquiryLinks = { whatsapp: string; email: string } | null;

export default function ContactForm() {
  const [links, setLinks] = useState<EnquiryLinks>(null);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.checkValidity()) { form.reportValidity(); return; }
    const data = new FormData(form);
    const subject = String(data.get("subject"));
    const details = `Customer name: ${data.get("name")}\nPhone: ${data.get("phone")}\nEmail: ${data.get("email")}\nSubject: ${subject}\n\nMessage:\n${data.get("message")}`;
    setLinks({
      whatsapp: `https://wa.me/918368045535?text=${encodeURIComponent(`Hello DS CREATIONS,\n\n${details}`)}`,
      email: `mailto:dscrea8ions@gmail.com?subject=${encodeURIComponent(`Enquiry: ${subject}`)}&body=${encodeURIComponent(details)}`,
    });
  };

  return <form onSubmit={submit} className="content-card p-6 sm:p-8">
    <h2 className="text-2xl font-black text-[var(--dark-navy)]">Send an enquiry</h2>
    <div className="mt-6 grid gap-5 sm:grid-cols-2">
      <label className="form-label">Name *<input name="name" required className="form-control" /></label>
      <label className="form-label">Phone *<input name="phone" required type="tel" pattern="[0-9+ -]{8,15}" className="form-control" /></label>
      <label className="form-label sm:col-span-2">Email *<input name="email" required type="email" className="form-control" /></label>
      <label className="form-label sm:col-span-2">Subject *<input name="subject" required className="form-control" /></label>
      <label className="form-label sm:col-span-2">Message *<textarea name="message" required rows={5} className="form-control" /></label>
    </div>
    <p className="mt-5 text-sm leading-6 text-slate-600">Your message will be sent through WhatsApp or your email application. Online enquiry storage will be added in a future update.</p>
    <button type="submit" className="btn-gold mt-6">Prepare Enquiry</button>
    {links && <div role="status" className="mt-6 rounded-xl bg-green-50 p-4 text-green-900">
      <p className="font-bold">Your enquiry details are ready. Choose WhatsApp or Email to send them to DS CREATIONS.</p>
      <div className="mt-4 flex flex-wrap gap-3">
        <a className="btn-primary inline-flex items-center gap-2" href={links.whatsapp} target="_blank" rel="noreferrer"><MessageCircle size={18} />Send by WhatsApp</a>
        <a className="btn-secondary inline-flex items-center gap-2" href={links.email}><Mail size={18} />Send by Email</a>
      </div>
    </div>}
  </form>;
}
