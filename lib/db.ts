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

    // Mapear translationGroupIds para montar dicionario de slugs por idioma
    const groupIds = posts.map((p) => p.translationGroupId).filter(Boolean) as string[];
    let groupMap: Record<string, Record<string, string>> = {};

    if (groupIds.length > 0) {
      const groupPosts = await prisma.post.findMany({
        where: {
          translationGroupId: { in: groupIds }
        },
        select: {
          slug: true,
          lang: true,
          translationGroupId: true
        }
      });

      groupPosts.forEach((gp) => {
        if (gp.translationGroupId) {
          const l = gp.lang || "pt";
          if (!groupMap[gp.translationGroupId]) {
            groupMap[gp.translationGroupId] = {};
          }
          groupMap[gp.translationGroupId][l] = gp.slug;
        }
      });
    }

    return posts.map((p) => {
      const slugsDict = p.translationGroupId ? groupMap[p.translationGroupId] || {} : {};
      return {
        ...p,
        image: p.img,
        description: p.excerpt,
        date: p.createdAt.toISOString(),
        slugs: slugsDict,
      };
    });
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
    let post = await prisma.post.findUnique({
      where: { slug }
    });

    if (!post) return null;

    // Se um idioma especifico foi solicitado e o post encontrado pertence a outro idioma,
    // tenta localizar a traducao no mesmo translationGroupId
    if (lang && post.lang !== lang && post.translationGroupId) {
      const translated = await prisma.post.findFirst({
        where: {
          translationGroupId: post.translationGroupId,
          lang: lang
        }
      });
      if (translated) {
        post = translated;
      }
    }

    // Carregar todas as traducoes do translationGroupId para montar a lista de slugs
    let slugsDict: Record<string, string> = {};
    if (post.translationGroupId) {
      const groupPosts = await prisma.post.findMany({
        where: { translationGroupId: post.translationGroupId },
        select: { slug: true, lang: true }
      });
      groupPosts.forEach((gp) => {
        const l = gp.lang || "pt";
        slugsDict[l] = gp.slug;
      });
    }

    return {
      ...post,
      image: post.img,
      description: post.excerpt,
      date: post.createdAt.toISOString(),
      metaTitle: post.seoTitle || post.title,
      metaDescription: post.seoDescription || post.excerpt,
      slugs: slugsDict,
    };
  } catch (error) {
    console.error("Erro ao buscar post por slug:", error);
    return null;
  }
}
