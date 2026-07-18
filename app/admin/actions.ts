"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin, writeAudit } from "@/lib/admin";
import { BlobStorageError, blobTokenPresent, deletePublicBlob, uploadPublicBlob } from "@/lib/blob-storage";
import { getPrisma } from "@/lib/prisma";
import { advanceProductSkuCounter, generateNextProductSku, isProductSkuUniqueConflict, withServerProductSku } from "@/lib/sku";
import { generateUniqueSlug } from "@/lib/slug";

const optionalMoney = z.preprocess((value) => value === "" || value == null ? null : Number(value), z.number().min(0).nullable());
const productSchema = z.object({
  name: z.string().trim().min(2).max(160),
  shortDescription: z.string().trim().min(10).max(400), description: z.string().trim().min(20).max(5000), categoryId: z.string().min(1),
  subcategory: z.string().trim().max(100).optional(), audience: z.enum(["SCHOOL", "CORPORATE", "INSTITUTION", "GENERAL"]),
  brand: z.string().trim().max(100).optional(), price: optionalMoney, offerPrice: optionalMoney,
  gstPercentage: z.coerce.number().min(0).max(100), minimumOrderQuantity: z.coerce.number().int().min(1), stockQuantity: z.coerce.number().int().min(0),
  stockStatus: z.enum(["IN_STOCK", "LOW_STOCK", "OUT_OF_STOCK", "MADE_TO_ORDER"]), material: z.string().trim().max(200).optional(),
  sizes: z.string().transform((value) => value.split(",").map((item) => item.trim()).filter(Boolean)).pipe(z.array(z.string()).min(1)),
  colours: z.string().transform((value) => value.split(",").map((item) => item.trim()).filter(Boolean)).pipe(z.array(z.string()).min(1)),
  deliveryTime: z.string().trim().min(10).max(300), fulfilmentType: z.enum(["READY_STOCK", "MADE_TO_ORDER", "CUSTOMIZED"]),
  customizationAvailable: z.boolean(), embroideryAvailable: z.boolean(), printingAvailable: z.boolean(), featured: z.boolean(), published: z.boolean(),
});

const checked = (form: FormData, key: string) => form.get(key) === "on";
const productInput = (form: FormData) => productSchema.safeParse({
  ...Object.fromEntries(form), customizationAvailable: checked(form, "customizationAvailable"), embroideryAvailable: checked(form, "embroideryAvailable"),
  printingAvailable: checked(form, "printingAvailable"), featured: checked(form, "featured"), published: checked(form, "published"),
});
const fail = (path: string, message: string): never => redirect(`${path}${path.includes("?") ? "&" : "?"}error=${encodeURIComponent(message)}`);
const revalidatePublicAssetPaths = () => {
  ["/", "/about", "/bulk-orders", "/cart", "/catalogue", "/checkout", "/contact", "/industries", "/products", "/quote"].forEach((path) => revalidatePath(path));
  revalidatePath("/products/[slug]", "page");
};
const revalidateProductAssetPaths = (adminPath: string) => {
  revalidatePath(adminPath);
  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath("/products/[slug]", "page");
};

