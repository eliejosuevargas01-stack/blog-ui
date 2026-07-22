import { loadPostsByLang } from "../lib/posts-db";
import { prisma } from "../lib/db";
import fs from "fs";

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

async function migrate() {
  const rootDir = process.env.GENERATED_DIR?.trim() || "/app/html-storage/posts";
  console.log(`Starting migration from: ${rootDir}`);

  if (!fs.existsSync(rootDir)) {
    console.warn(`Source directory ${rootDir} does not exist. No posts to migrate.`);
    return;
  }

  try {
    const postsByLang = await loadPostsByLang(rootDir);
    const languages = ["pt", "en", "es"] as const;

    for (const lang of languages) {
      const posts = postsByLang[lang] || [];
      console.log(`Found ${posts.length} posts for language [${lang}]`);

      for (const post of posts) {
        const slug = post.slug as string;
        if (!slug) {
          console.warn("Skipping post without slug", post);
          continue;
        }

        const contentHtml = post.contentHtml as string || post.content as string || "";
        const parsed = parsePostHtml(contentHtml);

        const title = (post.title as string) || parsed.title;
        const mainImage = (post.image as string) || parsed.mainImage;
        const excerpt = (post.excerpt as string) || (post.description as string) || "";
        const tags = (post.tags as string[]) || (post.keywords as string[]) || [];

        // Estimate read time
        const wordCount = contentHtml.replace(/<[^>]*>/g, " ").split(/\s+/).filter(Boolean).length;
        const readTime = (post.readTime as string) || `${Math.max(1, Math.round(wordCount / 200))} min`;

        const mainTag = tags[0] || "Geral";
        const seoKeywords = tags.join(", ");

        console.log(`Migrating post [${lang}]: ${title} (${slug})`);

        await prisma.post.upsert({
          where: { slug_lang: { slug: slug, lang: lang } },
          update: {
            lang: lang,
            slugs: (post.slugs as any) || null,
            tag: mainTag,
            category: (post.category as string) || "Mercado Tech",
            title: title,
            excerpt: excerpt,
            readTime: readTime,
            img: mainImage,
            imgFocalPoint: "center",
            blocks: parsed.blocks as any,
            seoTitle: (post.metaTitle as string) || title,
            seoDescription: (post.metaDescription as string) || excerpt,
            seoKeywords: seoKeywords,
          },
          create: {
            slug: slug,
            lang: lang,
            slugs: (post.slugs as any) || null,
            tag: mainTag,
            category: (post.category as string) || "Mercado Tech",
            title: title,
            excerpt: excerpt,
            readTime: readTime,
            img: mainImage,
            imgFocalPoint: "center",
            blocks: parsed.blocks as any,
            seoTitle: (post.metaTitle as string) || title,
            seoDescription: (post.metaDescription as string) || excerpt,
            seoKeywords: seoKeywords,
          }
        });
      }
    }

    console.log("Migration completed successfully.");

  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

migrate();
