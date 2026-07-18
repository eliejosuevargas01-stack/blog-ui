import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/db";
import fs from "fs/promises";
import path from "path";

// list of high-quality technology/development stock images to use as fallbacks for placeholders
const TECH_IMAGES = [
  "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&h=680&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&h=680&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&h=680&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=1200&h=680&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&h=680&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&h=680&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=1200&h=680&fit=crop&auto=format"
];

function getNextTechImage(index: number): string {
  return TECH_IMAGES[index % TECH_IMAGES.length];
}

function getNextPublishDate(): Date {
  const now = new Date();
  const pubDate = new Date(now);
  pubDate.setHours(7, 0, 0, 0);
  
  // If we are already past 7:00 AM today, schedule for tomorrow at 7:00 AM
  if (now >= pubDate) {
    pubDate.setDate(pubDate.getDate() + 1);
  }
  return pubDate;
}

function reconstructContentHtmlFromBlocks(blocks: any[], title: string): string {
  let html = `<h1>${title}</h1>\n\n`;
  blocks.forEach((block) => {
    html += block.text || "";
    if (block.image) {
      html += `\n<figure>\n  <img src="${block.image}" alt="Image" />\n</figure>\n`;
    }
  });
  return html;
}

function parsePostHtml(html: string) {
  let title = "";
  // 1. Extract h1 title
  const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (h1Match) {
    title = h1Match[1].replace(/<[^>]*>/g, "").trim(); // strip inner tags if any
    // Remove the h1 tag
    html = html.replace(/<h1[^>]*>[\s\S]*?<\/h1>/i, "");
  }

  // 2. Clean placeholders like COLE_LINK_IMAGEM_AQUI
  let imageCounter = 0;
  let cleanHtml = html;
  
  // Replace standard placeholders
  cleanHtml = cleanHtml.replace(/src="COLE_LINK_IMAGEM_AQUI"/gi, () => {
    return `src="${getNextTechImage(imageCounter++)}"`;
  });
  
  cleanHtml = cleanHtml.replace(/src='COLE_LINK_IMAGEM_AQUI'/gi, () => {
    return `src='${getNextTechImage(imageCounter++)}'`;
  });

  // 3. Find the first image src in the updated HTML
  let mainImage = "";
  const firstImgMatch = cleanHtml.match(/<img[^>]+src="([^"]+)"/i);
  if (firstImgMatch && firstImgMatch[1]) {
    mainImage = firstImgMatch[1];
  } else {
    // If no image is found in HTML at all, pick a default
    mainImage = getNextTechImage(0);
  }

  // 4. Split HTML into blocks based on <figure> tags or <img> tags
  const blocks: { text: string; image: string; focalPoint: string }[] = [];
  const figureRegex = /<figure[^>]*>([\s\S]*?)<\/figure>/gi;
  let match;
  const figures = [];

  while ((match = figureRegex.exec(cleanHtml)) !== null) {
    figures.push({
      fullText: match[0],
      innerHtml: match[1],
      index: match.index,
      length: match[0].length
    });
  }

  if (figures.length === 0) {
    // If no figures, just split the text paragraphs into 3 blocks (like seed)
    const paragraphs = cleanHtml.split(/<\/p>/i).map(p => p.trim() ? p + "</p>" : "").filter(Boolean);
    if (paragraphs.length === 0) {
      blocks.push({ text: cleanHtml, image: "", focalPoint: "center" });
    } else {
      const size = Math.ceil(paragraphs.length / 3);
      for (let i = 0; i < 3; i++) {
        const chunk = paragraphs.slice(i * size, (i + 1) * size);
        if (chunk.length > 0) {
          blocks.push({ text: chunk.join("\n"), image: "", focalPoint: "center" });
        }
      }
    }
  } else {
    // Split by figures
    let currentTextStart = 0;
    for (let i = 0; i < figures.length; i++) {
      const fig = figures[i];
      let textSegment = cleanHtml.substring(currentTextStart, fig.index).trim();
      currentTextStart = fig.index + fig.length;

      // Extract image URL and figcaption
      const imgMatch = fig.innerHtml.match(/<img[^>]+src="([^"]+)"/i);
      const captionMatch = fig.innerHtml.match(/<figcaption[^>]*>([\s\S]*?)<\/figcaption>/i);
      
      const imageSrc = imgMatch ? imgMatch[1] : "";
      const captionText = captionMatch ? captionMatch[1] : "";

      if (captionText && textSegment) {
        textSegment += `<p class="text-center text-[12px] text-muted-foreground italic mt-2">${captionText}</p>`;
      }

      blocks.push({
        text: textSegment,
        image: imageSrc,
        focalPoint: "center"
      });
    }

    const remainingText = cleanHtml.substring(currentTextStart).trim();
    if (remainingText) {
      blocks.push({
        text: remainingText,
        image: "",
        focalPoint: "center"
      });
    }
  }

  // Remove empty blocks and ensure we have at least one
  const finalBlocks = blocks.filter(b => b.text || b.image);
  if (finalBlocks.length === 0) {
    finalBlocks.push({ text: cleanHtml, image: "", focalPoint: "center" });
  }

  return {
    title: title || "Sem Título",
    mainImage,
    blocks: finalBlocks
  };
}

