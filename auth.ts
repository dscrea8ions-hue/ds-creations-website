import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { z } from "zod";
import { getPrisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  session: { strategy: "jwt", maxAge: 8 * 60 * 60 },
  pages: { signIn: "/admin/login" },
  providers: [Credentials({
    credentials: { email: { label: "Email", type: "email" }, password: { label: "Password", type: "password" } },
    async authorize(raw) {
      const parsed = z.object({ email: z.string().email(), password: z.string().min(1).max(200) }).safeParse(raw);
      if (!parsed.success) return null;
      try {
        const prisma = getPrisma();
        const user = await prisma.user.findUnique({ where: { email: parsed.data.email.trim().toLowerCase() } });
        if (!user || !user.active || user.role !== "ADMIN" || !(await compare(parsed.data.password, user.passwordHash))) return null;
        await prisma.adminAuditLog.create({ data: { userId: user.id, action: "LOGIN_SUCCESS", entityType: "User", entityId: user.id } });
        return { id: user.id, name: user.name, email: user.email, role: user.role };
      } catch (error) {
        console.error("AUTH ERROR");
        throw error;
      }
    },
  })],
  callbacks: {
    jwt({ token, user }) { if (user) { token.userId = user.id; token.role = (user as { role?: string }).role; } return token; },
    session({ session, token }) { if (session.user) { session.user.id = String(token.userId || token.sub); session.user.role = String(token.role || ""); } return session; },
  },
});
