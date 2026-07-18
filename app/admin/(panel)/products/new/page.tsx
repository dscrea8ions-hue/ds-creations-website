import AdminNotice from "@/components/admin/AdminNotice";
import ProductForm from "@/components/admin/ProductForm";
import { getPrisma } from "@/lib/prisma";

export default async function NewProductPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) { const [params, categories] = await Promise.all([searchParams, getPrisma().category.findMany({ where: { active: true }, orderBy: { name: "asc" }, select: { id: true, name: true } })]); return <><p className="text-sm font-bold uppercase tracking-widest text-[var(--royal-blue)]">Products</p><h1 className="mt-2 text-3xl font-black text-[var(--dark-navy)]">Add product</h1><div className="mt-6"><AdminNotice error={params.error} /></div><p className="mb-6 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">Save the product first. You can then add and preview product images from its edit page.</p><ProductForm categories={categories} /></>; }
