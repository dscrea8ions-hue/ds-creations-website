import type { Product, ProductAudience, StockStatus } from "@/types/product";

type Seed = {
  name: string; category: string; subcategory: string; audience: ProductAudience;
  price: number | null; offer?: number; moq: number; material: string;
  sizes?: string[]; colours?: string[]; status?: StockStatus; featured?: boolean;
  schoolName?: string; image: string; customization?: boolean; embroidery?: boolean; printing?: boolean;
};

const seeds: Seed[] = [
  { name: "School White Shirt", category: "School Uniforms", subcategory: "Shirts", audience: "SCHOOL", price: 699, offer: 599, moq: 1, material: "Cotton-rich poplin", sizes: ["24", "26", "28", "30", "32", "34", "36", "38", "40"], colours: ["White"], featured: true, image: "/products/school.svg", schoolName: "Custom school branding", customization: true, embroidery: true },
  { name: "School Grey Trousers", category: "School Uniforms", subcategory: "Trousers", audience: "SCHOOL", price: 899, offer: 799, moq: 1, material: "Poly-viscose suiting", sizes: ["24", "26", "28", "30", "32", "34", "36", "38"], colours: ["Charcoal Grey", "Mid Grey"], image: "/products/school.svg", customization: true },
  { name: "School Pleated Skirt", category: "School Uniforms", subcategory: "Skirts", audience: "SCHOOL", price: 849, offer: 749, moq: 1, material: "Easy-care poly-viscose", sizes: ["24", "26", "28", "30", "32", "34", "36"], colours: ["Navy", "Grey", "School Check"], image: "/products/school.svg", customization: true },
  { name: "School Winter Blazer", category: "School Uniforms", subcategory: "Winter Wear", audience: "SCHOOL", price: 2499, offer: 2199, moq: 1, material: "Premium wool-blend", sizes: ["28", "30", "32", "34", "36", "38", "40", "42"], colours: ["Navy", "Royal Blue", "Maroon"], status: "MADE_TO_ORDER", featured: true, image: "/products/school.svg", customization: true, embroidery: true },
  { name: "Teacher Formal Uniform", category: "Staff Uniforms", subcategory: "Teacher Wear", audience: "INSTITUTION", price: 1599, offer: 1399, moq: 1, material: "Breathable blended fabric", sizes: ["S", "M", "L", "XL", "2XL", "3XL"], colours: ["Navy", "Beige", "Grey"], image: "/products/staff.svg", customization: true, embroidery: true },
  { name: "Corporate Formal Shirt", category: "Corporate Uniforms", subcategory: "Shirts", audience: "CORPORATE", price: 1099, offer: 949, moq: 1, material: "Cotton-rich twill", sizes: ["S", "M", "L", "XL", "2XL", "3XL"], colours: ["White", "Sky Blue", "Navy", "Grey"], featured: true, image: "/products/corporate.svg", customization: true, embroidery: true, printing: true },
  { name: "Corporate Blazer", category: "Corporate Uniforms", subcategory: "Blazers", audience: "CORPORATE", price: 3499, offer: 3199, moq: 1, material: "Premium poly-wool suiting", sizes: ["36", "38", "40", "42", "44", "46"], colours: ["Navy", "Charcoal", "Black"], status: "MADE_TO_ORDER", image: "/products/corporate.svg", customization: true, embroidery: true },
  { name: "Housekeeping Uniform Set", category: "Staff Uniforms", subcategory: "Housekeeping", audience: "INSTITUTION", price: 1299, offer: 1099, moq: 1, material: "Durable poly-cotton", sizes: ["S", "M", "L", "XL", "2XL", "3XL"], colours: ["Teal", "Navy", "Beige", "Grey"], image: "/products/staff.svg", customization: true, embroidery: true },
  { name: "Security Uniform Set", category: "Staff Uniforms", subcategory: "Security", audience: "INSTITUTION", price: 1499, offer: 1299, moq: 1, material: "Hard-wearing poly-cotton", sizes: ["S", "M", "L", "XL", "2XL", "3XL"], colours: ["Khaki", "Navy", "Grey"], image: "/products/staff.svg", customization: true, embroidery: true },
  { name: "Customized Round-Neck T-Shirt", category: "Customized Apparel", subcategory: "T-Shirts", audience: "GENERAL", price: 499, offer: 399, moq: 1, material: "180 GSM combed cotton", sizes: ["XS", "S", "M", "L", "XL", "2XL", "3XL"], colours: ["White", "Royal Blue", "Navy", "Black", "Red"], featured: true, image: "/products/apparel.svg", customization: true, embroidery: true, printing: true },
  { name: "Customized Polo T-Shirt", category: "Customized Apparel", subcategory: "Polo T-Shirts", audience: "CORPORATE", price: 699, offer: 599, moq: 1, material: "220 GSM cotton pique", sizes: ["S", "M", "L", "XL", "2XL", "3XL"], colours: ["White", "Royal Blue", "Navy", "Black", "Grey"], image: "/products/apparel.svg", customization: true, embroidery: true, printing: true },
  { name: "Customized Cap", category: "Customized Apparel", subcategory: "Caps", audience: "GENERAL", price: 299, offer: 249, moq: 1, material: "Brushed cotton", sizes: ["Adjustable"], colours: ["White", "Royal Blue", "Navy", "Black", "Red"], image: "/products/apparel.svg", customization: true, embroidery: true, printing: true },
  { name: "Premium Trophy", category: "Awards", subcategory: "Trophies", audience: "GENERAL", price: null, moq: 1, material: "Metal and engineered wood", sizes: ["Small", "Medium", "Large"], colours: ["Gold", "Silver"], status: "MADE_TO_ORDER", featured: true, image: "/products/awards.svg", customization: true, printing: true },
  { name: "Sports Medal", category: "Awards", subcategory: "Medals", audience: "INSTITUTION", price: 199, offer: 149, moq: 1, material: "Die-cast metal", sizes: ["50 mm", "60 mm", "70 mm"], colours: ["Gold", "Silver", "Bronze"], image: "/products/awards.svg", customization: true, printing: true },
  { name: "Recognition Shield", category: "Awards", subcategory: "Shields", audience: "CORPORATE", price: null, moq: 1, material: "Wood and metal", sizes: ["Small", "Medium", "Large"], colours: ["Walnut Gold", "Black Gold"], status: "MADE_TO_ORDER", image: "/products/awards.svg", customization: true, printing: true },
  { name: "Stainless Steel Flask", category: "Drinkware", subcategory: "Flasks", audience: "CORPORATE", price: 899, offer: 749, moq: 1, material: "Food-grade stainless steel", sizes: ["500 ml", "750 ml", "1 L"], colours: ["Steel", "Navy", "Black"], image: "/products/drinkware.svg", customization: true, printing: true },
  { name: "Customized Water Bottle", category: "Drinkware", subcategory: "Water Bottles", audience: "SCHOOL", price: 499, offer: 399, moq: 1, material: "BPA-free plastic", sizes: ["600 ml", "750 ml"], colours: ["Royal Blue", "Navy", "Red", "Green"], image: "/products/drinkware.svg", customization: true, printing: true },
  { name: "School Notebook", category: "Stationery", subcategory: "Notebooks", audience: "SCHOOL", price: 99, offer: 79, moq: 1, material: "58 GSM paper", sizes: ["A4", "A5", "Long"], colours: ["Custom Cover"], image: "/products/stationery.svg", customization: true, printing: true },
  { name: "Corporate Diary", category: "Stationery", subcategory: "Diaries", audience: "CORPORATE", price: 499, offer: 399, moq: 1, material: "PU leather and premium paper", sizes: ["A5", "Executive"], colours: ["Navy", "Black", "Tan"], image: "/products/stationery.svg", customization: true, printing: true },
  { name: "Student ID Card", category: "Identity Products", subcategory: "ID Cards", audience: "SCHOOL", price: 99, offer: 79, moq: 1, material: "Premium PVC", sizes: ["CR80 Standard"], colours: ["Custom Design"], image: "/products/identity.svg", customization: true, printing: true },
  { name: "Printed Lanyard", category: "Identity Products", subcategory: "Lanyards", audience: "INSTITUTION", price: 79, offer: 59, moq: 1, material: "Polyester", sizes: ["12 mm", "16 mm", "20 mm"], colours: ["Custom Colour"], image: "/products/identity.svg", customization: true, printing: true },
  { name: "School House Sash", category: "School Accessories", subcategory: "Sashes", audience: "SCHOOL", price: 249, offer: 199, moq: 1, material: "Premium satin", sizes: ["Junior", "Senior"], colours: ["Red", "Blue", "Green", "Yellow"], image: "/products/school.svg", customization: true, printing: true },
  { name: "School Backpack", category: "Bags", subcategory: "Backpacks", audience: "SCHOOL", price: 1199, offer: 999, moq: 1, material: "Water-resistant polyester", sizes: ["Junior", "Senior"], colours: ["Royal Blue", "Navy", "Black"], image: "/products/bags.svg", customization: true, embroidery: true, printing: true },
  { name: "Corporate Gift Set", category: "Corporate Gifts", subcategory: "Gift Sets", audience: "CORPORATE", price: null, moq: 1, material: "Curated mixed materials", sizes: ["Standard", "Premium"], colours: ["Navy Gold", "Black Gold"], status: "MADE_TO_ORDER", featured: true, image: "/products/gifts.svg", customization: true, printing: true },
];