async function triggerTranslationWebhook(postData: any) {
  try {
    console.log("[Translation] Triggering n8n translation webhook for slug:", postData.slug);
    const response = await fetch("https://myn8n.seommerce.shop/webhook/curiosotech", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        action: "translate",
        post: postData
      })
    });

    if (!response.ok) {
      console.error("[Translation] Failed to trigger webhook. Status:", response.status);
    } else {
      console.log("[Translation] Webhook triggered successfully!");
    }
  } catch (error) {
    console.error("[Translation] Error triggering webhook:", error);
  }
}

async function triggerImageGenerationWebhook(slug: string, prompts: any) {
  try {
    console.log("[Images] Triggering n8n image generation webhook for slug:", slug);
    const response = await fetch("https://myn8n.seommerce.shop/webhook/curiosotech", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        action: "generate_img",
        slug: slug,
        prompts: prompts
      })
    });

    if (!response.ok) {
      console.error("[Images] Failed to trigger webhook. Status:", response.status);
    } else {
      console.log("[Images] Webhook triggered successfully!");
    }
  } catch (error) {
    console.error("[Images] Error triggering webhook:", error);
  }
}

export async function POST(req: NextRequest) {
  let isAuthenticated = false;

  // 1. Check x-publish-token / auth header
  const apiToken = process.env.PUBLISH_TOKEN;
  if (apiToken) {
    const incoming =
      req.headers.get("x-publish-token") ??
      req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ??
      "";
    if (incoming === apiToken) {
      isAuthenticated = true;
    }
  }

  // 2. Check admin_token cookie
  if (!isAuthenticated) {
    const cookieToken = cookies().get("admin_token")?.value;
    if (cookieToken) {
      const payload = await verifyToken(cookieToken);
      if (payload) {
        isAuthenticated = true;
      }
    }
  }

  if (!apiToken) {
    isAuthenticated = true;
  }

  if (!isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const contentType = req.headers.get("content-type") || "";
    
    // Check if the input is a binary image file upload (multipart/form-data)
    if (contentType.includes("multipart/form-data")) {
      console.log("[Images Upload] Received multipart form upload");
      const formData = await req.formData();
      
      const fileData = formData.get("data");
      const slug = (formData.get("slug") as string) || req.nextUrl.searchParams.get("slug") || "";
      const hnId = (formData.get("hn_id") as string) || (formData.get("hnId") as string) || req.nextUrl.searchParams.get("hn_id") || req.nextUrl.searchParams.get("hnId") || "";
      const fileName = (formData.get("fileName") as string) || (formData.get("filename") as string) || req.nextUrl.searchParams.get("fileName") || req.nextUrl.searchParams.get("filename") || "";
      const fileExtension = (formData.get("fileExtension") as string) || req.nextUrl.searchParams.get("fileExtension") || "png";

      if (!fileData || typeof fileData === "string") {
        return NextResponse.json({ error: "Missing binary data file in multipart request" }, { status: 400 });
      }
      if (!slug && !hnId) {
        return NextResponse.json({ error: "Missing slug or hn_id to identify post" }, { status: 400 });
      }
      if (!fileName) {
        return NextResponse.json({ error: "Missing fileName (e.g. imagem_hero) to identify target slot" }, { status: 400 });
      }

      // Find the post
      const targetPost = slug 
        ? await prisma.post.findUnique({ where: { slug } })
        : await prisma.post.findFirst({ where: { hn_id: hnId, lang: "pt" } });

      if (!targetPost) {
        return NextResponse.json({ error: `Post not found for slug: ${slug} or hn_id: ${hnId}` }, { status: 404 });
      }

      // Always organize and store images in the media directory of the Portuguese version
      const ptPost = targetPost.lang === "pt" 
        ? targetPost 
        : await prisma.post.findFirst({ where: { hn_id: targetPost.hn_id || "", lang: "pt" } });
      const ptSlug = ptPost?.slug || targetPost.slug;

      const fileObj = fileData as File;
      const arrayBuffer = await fileObj.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Save to static media storage
      const rootDir = process.env.GENERATED_DIR?.trim() || "/app/html-storage/posts";
      const mediaDestDir = path.join(rootDir, "media", "pt", ptSlug);
      await fs.mkdir(mediaDestDir, { recursive: true });

      const finalExt = fileExtension.replace(/^\./, "");
      const cleanFileName = `${fileName}.${finalExt}`;
      const fullFilePath = path.join(mediaDestDir, cleanFileName);
      await fs.writeFile(fullFilePath, buffer);

      const publicMediaUrl = `/media/pt/${ptSlug}/${cleanFileName}`;
      console.log(`[Images Upload] Saved to disk: ${fullFilePath} -> Accessible at: ${publicMediaUrl}`);

      // Find all translations associated with this post so they share the same image
      let postsToUpdate = [targetPost];
      if (targetPost.hn_id) {
        const translations = await prisma.post.findMany({
          where: { hn_id: targetPost.hn_id }
        });
        postsToUpdate = translations;
      }

      console.log(`[Images Upload] Updating image path for ${postsToUpdate.length} post translations`);

      for (const postToUpdate of postsToUpdate) {
        let updatedImg = postToUpdate.img;
        let blocks: any[] = [];

        if (Array.isArray(postToUpdate.blocks)) {
          blocks = postToUpdate.blocks;
        } else if (typeof postToUpdate.blocks === "string") {
          try {
            blocks = JSON.parse(postToUpdate.blocks);
          } catch {
            blocks = [];
          }
        }

        if (fileName === "imagem_hero") {
          updatedImg = publicMediaUrl;
        } else if (fileName.startsWith("img-bloco-")) {
          const index = parseInt(fileName.replace("img-bloco-", ""), 10) - 1;
          if (index >= 0 && index < blocks.length) {
            blocks[index] = {
              ...blocks[index],
              image: publicMediaUrl
            };
          }
        }

        await prisma.post.update({
          where: { slug: postToUpdate.slug },
          data: {
            img: updatedImg,
            blocks: blocks as any
          }
        });
      }

      // Check if this was the last image needed for the PT version, if so trigger translation!
      if (ptPost) {
        const freshPtPost = await prisma.post.findUnique({ where: { slug: ptSlug } });
        if (freshPtPost) {
          let freshBlocks: any[] = [];
          if (Array.isArray(freshPtPost.blocks)) {
            freshBlocks = freshPtPost.blocks;
          } else if (typeof freshPtPost.blocks === "string") {
            try {
              freshBlocks = JSON.parse(freshPtPost.blocks);
            } catch {
              freshBlocks = [];
            }
          }

          // Count how many images are still Unsplash fallbacks
          const hasUnsplashHero = freshPtPost.img?.includes("unsplash.com");
          const hasUnsplashBlocks = freshBlocks.some(b => b.image?.includes("unsplash.com"));

          // Count if translation has already been created
          const translationCount = await prisma.post.count({
            where: { hn_id: freshPtPost.hn_id || "", lang: { in: ["en", "es"] } }
          });

          if (!hasUnsplashHero && !hasUnsplashBlocks && translationCount === 0) {
            console.log(`[Images Upload] All images generated! Triggering translations for ptSlug: ${ptSlug}`);
            const updatedHtml = reconstructContentHtmlFromBlocks(freshBlocks, freshPtPost.title);
            
            await triggerTranslationWebhook({
              hn_id: freshPtPost.hn_id,
              conteudo_html: updatedHtml,
              slug: freshPtPost.slug,
              categoria: freshPtPost.category,
              excerpt: freshPtPost.excerpt,
              meta_title: freshPtPost.seoTitle,
              meta_description: freshPtPost.seoDescription,
              tags: freshPtPost.seoKeywords ? freshPtPost.seoKeywords.split(",").map((t: string) => t.trim()) : [],
              palavra_chave_principal: freshPtPost.tag
            });
          }
        }
      }

      return NextResponse.json({
        success: true,
        message: `Image ${cleanFileName} saved and linked successfully.`,
        url: publicMediaUrl
      });
    }

    const rawPayload = await req.json();
    
    // Check if the payload is the translation callback from n8n
    const firstItem = Array.isArray(rawPayload) ? rawPayload[0] : rawPayload;
    const isTranslationCallback = firstItem && firstItem.output && (firstItem.output.en || firstItem.output.es);

    if (isTranslationCallback) {
      console.log("[Publish] Processing translation callback payload...");
      const output = firstItem.output;
      const languages = ["en", "es"] as const;
      
      // Find the corresponding Portuguese post to copy publication date, images, and link translations
      const ptPost = await prisma.post.findFirst({
        where: { lang: "pt" },
        orderBy: { createdAt: "desc" }
      });

      if (!ptPost) {
        console.warn("[Publish] Could not find any recent 'pt' post to link translations to.");
      }

      const publishDate = ptPost ? ptPost.date : getNextPublishDate();

      const results = [];
      const slugMap: Record<string, string> = {};
      if (ptPost) {
        slugMap.pt = ptPost.slug;
      }

      // 1. Parse and upsert the translations
      for (const lang of languages) {
        const langData = output[lang];
        if (!langData) continue;

        const {
          conteudo_html,
          slug,
          categoria,
          excerpt,
          meta_title,
          meta_description,
          tags,
          palavra_chave_principal
        } = langData;

        if (!slug || !conteudo_html) continue;

        slugMap[lang] = slug;

        const { title, mainImage, blocks } = parsePostHtml(conteudo_html);
        const wordCount = conteudo_html.replace(/<[^>]*>/g, " ").split(/\s+/).filter(Boolean).length;
        const readTime = `${Math.max(1, Math.round(wordCount / 200))} min`;

        const mainTag = palavra_chave_principal || (tags && tags[0]) || "Geral";
        const seoKeywords = tags ? tags.join(", ") : "";

        // Extract hn_id from translation callback, fallback to PT post's hn_id
        const hn_id = langData.hn_id || langData.hnId || firstItem.hn_id || firstItem.hnId || ptPost?.hn_id || null;

        // Propagate the real saved images from the PT version
        let finalMainImage = mainImage;
        let finalBlocks = blocks;
        
        if (ptPost) {
          finalMainImage = ptPost.img;
          let ptBlocks: any[] = [];
          if (Array.isArray(ptPost.blocks)) {
            ptBlocks = ptPost.blocks;
          } else if (typeof ptPost.blocks === "string") {
            try {
              ptBlocks = JSON.parse(ptPost.blocks);
            } catch {
              ptBlocks = [];
            }
          }
          finalBlocks = blocks.map((block, idx) => {
            if (ptBlocks[idx] && ptBlocks[idx].image) {
              return {
                ...block,
                image: ptBlocks[idx].image
              };
            }
            return block;
          });
        }

        const savedPost = await prisma.post.upsert({
          where: { slug: slug },
          update: {
            lang: lang,
            date: publishDate,
            hn_id: hn_id,
            tag: mainTag,
            category: categoria || "Tech Market",
            title: title,
            excerpt: excerpt || "",
            readTime: readTime,
            img: finalMainImage,
            imgFocalPoint: "center",
            blocks: finalBlocks as any,
            seoTitle: meta_title || title,
            seoDescription: meta_description || excerpt || "",
            seoKeywords: seoKeywords,
          },
          create: {
            slug: slug,
            lang: lang,
            date: publishDate,
            hn_id: hn_id,
            tag: mainTag,
            category: categoria || "Tech Market",
            title: title,
            excerpt: excerpt || "",
            readTime: readTime,
            img: finalMainImage,
            imgFocalPoint: "center",
            blocks: finalBlocks as any,
            seoTitle: meta_title || title,
            seoDescription: meta_description || excerpt || "",
            seoKeywords: seoKeywords,
          }
        });

        results.push({
          lang,
          slug: savedPost.slug,
          status: "saved"
        });
      }

      // 2. Link all slugs together across all 3 posts (pt, en, es)
      if (Object.keys(slugMap).length > 0) {
        console.log("[Publish] Linking translation slugs:", slugMap);
        for (const [lang, slug] of Object.entries(slugMap)) {
          await prisma.post.update({
            where: { slug: slug },
            data: {
              slugs: slugMap
            }
          });
        }
      }

      return NextResponse.json({
        success: true,
        message: "Translations processed and linked successfully",
        results
      });

    } else {
      // Normal publish payload (typically the original Portuguese post)
      console.log("[Publish] Processing original post publication...");
      const data = rawPayload.output ? rawPayload.output : rawPayload;
      const postsToProcess = Array.isArray(data) ? data : [data];
      const results = [];

      // Calculate scheduled 7:00 AM publishing date
      const publishDate = getNextPublishDate();
      console.log("[Publish] Post publication scheduled for:", publishDate.toISOString());

      for (const postData of postsToProcess) {
        const {
          conteudo_html,
          slug,
          categoria,
          excerpt,
          meta_title,
          meta_description,
          tags,
          palavra_chave_principal
        } = postData;

        if (!slug || !conteudo_html) {
          return NextResponse.json({ error: "Missing slug or conteudo_html" }, { status: 400 });
        }

        const { title, mainImage, blocks } = parsePostHtml(conteudo_html);
        const wordCount = conteudo_html.replace(/<[^>]*>/g, " ").split(/\s+/).filter(Boolean).length;
        const readTime = `${Math.max(1, Math.round(wordCount / 200))} min`;

        const mainTag = palavra_chave_principal || (tags && tags[0]) || "Geral";
        const seoKeywords = tags ? tags.join(", ") : "";

        // Extract hn_id from the incoming post data
        const hn_id = postData.hn_id || postData.hnId || null;

        // Default language is "pt"
        const savedPost = await prisma.post.upsert({
          where: { slug: slug },
          update: {
            lang: "pt",
            date: publishDate,
            hn_id: hn_id,
            tag: mainTag,
            category: categoria || "Mercado Tech",
            title: title,
            excerpt: excerpt || "",
            readTime: readTime,
            img: mainImage,
            imgFocalPoint: "center",
            blocks: blocks as any,
            seoTitle: meta_title || title,
            seoDescription: meta_description || excerpt || "",
            seoKeywords: seoKeywords,
            slugs: { pt: slug } // initial slug mapping
          },
          create: {
            slug: slug,
            lang: "pt",
            date: publishDate,
            hn_id: hn_id,
            tag: mainTag,
            category: categoria || "Mercado Tech",
            title: title,
            excerpt: excerpt || "",
            readTime: readTime,
            img: mainImage,
            imgFocalPoint: "center",
            blocks: blocks as any,
            seoTitle: meta_title || title,
            seoDescription: meta_description || excerpt || "",
            seoKeywords: seoKeywords,
            slugs: { pt: slug }
          }
        });

        results.push({
          id: savedPost.id,
          slug: savedPost.slug,
          title: savedPost.title,
          status: "saved"
        });

        // Extract prompts from HTML alts
        const imgAltPrompts: string[] = [];
        const imgMatches = conteudo_html.match(/<img[^>]+alt="([^"]+)"/g);
        if (imgMatches) {
          imgMatches.forEach((m: string) => {
            const altMatch = m.match(/alt="([^"]+)"/);
            if (altMatch && altMatch[1]) {
              imgAltPrompts.push(altMatch[1]);
            }
          });
        }

        const imagePrompts = {
          imagem_hero: meta_description || excerpt || title,
          "img-bloco-1": imgAltPrompts[0] || "",
          "img-bloco-2": imgAltPrompts[1] || "",
          "img-bloco-3": imgAltPrompts[2] || ""
        };

        // Trigger ONLY the image generation webhook. Translation will be triggered after images are received!
        triggerImageGenerationWebhook(slug, imagePrompts);
      }

      return NextResponse.json({
        success: true,
        message: "Original posts saved. Image webhook triggered.",
        processed: results
      });
    }

  } catch (error: any) {
    console.error("Error publishing post:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