export async function saveProduct(form: FormData) {
  const user = await requireAdmin(); const id = String(form.get("id") || ""); const parsed = productInput(form); const path = id ? `/admin/products/${id}` : "/admin/products/new";
  if (!parsed.success) fail(path, "Please review the product fields and try again.");
  const submittedMode = z.enum(["auto", "preserve", "custom", "regenerate"]).safeParse(form.get("slugMode"));
  const slugMode = id
    ? (submittedMode.success && ["custom", "regenerate"].includes(submittedMode.data) ? submittedMode.data : "preserve")
    : (submittedMode.success && submittedMode.data === "custom" ? "custom" : "auto");
  const submittedSlug = z.string().trim().min(1).max(200).safeParse(form.get("slug"));
  if (slugMode === "custom" && !submittedSlug.success) fail(path, "Enter a valid custom slug and try again.");

  try {
    const prisma = getPrisma();
    const existingProduct = id ? await prisma.product.findUnique({ where: { id }, select: { id: true, slug: true, sku: true } }) : null;
    if (id && !existingProduct) fail("/admin/products", "Product record was not found.");

    const nextSlug = slugMode === "preserve"
      ? existingProduct!.slug
      : await generateUniqueSlug(prisma, slugMode === "custom" ? submittedSlug.data! : parsed.data!.name, id || undefined);
    let saved;
    if (id) {
      saved = await prisma.product.update({ where: { id }, data: withServerProductSku({ ...parsed.data!, slug: nextSlug }, existingProduct!.sku) });
    } else {
      for (let attempt = 1; attempt <= 3; attempt += 1) {
        try {
          saved = await prisma.$transaction(async (transaction) => {
            const sku = await generateNextProductSku(transaction);
            return transaction.product.create({ data: withServerProductSku({ ...parsed.data!, slug: nextSlug }, sku) });
          });
          break;
        } catch (error) {
          if (!isProductSkuUniqueConflict(error)) throw error;
          await advanceProductSkuCounter(prisma);
        }
      }
      if (!saved) throw new Error("PRODUCT_SKU_GENERATION_FAILED");
    }
    await writeAudit(user.id, id ? "PRODUCT_UPDATE" : "PRODUCT_CREATE", "Product", saved.id, { name: saved.name, sku: saved.sku });
    revalidatePath("/"); revalidatePath("/products"); revalidatePath("/products/[slug]", "page"); revalidatePath(`/products/${saved.slug}`); revalidatePath("/admin/products");
    if (existingProduct && existingProduct.slug !== saved.slug) revalidatePath(`/products/${existingProduct.slug}`);
    redirect(`/admin/products/${saved.id}?saved=1`);
  } catch (error) {
    if ((error as { digest?: string }).digest?.startsWith("NEXT_REDIRECT")) throw error;
    if ((error as Error).message === "PRODUCT_SKU_GENERATION_FAILED" || (error as Error).message === "PRODUCT_SKU_RANGE_EXHAUSTED") fail(path, "A unique product SKU could not be generated. Please try again.");
    fail(path, "Product save failed. Please review the product details and try again.");
  }
}

export async function deleteProduct(form: FormData) {
  const user = await requireAdmin(); const id = z.string().min(1).parse(form.get("id")); const prisma = getPrisma(); const product = await prisma.product.findUnique({ where: { id }, include: { images: true } });
  if (!product) return fail("/admin/products", "Product record was not found.");
  try { for (const image of product.images) if (image.pathname) await deletePublicBlob(image.pathname); }
  catch { fail("/admin/products", "Blob storage rejected the deletion."); }
  try { await prisma.product.delete({ where: { id } }); await writeAudit(user.id, "PRODUCT_DELETE", "Product", id, { name: product.name }); revalidatePath("/"); revalidatePath("/products"); revalidatePath("/products/[slug]", "page"); revalidatePath("/admin/products"); }
  catch { fail("/admin/products", "Database record could not be deleted."); }
  redirect("/admin/products?deleted=1");
}

export async function toggleProduct(form: FormData) {
  const user = await requireAdmin(); const id = z.string().min(1).parse(form.get("id")); const field = z.enum(["published", "featured"]).parse(form.get("field")); const value = form.get("value") === "true";
  try { await getPrisma().product.update({ where: { id }, data: { [field]: value } }); await writeAudit(user.id, field === "published" ? (value ? "PRODUCT_PUBLISH" : "PRODUCT_UNPUBLISH") : "PRODUCT_FEATURE_CHANGE", "Product", id, { value }); revalidatePath("/"); revalidatePath("/products"); revalidatePath("/products/[slug]", "page"); revalidatePath("/admin/products"); }
  catch { fail("/admin/products", "Product status update failed."); }
}

const safeName = (name: string) => name.toLowerCase().replace(/[^a-z0-9.]+/g, "-").replace(/(^-|-$)/g, "");
const blobUploadFailure = (path: string, error: unknown): never => {
  if (error instanceof BlobStorageError && error.reason === "TOKEN_MISSING") return fail(path, "Storage token is missing.");
  return fail(path, "Blob storage rejected the upload.");
};

