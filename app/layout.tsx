import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CartProvider } from "@/context/CartContext";
import { siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "DS CREATIONS | Uniform & Customized Product Manufacturer", template: "%s | DS CREATIONS" },
  description: "DS CREATIONS manufactures uniforms, awards, customized apparel and institutional products in Lajpat Nagar 4, New Delhi.",
  keywords: ["DS CREATIONS", "school uniforms Delhi", "corporate uniforms", "bulk customized products"],
  openGraph: { title: "DS CREATIONS", description: "Premium uniforms and customized products for schools and businesses.", url: siteUrl, type: "website", locale: "en_IN", siteName: "DS CREATIONS", images: [{ url: "/og.png", width: 1536, height: 1024, alt: "DS CREATIONS uniforms and customized products" }] },
  twitter: { card: "summary_large_image", title: "DS CREATIONS", description: "Premium uniforms and customized products for schools and businesses.", images: ["/og.png"] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><CartProvider><Header /><main>{children}</main><Footer /><a href="https://wa.me/918368045535" target="_blank" rel="noreferrer" aria-label="Chat with DS CREATIONS on WhatsApp" className="fixed bottom-5 right-5 z-40 rounded-full bg-[var(--gold)] px-5 py-3 font-black text-[var(--dark-navy)] shadow-2xl hover:-translate-y-1 hover:bg-white">WhatsApp</a></CartProvider></body></html>;
}
