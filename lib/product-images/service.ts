import "server-only";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Prisma } from "@/app/generated/prisma/client";
import { requireAdmin, writeAudit } from "@/lib/admin";
import { BlobStorageError, blobTokenPresent, deletePublicBlob, uploadPublicBlob } from "@/lib/blob-storage";
import { getPrisma } from "@/lib/prisma";
import { MAX_PRODUCT_IMAGES } from "@/lib/product-images/constants";
import {
  ProductImageValidationError,
  safeProductImageFileName,
  validateProductId,
  validateProductImageIds,
  validateProductImageOrder,
  validateProductImageReorder,
  validateProductImageReplacement,
  validateProductImageUpload,
} from "@/lib/product-images/validation";

type Transaction = Prisma.TransactionClient;
type ProductIdentity = { id: string; slug: string };

class ProductImageServiceError extends Error {
  constructor(public readonly userMessage: string) {
    super(userMessage);
    this.name = "ProductImageServiceError";
  }
}

const adminProductPath = (productId: string) => `/admin/products/${productId}`;
const fail = (path: string, message: string): never => redirect(`${path}${path.includes("?") ? "&" : "?"}error=${encodeURIComponent(message)}`);

function parseInput<T>(path: string, parser: () => T): T {
  try {
    return parser();
  } catch (error) {
    if (error instanceof ProductImageValidationError) fail(path, error.userMessage);
    throw error;
  }
}

function mutationMessage(error: unknown, fallback: string): string {
  if (error instanceof ProductImageServiceError || error instanceof ProductImageValidationError) return error.userMessage;
  if (error instanceof BlobStorageError && error.reason === "TOKEN_MISSING") return "Storage token is missing.";
  if (error instanceof BlobStorageError) return "Blob storage rejected the operation.";
  return fallback;
}

async function getProduct(productId: string): Promise<ProductIdentity> {
  const product = await getPrisma().product.findUnique({ where: { id: productId }, select: { id: true, slug: true } });
  if (!product) throw new ProductImageServiceError("Product record was not found.");
  return product;
}

async function lockProduct(transaction: Transaction, productId: string): Promise<ProductIdentity> {
  const rows = await transaction.$queryRaw<Array<ProductIdentity>>`SELECT "id", "slug" FROM "Product" WHERE "id" = ${productId} FOR UPDATE`;
  const product = rows[0];
  if (!product) throw new ProductImageServiceError("Product record was not found.");
  return product;
}

async function getOwnedImage(transaction: Transaction, productId: string, imageId: string) {
  const image = await transaction.productImage.findFirst({ where: { id: imageId, productId } });
  if (!image) throw new ProductImageServiceError("Image record was not found for this product.");
  return image;
}

async function normalizeProductImages(
  transaction: Transaction,
  productId: string,
  options: { orderedIds?: string[]; primaryImageId?: string } = {},
) {
  const images = await transaction.productImage.findMany({
    where: { productId },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }, { id: "asc" }],
  });
  if (!images.length) return;

  const byId = new Map(images.map((image) => [image.id, image]));
  const requestedOrder = options.orderedIds?.filter((id, index, ids) => byId.has(id) && ids.indexOf(id) === index) ?? [];
  const requestedIds = new Set(requestedOrder);
  const orderedImages = [
    ...requestedOrder.map((id) => byId.get(id)!),
    ...images.filter((image) => !requestedIds.has(image.id)),
  ];
  const primaryImageId = options.primaryImageId && byId.has(options.primaryImageId)
    ? options.primaryImageId
    : orderedImages.find((image) => image.isPrimary)?.id ?? orderedImages[0].id;

  for (const [sortOrder, image] of orderedImages.entries()) {
    const isPrimary = image.id === primaryImageId;
    if (image.sortOrder !== sortOrder || image.isPrimary !== isPrimary) {
      await transaction.productImage.update({ where: { id: image.id }, data: { sortOrder, isPrimary } });
    }
  }
}

function revalidateProductImagePaths(product: ProductIdentity) {
  revalidatePath(adminProductPath(product.id));
  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath("/products/[slug]", "page");
  revalidatePath(`/products/${product.slug}`);
}

function revalidateDeletedProductPaths(slug: string) {
  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath("/products/[slug]", "page");
  revalidatePath(`/products/${slug}`);
  revalidatePath("/admin/products");
}

export type ProductImageUploadResult = { success: true; imageId: string } | { success: false; error: string };

