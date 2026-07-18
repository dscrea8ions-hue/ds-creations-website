import { compare, hash } from "bcryptjs";
import { config } from "dotenv";

async function resetAdminPassword() {
  const plainPassword = process.env.ADMIN_PLAIN_PASSWORD;
  delete process.env.ADMIN_PLAIN_PASSWORD;

  config({ path: ".env.local", override: true, quiet: true });
  delete process.env.ADMIN_PLAIN_PASSWORD;

  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (!adminEmail || !plainPassword || plainPassword.length < 12) {
    throw new Error("ADMIN_PASSWORD_RESET_INPUT_INVALID");
  }

  const { getPrisma } = await import("../lib/prisma");
  const prisma = getPrisma();

  try {
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail },
      select: { id: true },
    });
    if (!existingAdmin) throw new Error("ADMIN_NOT_FOUND");

    const passwordHash = await hash(plainPassword, 12);
    const updatedAdmin = await prisma.user.update({
      where: { email: adminEmail },
      data: {
        role: "ADMIN",
        active: true,
        passwordHash,
      },
      select: {
        email: true,
        passwordHash: true,
      },
    });
    const selfCheck = await compare(plainPassword, updatedAdmin.passwordHash);

    console.log(`admin email: ${updatedAdmin.email}`);
    console.log("updated successfully");
    console.log(`stored hash length: ${updatedAdmin.passwordHash.length}`);
    console.log(`stored hash prefix: ${updatedAdmin.passwordHash.slice(0, 7)}`);
    console.log(`bcrypt self-check: ${selfCheck}`);

    if (!selfCheck) process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

resetAdminPassword().catch(() => {
  process.exitCode = 1;
});
