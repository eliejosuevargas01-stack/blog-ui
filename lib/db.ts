import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

function reconstructContentHtml(blocksJson: any): string {
  let blocks: any[] = [];
  if (Array.isArray(blocksJson)) {
    blocks = blocksJson;
  } else if (typeof blocksJson === "string") {
    try {
      blocks = JSON.parse(blocksJson);
    } catch {
      blocks = [];
    }
  }

  return blocks.map((block) => {
    let segment = block.text || "";
    if (block.image) {
      segment += `\n<figure>\n  <img src="${block.image}" alt="Image" />\n</figure>`;
    }
    return segment;
  }).join("\n");
}

export function mapDbPostToBlogPost(post: any) {
  let slugs: any = {};
  if (post.slugs) {
    slugs = typeof post.slugs === "string" ? JSON.parse(post.slugs) : post.slugs;
  }

  const contentHtml = reconstructContentHtml(post.blocks);
  const tags = post.seoKeywords ? post.seoKeywords.split(',').map((t: string) => t.trim()).filter(Boolean) : [post.tag];

  return {
    id: post.id,
    slug: post.slug,
    lang: post.lang,
    title: post.title,
    excerpt: post.excerpt,
    description: post.excerpt,
    category: post.category,
    image: post.img,
    imageThumb: post.img,
    tags: tags,
    keywords: tags,
    date: post.date.toISOString(),
    publishedAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
    readTime: post.readTime,
    slugs: slugs,
    contentHtml: contentHtml,
    content: post.excerpt
  };
}

export async function getDbPostsForLang(lang: string) {
  try {
    const dbPosts = await prisma.post.findMany({
      where: { lang: lang },
      orderBy: { date: "desc" }
    });
    return dbPosts.map(mapDbPostToBlogPost);
  } catch (error) {
    console.error(`[DB] Error loading posts for language ${lang}:`, error);
    return [];
  }
}
