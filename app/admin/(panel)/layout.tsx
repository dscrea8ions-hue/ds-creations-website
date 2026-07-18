import Link from "next/link";
import { signOut } from "@/auth";
import { requireAdmin } from "@/lib/admin";

const links = [
  ["Dashboard", "/admin"], ["Products", "/admin/products"], ["Categories", "/admin/categories"],
  ["Logo & Branding", "/admin/assets?type=logo"], ["Catalogue PDF", "/admin/assets?type=catalogue"],
  ["Website Settings", "/admin/settings"], ["View Website", "/"],
];

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();
  return <div className="min-h-screen bg-slate-100 lg:grid lg:grid-cols-[260px_1fr]">
    <aside className="bg-[var(--dark-navy)] p-6 text-white"><Link href="/admin" className="text-xl font-black tracking-wider">DS CREATIONS</Link><p className="mt-2 text-xs text-white/60">ADMIN PANEL</p><nav className="mt-8 flex flex-col gap-2">{links.map(([label, href]) => <Link key={href} href={href} className="rounded-xl px-4 py-3 font-bold hover:bg-white/10 hover:text-[var(--gold)]">{label}</Link>)}</nav><form className="mt-8" action={async () => { "use server"; await signOut({ redirectTo: "/admin/login" }); }}><button className="w-full rounded-xl border border-white/20 px-4 py-3 text-left font-bold hover:bg-white/10">Logout</button></form></aside>
    <div><header className="flex items-center justify-between border-b bg-white px-6 py-4"><p className="font-bold text-[var(--dark-navy)]">Content management</p><p className="text-sm text-slate-500">{user.email}</p></header><main className="p-5 sm:p-8">{children}</main></div>
  </div>;
}
