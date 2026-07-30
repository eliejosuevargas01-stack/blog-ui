import { NextResponse } from "next/server";
import { prisma } from "../../../lib/db";
import { revalidatePath } from "next/cache";
import { processImageBase64, saveAudioBuffer, calculateReadTime } from "@/lib/image-utils";

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

async function generateUniqueSlug(title: string, existingId?: string): Promise<string> {
  const baseSlug = generateSlug(title) || `post-${Date.now()}`;
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await prisma.post.findUnique({
      where: { slug },
      select: { id: true }
    });

    if (!existing || (existingId && existing.id === existingId)) {
      return slug;
    }

    counter++;
    slug = `${baseSlug}-${counter}`;
  }
}

function cleanSlug(slug?: string): string {
  if (!slug) return "";
  return slug
    .trim()
    .replace(/^\/?(posts|post|reviews|resenas|avaliacoes)\//i, "")
    .replace(/^\/+/, "");
}

function extractImageUrl(imgField: any): string {
  if (!imgField) return "";
  if (typeof imgField === "string") {
    if (imgField.startsWith("http")) return imgField;
    return "";
  }
  if (typeof imgField === "object" && imgField.url) {
    return imgField.url;
  }
  return "";
}

function normalizePostTag(rawTag?: string, title?: string): string {
  const lowerTag = (rawTag || "").toLowerCase().trim();
  const lowerTitle = (title || "").toLowerCase().trim();

  if (lowerTag.includes("review") || lowerTag.includes("anális") || lowerTag.includes("analis") || lowerTag.includes("teste") || lowerTag.includes("test")) return "Reviews";
  if (lowerTag.includes("manuten") || lowerTag.includes("mainten") || lowerTag.includes("oficina") || lowerTag.includes("garagem")) return "Manutenção";
  if (lowerTag.includes("rota") || lowerTag.includes("route") || lowerTag.includes("viagem") || lowerTag.includes("estrada") || lowerTag.includes("travel")) return "Rotas";
  if (lowerTag.includes("equip") || lowerTag.includes("gear") || lowerTag.includes("capacete") || lowerTag.includes("vestuário")) return "Equipamentos";
  if (lowerTag.includes("event") || lowerTag.includes("encontro") || lowerTag.includes("salão")) return "Eventos";
  if (lowerTag.includes("motogp") || lowerTag.includes("márquez") || lowerTag.includes("marquez") || lowerTag.includes("ducati") || lowerTag.includes("paddock") || lowerTag.includes("corrida")) return "MotoGP";

  // Inferência automática pelo título se tag não foi informada ou for genérica
  if (lowerTitle.includes("review") || lowerTitle.includes("avaliação") || lowerTitle.includes("análise") || lowerTitle.includes("custos") || lowerTitle.includes("twister") || lowerTitle.includes("mt-") || lowerTitle.includes("fz25") || lowerTitle.includes("cb 300") || lowerTitle.includes("morreram") || lowerTitle.includes("died")) return "Reviews";
  if (lowerTitle.includes("manutenção") || lowerTitle.includes("óleo") || lowerTitle.includes("corrente") || lowerTitle.includes("freio") || lowerTitle.includes("pneu") || lowerTitle.includes("oficina")) return "Manutenção";
  if (lowerTitle.includes("rota") || lowerTitle.includes("viagem") || lowerTitle.includes("serra") || lowerTitle.includes("estrada") || lowerTitle.includes("roteiro")) return "Rotas";
  if (lowerTitle.includes("capacete") || lowerTitle.includes("jaqueta") || lowerTitle.includes("luva") || lowerTitle.includes("intercomunicador") || lowerTitle.includes("equipamento")) return "Equipamentos";
  if (lowerTitle.includes("motogp") || lowerTitle.includes("marquez") || lowerTitle.includes("márquez") || lowerTitle.includes("bagnaia") || lowerTitle.includes("martín") || lowerTitle.includes("cota") || lowerTitle.includes("austin")) return "MotoGP";

  return rawTag?.trim() || "Reviews";
}

function extractMentionedSlugsFromHtml(html: string, selfSlug?: string): string[] {
  if (!html) return [];
  const regex = /(?:\/post\/|\/en\/post\/|\/es\/post\/|motonapratica\.online\/post\/)([a-zA-Z0-9_-]+)/gi;
  const slugs: string[] = [];
  let match;
  while ((match = regex.exec(html)) !== null) {
    if (match[1]) {
      const clean = match[1].trim();
      if (clean && clean !== selfSlug) {
        slugs.push(clean);
      }
    }
  }
  return Array.from(new Set(slugs));
}

function cleanBlockHtml(html: string): string {
  if (!html) return "";
  return html
    .replace(/<p>\s*(?:Image|Imagem)\s*URL\s*:?\s*https?:\/\/[^\s<]+\s*<\/p>/gi, "")
    .replace(/(?:Image|Imagem)\s*URL\s*:?\s*https?:\/\/[^\s<]+/gi, "")
    .replace(/\{[^}]*\}=\d+\{[^}]*\}/gi, "")
    .replace(/href=(["'])\/?pt\/posts?\//gi, 'href=$1/post/')
    .replace(/href=(["'])\/?posts\//gi, 'href=$1/post/')
    .replace(/href=(["'])\/?en\/posts\//gi, 'href=$1/en/post/')
    .replace(/href=(["'])\/?es\/posts\//gi, 'href=$1/es/post/')
    .trim();
}

function processImagePlaceholdersInHtml(htmlText: string, langData: any): string {
  if (!htmlText) return "";

  let processed = htmlText
    // Suporte ao formato {id=1}, {id=2}, [id=1], [id=2], {img=1}, [img=1], {image=1}
    .replace(/[\{\[]\s*(?:id|img|image)\s*=\s*(\d+)\s*[\}\]]/gi, (match, orderStr) => {
      const orderNum = parseInt(orderStr, 10);
      const imgKey = `img-${orderNum}`;
      const imgUrl = extractImageUrl(langData[imgKey]);
      if (imgUrl) {
        const altText = langData[`alt-${orderNum}`] || langData[`alt_${orderNum}`] || langData[`img-${orderNum}-alt`] || `Imagem ${orderNum}`;
        const captionText = langData[`caption-${orderNum}`] || langData[`caption_${orderNum}`] || langData[`legenda-${orderNum}`] || "";

        if (captionText) {
          return `<figure class="my-6 text-center"><img src="${imgUrl}" alt="${altText}" class="w-full h-auto object-cover border border-border rounded-sm mx-auto" loading="lazy" /><figcaption class="text-xs text-muted-foreground mt-2 italic">${captionText}</figcaption></figure>`;
        }
        return `<img src="${imgUrl}" alt="${altText}" class="w-full h-auto object-cover border border-border rounded-sm my-4" loading="lazy" />`;
      }
      return "";
    })
    // Suporte ao formato com legenda {Legenda}=2{Alt}
    .replace(/\{([^}]*)\}=(\d+)\{([^}]*)\}/gi, (match, captionText, orderStr, altText) => {
      const orderNum = parseInt(orderStr, 10);
      const imgKey = `img-${orderNum}`;
      const imgUrl = extractImageUrl(langData[imgKey]);

      if (imgUrl) {
        const cleanAlt = altText ? altText.trim() : (langData[`alt-${orderNum}`] || "Imagem do artigo");
        const cleanCaption = captionText ? captionText.trim() : (langData[`caption-${orderNum}`] || "");
        if (cleanCaption) {
          return `<figure class="my-6 text-center"><img src="${imgUrl}" alt="${cleanAlt}" class="w-full h-auto object-cover border border-border rounded-sm mx-auto" loading="lazy" /><figcaption class="text-xs text-muted-foreground mt-2 italic">${cleanCaption}</figcaption></figure>`;
        }
        return `<img src="${imgUrl}" alt="${cleanAlt}" class="w-full h-auto object-cover border border-border rounded-sm my-4" loading="lazy" />`;
      }
      return "";
    });

  return cleanBlockHtml(processed);
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const lang = url.searchParams.get("lang") || "pt";
    const orderByParam = url.searchParams.get("orderBy") || "createdAt";
    const order = url.searchParams.get("order") === "asc" ? "asc" : "desc";
    const limit = parseInt(url.searchParams.get("limit") || "50", 10);

    const validOrderByFields = ["createdAt", "mentions", "views", "likes", "title"];
    const orderByField = validOrderByFields.includes(orderByParam) ? orderByParam : "createdAt";

    const posts = await prisma.post.findMany({
      where: {
        OR: [
          { lang },
          ...(lang === "pt" ? [{ lang: null }] : [])
        ]
      },
      orderBy: { [orderByField]: order },
      take: limit,
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        tag: true,
        category: true,
        lang: true,
        mentions: true,
        views: true,
        likes: true,
        createdAt: true,
      }
    });

    return NextResponse.json({
      success: true,
      count: posts.length,
      posts
    });
  } catch (error: any) {
    return NextResponse.json({ error: "Erro ao buscar posts", details: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const apiKeyHeader = req.headers.get("x-api-key") || req.headers.get("authorization")?.replace("Bearer ", "");
    const url = new URL(req.url);
    const apiKeyQuery = url.searchParams.get("api_key");

    const expectedKey = process.env.API_SECRET_KEY || "motonapratica-secret-key-2026";
    const providedKey = apiKeyHeader || apiKeyQuery;

    if (!providedKey || providedKey !== expectedKey) {
      return NextResponse.json({ error: "Não autorizado. Chave de API inválida (x-api-key)." }, { status: 401 });
    }

    const rawBody = await req.json();
    let body = Array.isArray(rawBody) ? rawBody[0] : rawBody;

    if (body && typeof body === "object" && "json" in body && body.json) {
      body = body.json;
    }

    let output = body?.output || (body?.pt || body?.en || body?.es ? body : null);

    if (typeof output === "string") {
      try {
        output = JSON.parse(output);
      } catch (e) {
        console.error("Falha ao fazer parse do output recebido como string:", e);
      }
    }

    const explicitMentionedSlugs: string[] = Array.isArray(body?.mentioned_slugs || body?.mentionedSlugs) ? (body?.mentioned_slugs || body?.mentionedSlugs) : [];

    // SUPORTE A POST MULTI-IDIOMA (OUTPUT DE AUTOMACÃO N8N)
    if (output && typeof output === "object") {
      const translationGroupId = output.id || output.pt?.id || output.en?.id || output.es?.id || body.id || body.translationGroupId || `group-${Date.now()}`;
      const createdPosts: any[] = [];
      const extractedMentionedSlugs: Set<string> = new Set(explicitMentionedSlugs);

      const langs = ["pt", "en", "es"];

      // Buscar posts existentes do mesmo translationGroupId para aproveitar imagens reais já cadastradas
      const existingGroupPosts = translationGroupId ? await prisma.post.findMany({
        where: { translationGroupId },
        select: { img: true, blocks: true }
      }) : [];

      let dbRealFeaturedImg: string | null = null;
      const dbRealBlockImgs: Record<number, string> = {};

      for (const p of existingGroupPosts) {
        if (p.img && typeof p.img === "string" && !p.img.includes("unsplash.com")) {
          dbRealFeaturedImg = p.img;
        }
        const bList = Array.isArray(p.blocks) ? (p.blocks as any[]) : [];
        bList.forEach((b: any, idx: number) => {
          if (b && typeof b.image === "string" && b.image && !b.image.includes("unsplash.com") && !dbRealBlockImgs[idx]) {
            dbRealBlockImgs[idx] = b.image;
          }
        });
      }

      for (const lang of langs) {
        const langData = output[lang];
        if (!langData || !langData.title) continue;

        // Gerar slug automaticamente e garantindo unicidade (-2, -3 se já existir no banco)
        const finalSlug = await generateUniqueSlug(langData.title);

        const featuredImg =
          extractImageUrl(langData["img-1"]) ||
          extractImageUrl(output.pt?.["img-1"]) ||
          extractImageUrl(output.en?.["img-1"]) ||
          extractImageUrl(output.es?.["img-1"]) ||
          dbRealFeaturedImg ||
          "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=1200";

        const blocks: any[] = [];
        for (let i = 1; i <= 20; i++) {
          const rawBlockText = langData[`block-${i}`];
          if (!rawBlockText) continue;

          const foundSlugs = extractMentionedSlugsFromHtml(rawBlockText, finalSlug);
          foundSlugs.forEach(s => extractedMentionedSlugs.add(s));

          const processedBlockText = processImagePlaceholdersInHtml(rawBlockText, langData);
          const rawBlockImg =
            extractImageUrl(langData[`img-${i + 1}`]) ||
            extractImageUrl(output.pt?.[`img-${i + 1}`]) ||
            extractImageUrl(output.en?.[`img-${i + 1}`]) ||
            extractImageUrl(output.es?.[`img-${i + 1}`]) ||
            dbRealBlockImgs[i - 1] || "";

          const hasImgTagInText = processedBlockText.includes("<img");

          blocks.push({
            text: processedBlockText,
            image: hasImgTagInText ? "" : rawBlockImg,
            focalPoint: "center",
          });
        }

        const postUrlPath = lang === "en" ? `/en/post/${finalSlug}` : lang === "es" ? `/es/post/${finalSlug}` : `/post/${finalSlug}`;

        const rawPostTag = langData.tag || langData.type || langData.category || body.tag || body.type || body.category || output.tag || output.type || output.category;
        const postTag = normalizePostTag(rawPostTag, langData.title);
        const finalAudioUrl = langData.audioUrl || langData.audio_url || langData.audio || output.audioUrl || output.audio_url || output.audio || null;

        const calculatedReadTime = calculateReadTime({ title: langData.title, excerpt: langData.summary, blocks });

        const post = await prisma.post.upsert({
          where: { slug: finalSlug },
          update: {
            tag: postTag,
            title: langData.title,
            excerpt: langData.summary || langData.title,
            readTime: calculatedReadTime,
            img: featuredImg,
            audioUrl: finalAudioUrl,
            blocks,
            seoTitle: langData["meta-title"] || langData.title,
            seoDescription: langData["meta-description"] || langData.summary,
            seoKeywords: langData["meta-tags"] || `${postTag}, Moto na Prática`,
            translationGroupId,
            lang,
          },
          create: {
            slug: finalSlug,
            tag: postTag,
            category: postTag,
            title: langData.title,
            excerpt: langData.summary || langData.title,
            readTime: calculatedReadTime,
            img: featuredImg,
            audioUrl: finalAudioUrl,
            imgFocalPoint: "center",
            blocks,
            seoTitle: langData["meta-title"] || langData.title,
            seoDescription: langData["meta-description"] || langData.summary,
            seoKeywords: langData["meta-tags"] || `${postTag}, Moto na Prática`,
            translationGroupId,
            lang,
            date: new Date(),
          },
        });

        createdPosts.push({
          id: post.id,
          lang: post.lang,
          slug: post.slug,
          title: post.title,
          url: `https://motonapratica.online${postUrlPath}`
        });
      }

      // INCREMENTAR COLUNA 'mentions' NOS POSTS MENCIONADOS
      if (extractedMentionedSlugs.size > 0) {
        await prisma.post.updateMany({
          where: {
            slug: {
              in: Array.from(extractedMentionedSlugs)
            }
          },
          data: {
            mentions: {
              increment: 1
            }
          }
        });
      }

      revalidatePath("/");
      revalidatePath("/posts");
      revalidatePath("/eventos");

      return NextResponse.json({
        success: true,
        message: `Post multi-idioma (${createdPosts.length} versões) criado com sucesso!`,
        translationGroupId,
        mentionedSlugsCount: extractedMentionedSlugs.size,
        posts: createdPosts,
      });
    }

    // SUPORTE A POST ÚNICO MANUAL
    const {
      title,
      slug: customSlug,
      tag = "Eventos",
      category = "Notícias",
      excerpt = "",
      readTime = "5 min",
      img = "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=1200",
      imgFocalPoint = "center",
      blocks = [],
      seoTitle,
      seoDescription,
      seoKeywords,
      lang = "pt",
      translationGroupId,
    } = body;

    const finalTranslationGroupId = translationGroupId || body.group_id || body.groupId || body.id || null;

    if (!title) {
      return NextResponse.json({ error: "O título do post é obrigatório." }, { status: 400 });
    }

    // Gerar slug automaticamente e garantindo unicidade (-2, -3 se já existir)
    const finalSlug = await generateUniqueSlug(title);
    const extractedMentionedSlugs: Set<string> = new Set(explicitMentionedSlugs);

    const cleanedBlocks = Array.isArray(blocks) ? blocks.map((b: any) => {
      if (b && typeof b.text === "string") {
        const found = extractMentionedSlugsFromHtml(b.text, finalSlug);
        found.forEach(s => extractedMentionedSlugs.add(s));
        const cleanedText = cleanBlockHtml(b.text);
        const hasImgTagInText = cleanedText.includes("<img");
        return {
          ...b,
          text: cleanedText,
          image: hasImgTagInText ? "" : (b.image || "")
        };
      }
      return b;
    }) : [];

    const rawSingleTag = body.tag || body.type || body.category || body.post_type || body.postType;
    const finalTag = normalizePostTag(rawSingleTag, title);
    const finalAudioUrlSingle = body.audioUrl || body.audio_url || body.audio || body.narrationUrl || null;
    const finalReadTime = (body.readTime && body.readTime !== "5 min")
      ? body.readTime
      : calculateReadTime({ title, excerpt, blocks: cleanedBlocks });

    const post = await prisma.post.upsert({
      where: { slug: finalSlug },
      update: {
        tag: finalTag,
        category: finalTag,
        title,
        excerpt: excerpt || title,
        readTime: finalReadTime,
        audioUrl: finalAudioUrlSingle,
        blocks: cleanedBlocks,
        seoTitle: seoTitle || title,
        seoDescription: seoDescription || excerpt,
        seoKeywords: seoKeywords || `${finalTag}, Moto na Prática`,
        translationGroupId: finalTranslationGroupId,
        lang,
      },
      create: {
        slug: finalSlug,
        tag: finalTag,
        category: finalTag,
        title,
        excerpt: excerpt || title,
        readTime: finalReadTime,
        img,
        imgFocalPoint,
        audioUrl: finalAudioUrlSingle,
        blocks: cleanedBlocks,
        seoTitle: seoTitle || title,
        seoDescription: seoDescription || excerpt,
        seoKeywords: seoKeywords || `${finalTag}, Moto na Prática`,
        translationGroupId: finalTranslationGroupId,
        lang,
        date: new Date(),
      },
    });

    if (extractedMentionedSlugs.size > 0) {
      await prisma.post.updateMany({
        where: {
          slug: {
            in: Array.from(extractedMentionedSlugs)
          }
        },
        data: {
          mentions: {
            increment: 1
          }
        }
      });
    }

    revalidatePath("/");
    revalidatePath("/posts");

    const postUrlPath = lang === "en" ? `/en/post/${post.slug}` : lang === "es" ? `/es/post/${post.slug}` : `/post/${post.slug}`;

    return NextResponse.json({
      success: true,
      message: "Post salvo com sucesso!",
      post: {
        id: post.id,
        lang: post.lang,
        slug: post.slug,
        title: post.title,
        url: `https://motonapratica.online${postUrlPath}`
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: "Erro ao salvar post", details: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const apiKeyHeader = req.headers.get("x-api-key") || req.headers.get("authorization")?.replace("Bearer ", "");
    const url = new URL(req.url);
    const apiKeyQuery = url.searchParams.get("api_key");

    const expectedKey = process.env.API_SECRET_KEY || "motonapratica-secret-key-2026";
    const providedKey = apiKeyHeader || apiKeyQuery;

    if (!providedKey || providedKey !== expectedKey) {
      return NextResponse.json({ error: "Não autorizado. Chave de API inválida (x-api-key)." }, { status: 401 });
    }

    const contentType = req.headers.get("content-type") || "";
    let body: any = {};
    let fileFromFormData: File | null = null;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      formData.forEach((value, key) => {
        if (value instanceof File) {
          if (key === "audio" || key === "file") fileFromFormData = value;
          else if (key === "image" || key === "img") body[key] = value;
        } else {
          body[key] = value;
        }
      });
    } else {
      try {
        body = await req.json();
      } catch (e) {
        body = {};
      }
    }

    const {
      id, post_id, postId, slug,
      position, pos, imgKey,
      image, img,
      audioUrl, audio_url, audio, narrationUrl,
      lang,
      alt, altText, alt_text, caption, legenda, focalPoint, focal_point
    } = body;

    const targetIdentifier = id || post_id || postId || slug;
    if (!targetIdentifier) {
      return NextResponse.json({ error: "É necessário fornecer o id ou slug do post ('id', 'post_id' ou 'slug')." }, { status: 400 });
    }

    const rawAudioInput = fileFromFormData || audio || audioUrl || audio_url || narrationUrl;
    let finalAudioUrl: string | null = null;

    if (rawAudioInput) {
      if (typeof rawAudioInput === "string") {
        if (rawAudioInput.startsWith("http://") || rawAudioInput.startsWith("https://")) {
          finalAudioUrl = rawAudioInput;
        } else {
          // Processar string Base64 de áudio
          const matches = rawAudioInput.match(/^data:audio\/([a-z0-9\+\-]+);base64,/i);
          const ext = matches ? (matches[1] === "mpeg" ? "mp3" : matches[1]) : "mp3";
          const cleanBase64 = rawAudioInput.replace(/^data:audio\/[a-z0-9\+\-]+;base64,/i, "").trim();
          const buffer = Buffer.from(cleanBase64, "base64");
          finalAudioUrl = await saveAudioBuffer(buffer, ext);
        }
      } else if (typeof rawAudioInput === "object" && rawAudioInput && "arrayBuffer" in rawAudioInput) {
        const fileObj = rawAudioInput as File;
        const bytes = await fileObj.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const ext = fileObj.name ? (fileObj.name.split(".").pop() || "mp3") : "mp3";
        finalAudioUrl = await saveAudioBuffer(buffer, ext);
      }
    }

    const imageUrl = typeof image === "string" ? image : (typeof img === "string" ? img : null);
    if (!imageUrl && !finalAudioUrl) {
      return NextResponse.json({ error: "É necessário fornecer uma imagem ('image') ou um áudio ('audio')." }, { status: 400 });
    }

    let finalImageUrl = imageUrl;
    if (typeof imageUrl === "string" && (imageUrl.startsWith("data:image") || (imageUrl.length > 200 && !imageUrl.startsWith("http")))) {
      try {
        finalImageUrl = await processImageBase64(imageUrl);
      } catch (err: any) {
        console.error("Erro ao processar Base64 na rota PATCH:", err);
        return NextResponse.json({ error: "Falha ao processar imagem Base64.", details: err.message }, { status: 400 });
      }
    }

    const initialPosts = await prisma.post.findMany({
      where: {
        OR: [
          { id: targetIdentifier },
          { slug: targetIdentifier },
          { translationGroupId: targetIdentifier }
        ]
      }
    });

    if (initialPosts.length === 0) {
      return NextResponse.json({ error: "Nenhum post encontrado com o id, slug ou translationGroupId fornecido." }, { status: 404 });
    }

    const groupIds = Array.from(new Set(initialPosts.map(p => p.translationGroupId).filter(Boolean))) as string[];
    let postsToUpdate = await prisma.post.findMany({
      where: {
        OR: [
          { id: { in: initialPosts.map(p => p.id) } },
          ...(groupIds.length > 0 ? [{ translationGroupId: { in: groupIds } }] : [])
        ]
      }
    });

    // Se o parâmetro 'lang' for informado (ex: 'pt', 'en', 'es'), filtrar posts para aplicar a essa língua específica
    const targetLang = lang ? String(lang).trim().toLowerCase() : null;
    if (targetLang && finalAudioUrl && !imageUrl) {
      const langFiltered = postsToUpdate.filter(p => p.lang === targetLang);
      if (langFiltered.length > 0) {
        postsToUpdate = langFiltered;
      }
    }

    const rawPos = position !== undefined ? position : (pos !== undefined ? pos : imgKey);
    let posNum = 1;
    if (typeof rawPos === "number") {
      posNum = rawPos;
    } else if (typeof rawPos === "string") {
      const match = rawPos.match(/\d+/);
      if (match) posNum = parseInt(match[0], 10);
    }

    const updatedPostsInfo: any[] = [];
    const metaAlt = alt || altText || alt_text;
    const metaCaption = caption || legenda;
    const metaFocal = focalPoint || focal_point;

    for (const post of postsToUpdate) {
      const updateData: any = {};
      if (finalAudioUrl) updateData.audioUrl = finalAudioUrl;

      if (!imageUrl && finalAudioUrl) {
        const updated = await prisma.post.update({
          where: { id: post.id },
          data: updateData
        });
        revalidatePath("/");
        revalidatePath(`/post/${updated.slug}`);
        updatedPostsInfo.push({ id: post.id, lang: post.lang, slug: post.slug, audioUrl: finalAudioUrl });
      } else if (posNum === 1) {
        if (finalImageUrl) updateData.img = finalImageUrl;
        if (metaFocal) updateData.imgFocalPoint = metaFocal;

        const updated = await prisma.post.update({
          where: { id: post.id },
          data: updateData
        });
        revalidatePath("/");
        revalidatePath(`/post/${updated.slug}`);
        updatedPostsInfo.push({ id: post.id, lang: post.lang, slug: post.slug });
      } else {
        const blockIndex = posNum - 2;
        const rawBlocks = Array.isArray(post.blocks) ? (post.blocks as any[]) : [];

        if (blockIndex >= 0 && blockIndex < rawBlocks.length) {
          const updatedBlocks = [...rawBlocks];
          const targetBlock = { ...updatedBlocks[blockIndex] };
          if (finalImageUrl) targetBlock.image = finalImageUrl;
          if (metaAlt) targetBlock.alt = metaAlt;
          if (metaCaption) targetBlock.caption = metaCaption;
          if (metaFocal) targetBlock.focalPoint = metaFocal;

          const blockAltText = metaAlt || `Imagem ${posNum}`;

          if (targetBlock.text && finalImageUrl) {
            const placeholderRegex = new RegExp(`[\\{\\[]\\s*(?:id|img|image)\\s*=\\s*${posNum}\\s*[\\}\\]]`, "gi");
            if (metaCaption) {
              targetBlock.text = targetBlock.text.replace(
                placeholderRegex,
                `<figure class="my-6 text-center"><img src="${finalImageUrl}" alt="${blockAltText}" class="w-full h-auto object-cover border border-border rounded-sm mx-auto" loading="lazy" /><figcaption class="text-xs text-muted-foreground mt-2 italic">${metaCaption}</figcaption></figure>`
              );
            } else {
              targetBlock.text = targetBlock.text.replace(
                placeholderRegex,
                `<img src="${finalImageUrl}" alt="${blockAltText}" class="w-full h-auto object-cover border border-border rounded-sm my-4" loading="lazy" />`
              );
            }
          }

          updatedBlocks[blockIndex] = targetBlock;

          const updated = await prisma.post.update({
            where: { id: post.id },
            data: {
              ...updateData,
              blocks: updatedBlocks
            }
          });

          revalidatePath("/");
          revalidatePath(`/post/${updated.slug}`);
          updatedPostsInfo.push({ id: post.id, lang: post.lang, slug: post.slug });
        }
      }
    }

    if (updatedPostsInfo.length === 0) {
      return NextResponse.json({
        error: `Nenhum post pôde ser atualizado para os critérios informados.`
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: finalAudioUrl && !imageUrl
        ? `Áudio de narração anexado com sucesso a ${updatedPostsInfo.length} post(s)!`
        : `Conteúdo anexado com sucesso a ${updatedPostsInfo.length} post(s)!`,
      audioUrl: finalAudioUrl,
      imageUrl: finalImageUrl,
      updatedPosts: updatedPostsInfo
    });

  } catch (error: any) {
    return NextResponse.json({ error: "Erro ao anexar arquivo ao post", details: error.message }, { status: 500 });
  }
}
