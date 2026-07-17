import type { Metadata } from "next";
import CartPageClient from "@/components/CartPageClient";
export const metadata: Metadata = { title: "Cart", description: "Review products selected from DS CREATIONS." };
export default function CartPage() { return <><section className="blue-gradient page-hero"><div className="container-custom"><p className="eyebrow">Your Selection</p><h1 className="page-title">Shopping cart</h1></div></section><CartPageClient /></>; }