export async function uploadProductImage(form: FormData) {
  const user = await requireAdmin(); const productId = z.string().min(1).parse(form.get("productId")); const uploadedValue = form.get("file"); const altText = z.string().trim().min(2).max(180).parse(form.get("altText")); const path = `/admin/products/${productId}`;
  if (!(uploadedValue instanceof File) || uploadedValue.size === 0) return fail(path, "Choose a non-empty image file.");
  const file = uploadedValue;
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) return fail(path, "File type is unsupported. Upload JPG, PNG or WEBP only.");
  if (file.size > 5 * 1024 * 1024) return fail(`/admin/products/${productId}`, "Image is too large. Maximum size is 5 MB.");
  if (!blobTokenPresent()) return fail(path, "Storage token is missing.");

  const blob = await uploadPublicBlob(`products/${Date.now()}-${safeName(file.name)}`, file).catch((error) => blobUploadFailure(path, error));

  try {
    const prisma = getPrisma();
    const image = await prisma.$transaction(async (tx) => {
      const lastImage = await tx.productImage.findFirst({ where: { productId }, orderBy: [{ sortOrder: "desc" }, { createdAt: "desc" }], select: { sortOrder: true } });
      return tx.productImage.create({ data: { productId, url: blob.url, pathname: blob.pathname, altText, isPrimary: !lastImage, sortOrder: lastImage ? lastImage.sortOrder + 1 : 0 } });
    });
    await writeAudit(user.id, "PRODUCT_IMAGE_UPLOAD", "ProductImage", image.id, { productId });
    revalidateProductAssetPaths(path);
  }
  catch { await deletePublicBlob(blob.pathname).catch(() => undefined); fail(path, "Database record could not be saved."); }
}

export async function setPrimaryImage(form: FormData) {
  const user = await requireAdmin(); const imageId = z.string().min(1).parse(form.get("imageId")); const productId = z.string().min(1).parse(form.get("productId"));
  const prisma = getPrisma(); const image = await prisma.productImage.findFirst({ where: { id: imageId, productId }, select: { id: true } });
  if (!image) return fail(`/admin/products/${productId}`, "Image record was not found.");
  try { await prisma.$transaction([prisma.productImage.updateMany({ where: { productId }, data: { isPrimary: false } }), prisma.productImage.update({ where: { id: image.id }, data: { isPrimary: true } })]); await writeAudit(user.id, "PRODUCT_IMAGE_PRIMARY", "ProductImage", image.id, { productId }); revalidateProductAssetPaths(`/admin/products/${productId}`); }
  catch { fail(`/admin/products/${productId}`, "Primary image update failed."); }
}

export async function moveProductImage(form: FormData) {
  const user = await requireAdmin(); const imageId = z.string().min(1).parse(form.get("imageId")); const productId = z.string().min(1).parse(form.get("productId")); const direction = z.enum(["up", "down"]).parse(form.get("direction"));
  try { const prisma = getPrisma(); const images = await prisma.productImage.findMany({ where: { productId }, orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] }); const index = images.findIndex((image) => image.id === imageId); const target = direction === "up" ? index - 1 : index + 1; if (index >= 0 && target >= 0 && target < images.length) await prisma.$transaction([prisma.productImage.update({ where: { id: images[index].id }, data: { sortOrder: images[target].sortOrder } }), prisma.productImage.update({ where: { id: images[target].id }, data: { sortOrder: images[index].sortOrder } })]); await writeAudit(user.id, "PRODUCT_IMAGE_REORDER", "ProductImage", imageId, { productId, direction }); revalidateProductAssetPaths(`/admin/products/${productId}`); }
  catch { fail(`/admin/products/${productId}`, "Image reorder failed."); }
}

