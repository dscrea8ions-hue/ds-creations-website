import type { Product, PublicProductImage } from "@/types/product";
import { products as localProducts } from "@/data/products";
import { getPrisma, hasDatabaseUrl } from "@/lib/prisma";
import type { Prisma } from "@/app/generated/prisma/client";

type DbProduct = Prisma.ProductGetPayload<{ include: { category: true; images: true } }>;

function mapProduct(row: DbProduct): Product {
  const fallback = localProducts.find((product) => product.slug === row.slug);
  const seenUrls = new Set<string>();
  const managedImages = [...row.images]
    .sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary) || a.sortOrder - b.sortOrder || a.createdAt.getTime() - b.createdAt.getTime() || a.id.localeCompare(b.id))
    .filter((image) => {
      if (seenUrls.has(image.url)) return false;
      seenUrls.add(image.url);
      return true;
    })
    .map<PublicProductImage>((image, index) => ({ id: image.id, url: image.url, altText: image.altText || row.name, isPrimary: index === 0, sortOrder: image.sortOrder }));
  const fallbackImages = fallback?.images?.length
    ? fallback.images
    : [{ id: `fallback-${row.id}`, url: fallback?.mainImage || "/products/corporate.svg", altText: row.name, isPrimary: true, sortOrder: 0 }];
  const images = (managedImages.length ? managedImages : fallbackImages).map((image, index) => ({ ...image, isPrimary: index === 0 }));
  const mainImage = images[0].url;
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
    createdAt: row.createdAt.toISOString(), mainImage, galleryImages: images.map((image) => image.url), images,
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
