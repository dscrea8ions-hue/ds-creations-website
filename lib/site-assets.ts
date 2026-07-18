import "server-only";

import { cache } from "react";
import { getPrisma, hasDatabaseUrl } from "@/lib/prisma";
import type { PublicSiteAsset } from "@/types/site-assets";

const filenameFrom = (url: string, pathname: string | null) => {
  const path = pathname || new URL(url, "http://localhost").pathname;
  const filename = path.split("/").filter(Boolean).at(-1) || "asset";
  try { return decodeURIComponent(filename); } catch { return filename; }
};

const getActiveAsset = async (type: "CATALOGUE" | "LOGO"): Promise<PublicSiteAsset | null> => {
  if (!hasDatabaseUrl()) return null;
  try {
    const asset = await getPrisma().siteAsset.findFirst({
      where: { type, active: true },
      orderBy: { updatedAt: "desc" },
      select: { id: true, title: true, url: true, pathname: true },
    });
    return asset ? { ...asset, filename: filenameFrom(asset.url, asset.pathname) } : null;
  } catch {
    return null;
  }
};

export const getActiveCatalogue = cache(() => getActiveAsset("CATALOGUE"));
export const getActiveLogo = cache(() => getActiveAsset("LOGO"));