export async function deleteProductImage(form: FormData) {
  const user = await requireAdmin(); const imageId = z.string().min(1).parse(form.get("imageId")); const productId = z.string().min(1).parse(form.get("productId")); const path = `/admin/products/${productId}`; const prisma = getPrisma();
  const image = await prisma.productImage.findFirst({ where: { id: imageId, productId } });
  if (!image) return fail(path, "Image record was not found.");
  if (image.pathname) { try { await deletePublicBlob(image.pathname); } catch { fail(path, "Blob storage rejected the deletion."); } }
  try { await prisma.$transaction(async (tx) => { await tx.productImage.delete({ where: { id: image.id } }); if (image.isPrimary) { const nextImage = await tx.productImage.findFirst({ where: { productId }, orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }], select: { id: true } }); if (nextImage) await tx.productImage.update({ where: { id: nextImage.id }, data: { isPrimary: true } }); } }); await writeAudit(user.id, "PRODUCT_IMAGE_DELETE", "ProductImage", image.id, { productId }); revalidateProductAssetPaths(path); }
  catch { fail(path, "Database record could not be deleted."); }
}

export async function saveCategory(form: FormData) {
  const user = await requireAdmin(); const id = String(form.get("id") || ""); const parsed = z.object({ name: z.string().trim().min(2).max(100), slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/), description: z.string().trim().max(500).optional(), sortOrder: z.coerce.number().int().min(0), active: z.boolean() }).safeParse({ ...Object.fromEntries(form), active: checked(form, "active") });
  if (!parsed.success) fail("/admin/categories", "Please review the category fields.");
  try { const saved = id ? await getPrisma().category.update({ where: { id }, data: parsed.data! }) : await getPrisma().category.create({ data: parsed.data! }); await writeAudit(user.id, id ? "CATEGORY_UPDATE" : "CATEGORY_CREATE", "Category", saved.id); revalidatePath("/products"); revalidatePath("/admin/categories"); }
  catch { fail("/admin/categories", "Category save failed. The slug must be unique."); }
}

const assetRules = { LOGO: { types: ["image/jpeg", "image/png", "image/webp"], max: 5 * 1024 * 1024 }, CATALOGUE: { types: ["application/pdf"], max: 25 * 1024 * 1024 } } as const;
export async function uploadSiteAsset(form: FormData) {
  const user = await requireAdmin(); const type = z.enum(["LOGO", "CATALOGUE"]).parse(form.get("type")); const title = z.string().trim().min(2).max(160).parse(form.get("title")); const uploadedValue = form.get("file"); const returnType = type.toLowerCase(); const path = `/admin/assets?type=${returnType}`;
  if (!(uploadedValue instanceof File) || uploadedValue.size === 0) return fail(path, `Choose a non-empty ${type === "LOGO" ? "image" : "PDF"} file.`);
  const file = uploadedValue;
  if (!(assetRules[type].types as readonly string[]).includes(file.type)) return fail(path, type === "LOGO" ? "File type is unsupported. Upload JPG, PNG or WEBP only." : "File type is unsupported. Upload a PDF only.");
  if (file.size > assetRules[type].max) return fail(path, `File is too large. Maximum size is ${type === "LOGO" ? "5 MB" : "25 MB"}.`);
  if (!blobTokenPresent()) return fail(path, "Storage token is missing.");

  const prisma = getPrisma();
  const previousAsset = await prisma.siteAsset.findFirst({ where: { type, active: true }, orderBy: { updatedAt: "desc" } });
  const blob = await uploadPublicBlob(`site-assets/${returnType}/${Date.now()}-${safeName(file.name)}`, file).catch((error) => blobUploadFailure(path, error));

  const asset = await prisma.$transaction(async (tx) => { await tx.siteAsset.updateMany({ where: { type, active: true }, data: { active: false } }); return tx.siteAsset.create({ data: { type, title, url: blob.url, pathname: blob.pathname, mimeType: file.type, fileSize: file.size, active: true } }); }).catch(async () => { await deletePublicBlob(blob.pathname).catch(() => undefined); return fail(path, "Database record could not be saved."); });
  await writeAudit(user.id, `${type}_UPLOAD_ACTIVATE`, "SiteAsset", asset.id, { title });

  if (previousAsset && previousAsset.id !== asset.id) {
    try {
      const previousBlob = previousAsset.pathname || (previousAsset.url.startsWith("https://") ? previousAsset.url : null);
      if (previousBlob) await deletePublicBlob(previousBlob);
      await prisma.siteAsset.delete({ where: { id: previousAsset.id } });
    } catch {
      revalidatePublicAssetPaths();
      revalidatePath("/admin/assets");
      return fail(path, "Replacement activated, but the previous file could not be cleaned up.");
    }
  }

  revalidatePublicAssetPaths();
  revalidatePath("/admin/assets");
  redirect(`${path}&saved=1`);
}

