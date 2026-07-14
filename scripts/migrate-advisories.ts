import { loadEnvConfig } from '@next/env';
loadEnvConfig(process.cwd());

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });
// Basic slugify function
function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
}

async function main() {
  console.log('Starting advisory data migration...');
  
  const advisories = await prisma.advisory.findMany();
  console.log(`Found ${advisories.length} advisories to migrate.`);
  
  let migratedCount = 0;
  
  for (const adv of advisories) {
    try {
      // 1. Generate a slug
      let slug = slugify(adv.title);
      
      // Ensure slug uniqueness (simple implementation, if collision append advisoryId)
      const existing = await prisma.advisory.findFirst({
        where: { slug, id: { not: adv.id } }
      });
      
      if (existing) {
        slug = `${slug}-${adv.advisoryId.toLowerCase()}`;
      }
      
      // 2. Update the record
      // Map existing description to overview
      await prisma.advisory.update({
        where: { id: adv.id },
        data: {
          slug,
          overview: adv.description,
          // Defaults are handled by schema: type=standard, arrays=[]
        }
      });
      
      migratedCount++;
    } catch (error) {
      console.error(`Failed to migrate advisory ${adv.id} (${adv.advisoryId}):`, error);
    }
  }
  
  console.log(`Successfully migrated ${migratedCount} out of ${advisories.length} advisories.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
