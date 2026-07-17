import type { Metadata } from "next";
import CheckoutForm from "@/components/CheckoutForm";
export const metadata: Metadata = { title: "Checkout", description: "Review your DS CREATIONS cart and send a Phase 1 order enquiry." };
export default function CheckoutPage() { return <><section className="blue-gradient page-hero"><div className="container-custom"><p className="eyebrow">Phase 1 Prototype</p><h1 className="page-title">Checkout</h1></div></section><section className="section-space bg-[var(--light-bg)]"><div className="container-custom"><CheckoutForm /></div></section></>; }
