import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { loadPostsByLang } from "@/lib/posts-db";
import fs from "fs";

const TECH_IMAGES = [
  "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&h=680&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&h=680&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&h=680&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=1200&h=680&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&h=680&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&h=680&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=1200&h=680&fit=crop&auto=format",
];

function getNextTechImage(index: number): string {
  return TECH_IMAGES[index % TECH_IMAGES.length];
}

function parsePostHtml(html: string) {
  let title = "";
  const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (h1Match) {
    title = h1Match[1].replace(/<[^>]*>/g, "").trim();
    html = html.replace(/<h1[^>]*>[\s\S]*?<\/h1>/i, "");
  }

  let imageCounter = 0;
  let cleanHtml = html;
  cleanHtml = cleanHtml.replace(/src="COLE_LINK_IMAGEM_AQUI"/gi, () => `src="${getNextTechImage(imageCounter++)}"`);
  cleanHtml = cleanHtml.replace(/src='COLE_LINK_IMAGEM_AQUI'/gi, () => `src='${getNextTechImage(imageCounter++)}'`);

  let mainImage = "";
  const firstImgMatch = cleanHtml.match(/<img[^>]+src="([^"]+)"/i);
  mainImage = firstImgMatch?.[1] || getNextTechImage(0);

  const blocks: { text: string; image: string; focalPoint: string }[] = [];
  const figureRegex = /<figure[^>]*>([\s\S]*?)<\/figure>/gi;
  const figures: { fullText: string; innerHtml: string; index: number; length: number }[] = [];
  let match;

  while ((match = figureRegex.exec(cleanHtml)) !== null) {
    figures.push({ fullText: match[0], innerHtml: match[1], index: match.index, length: match[0].length });
  }

  if (figures.length === 0) {
    const paragraphs = cleanHtml.split(/<\/p>/i).map(p => p.trim() ? p + "</p>" : "").filter(Boolean);
    if (paragraphs.length === 0) {
      blocks.push({ text: cleanHtml, image: "", focalPoint: "center" });
    } else {
      const size = Math.ceil(paragraphs.length / 3);
      for (let i = 0; i < 3; i++) {
        const chunk = paragraphs.slice(i * size, (i + 1) * size);
        if (chunk.length > 0) blocks.push({ text: chunk.join("\n"), image: "", focalPoint: "center" });
      }
    }
  } else {
    let currentTextStart = 0;
    for (const fig of figures) {
      const textSegment = cleanHtml.substring(currentTextStart, fig.index).trim();
      currentTextStart = fig.index + fig.length;
      const imgMatch = fig.innerHtml.match(/<img[^>]+src="([^"]+)"/i);
      blocks.push({ text: textSegment, image: imgMatch?.[1] || "", focalPoint: "center" });
    }
    const remaining = cleanHtml.substring(currentTextStart).trim();
    if (remaining) blocks.push({ text: remaining, image: "", focalPoint: "center" });
  }

  const finalBlocks = blocks.filter(b => b.text || b.image);
  if (finalBlocks.length === 0) finalBlocks.push({ text: cleanHtml, image: "", focalPoint: "center" });

  return { title: title || "Sem Título", mainImage, blocks: finalBlocks };
}

export async function POST(req: NextRequest) {
  // Security: require the PUBLISH_TOKEN header
  const apiToken = process.env.PUBLISH_TOKEN;
  const incoming = req.headers.get("x-publish-token") ?? "";
  if (apiToken && incoming !== apiToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rootDir = process.env.GENERATED_DIR?.trim() || "/app/html-storage/posts";

  if (!fs.existsSync(rootDir)) {
    return NextResponse.json({ error: `Directory not found: ${rootDir}` }, { status: 404 });
  }

  const log: string[] = [];
  let migrated = 0;
  let skipped = 0;
  let errors = 0;

  try {
    const postsByLang = await loadPostsByLang(rootDir);
    const languages = ["pt", "en", "es"] as const;

    for (const lang of languages) {
      const posts = postsByLang[lang] || [];
      log.push(`[${lang}] Found ${posts.length} posts`);

      for (const post of posts) {
        const slug = post.slug as string;
        if (!slug) { skipped++; continue; }

        try {
          const contentHtml = (post.contentHtml as string) || (post.content as string) || "";
          const parsed = parsePostHtml(contentHtml);
          const title = (post.title as string) || parsed.title;
          const mainImage = (post.image as string) || parsed.mainImage;
          const excerpt = (post.excerpt as string) || (post.description as string) || "";
          const tags = (post.tags as string[]) || (post.keywords as string[]) || [];
          const wordCount = contentHtml.replace(/<[^>]*>/g, " ").split(/\s+/).filter(Boolean).length;
          const readTime = (post.readTime as string) || `${Math.max(1, Math.round(wordCount / 200))} min`;
          const mainTag = tags[0] || "Geral";
          const seoKeywords = tags.join(", ");
          const postDate = post.date ? new Date(post.date as string) : new Date();

          await prisma.post.upsert({
            where: { slug },
            update: {
              lang, date: postDate, slugs: (post.slugs as any) || null,
              tag: mainTag, category: (post.category as string) || "Mercado Tech",
              title, excerpt, readTime, img: mainImage, imgFocalPoint: "center",
              blocks: parsed.blocks as any,
              seoTitle: (post.metaTitle as string) || title,
              seoDescription: (post.metaDescription as string) || excerpt,
              seoKeywords,
            },
            create: {
              slug, lang, date: postDate, slugs: (post.slugs as any) || null,
              tag: mainTag, category: (post.category as string) || "Mercado Tech",
              title, excerpt, readTime, img: mainImage, imgFocalPoint: "center",
              blocks: parsed.blocks as any,
              seoTitle: (post.metaTitle as string) || title,
              seoDescription: (post.metaDescription as string) || excerpt,
              seoKeywords,
            },
          });

          log.push(`  ✓ [${lang}] ${slug}`);
          migrated++;
        } catch (e: any) {
          log.push(`  ✗ [${lang}] ${slug}: ${e.message}`);
          errors++;
        }
      }
    }

    return NextResponse.json({ success: true, migrated, skipped, errors, log });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message, log }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
