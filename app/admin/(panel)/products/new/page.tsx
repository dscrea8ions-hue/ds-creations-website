import AdminNotice from "@/components/admin/AdminNotice";
import ProductForm from "@/components/admin/ProductForm";
import { getPrisma } from "@/lib/prisma";

export default async function NewProductPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) { const [params, categories] = await Promise.all([searchParams, getPrisma().category.findMany({ where: { active: true }, orderBy: { name: "asc" }, select: { id: true, name: true } })]); return <><p className="text-sm font-bold uppercase tracking-widest text-[var(--royal-blue)]">Products</p><h1 className="mt-2 text-3xl font-black text-[var(--dark-navy)]">Add product</h1><div className="mt-6"><AdminNotice error={params.error} /></div><ProductForm categories={categories} /></>; }
