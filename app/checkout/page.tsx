import type { Metadata } from "next";
import CheckoutForm from "@/components/CheckoutForm";
export const metadata: Metadata = { title: "Checkout", description: "Review your DS CREATIONS cart and prepare an order enquiry." };
export default function CheckoutPage() { return <><section className="blue-gradient page-hero"><div className="container-custom"><p className="eyebrow">Order enquiry</p><h1 className="page-title">Checkout</h1></div></section><section className="section-space bg-[var(--light-bg)]"><div className="container-custom"><CheckoutForm /></div></section></>; }
