import { hash } from "bcryptjs";

const password = process.env.ADMIN_PLAIN_PASSWORD;

if (!password || password.length < 12) {
  console.error("Set ADMIN_PLAIN_PASSWORD in the current terminal to a password containing at least 12 characters.");
  process.exit(1);
}

async function main() {
  console.log(await hash(password!, 12));
}

main().catch(() => process.exit(1));
