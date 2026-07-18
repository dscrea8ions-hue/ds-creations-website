const fallbackSiteUrl = "https://ds-creations-website.vercel.app";

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || fallbackSiteUrl).replace(/\/$/, "");
