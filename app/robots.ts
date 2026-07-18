import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";
import { getPublicSettings } from "@/lib/site-data";

export default async function robots(): Promise<MetadataRoute.Robots> { const settings = await getPublicSettings(); const base = String(settings.siteUrl || siteUrl).replace(/\/$/, ""); return { rules: { userAgent: "*", allow: "/" }, sitemap: `${base}/sitemap.xml` }; }
