import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("Checking Prisma client models...");
  const columns = await prisma.$queryRawUnsafe(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'Post';
  `);
  console.log("Columns in remote DB 'Post' table:", columns);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
