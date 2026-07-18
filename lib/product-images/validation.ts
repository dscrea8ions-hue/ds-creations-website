import { z } from "zod";
import { ALLOWED_PRODUCT_IMAGE_TYPES, MAX_PRODUCT_IMAGE_BYTES } from "@/lib/product-images/constants";

const idSchema = z.string().trim().min(1).max(128);
const altTextSchema = z.string().trim().min(2).max(180);
const directionSchema = z.enum(["up", "down"]);

export class ProductImageValidationError extends Error {
  constructor(public readonly userMessage: string) {
    super(userMessage);
    this.name = "ProductImageValidationError";
  }
}

const parseId = (value: FormDataEntryValue | null, label: string) => {
  const parsed = idSchema.safeParse(value);
  if (!parsed.success) throw new ProductImageValidationError(`${label} is invalid.`);
  return parsed.data;
};

export function validateProductId(form: FormData): string {
  return parseId(form.get("productId") ?? form.get("id"), "Product record");
}

export function validateProductImageIds(form: FormData): { productId: string; imageId: string } {
  return {
    productId: parseId(form.get("productId"), "Product record"),
    imageId: parseId(form.get("imageId"), "Image record"),
  };
}

export function validateProductImageUpload(form: FormData): { productId: string; file: File; altText: string } {
  const productId = parseId(form.get("productId"), "Product record");
  const altText = altTextSchema.safeParse(form.get("altText"));
  if (!altText.success) throw new ProductImageValidationError("Image alt text must be between 2 and 180 characters.");

  const fileValue = form.get("file");
  if (!(fileValue instanceof File) || fileValue.size === 0) throw new ProductImageValidationError("Choose a non-empty image file.");
  if (!(ALLOWED_PRODUCT_IMAGE_TYPES as readonly string[]).includes(fileValue.type)) {
    throw new ProductImageValidationError("File type is unsupported. Upload JPG, PNG or WEBP only.");
  }
  if (fileValue.size > MAX_PRODUCT_IMAGE_BYTES) throw new ProductImageValidationError("Image is too large. Maximum size is 5 MB.");

  return { productId, file: fileValue, altText: altText.data };
}

export function validateProductImageReorder(form: FormData): { productId: string; imageId: string; direction: "up" | "down" } {
  const ids = validateProductImageIds(form);
  const direction = directionSchema.safeParse(form.get("direction"));
  if (!direction.success) throw new ProductImageValidationError("Image reorder direction is invalid.");
  return { ...ids, direction: direction.data };
}

export function validateProductImageOrder(form: FormData): { productId: string; orderedImageIds: string[] } {
  const productId = parseId(form.get("productId"), "Product record");
  const rawOrder = form.get("orderedImageIds");
  if (typeof rawOrder !== "string") throw new ProductImageValidationError("Image order is invalid.");

  let decoded: unknown;
  try {
    decoded = JSON.parse(rawOrder);
  } catch {
    throw new ProductImageValidationError("Image order is invalid.");
  }
  const order = z.array(idSchema).min(1).max(100).safeParse(decoded);
  if (!order.success) throw new ProductImageValidationError("Image order is invalid.");
  if (new Set(order.data).size !== order.data.length) throw new ProductImageValidationError("Image order contains duplicate records.");
  return { productId, orderedImageIds: order.data };
}

export function validateProductImageReplacement(form: FormData): { productId: string; imageId: string; file: File; altText: string } {
  const imageId = parseId(form.get("imageId"), "Image record");
  return { ...validateProductImageUpload(form), imageId };
}

export function safeProductImageFileName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9.]+/g, "-").replace(/(^-|-$)/g, "") || "image";
}
