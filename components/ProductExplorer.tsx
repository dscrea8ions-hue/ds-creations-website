"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import ProductCard from "./ProductCard";
import { audiences, categories, products } from "@/data/products";

type Props = { initialAudience?: string };

export default function ProductExplorer({ initialAudience = "" }: Props) {
  const [search, setSearch] = useState(""); const [category, setCategory] = useState("");
  const [audience, setAudience] = useState(initialAudience); const [availability, setAvailability] = useState("");
  const [institution, setInstitution] = useState(""); const [maxPrice, setMaxPrice] = useState(4000);
  const [sort, setSort] = useState("featured");
  const institutions = [...new Set(products.map((p) => p.schoolName).filter(Boolean))] as string[];
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return products.filter((p) => p.published && (!q || `${p.name} ${p.category} ${p.tags.join(" ")}`.toLowerCase().includes(q)) && (!category || p.category === category) && (!audience || p.audience === audience) && (!availability || p.stockStatus === availability) && (!institution || p.schoolName === institution) && (p.price === null || (p.offerPrice ?? p.price) <= maxPrice)).sort((a, b) => sort === "newest" ? b.createdAt.localeCompare(a.createdAt) : sort === "low" ? (a.offerPrice ?? a.price ?? Infinity) - (b.offerPrice ?? b.price ?? Infinity) : sort === "high" ? (b.offerPrice ?? b.price ?? 0) - (a.offerPrice ?? a.price ?? 0) : sort === "name" ? a.name.localeCompare(b.name) : Number(b.featured) - Number(a.featured));
  }, [search, category, audience, availability, institution, maxPrice, sort]);
  const clear = () => { setSearch(""); setCategory(""); setAudience(""); setAvailability(""); setInstitution(""); setMaxPrice(4000); setSort("featured"); };
  const selectClass = "w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-[var(--royal-blue)] focus:ring-2 focus:ring-blue-100";
  return (
    <div>
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:p-5">
        <div className="relative"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} /><label htmlFor="product-search" className="sr-only">Search products</label><input id="product-search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search uniforms, awards, bottles, stationery…" className="w-full rounded-xl border border-slate-200 py-3 pl-12 pr-4 outline-none focus:border-[var(--royal-blue)] focus:ring-2 focus:ring-blue-100" /></div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
          <select aria-label="Category" className={selectClass} value={category} onChange={(e) => setCategory(e.target.value)}><option value="">All categories</option>{categories.map((item) => <option key={item}>{item}</option>)}</select>
          <select aria-label="Audience" className={selectClass} value={audience} onChange={(e) => setAudience(e.target.value)}><option value="">All audiences</option>{audiences.map((item) => <option key={item}>{item.charAt(0) + item.slice(1).toLowerCase()}</option>)}</select>
          <select aria-label="Institution" className={selectClass} value={institution} onChange={(e) => setInstitution(e.target.value)}><option value="">All institutions</option>{institutions.map((item) => <option key={item}>{item}</option>)}</select>
          <select aria-label="Availability" className={selectClass} value={availability} onChange={(e) => setAvailability(e.target.value)}><option value="">Any availability</option><option value="IN_STOCK">In stock</option><option value="LOW_STOCK">Low stock</option><option value="MADE_TO_ORDER">Made to order</option></select>
          <label className="rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-500">Price up to ₹{maxPrice}<input aria-label="Maximum price" type="range" min="100" max="4000" step="100" value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} className="mt-1 w-full accent-[var(--royal-blue)]" /></label>
          <select aria-label="Sort products" className={selectClass} value={sort} onChange={(e) => setSort(e.target.value)}><option value="featured">Featured</option><option value="newest">Newest</option><option value="low">Price: Low to High</option><option value="high">Price: High to Low</option><option value="name">Name: A to Z</option></select>
        </div>
      </div>
      <div className="my-7 flex flex-wrap items-center justify-between gap-4"><p className="font-bold text-[var(--dark-navy)]"><SlidersHorizontal className="mr-2 inline" size={18} />{filtered.length} products</p><button onClick={clear} className="btn-secondary flex items-center gap-2"><X size={16} /> Clear filters</button></div>
      {filtered.length ? <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{filtered.map((product) => <ProductCard key={product.id} product={product} />)}</div> : <div className="rounded-3xl border border-dashed border-slate-300 bg-white py-20 text-center"><h2 className="text-2xl font-black text-[var(--dark-navy)]">No matching products</h2><p className="mt-2 text-slate-600">Try widening your filters or clearing your search.</p></div>}
    </div>
  );
}
