import type { Product } from "@/types/product";
import { products as localProducts } from "@/data/products";
import { getPrisma, hasDatabaseUrl } from "@/lib/prisma";
import type { Prisma } from "@/app/generated/prisma/client";

type DbProduct = Prisma.ProductGetPayload<{ include: { category: true; images: true } }>;

function mapProduct(row: DbProduct): Product {
  const fallback = localProducts.find((product) => product.slug === row.slug);
  const orderedImages = [...row.images].sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary) || a.sortOrder - b.sortOrder || a.id.localeCompare(b.id)).map((image) => image.url);
  const mainImage = orderedImages[0] || fallback?.mainImage || "/products/corporate.svg";
  return {
    id: row.id, slug: row.slug, name: row.name, sku: row.sku, shortDescription: row.shortDescription, description: row.description,
    category: row.category.name, subcategory: row.subcategory || "General", audience: row.audience, institutionName: row.institutionName || undefined,
    schoolName: row.schoolName || undefined, brand: row.brand || "DS CREATIONS", price: row.price == null ? null : Number(row.price),
    offerPrice: row.offerPrice == null ? undefined : Number(row.offerPrice), gstPercentage: Number(row.gstPercentage),
    minimumOrderQuantity: Math.max(1, row.minimumOrderQuantity), stockQuantity: row.stockQuantity, stockStatus: row.stockStatus,
    material: row.material || "Specification available on request", sizes: Array.isArray(row.sizes) ? row.sizes.map(String) : ["Standard"],
    colours: Array.isArray(row.colours) ? row.colours.map(String) : ["Standard"], weight: row.weight || undefined,
    deliveryTime: row.deliveryTime, fulfilmentType: row.fulfilmentType, customizationAvailable: row.customizationAvailable,
    embroideryAvailable: row.embroideryAvailable, printingAvailable: row.printingAvailable, featured: row.featured, published: row.published,
    createdAt: row.createdAt.toISOString(), mainImage, galleryImages: orderedImages.length ? orderedImages : [mainImage],
    features: ["Single-piece ordering available", "Quality checked before dispatch", row.customizationAvailable ? "Optional customization available" : "Practical standard specification"],
    specifications: { Material: row.material || "Available on request", "Minimum order": `${Math.max(1, row.minimumOrderQuantity)} piece`, GST: `${Number(row.gstPercentage)}%` },
    tags: [row.category.name, row.subcategory || "", row.audience].filter(Boolean),
  };
}

// TODO: Remove the local fallback after the production database and seeded assets are confirmed.
export async function getPublicProducts(): Promise<Product[]> {
  if (!hasDatabaseUrl()) return localProducts.filter((product) => product.published);
  try {
    const rows = await getPrisma().product.findMany({ where: { published: true, category: { active: true } }, include: { category: true, images: { orderBy: { sortOrder: "asc" } } }, orderBy: [{ featured: "desc" }, { updatedAt: "desc" }] });
    return rows.map((row) => mapProduct(row));
  } catch { return localProducts.filter((product) => product.published); }
}

export async function getPublicProduct(slug: string): Promise<Product | undefined> {
  if (!hasDatabaseUrl()) return localProducts.find((product) => product.slug === slug && product.published);
  try { const row = await getPrisma().product.findFirst({ where: { slug, published: true, category: { active: true } }, include: { category: true, images: { orderBy: { sortOrder: "asc" } } } }); return row ? mapProduct(row) : undefined; }
  catch { return localProducts.find((product) => product.slug === slug && product.published); }
}