export async function uploadProductImageResultService(form: FormData): Promise<ProductImageUploadResult> {
  const user = await requireAdmin();
  let input;
  try {
    input = validateProductImageUpload(form);
  } catch (error) {
    return { success: false, error: mutationMessage(error, "Please review the selected image.") };
  }
  let product: ProductIdentity;

  try {
    product = await getProduct(input.productId);
    const currentCount = await getPrisma().productImage.count({ where: { productId: input.productId } });
    if (currentCount >= MAX_PRODUCT_IMAGES) throw new ProductImageServiceError(`A product can have at most ${MAX_PRODUCT_IMAGES} images.`);
    if (!blobTokenPresent()) throw new BlobStorageError("TOKEN_MISSING");
  } catch (error) {
    return { success: false, error: mutationMessage(error, "Product image upload could not be prepared.") };
  }

  let blob!: Awaited<ReturnType<typeof uploadPublicBlob>>;
  try {
    blob = await uploadPublicBlob(`products/${input.productId}/${Date.now()}-${safeProductImageFileName(input.file.name)}`, input.file);
  } catch (error) {
    return { success: false, error: mutationMessage(error, "Blob storage rejected the upload.") };
  }

  try {
    const image = await getPrisma().$transaction(async (transaction) => {
      product = await lockProduct(transaction, input.productId);
      const imageCount = await transaction.productImage.count({ where: { productId: input.productId } });
      if (imageCount >= MAX_PRODUCT_IMAGES) throw new ProductImageServiceError(`A product can have at most ${MAX_PRODUCT_IMAGES} images.`);
      const created = await transaction.productImage.create({
        data: { productId: input.productId, url: blob.url, pathname: blob.pathname, altText: input.altText, isPrimary: false, sortOrder: imageCount },
      });
      await normalizeProductImages(transaction, input.productId);
      return created;
    });
    await writeAudit(user.id, "PRODUCT_IMAGE_UPLOAD", "ProductImage", image.id, { productId: input.productId });
    revalidateProductImagePaths(product!);
    return { success: true, imageId: image.id };
  } catch (error) {
    await deletePublicBlob(blob.pathname).catch(() => undefined);
    return { success: false, error: mutationMessage(error, "Database record could not be saved.") };
  }
}

export async function uploadProductImageService(form: FormData): Promise<void> {
  const result = await uploadProductImageResultService(form);
  if (!result.success) {
    const productId = String(form.get("productId") ?? "").trim();
    const path = productId && productId.length <= 128 ? adminProductPath(productId) : "/admin/products";
    fail(path, result.error);
  }
}

export async function setPrimaryProductImageService(form: FormData): Promise<void> {
  const user = await requireAdmin();
  const input = parseInput("/admin/products", () => validateProductImageIds(form));
  const path = adminProductPath(input.productId);

  try {
    const product = await getPrisma().$transaction(async (transaction) => {
      const lockedProduct = await lockProduct(transaction, input.productId);
      await getOwnedImage(transaction, input.productId, input.imageId);
      await normalizeProductImages(transaction, input.productId, { primaryImageId: input.imageId });
      return lockedProduct;
    });
    await writeAudit(user.id, "PRODUCT_IMAGE_PRIMARY", "ProductImage", input.imageId, { productId: input.productId });
    revalidateProductImagePaths(product);
  } catch (error) {
    fail(path, mutationMessage(error, "Primary image update failed."));
  }
}

export async function reorderProductImageService(form: FormData): Promise<void> {
  const user = await requireAdmin();
  const input = parseInput("/admin/products", () => validateProductImageReorder(form));
  const path = adminProductPath(input.productId);

  try {
    const product = await getPrisma().$transaction(async (transaction) => {
      const lockedProduct = await lockProduct(transaction, input.productId);
      await getOwnedImage(transaction, input.productId, input.imageId);
      const images = await transaction.productImage.findMany({
        where: { productId: input.productId },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }, { id: "asc" }],
        select: { id: true },
      });
      const orderedIds = images.map(({ id }) => id);
      const currentIndex = orderedIds.indexOf(input.imageId);
      const targetIndex = input.direction === "up" ? currentIndex - 1 : currentIndex + 1;
      if (currentIndex >= 0 && targetIndex >= 0 && targetIndex < orderedIds.length) {
        [orderedIds[currentIndex], orderedIds[targetIndex]] = [orderedIds[targetIndex], orderedIds[currentIndex]];
      }
      await normalizeProductImages(transaction, input.productId, { orderedIds });
      return lockedProduct;
    });
    await writeAudit(user.id, "PRODUCT_IMAGE_REORDER", "ProductImage", input.imageId, { productId: input.productId, direction: input.direction });
    revalidateProductImagePaths(product);
  } catch (error) {
    fail(path, mutationMessage(error, "Image reorder failed."));
  }
}

export type ProductImageReorderResult = { success: true } | { success: false; error: string };

export async function reorderProductImagesService(form: FormData): Promise<ProductImageReorderResult> {
  const user = await requireAdmin();
  let input;
  try {
    input = validateProductImageOrder(form);
  } catch (error) {
    return { success: false, error: mutationMessage(error, "Image order is invalid.") };
  }

  try {
    const product = await getPrisma().$transaction(async (transaction) => {
      const lockedProduct = await lockProduct(transaction, input.productId);
      const savedImages = await transaction.productImage.findMany({ where: { productId: input.productId }, select: { id: true } });
      const savedIds = new Set(savedImages.map(({ id }) => id));
      if (savedImages.length !== input.orderedImageIds.length || input.orderedImageIds.some((id) => !savedIds.has(id))) {
        throw new ProductImageServiceError("The saved image list changed. Refresh the page and try reordering again.");
      }
      await normalizeProductImages(transaction, input.productId, { orderedIds: input.orderedImageIds });
      return lockedProduct;
    });
    await writeAudit(user.id, "PRODUCT_IMAGE_REORDER_BATCH", "Product", input.productId, { orderedImageIds: input.orderedImageIds });
    revalidateProductImagePaths(product);
    return { success: true };
  } catch (error) {
    return { success: false, error: mutationMessage(error, "Image reorder failed. Please refresh and try again.") };
  }
}

