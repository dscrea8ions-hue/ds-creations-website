import type { MetadataRoute } from "next";
import { products } from "@/data/products";
import { siteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/about", "/products", "/industries", "/bulk-orders", "/contact", "/cart", "/checkout"];
  return [
    ...pages.map((path) => ({ url: `${siteUrl}${path}`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: path === "" ? 1 : .8 })),
    ...products.map((product) => ({ url: `${siteUrl}/products/${product.slug}`, lastModified: new Date(product.createdAt), changeFrequency: "monthly" as const, priority: .7 })),
  ];
}
