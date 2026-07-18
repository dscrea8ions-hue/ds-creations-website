"use client";

import Link from "next/link";
import { Menu, Search, ShoppingBag, X } from "lucide-react";
import { useState } from "react";
import BrandLogo from "./BrandLogo";
import DownloadCatalogueButton from "./DownloadCatalogueButton";
import { useCart } from "@/context/CartContext";

const nav = [{ label: "HOME", href: "/" }, { label: "ABOUT", href: "/about" }, { label: "PRODUCTS", href: "/products" }, { label: "INDUSTRIES", href: "/industries" }, { label: "BULK ORDERS", href: "/bulk-orders" }, { label: "CONTACT", href: "/contact" }];

export default function Header() {
  const [open, setOpen] = useState(false);
  const { count } = useCart();
  return <header className="sticky top-0 z-50 border-b border-white/10 bg-[var(--dark-navy)] text-white shadow-lg">
    <div className="container-custom flex min-h-20 items-center justify-between gap-4">
      <BrandLogo />
      <nav className="hidden items-center gap-4 xl:flex">{nav.map((item) => <Link key={item.href} href={item.href} className="text-xs font-bold tracking-wide transition hover:text-[var(--gold)]">{item.label}</Link>)}</nav>
      <div className="hidden items-center gap-1 lg:flex">
        <Link href="/products" aria-label="Search products" className="header-icon"><Search size={19} /></Link>
        <Link href="/cart" aria-label={`Cart with ${count} items`} className="header-icon relative"><ShoppingBag size={20} />{count > 0 && <span className="absolute -right-1 -top-1 min-w-4 rounded-full bg-[var(--gold)] px-1 text-center text-[10px] font-black text-[var(--dark-navy)]">{count}</span>}</Link>
        <DownloadCatalogueButton className="btn-gold ml-2 text-xs" />
      </div>
      <div className="flex items-center gap-2 lg:hidden">
        <Link href="/cart" aria-label={`Cart with ${count} items`} className="header-icon relative"><ShoppingBag size={20} />{count > 0 && <span className="absolute -right-1 -top-1 rounded-full bg-[var(--gold)] px-1 text-[10px] font-black text-[var(--dark-navy)]">{count}</span>}</Link>
        <button type="button" aria-label="Toggle navigation menu" aria-expanded={open} className="header-icon" onClick={() => setOpen((value) => !value)}>{open ? <X /> : <Menu />}</button>
      </div>
    </div>
    {open && <nav className="container-custom flex flex-col border-t border-white/10 py-3 lg:hidden">
      <div className="mb-3 rounded-xl bg-white/5 p-3"><BrandLogo /></div>
      {nav.map((item) => <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className="rounded-lg px-3 py-3 text-sm font-bold hover:bg-white/10 hover:text-[var(--gold)]">{item.label}</Link>)}
      <div className="mt-2"><DownloadCatalogueButton className="btn-gold w-full" showMessage /></div>
    </nav>}
  </header>;
}
