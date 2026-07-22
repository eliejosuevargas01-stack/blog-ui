import { PrismaClient as PrismaClient1 } from '@prisma/client';

async function main() {
  const url1 = "postgresql://postgres:S%40m%40r1%401205112005@db.jncjrxpnpfglbjskombd.supabase.co:5432/postgres";
  const url2 = "postgres://curiosotech:souCurioso%40Tech2026@72.60.247.157:2500/curiosotech";

  console.log("Connecting to Supabase db...");
  const prisma1 = new PrismaClient1({ datasources: { db: { url: url1 } } });
  try {
    const count1 = await prisma1.post.count();
    console.log("Supabase post count:", count1);
  } catch (e: any) {
    console.error("Supabase count error:", e.message);
  } finally {
    await prisma1.$disconnect();
  }

  console.log("Connecting to Curiosotech db...");
  const prisma2 = new PrismaClient1({ datasources: { db: { url: url2 } } });
  try {
    const count2 = await prisma2.post.count();
    console.log("Curiosotech post count:", count2);
  } catch (e: any) {
    console.error("Curiosotech count error:", e.message);
  } finally {
    await prisma2.$disconnect();
  }
}

main().catch(console.error);
