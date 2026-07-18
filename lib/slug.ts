import type { PrismaClient } from "@/app/generated/prisma/client";

export function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['\u2019\u02bc`]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function generateUniqueSlug(
  prisma: PrismaClient,
  value: string,
  excludeProductId?: string,
): Promise<string> {
  const baseSlug = slugify(value);
  if (!baseSlug) throw new Error("PRODUCT_SLUG_EMPTY");

  const existing = await prisma.product.findMany({
    where: {
      OR: [{ slug: baseSlug }, { slug: { startsWith: `${baseSlug}-` } }],
      ...(excludeProductId ? { NOT: { id: excludeProductId } } : {}),
    },
    select: { slug: true },
  });

  const usedSlugs = new Set(existing.map(({ slug }) => slug));
  if (!usedSlugs.has(baseSlug)) return baseSlug;

  let suffix = 2;
  while (usedSlugs.has(`${baseSlug}-${suffix}`)) suffix += 1;
  return `${baseSlug}-${suffix}`;
}
