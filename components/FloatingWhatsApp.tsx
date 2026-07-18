"use client";
import { usePathname } from "next/navigation";
export default function FloatingWhatsApp({ number }: { number: string }) { const pathname = usePathname(); if (pathname.startsWith("/admin")) return null; return <a href={`https://wa.me/${number}`} target="_blank" rel="noreferrer" aria-label="Chat with DS CREATIONS on WhatsApp" className="fixed bottom-5 right-5 z-40 rounded-full bg-[var(--gold)] px-5 py-3 font-black text-[var(--dark-navy)] shadow-2xl hover:-translate-y-1 hover:bg-white">WhatsApp</a>; }
