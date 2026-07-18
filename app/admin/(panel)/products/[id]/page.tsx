import Image from "next/image";
import { notFound } from "next/navigation";
import AdminNotice from "@/components/admin/AdminNotice";
import DeleteProductButton from "@/components/admin/DeleteProductButton";
import ProductForm from "@/components/admin/ProductForm";
import SubmitButton from "@/components/admin/SubmitButton";
import { deleteProductImage, moveProductImage, setPrimaryImage, uploadProductImage } from "@/app/admin/actions";
import { getPrisma } from "@/lib/prisma";

export default async function EditProductPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string; saved?: string }> }) {
  const { id } = await params; const query = await searchParams; const prisma = getPrisma();
  const [product, categories] = await Promise.all([prisma.product.findUnique({ where: { id }, include: { images: { orderBy: { sortOrder: "asc" } } } }), prisma.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } })]);
  if (!product) notFound();
  const plainProduct = { ...product, price: product.price?.toString() || "", offerPrice: product.offerPrice?.toString() || "", gstPercentage: product.gstPercentage.toString() };
  return <><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-bold uppercase tracking-widest text-[var(--royal-blue)]">Products</p><h1 className="mt-2 text-3xl font-black text-[var(--dark-navy)]">Edit {product.name}</h1></div><DeleteProductButton id={product.id} /></div><div className="mt-6"><AdminNotice error={query.error} success={query.saved ? "Product saved." : undefined} /></div><ProductForm product={plainProduct} categories={categories} />
    <section className="content-card mt-8 p-6"><h2 className="text-xl font-black text-[var(--dark-navy)]">Product images</h2><p className="mt-2 text-sm text-slate-500">JPG, PNG or WEBP; maximum 5 MB. Add descriptive alt text for accessibility.</p><form action={uploadProductImage} className="mt-5 grid gap-4 md:grid-cols-[1fr_1fr_auto]"><input type="hidden" name="productId" value={product.id} /><input type="file" name="file" accept="image/jpeg,image/png,image/webp" required className="form-control" /><input name="altText" required defaultValue={product.name} className="form-control" /><SubmitButton>Upload image</SubmitButton></form>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{product.images.map((image) => <article className="rounded-xl border p-3" key={image.id}><div className="relative aspect-square overflow-hidden rounded-lg bg-slate-100"><Image src={image.url} alt={image.altText} fill unoptimized={image.url.startsWith("http")} className="object-contain" /></div><p className="mt-2 line-clamp-1 text-sm font-bold">{image.altText}</p><p className="text-xs text-slate-500">{image.isPrimary ? "Primary image" : `Position ${image.sortOrder + 1}`}</p><div className="mt-3 flex flex-wrap gap-3">{!image.isPrimary && <form action={setPrimaryImage}><input type="hidden" name="productId" value={product.id} /><input type="hidden" name="imageId" value={image.id} /><button className="text-sm font-bold text-[var(--royal-blue)]">Make primary</button></form>}{["up", "down"].map((direction) => <form action={moveProductImage} key={direction}><input type="hidden" name="productId" value={product.id} /><input type="hidden" name="imageId" value={image.id} /><input type="hidden" name="direction" value={direction} /><button className="text-sm font-bold">{direction === "up" ? "Move up" : "Move down"}</button></form>)}<form action={deleteProductImage}><input type="hidden" name="productId" value={product.id} /><input type="hidden" name="imageId" value={image.id} /><button className="text-sm font-bold text-red-700">Delete</button></form></div></article>)}</div>
    </section>
  </>;
}
