import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("[Translation Callback] Received translation payload:", body);

    const {
      id,
      lang,
      title,
      slug: customSlug,
      excerpt,
      blocks = [],
      tag,
      category,
      img,
      imgFocalPoint = "center",
      readTime = "5 min",
      seoTitle,
      seoDescription,
      seoKeywords
    } = body;

    if (!id || !lang || !title) {
      return NextResponse.json(
        { error: "Campos obrigatórios ausentes (id, lang, title)." },
        { status: 400 }
      );
    }

    // Generate slug from title if customSlug is not provided
    const finalSlug = customSlug?.trim() || generateSlug(title);

    // Look up original post in PT if available to copy images/tags fallback
    const originalPost = await prisma.post.findFirst({
      where: { id }
    });

    const finalTag = tag || originalPost?.tag || "Mercado Tech";
    const finalCategory = category || originalPost?.category || "Mercado Tech";
    const finalImg = img || originalPost?.img || "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&h=680&fit=crop&auto=format";
    const finalImgFocalPoint = imgFocalPoint || originalPost?.imgFocalPoint || "center";
    const finalReadTime = readTime || originalPost?.readTime || "5 min";

    // Upsert the translated post entry using composite key (id, lang)
    const savedPost = await prisma.post.upsert({
      where: {
        id_lang: {
          id: id,
          lang: lang
        }
      },
      update: {
        slug: finalSlug,
        title: title,
        excerpt: excerpt || "",
        blocks: Array.isArray(blocks) ? blocks : originalPost?.blocks || [],
        tag: finalTag,
        category: finalCategory,
        img: finalImg,
        imgFocalPoint: finalImgFocalPoint,
        readTime: finalReadTime,
        seoTitle: seoTitle || title,
        seoDescription: seoDescription || excerpt || "",
        seoKeywords: seoKeywords || originalPost?.seoKeywords || undefined,
        published: true,
      },
      create: {
        id: id,
        lang: lang,
        slug: finalSlug,
        title: title,
        excerpt: excerpt || "",
        blocks: Array.isArray(blocks) ? blocks : originalPost?.blocks || [],
        tag: finalTag,
        category: finalCategory,
        img: finalImg,
        imgFocalPoint: finalImgFocalPoint,
        readTime: finalReadTime,
        seoTitle: seoTitle || title,
        seoDescription: seoDescription || excerpt || "",
        seoKeywords: seoKeywords || originalPost?.seoKeywords || undefined,
        published: true,
      }
    });

    // Update slug mappings on all translations sharing this ID
    const siblingTranslations = await prisma.post.findMany({
      where: { id: id },
      select: { lang: true, slug: true }
    });

    const slugMap: Record<string, string> = {};
    siblingTranslations.forEach((t) => {
      slugMap[t.lang] = t.slug;
    });

    for (const [sLang, sSlug] of Object.entries(slugMap)) {
      await prisma.post.update({
        where: { slug_lang: { slug: sSlug, lang: sLang } },
        data: { slugs: slugMap }
      });
    }

    revalidatePath("/");
    revalidatePath(`/${lang}`);
    revalidatePath(`/${lang}/post/${finalSlug}`);

    return NextResponse.json({
      success: true,
      message: `Post traduzido para '${lang}' salvo com sucesso!`,
      post: savedPost
    });
  } catch (error: any) {
    console.error("[Translation Callback] Erro ao salvar post traduzido:", error);
    return NextResponse.json(
      { error: "Erro ao processar callback de tradução", details: error.message },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
