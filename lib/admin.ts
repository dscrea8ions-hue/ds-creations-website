import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getPrisma } from "@/lib/prisma";
import type { Prisma } from "@/app/generated/prisma/client";

export async function requireAdmin() {
  const session = await auth();
  let authorized = false;
  if (session?.user?.id && session.user.role === "ADMIN") {
    const user = await getPrisma().user.findUnique({ where: { id: session.user.id }, select: { active: true, role: true } });
    authorized = Boolean(user?.active && user.role === "ADMIN");
  }
  if (!authorized || !session?.user) redirect("/admin/login");
  return session.user;
}

export async function writeAudit(userId: string, action: string, entityType: string, entityId?: string, details?: Record<string, unknown>) {
  try { await getPrisma().adminAuditLog.create({ data: { userId, action, entityType, entityId, details: details as Prisma.InputJsonValue | undefined } }); } catch { /* Auditing must never expose internals to the user. */ }
}