export type ProductImageReplacementResult =
  | { success: true; url: string; altText: string; warning?: string }
  | { success: false; error: string };

export async function replaceProductImageService(form: FormData): Promise<ProductImageReplacementResult> {
  const user = await requireAdmin();
  let input;
  try {
    input = validateProductImageReplacement(form);
  } catch (error) {
    return { success: false, error: mutationMessage(error, "Please review the replacement image.") };
  }

  try {
    await getProduct(input.productId);
    const existingImage = await getPrisma().productImage.findFirst({ where: { id: input.imageId, productId: input.productId }, select: { id: true } });
    if (!existingImage) throw new ProductImageServiceError("Image record was not found for this product.");
    if (!blobTokenPresent()) throw new BlobStorageError("TOKEN_MISSING");
  } catch (error) {
    return { success: false, error: mutationMessage(error, "Image replacement could not be prepared.") };
  }

  let blob!: Awaited<ReturnType<typeof uploadPublicBlob>>;
  try {
    blob = await uploadPublicBlob(`products/${input.productId}/${Date.now()}-${safeProductImageFileName(input.file.name)}`, input.file);
  } catch (error) {
    return { success: false, error: mutationMessage(error, "Blob storage rejected the replacement upload.") };
  }

  let mutation;
  try {
    mutation = await getPrisma().$transaction(async (transaction) => {
      const product = await lockProduct(transaction, input.productId);
      const existingImage = await getOwnedImage(transaction, input.productId, input.imageId);
      const updatedImage = await transaction.productImage.update({
        where: { id: existingImage.id },
        data: { url: blob.url, pathname: blob.pathname, altText: input.altText },
      });
      await normalizeProductImages(transaction, input.productId);
      return { product, oldPathname: existingImage.pathname, updatedImage };
    });
  } catch (error) {
    await deletePublicBlob(blob.pathname).catch(() => undefined);
    return { success: false, error: mutationMessage(error, "Replacement could not be saved. The original image was preserved.") };
  }

  await writeAudit(user.id, "PRODUCT_IMAGE_REPLACE", "ProductImage", input.imageId, { productId: input.productId });
  revalidateProductImagePaths(mutation.product);

  let warning: string | undefined;
  if (mutation.oldPathname) {
    try {
      await deletePublicBlob(mutation.oldPathname);
    } catch {
      warning = "The replacement is active, but the previous stored file could not be cleaned up automatically.";
    }
  }
  return { success: true, url: mutation.updatedImage.url, altText: mutation.updatedImage.altText, ...(warning ? { warning } : {}) };
}

export async function deleteProductImageService(form: FormData): Promise<void> {
  const user = await requireAdmin();
  const input = parseInput("/admin/products", () => validateProductImageIds(form));
  const path = adminProductPath(input.productId);
  const prisma = getPrisma();

  let image;
  try {
    await getProduct(input.productId);
    image = await prisma.productImage.findFirst({ where: { id: input.imageId, productId: input.productId } });
    if (!image) throw new ProductImageServiceError("Image record was not found for this product.");
    if (image.pathname) await deletePublicBlob(image.pathname);
  } catch (error) {
    fail(path, mutationMessage(error, "Image could not be deleted from storage."));
  }

  try {
    const product = await prisma.$transaction(async (transaction) => {
      const lockedProduct = await lockProduct(transaction, input.productId);
      await getOwnedImage(transaction, input.productId, input.imageId);
      await transaction.productImage.delete({ where: { id: input.imageId } });
      await normalizeProductImages(transaction, input.productId);
      return lockedProduct;
    });
    await writeAudit(user.id, "PRODUCT_IMAGE_DELETE", "ProductImage", input.imageId, { productId: input.productId });
    revalidateProductImagePaths(product);
  } catch (error) {
    fail(path, mutationMessage(error, "Database record could not be deleted."));
  }
}

export async function deleteProductWithImagesService(form: FormData): Promise<never> {
  const user = await requireAdmin();
  const path = "/admin/products";
  const productId = parseInput(path, () => validateProductId(form));
  const prisma = getPrisma();

  const existingProduct = await prisma.product.findUnique({ where: { id: productId }, include: { images: true } });
  if (!existingProduct) return fail(path, "Product record was not found.");
  const product = existingProduct;

  try {
    for (const image of product.images) if (image.pathname) await deletePublicBlob(image.pathname);
  } catch (error) {
    fail(path, mutationMessage(error, "Blob storage rejected the deletion."));
  }

  try {
    await prisma.product.delete({ where: { id: productId } });
    await writeAudit(user.id, "PRODUCT_DELETE", "Product", productId, { name: product.name });
    revalidateDeletedProductPaths(product.slug);
  } catch {
    fail(path, "Database record could not be deleted.");
  }

  redirect("/admin/products?deleted=1");
}
