import type { Metadata } from "next";
import CheckoutForm from "@/components/CheckoutForm";
import { getActiveLogo } from "@/lib/site-assets";
export const metadata: Metadata = { title: "Checkout", description: "Review your DS CREATIONS cart and prepare an order enquiry." };
export default async function CheckoutPage() { const logo = await getActiveLogo(); return <><section className="blue-gradient page-hero"><div className="container-custom"><p className="eyebrow">Order enquiry</p><h1 className="page-title">Checkout</h1></div></section><section className="section-space bg-[var(--light-bg)]"><div className="container-custom"><CheckoutForm logo={logo} /></div></section></>; }
