import "dotenv/config";
import crypto from "node:crypto";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

function hashApiKey(rawKey: string): string {
  return crypto.createHash("sha256").update(rawKey.trim()).digest("hex");
}

async function main() {
  const args = process.argv.slice(2);
  let keyName = "TheHive Bridge Service";

  const nameArgIndex = args.indexOf("--name");
  if (nameArgIndex !== -1 && args[nameArgIndex + 1]) {
    keyName = args[nameArgIndex + 1].trim();
  }

  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  try {
    console.log(`🔑 Generating new API Key for: "${keyName}"...`);

    // Generate cryptographically random 256-bit (64 hex char) raw API key
    const rawKey = crypto.randomBytes(32).toString("hex");
    const keyHash = hashApiKey(rawKey);

    const apiKeyRecord = await prisma.apiKey.create({
      data: {
        name: keyName,
        keyHash,
        isActive: true,
      },
    });

    console.log("\n=======================================================");
    console.log("🎉 API Key Created Successfully!");
    console.log("=======================================================");
    console.log(` ID:       ${apiKeyRecord.id}`);
    console.log(` Name:     ${apiKeyRecord.name}`);
    console.log(` Created:  ${apiKeyRecord.createdAt.toLocaleString()}`);
    console.log(` RAW KEY:  ${rawKey}`);
    console.log("=======================================================");
    console.log("⚠️  IMPORTANT: Copy and store this RAW KEY securely now.");
    console.log("    Only the SHA-256 hash is saved in the database.");
    console.log("    This key will NEVER be displayed again!");
    console.log("=======================================================\n");

    console.log("Example Authorization Header for HTTP requests:");
    console.log(`Authorization: Bearer ${rawKey}\n`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error("❌ Error generating API key:", e);
  process.exit(1);
});
