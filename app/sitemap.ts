import type { MetadataRoute } from "next";
import { getPublicProducts } from "@/lib/product-data";
import { siteUrl } from "@/lib/site";
import { getPublicSettings } from "@/lib/site-data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> { const [products, settings] = await Promise.all([getPublicProducts(), getPublicSettings()]); const base = String(settings.siteUrl || siteUrl).replace(/\/$/, ""); const pages = ["", "/about", "/products", "/industries", "/bulk-orders", "/contact", "/cart", "/checkout"]; return [...pages.map((path) => ({ url: `${base}${path}`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: path === "" ? 1 : .8 })), ...products.map((product) => ({ url: `${base}/products/${product.slug}`, lastModified: new Date(product.createdAt), changeFrequency: "monthly" as const, priority: .7 }))]; }