export async function activateSiteAsset(form: FormData) {
  const user = await requireAdmin(); const id = z.string().min(1).parse(form.get("id")); const type = z.enum(["LOGO", "CATALOGUE"]).parse(form.get("type"));
  try { await getPrisma().$transaction([getPrisma().siteAsset.updateMany({ where: { type, active: true }, data: { active: false } }), getPrisma().siteAsset.update({ where: { id, type }, data: { active: true } })]); await writeAudit(user.id, `${type}_ACTIVATE`, "SiteAsset", id); revalidatePublicAssetPaths(); revalidatePath("/admin/assets"); }
  catch { fail(`/admin/assets?type=${type.toLowerCase()}`, `${type === "LOGO" ? "Logo" : "Catalogue"} activation failed.`); }
}

export async function deactivateSiteAsset(form: FormData) { const user = await requireAdmin(); const id = z.string().min(1).parse(form.get("id")); const type = z.enum(["LOGO", "CATALOGUE"]).parse(form.get("type")); try { await getPrisma().siteAsset.update({ where: { id, type }, data: { active: false } }); await writeAudit(user.id, `${type}_DEACTIVATE`, "SiteAsset", id); revalidatePublicAssetPaths(); revalidatePath("/admin/assets"); } catch { fail(`/admin/assets?type=${type.toLowerCase()}`, "Asset deactivation failed."); } }
export async function deleteSiteAsset(form: FormData) { const user = await requireAdmin(); const id = z.string().min(1).parse(form.get("id")); const type = z.enum(["LOGO", "CATALOGUE"]).parse(form.get("type")); const path = `/admin/assets?type=${type.toLowerCase()}`; const prisma = getPrisma(); const asset = await prisma.siteAsset.findFirst({ where: { id, type } }); if (!asset) return fail(path, "Asset record was not found."); if (asset.active) return fail(path, "Deactivate this asset before deleting it."); const blobTarget = asset.pathname || (asset.url.startsWith("https://") ? asset.url : null); if (blobTarget) { try { await deletePublicBlob(blobTarget); } catch { return fail(path, "Blob storage rejected the deletion."); } } try { await prisma.siteAsset.delete({ where: { id: asset.id } }); await writeAudit(user.id, `${type}_DELETE`, "SiteAsset", asset.id); revalidatePublicAssetPaths(); revalidatePath("/admin/assets"); } catch { return fail(path, "Database record could not be deleted."); } }

const settingsSchema = z.object({ businessName: z.literal("DS CREATIONS"), phone: z.string().regex(/^\d{10}$/), whatsapp: z.string().regex(/^\d{11,15}$/), email: z.string().email(), address: z.string().trim().min(5).max(300), heroHeading: z.string().trim().min(10).max(200), heroSupportingText: z.string().trim().min(10).max(500), contactNote: z.string().trim().min(5).max(500), footerDescription: z.string().trim().min(10).max(500), defaultGstPercentage: z.coerce.number().min(0).max(100), siteUrl: z.string().url() });
export async function saveSettings(form: FormData) { const user = await requireAdmin(); const parsed = settingsSchema.safeParse(Object.fromEntries(form)); if (!parsed.success) fail("/admin/settings", "Please review the website settings."); const data = parsed.data!; try { await getPrisma().$transaction(Object.entries(data).map(([key, value]) => getPrisma().siteSetting.upsert({ where: { key }, update: { value }, create: { key, value } }))); await writeAudit(user.id, "SETTINGS_UPDATE", "SiteSetting", undefined, { keys: Object.keys(data) }); revalidatePath("/"); revalidatePath("/admin/settings"); redirect("/admin/settings?saved=1"); } catch (error) { if ((error as { digest?: string }).digest?.startsWith("NEXT_REDIRECT")) throw error; fail("/admin/settings", "Website settings could not be saved."); } }
