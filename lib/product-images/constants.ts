export const MAX_PRODUCT_IMAGES = 8;
export const MAX_PRODUCT_IMAGE_BYTES = 5 * 1024 * 1024;
export const ALLOWED_PRODUCT_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export type AllowedProductImageType = (typeof ALLOWED_PRODUCT_IMAGE_TYPES)[number];
