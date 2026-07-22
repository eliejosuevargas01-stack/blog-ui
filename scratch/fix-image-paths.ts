import { prisma } from "../lib/db";

async function fixPaths() {
  const posts = await prisma.post.findMany();
  console.log(`Checking ${posts.length} posts for image paths...`);

  for (const post of posts) {
    let updatedImg = post.img;
    if (updatedImg.includes("/uploads/posts/")) {
      updatedImg = updatedImg.replace("/uploads/posts/", "/uploads/");
    }

    let updatedBlocks = post.blocks;
    if (typeof updatedBlocks === "string") {
      try { updatedBlocks = JSON.parse(updatedBlocks); } catch {}
    }

    if (Array.isArray(updatedBlocks)) {
      updatedBlocks = updatedBlocks.map((b: any) => {
        let bImg = b.image || "";
        if (bImg.includes("/uploads/posts/")) {
          bImg = bImg.replace("/uploads/posts/", "/uploads/");
        }
        return { ...b, image: bImg };
      });
    }

    await prisma.post.update({
      where: {
        id_lang: { id: post.id, lang: post.lang }
      },
      data: {
        img: updatedImg,
        blocks: updatedBlocks as any
      }
    });
  }

  console.log("Done fixing image paths in database!");
}

fixPaths().catch(console.error).finally(() => prisma.$disconnect());
