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

export function mapDbPostToBlogPost(post: any, dynamicSlugs?: Record<string, string>) {
  let slugs: any = {};
  if (dynamicSlugs && Object.keys(dynamicSlugs).length > 0) {
    slugs = dynamicSlugs;
  } else if (post.slugs) {
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
    content: post.excerpt,
    hnId: post.hn_id,
    published: post.published,
    imageGenerationSent: post.image_generation_sent,
    imageStatus: post.image_status,
    translationStatus: post.translation_status,
  };
}

export async function getDbPostsForLang(lang: string) {
  try {
    const dbPosts = await prisma.post.findMany({
      where: { 
        lang: lang,
        published: true,
        date: { lte: new Date() }
      },
      orderBy: { date: "desc" }
    });

    // Batch fetch translation slugs using the universal hn_id key
    const hnIds = dbPosts.map(p => p.hn_id).filter(Boolean) as string[];
    const allTranslations = hnIds.length > 0 ? await prisma.post.findMany({
      where: { hn_id: { in: hnIds } },
      select: { hn_id: true, lang: true, slug: true }
    }) : [];

    const slugsMapByHnId: Record<string, Record<string, string>> = {};
    allTranslations.forEach(t => {
      if (t.hn_id) {
        if (!slugsMapByHnId[t.hn_id]) {
          slugsMapByHnId[t.hn_id] = {};
        }
        slugsMapByHnId[t.hn_id][t.lang] = t.slug;
      }
    });

    return dbPosts.map(post => {
      const dynamicSlugs = post.hn_id ? slugsMapByHnId[post.hn_id] : undefined;
      return mapDbPostToBlogPost(post, dynamicSlugs);
    });
  } catch (error) {
    console.error(`[DB] Error loading posts for language ${lang}:`, error);
    return [];
  }
}
