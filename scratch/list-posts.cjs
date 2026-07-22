const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" }
  });
  console.log("POSTS IN DB:", posts.map(p => ({
    id: p.id,
    lang: p.lang,
    title: p.title,
    img: p.img,
    blocksCount: Array.isArray(p.blocks) ? p.blocks.length : 0
  })));
}

main().catch(console.error).finally(() => prisma.$disconnect());
