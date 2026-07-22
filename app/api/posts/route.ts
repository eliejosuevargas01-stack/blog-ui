import { NextResponse } from "next/server";
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

export async function POST(req: Request) {
  try {
    // Autenticação da API via Header ou Query String
    const apiKeyHeader = req.headers.get("x-api-key") || req.headers.get("authorization")?.replace("Bearer ", "");
    const url = new URL(req.url);
    const apiKeyQuery = url.searchParams.get("api_key");

    const expectedKey = process.env.API_SECRET_KEY || "motonapratica-secret-key-2026";
    const providedKey = apiKeyHeader || apiKeyQuery;

    if (!providedKey || providedKey !== expectedKey) {
      return NextResponse.json({ error: "Não autorizado. Chave de API inválida (x-api-key)." }, { status: 401 });
    }

    const body = await req.json();
    const {
      title,
      slug: customSlug,
      tag = "Notícias",
      category = "Mercado Tech",
      excerpt = "",
      readTime = "5 min",
      img = "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=1200",
      imgFocalPoint = "center",
      blocks = [],
      seoTitle,
      seoDescription,
      seoKeywords,
      lang = "pt",
      slugs = {},
      hn_id = null
    } = body;

    if (!title) {
      return NextResponse.json({ error: "O título do post é obrigatório." }, { status: 400 });
    }

    const finalSlug = customSlug?.trim() || generateSlug(title);

    // Verificar se já existe slug idêntico no mesmo idioma
    const existing = await prisma.post.findUnique({
      where: { slug_lang: { slug: finalSlug, lang } },
    });

    if (existing) {
      return NextResponse.json(
        { error: `Já existe um post com o slug '${finalSlug}'. Escolha um slug diferente.` },
        { status: 400 }
      );
    }

    // Criar o post no banco de dados conforme o schema do nosso projeto
    const post = await prisma.post.create({
      data: {
        slug: finalSlug,
        lang,
        slugs: slugs && Object.keys(slugs).length > 0 ? slugs : { [lang]: finalSlug },
        hn_id,
        tag,
        category,
        title,
        excerpt: excerpt || title,
        readTime,
        img,
        imgFocalPoint,
        blocks: Array.isArray(blocks) ? blocks : [],
        seoTitle: seoTitle || title,
        seoDescription: seoDescription || excerpt,
        seoKeywords: seoKeywords || `${tag}, ${category}`,
        date: new Date(),
        published: true
      },
    });

    // Revalidar caches públicos do Next.js
    revalidatePath("/");
    revalidatePath(`/${lang}`);
    revalidatePath(`/${lang}/artigos`);
    revalidatePath(`/${lang}/post/${finalSlug}`);
    revalidatePath("/sitemap.xml");

    return NextResponse.json({
      success: true,
      message: "Post criado com sucesso via automação API!",
      post: {
        id: post.id,
        title: post.title,
        slug: post.slug,
        lang: post.lang,
        url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/${lang}/post/${post.slug}`,
      },
    });
  } catch (error: any) {
    console.error("Erro na API de automação de posts:", error);
    return NextResponse.json({ error: "Erro interno ao processar automação.", details: error.message }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
