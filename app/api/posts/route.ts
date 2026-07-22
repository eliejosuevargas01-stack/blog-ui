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
    console.log("[Create Post API] Incoming payload:", body);

    // Adapt n8n post generator payload structure
    let title = body.title || "";
    let blocks: any[] = [];
    let coverImg = body.img || "";

    if (body.conteudo_html && typeof body.conteudo_html === "object") {
      // Sort blocks by key name: bloco1, bloco2, bloco3...
      const blockKeys = Object.keys(body.conteudo_html).sort((a, b) => {
        const numA = parseInt(a.replace(/\D/g, ""), 10) || 0;
        const numB = parseInt(b.replace(/\D/g, ""), 10) || 0;
        return numA - numB;
      });

      blockKeys.forEach((key, idx) => {
        const htmlContent = body.conteudo_html[key] || "";
        
        // Extract first <h1> as title if not already set
        if (!title && idx === 0) {
          const h1Match = htmlContent.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
          if (h1Match) {
            title = h1Match[1].replace(/<[^>]*>/g, "").trim();
          }
        }

        // Extract image src if present inside block HTML
        let blockImage = "";
        const imgMatch = htmlContent.match(/<img[^>]*src=["']([^"']*)["']/i);
        if (imgMatch) {
          blockImage = imgMatch[1];
          if (!coverImg) {
            coverImg = blockImage; // Set first found image as post cover
          }
        }

        blocks.push({
          contentHtml: htmlContent,
          image: blockImage,
          focalPoint: "50% 50%"
        });
      });
    }

    // Default title fallback
    if (!title && body.meta_title) {
      title = body.meta_title.split(":")[1]?.trim() || body.meta_title;
    }
    if (!title) {
      title = "Matéria Curiosotech";
    }

    // Map standard fields
    const lang = body.lang || "pt";
    const customSlug = body.slug;
    const finalSlug = customSlug?.trim() || generateSlug(title);

    const category = body.categoria || body.category || "Inteligência Artificial";
    const tag = (body.tags && body.tags[0]) || body.tag || "Tecnologia";
    const seoKeywords = Array.isArray(body.tags) ? body.tags.join(", ") : body.seoKeywords || tag;

    const excerpt = body.excerpt || "";
    const seoTitle = body.meta_title || body.seoTitle || title;
    const seoDescription = body.meta_description || body.seoDescription || excerpt;
    const hn_id = body.hn_id || null;
    const imgFocalPoint = body.imgFocalPoint || "50% 50%";
    const readTime = body.readTime || "5 min";

    // Use default image if none found in blocks
    const finalCoverImg = coverImg || "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=1200";

    // Standard blocks fallback
    const finalBlocks = blocks.length > 0 ? blocks : (Array.isArray(body.blocks) ? body.blocks : []);

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
        slugs: body.slugs && Object.keys(body.slugs).length > 0 ? body.slugs : { [lang]: finalSlug },
        hn_id,
        tag,
        category,
        title,
        excerpt: excerpt || title,
        readTime,
        img: finalCoverImg,
        imgFocalPoint,
        blocks: finalBlocks,
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
        url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://curiosotech.online"}/${lang}/post/${post.slug}`,
      },
    });
  } catch (error: any) {
    console.error("Erro na API de automação de posts:", error);
    return NextResponse.json({ error: "Erro interno ao processar automação.", details: error.message }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
