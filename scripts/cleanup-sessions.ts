/**
 * Delete expired admin sessions from the database.
 *
 * Run on a schedule (e.g. daily) via the system cron or a systemd timer:
 *   pnpm cleanup-sessions
 *
 * Note: rate-limit records live in Redis and expire automatically via TTL,
 * so they need no cleanup job.
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  try {
    const result = await prisma.session.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
    console.log(
      `[${new Date().toISOString()}] Cleaned up ${result.count} expired session(s)`,
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("Session cleanup failed:", error);
  process.exit(1);
});
