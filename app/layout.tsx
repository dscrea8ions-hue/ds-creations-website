import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import { CartProvider } from "@/context/CartContext";
import { siteUrl } from "@/lib/site";
import { getPublicSettings } from "@/lib/site-data";
import { getActiveCatalogue, getActiveLogo } from "@/lib/site-assets";

export async function generateMetadata(): Promise<Metadata> { const settings = await getPublicSettings(); const resolvedSiteUrl = String(settings.siteUrl || siteUrl); return { metadataBase: new URL(resolvedSiteUrl), title: { default: "DS CREATIONS | Uniform & Customized Product Manufacturer", template: "%s | DS CREATIONS" }, description: "DS CREATIONS manufactures uniforms, awards, customized apparel and institutional products in Lajpat Nagar 4, New Delhi.", keywords: ["DS CREATIONS", "school uniforms Delhi", "corporate uniforms", "bulk customized products"], openGraph: { title: "DS CREATIONS", description: "Premium uniforms and customized products for schools and businesses.", url: resolvedSiteUrl, type: "website", locale: "en_IN", siteName: "DS CREATIONS", images: [{ url: "/og.png", width: 1536, height: 1024, alt: "DS CREATIONS uniforms and customized products" }] }, twitter: { card: "summary_large_image", title: "DS CREATIONS", description: "Premium uniforms and customized products for schools and businesses.", images: ["/og.png"] } }; }
export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { const [settings, logo, catalogue] = await Promise.all([getPublicSettings(), getActiveLogo(), getActiveCatalogue()]); return <html lang="en"><body><CartProvider><Header logo={logo} catalogue={catalogue} /><main>{children}</main><Footer phone={String(settings.phone)} whatsapp={String(settings.whatsapp)} email={String(settings.email)} address={String(settings.address)} description={String(settings.footerDescription)} logo={logo} catalogue={catalogue} /><FloatingWhatsApp number={String(settings.whatsapp)} /></CartProvider></body></html>; }
