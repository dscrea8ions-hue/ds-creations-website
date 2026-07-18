import { NextResponse } from "next/server";
import { getActiveCatalogue, getActiveLogo } from "@/lib/site-assets";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const type = new URL(request.url).searchParams.get("type") === "catalogue" ? "CATALOGUE" : "LOGO";
  const asset = type === "CATALOGUE" ? await getActiveCatalogue() : await getActiveLogo();
  return asset
    ? NextResponse.json(asset, { headers: { "Cache-Control": "private, no-store" } })
    : NextResponse.json({ asset: null }, { status: 404, headers: { "Cache-Control": "private, no-store" } });
}
