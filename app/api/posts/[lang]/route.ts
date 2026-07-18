import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { languages, type Language } from "@/lib/i18n";

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
    let segment = block.text || "";
    if (block.image) {
      segment += `\n<figure>\n  <img src="${block.image}" alt="Image" />\n</figure>`;
    }
    return segment;
  }).join("\n");
}

function mapDbPostToBlogPost(post: any) {
  let slugs: any = {};
  if (post.slugs) {
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
    content: post.excerpt
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: { lang: string } },
) {
  const { lang } = params;
  if (!languages.includes(lang as Language)) {
    return NextResponse.json({ error: "Invalid language" }, { status: 400 });
  }

  try {
    const dbPosts = await prisma.post.findMany({
      where: { 
        lang: lang,
        date: { lte: new Date() }
      },
      orderBy: { date: "desc" }
    });

    const mappedPosts = dbPosts.map(mapDbPostToBlogPost);
    return NextResponse.json({ posts: mappedPosts });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}

export const dynamic = 'force-dynamic';
