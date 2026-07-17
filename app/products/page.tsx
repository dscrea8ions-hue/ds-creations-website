import type { Metadata } from "next";
import ProductExplorer from "@/components/ProductExplorer";
import DownloadCatalogueButton from "@/components/DownloadCatalogueButton";

export const metadata: Metadata = { title: "Products", description: "Browse uniforms, apparel, awards, stationery, drinkware and institutional products from DS CREATIONS." };

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ audience?: string }> }) {
  const params = await searchParams;
  return <><section className="blue-gradient page-hero"><div className="container-custom flex flex-wrap items-end justify-between gap-8"><div><p className="eyebrow">Our Products</p><h1 className="page-title">Products manufactured for schools, companies and institutions</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-white/75">Buy a single piece or request optional bulk pricing and customization for your organization.</p></div><DownloadCatalogueButton label="DOWNLOAD PRODUCT CATALOGUE" className="btn-gold" showMessage /></div></section><section className="section-space bg-[var(--light-bg)]"><div className="container-custom"><ProductExplorer initialAudience={params.audience?.toUpperCase()} /></div></section></>;
}