const slugify = (value: string) => value.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export const products: Product[] = seeds.map((seed, index) => ({
  id: String(index + 1), slug: slugify(seed.name), name: seed.name, sku: `DSC-${String(index + 1).padStart(4, "0")}`,
  shortDescription: `Premium ${seed.name.toLowerCase()} for dependable institutional and bulk requirements.`,
  description: `${seed.name} is manufactured by DS CREATIONS for comfort, durability and a polished identity. Materials, colours and branding can be coordinated for eligible bulk orders.`,
  category: seed.category, subcategory: seed.subcategory, audience: seed.audience, schoolName: seed.schoolName,
  brand: "DS CREATIONS", price: seed.price, offerPrice: seed.offer, gstPercentage: 18, minimumOrderQuantity: seed.moq,
  stockQuantity: seed.status === "OUT_OF_STOCK" ? 0 : 100, stockStatus: seed.status ?? "IN_STOCK", material: seed.material,
  sizes: seed.sizes ?? ["Standard"], colours: seed.colours ?? ["Custom"], deliveryTime: "10–20 working days after approval",
  customizationAvailable: seed.customization ?? false, embroideryAvailable: seed.embroidery ?? false, printingAvailable: seed.printing ?? false,
  featured: seed.featured ?? false, published: true, createdAt: `2026-0${(index % 6) + 1}-01`, mainImage: seed.image,
  galleryImages: [seed.image, seed.image, seed.image],
  features: ["Bulk-order ready", "Quality checked before dispatch", seed.customization ? "Brand customization available" : "Practical institutional specification"],
  specifications: { Material: seed.material, "Minimum order": "1 piece", GST: "18%", Delivery: "10–20 working days after approval" },
  tags: [seed.category, seed.subcategory, seed.audience],
}));

export const categories = [...new Set(products.map((product) => product.category))].sort();
export const audiences: ProductAudience[] = ["SCHOOL", "CORPORATE", "INSTITUTION", "GENERAL"];
export const getProduct = (slug: string) => products.find((product) => product.slug === slug);
