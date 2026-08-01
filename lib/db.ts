import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function getDbPostsForLang(lang: string) {
  try {
    const posts = await prisma.post.findMany({
      where: {
        OR: [
          { lang },
          ...(lang === "pt" ? [{ lang: null }] : [])
        ]
      },
      orderBy: { createdAt: "desc" }
    });
    return posts.map((p) => ({
      ...p,
      image: p.img,
      description: p.excerpt,
      date: p.createdAt.toISOString(),
    }));
  } catch (error) {
    console.error("Erro ao buscar posts para o idioma:", error);
    return [];
  }
}

export async function loadPagesForLang(rootDir?: string, lang?: string) {
  try {
    const pages = await prisma.page.findMany({
      orderBy: { createdAt: "desc" }
    });
    return pages.map((p) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      isStatic: p.isStatic,
      content: typeof p.content === "string" ? JSON.parse(p.content) : p.content,
      seoTitle: p.seoTitle,
      seoDescription: p.seoDescription,
    }));
  } catch (error) {
    console.error("Erro ao carregar páginas:", error);
    return [];
  }
}

export async function getPostBySlug(slug: string, lang?: string) {
  try {
    const post = await prisma.post.findUnique({
      where: { slug }
    });
    if (!post) return null;
    return {
      ...post,
      image: post.img,
      description: post.excerpt,
      date: post.createdAt.toISOString(),
      metaTitle: post.seoTitle || post.title,
      metaDescription: post.seoDescription || post.excerpt,
    };
  } catch (error) {
    console.error("Erro ao buscar post por slug:", error);
    return null;
  }
}
