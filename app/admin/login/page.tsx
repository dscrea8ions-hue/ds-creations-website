import { redirect } from "next/navigation";
import { auth } from "@/auth";
import BrandLogo from "@/components/BrandLogo";
import LoginForm from "@/components/admin/LoginForm";

export const dynamic = "force-dynamic";
export default async function AdminLoginPage() {
  const session = await auth();
  if (session?.user?.role === "ADMIN") redirect("/admin");
  return <main className="flex min-h-screen items-center justify-center bg-[var(--light-bg)] p-5"><section className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl"><BrandLogo darkText /><p className="mt-6 text-sm font-bold uppercase tracking-widest text-[var(--royal-blue)]">Secure administration</p><h1 className="mt-2 text-3xl font-black text-[var(--dark-navy)]">Admin sign in</h1><p className="mt-3 text-sm leading-6 text-slate-600">Authorized DS CREATIONS administrators only.</p><LoginForm /></section></main>;
}
