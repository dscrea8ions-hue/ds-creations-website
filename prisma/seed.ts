import { config } from "dotenv";

config({ path: ".env.local" });
config();

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";
import { products } from "../data/products";
import { PRODUCT_SKU_COUNTER_KEY } from "../lib/sku";
import { slugify } from "../lib/slug";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required to seed the database.");
if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD_HASH) {
  throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD_HASH are required to seed the initial administrator.");
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

async function main() {
  await prisma.user.upsert({
    where: { email: process.env.ADMIN_EMAIL!.trim().toLowerCase() },
    update: { passwordHash: process.env.ADMIN_PASSWORD_HASH!, active: true, role: "ADMIN" },
    create: { name: "DS CREATIONS Admin", email: process.env.ADMIN_EMAIL!.trim().toLowerCase(), passwordHash: process.env.ADMIN_PASSWORD_HASH!, role: "ADMIN", active: true },
  });

  const categoryIds = new Map<string, string>();
  for (const [index, categoryName] of [...new Set(products.map((product) => product.category))].sort().entries()) {
    const category = await prisma.category.upsert({
      where: { slug: slugify(categoryName) },
      update: { name: categoryName, active: true, sortOrder: index },
      create: { name: categoryName, slug: slugify(categoryName), active: true, sortOrder: index },
    });
    categoryIds.set(categoryName, category.id);
  }

  for (const product of products) {
    const data = {
      name: product.name, shortDescription: product.shortDescription, description: product.description,
      categoryId: categoryIds.get(product.category)!, subcategory: product.subcategory, audience: product.audience,
      schoolName: product.schoolName, brand: product.brand, price: product.price, offerPrice: product.offerPrice,
      gstPercentage: product.gstPercentage, minimumOrderQuantity: product.minimumOrderQuantity, stockQuantity: product.stockQuantity,
      stockStatus: product.stockStatus, material: product.material, sizes: product.sizes, colours: product.colours,
      weight: product.weight, deliveryTime: product.deliveryTime, fulfilmentType: product.fulfilmentType,
      customizationAvailable: product.customizationAvailable, embroideryAvailable: product.embroideryAvailable,
      printingAvailable: product.printingAvailable, featured: product.featured, published: product.published,
    };
    const saved = await prisma.product.upsert({ where: { slug: product.slug }, update: data, create: { ...data, slug: product.slug, sku: product.sku } });
    const existingFallback = await prisma.productImage.findFirst({ where: { productId: saved.id, url: product.mainImage } });
    if (!existingFallback) await prisma.productImage.create({ data: { productId: saved.id, url: product.mainImage, altText: product.name, isPrimary: true, sortOrder: 0 } });
  }

  const highestSeedSku = products.length;
  await prisma.$executeRaw`
    INSERT INTO "ProductSkuCounter" ("key", "lastValue", "updatedAt")
    VALUES (${PRODUCT_SKU_COUNTER_KEY}, ${highestSeedSku}, CURRENT_TIMESTAMP)
    ON CONFLICT ("key") DO UPDATE
    SET "lastValue" = GREATEST("ProductSkuCounter"."lastValue", EXCLUDED."lastValue"),
        "updatedAt" = CURRENT_TIMESTAMP
  `;

  const settings = {
    businessName: "DS CREATIONS", phone: "8368045535", whatsapp: "918368045535", email: "dscrea8ions@gmail.com",
    address: "Lajpat Nagar 4, New Delhi", heroHeading: "Premium Uniforms and Customized Products for Schools and Businesses",
    heroSupportingText: "DS CREATIONS manufactures uniforms, awards, apparel and customized institutional products.",
    contactNote: "Your message will be sent through WhatsApp or your email application.",
    footerDescription: "Direct manufacturer and supplier of uniforms, awards, apparel and customized institutional products.",
    defaultGstPercentage: 18, siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://ds-creations-website.vercel.app",
  };
  for (const [key, value] of Object.entries(settings)) {
    await prisma.siteSetting.upsert({ where: { key }, update: { value }, create: { key, value } });
  }
}

main().finally(() => prisma.$disconnect());
