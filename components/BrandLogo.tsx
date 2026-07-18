"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { PublicSiteAsset } from "@/types/site-assets";

export default function BrandLogo({ darkText = false, logo = null }: { darkText?: boolean; logo?: PublicSiteAsset | null }) {
  const [activeLogoFailed, setActiveLogoFailed] = useState(false);
  const [fallbackFailed, setFallbackFailed] = useState(false);
  const logoUrl = activeLogoFailed ? "/images/logo.jpeg" : logo?.url || "/images/logo.jpeg";
  return <Link href="/" aria-label="DS CREATIONS home" className="inline-flex shrink-0">{fallbackFailed ? <span className={`flex h-12 items-center text-sm font-black tracking-wider ${darkText ? "text-[var(--dark-navy)]" : "text-white"}`}>DS CREATIONS</span> : <span className="relative block h-12 w-44"><Image src={logoUrl} alt={logo?.title || "DS CREATIONS"} fill priority onError={() => { if (logoUrl === "/images/logo.jpeg") setFallbackFailed(true); else setActiveLogoFailed(true); }} className="object-contain object-left" sizes="176px" /></span>}</Link>;
}
