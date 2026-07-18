import { notFound } from "next/navigation";
import AdminNotice from "@/components/admin/AdminNotice";
import DeleteProductButton from "@/components/admin/DeleteProductButton";
import ProductForm from "@/components/admin/ProductForm";
import ProductImageManager from "@/components/admin/product-images/ProductImageManager";
import { getPrisma } from "@/lib/prisma";

export default async function EditProductPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string; saved?: string }> }) {
  const { id } = await params; const query = await searchParams; const prisma = getPrisma();
  const [product, categories] = await Promise.all([prisma.product.findUnique({ where: { id }, include: { images: { orderBy: { sortOrder: "asc" } } } }), prisma.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } })]);
  if (!product) notFound();
  const plainProduct = { ...product, price: product.price?.toString() || "", offerPrice: product.offerPrice?.toString() || "", gstPercentage: product.gstPercentage.toString() };
  return <><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-bold uppercase tracking-widest text-[var(--royal-blue)]">Products</p><h1 className="mt-2 text-3xl font-black text-[var(--dark-navy)]">Edit {product.name}</h1></div><DeleteProductButton id={product.id} /></div><div className="mt-6"><AdminNotice error={query.error} success={query.saved ? "Product saved." : undefined} /></div><ProductForm product={plainProduct} categories={categories} />
    <section className="content-card mt-8 p-6"><h2 className="text-xl font-black text-[var(--dark-navy)]">Product images</h2><p className="mt-2 text-sm text-slate-500">Select or drop one or more JPG, PNG or WEBP images. Files remain local until you confirm the upload.</p><ProductImageManager productId={product.id} productTitle={product.name} savedImages={product.images.map(({ id: imageId, url, altText, isPrimary, sortOrder }) => ({ id: imageId, url, altText, isPrimary, sortOrder }))} /></section>
  </>;
}
