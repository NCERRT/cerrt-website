/**
 * Create an admin account from the command line.
 *
 * Usage:
 *   pnpm create-admin <email> <password> "<full name>"
 *
 * The password is validated (length + Have I Been Pwned breach check)
 * before the account is created.
 */
import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { validatePassword } from "../lib/server/passwordPolicy";

async function main() {
  const [email, password, ...nameParts] = process.argv.slice(2);
  const name = nameParts.join(" ").trim();

  if (!email || !password || !name) {
    console.error(
      'Usage: pnpm create-admin <email> <password> "<full name>"',
    );
    process.exit(1);
  }

  // Validate password (structure + breach check)
  const pwCheck = await validatePassword(password);
  if (!pwCheck.valid) {
    console.error(`✗ Password rejected: ${pwCheck.error}`);
    process.exit(1);
  }

  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  try {
    const normalizedEmail = email.toLowerCase().trim();

    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (existing) {
      console.error(`✗ A user with email ${normalizedEmail} already exists.`);
      process.exit(1);
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email: normalizedEmail, name, passwordHash, role: "superadmin" },
    });

    console.log(`✓ Admin account created`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Name:  ${user.name}`);
    console.log(`  ID:    ${user.id}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("✗ Failed to create admin:", error);
  process.exit(1);
});
