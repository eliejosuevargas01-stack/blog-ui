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
    let segment = block.contentHtml || block.text || "";
    if (block.image) {
      // Avoid duplicate img tags if segment already contains this image url
      if (!segment.includes(block.image)) {
        segment += `\n<figure class="my-8">\n  <img src="${block.image}" alt="Imagem do bloco" class="w-full rounded-2xl border border-border/80 shadow-sm" style="object-position: ${block.focalPoint || 'center'}" />\n</figure>`;
      }
    }
    return segment;
  }).join("\n\n");
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
    tag: post.tag,
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

    // Batch fetch translation slugs using shared id and hn_id keys
    const postIds = dbPosts.map(p => p.id).filter(Boolean) as string[];
    const hnIds = dbPosts.map(p => p.hn_id).filter(Boolean) as string[];

    const allTranslations = (postIds.length > 0 || hnIds.length > 0) ? await prisma.post.findMany({
      where: {
        OR: [
          postIds.length > 0 ? { id: { in: postIds } } : {},
          hnIds.length > 0 ? { hn_id: { in: hnIds } } : {}
        ]
      },
      select: { id: true, hn_id: true, lang: true, slug: true }
    }) : [];

    const slugsMapById: Record<string, Record<string, string>> = {};
    allTranslations.forEach(t => {
      if (t.id) {
        if (!slugsMapById[t.id]) {
          slugsMapById[t.id] = {};
        }
        slugsMapById[t.id][t.lang] = t.slug;
      }
      if (t.hn_id) {
        if (!slugsMapById[t.hn_id]) {
          slugsMapById[t.hn_id] = {};
        }
        slugsMapById[t.hn_id][t.lang] = t.slug;
      }
    });

    return dbPosts.map(post => {
      const dynamicSlugs = slugsMapById[post.id] || (post.hn_id ? slugsMapById[post.hn_id] : undefined);
      return mapDbPostToBlogPost(post, dynamicSlugs);
    });
  } catch (error) {
    console.error(`[DB] Error loading posts for language ${lang}:`, error);
    return [];
  }
}
