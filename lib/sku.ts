import type { Prisma } from "@/app/generated/prisma/client";

export const PRODUCT_SKU_PREFIX = "DSC";
export const PRODUCT_SKU_COUNTER_KEY = "product";
export const MAX_PRODUCT_SKU_NUMBER = 999999;

export function normalizeSku(value: string): string {
  return value.trim().toUpperCase();
}

export function isValidProductSku(value: string): boolean {
  return /^DSC-[0-9]{6}$/.test(normalizeSku(value));
}

export function formatProductSku(value: number): string {
  if (!Number.isSafeInteger(value) || value < 1 || value > MAX_PRODUCT_SKU_NUMBER) {
    throw new Error("PRODUCT_SKU_RANGE_EXHAUSTED");
  }
  return `${PRODUCT_SKU_PREFIX}-${String(value).padStart(6, "0")}`;
}

type ProductSkuTransaction = Pick<Prisma.TransactionClient, "productSkuCounter">;

export async function generateNextProductSku(transaction: ProductSkuTransaction): Promise<string> {
  const counter = await transaction.productSkuCounter.upsert({
    where: { key: PRODUCT_SKU_COUNTER_KEY },
    create: { key: PRODUCT_SKU_COUNTER_KEY, lastValue: 1 },
    update: { lastValue: { increment: 1 } },
    select: { lastValue: true },
  });
  return formatProductSku(counter.lastValue);
}

export async function advanceProductSkuCounter(transaction: ProductSkuTransaction): Promise<void> {
  await transaction.productSkuCounter.upsert({
    where: { key: PRODUCT_SKU_COUNTER_KEY },
    create: { key: PRODUCT_SKU_COUNTER_KEY, lastValue: 1 },
    update: { lastValue: { increment: 1 } },
    select: { lastValue: true },
  });
}

export function isProductSkuUniqueConflict(error: unknown): boolean {
  const candidate = error as { code?: string; meta?: { target?: unknown; modelName?: unknown } };
  if (candidate.code !== "P2002") return false;
  return `${JSON.stringify(candidate.meta?.target)} ${String(candidate.meta?.modelName ?? "")}`.toLowerCase().includes("sku");
}

export function withServerProductSku<T extends object>(data: T, serverSku: string): Omit<T, "sku"> & { sku: string } {
  const { sku: _ignoredClientSku, ...safeData } = data as T & { sku?: unknown };
  return { ...safeData, sku: serverSku } as Omit<T, "sku"> & { sku: string };
}
