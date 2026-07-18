"use client";

import { useState } from "react";
import { saveProduct } from "@/app/admin/actions";
import { slugify } from "@/lib/slug";

type ProductData = Record<string, unknown> & { id?: string; sizes?: unknown; colours?: unknown };
export default function ProductForm({ product, categories }: { product?: ProductData; categories: { id: string; name: string }[] }) {
  const value = (key: string, fallback = "") => String(product?.[key] ?? fallback);
  const list = (key: "sizes" | "colours") => Array.isArray(product?.[key]) ? (product?.[key] as string[]).join(", ") : "";
  const checked = (key: string) => Boolean(product?.[key]);
  const isEditing = Boolean(product?.id);
  const initialName = value("name");
  const [name, setName] = useState(initialName);
  const [slug, setSlug] = useState(isEditing ? value("slug") : slugify(initialName));
  const [slugMode, setSlugMode] = useState<"auto" | "preserve" | "custom" | "regenerate">(isEditing ? "preserve" : "auto");
  const slugIsEditable = slugMode === "custom";

  const changeName = (nextName: string) => {
    setName(nextName);
    if (!isEditing && slugMode === "auto") setSlug(slugify(nextName));
  };

  const regenerateSlug = () => {
    setSlug(slugify(name));
    setSlugMode(isEditing ? "regenerate" : "auto");
  };

  return <form action={saveProduct} className="space-y-8"><input type="hidden" name="id" value={product?.id || ""} /><input type="hidden" name="slugMode" value={slugMode} />
    <section className="content-card grid gap-5 p-6 md:grid-cols-2"><h2 className="text-xl font-black text-[var(--dark-navy)] md:col-span-2">Product details</h2>
      <label className="form-label">Name *<input name="name" required value={name} onChange={(event) => changeName(event.target.value)} className="form-control" /></label><label className="form-label">SKU<input value={isEditing ? value("sku") : "Generated automatically when saved"} readOnly className="form-control bg-slate-100" /><span className="text-xs font-normal text-slate-500">SKU is a permanent internal product code.</span></label>
      <div className="form-label">
        <label htmlFor="product-slug">Slug *</label>
        <div className="flex flex-wrap items-center gap-2">
          <input id="product-slug" name="slug" required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" value={slug} readOnly={!slugIsEditable} onChange={(event) => setSlug(event.target.value)} className="form-control min-w-0 flex-1" />
          <button type="button" onClick={() => setSlugMode("custom")} className="btn-secondary px-4 py-2">Edit Slug</button>
          {isEditing ? <button type="button" onClick={regenerateSlug} className="btn-secondary px-4 py-2">Regenerate Slug</button> : null}
        </div>
      </div><label className="form-label">Category *<select name="categoryId" required defaultValue={value("categoryId")} className="form-control"><option value="">Select category</option>{categories.map((category) => <option value={category.id} key={category.id}>{category.name}</option>)}</select></label>
      <label className="form-label">Subcategory<input name="subcategory" defaultValue={value("subcategory")} className="form-control" /></label><label className="form-label">Audience<select name="audience" defaultValue={value("audience", "GENERAL")} className="form-control">{["SCHOOL", "CORPORATE", "INSTITUTION", "GENERAL"].map((item) => <option key={item}>{item}</option>)}</select></label>
      <label className="form-label md:col-span-2">Short description *<textarea name="shortDescription" required rows={2} defaultValue={value("shortDescription")} className="form-control" /></label><label className="form-label md:col-span-2">Full description *<textarea name="description" required rows={6} defaultValue={value("description")} className="form-control" /></label>
    </section>
    <section className="content-card grid gap-5 p-6 md:grid-cols-3"><h2 className="text-xl font-black text-[var(--dark-navy)] md:col-span-3">Pricing and stock</h2>
      <label className="form-label">Price<input name="price" type="number" min="0" step="0.01" defaultValue={value("price")} className="form-control" /></label><label className="form-label">Offer price<input name="offerPrice" type="number" min="0" step="0.01" defaultValue={value("offerPrice")} className="form-control" /></label><label className="form-label">GST % *<input name="gstPercentage" required type="number" min="0" max="100" step="0.01" defaultValue={value("gstPercentage", "18")} className="form-control" /></label>
      <label className="form-label">Minimum order *<input name="minimumOrderQuantity" required type="number" min="1" defaultValue={value("minimumOrderQuantity", "1")} className="form-control" /></label><label className="form-label">Stock quantity *<input name="stockQuantity" required type="number" min="0" defaultValue={value("stockQuantity", "0")} className="form-control" /></label><label className="form-label">Stock status<select name="stockStatus" defaultValue={value("stockStatus", "IN_STOCK")} className="form-control">{["IN_STOCK", "LOW_STOCK", "OUT_OF_STOCK", "MADE_TO_ORDER"].map((item) => <option key={item}>{item}</option>)}</select></label>
    </section>
    <section className="content-card grid gap-5 p-6 md:grid-cols-2"><h2 className="text-xl font-black text-[var(--dark-navy)] md:col-span-2">Specifications and fulfilment</h2>
      <label className="form-label">Brand<input name="brand" defaultValue={value("brand", "DS CREATIONS")} className="form-control" /></label><label className="form-label">Material<input name="material" defaultValue={value("material")} className="form-control" /></label>
      <label className="form-label">Sizes, comma-separated *<input name="sizes" required defaultValue={list("sizes")} className="form-control" /></label><label className="form-label">Colours, comma-separated *<input name="colours" required defaultValue={list("colours")} className="form-control" /></label>
      <label className="form-label">Fulfilment type<select name="fulfilmentType" defaultValue={value("fulfilmentType", "READY_STOCK")} className="form-control">{["READY_STOCK", "MADE_TO_ORDER", "CUSTOMIZED"].map((item) => <option key={item}>{item}</option>)}</select></label><label className="form-label">Delivery message *<textarea name="deliveryTime" required rows={3} defaultValue={value("deliveryTime", "Estimated dispatch: 2–5 working days, subject to availability.")} className="form-control" /></label>
      <div className="flex flex-wrap gap-5 md:col-span-2">{[["customizationAvailable", "Customization available"], ["printingAvailable", "Printing available"], ["embroideryAvailable", "Embroidery available"], ["featured", "Featured"], ["published", "Published"]].map(([name, label]) => <label key={name} className="font-bold"><input type="checkbox" name={name} defaultChecked={checked(name)} className="mr-2 accent-[var(--royal-blue)]" />{label}</label>)}</div>
    </section>
    <button className="btn-gold px-8">Save product</button>
  </form>;
}
