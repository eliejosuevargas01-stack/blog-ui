import { NextRequest, NextResponse } from "next/server";
import { prisma, mapDbPostToBlogPost } from "@/lib/db";
import { languages, type Language } from "@/lib/i18n";

export async function GET(
  request: NextRequest,
  { params }: { params: { lang: string } },
) {
  const { lang } = params;
  if (!languages.includes(lang as Language)) {
    return NextResponse.json({ error: "Invalid language" }, { status: 400 });
  }

  const { searchParams } = new URL(request.url);
  const includeFuture = searchParams.get("all") === "true";

  try {
    const whereClause: any = { lang: lang };
    if (!includeFuture) {
      whereClause.published = true;
      whereClause.date = { lte: new Date() };
    }

    const dbPosts = await prisma.post.findMany({
      where: whereClause,
      orderBy: { date: "desc" }
    });

    // Batch fetch translation slugs using the universal hn_id key
    const hnIds = dbPosts.map(p => p.hn_id).filter(Boolean) as string[];
    const allTranslations = hnIds.length > 0 ? await prisma.post.findMany({
      where: { hn_id: { in: hnIds } },
      select: { hn_id: true, lang: true, slug: true }
    }) : [];

    const slugsMapByHnId: Record<string, Record<string, string>> = {};
    allTranslations.forEach(t => {
      if (t.hn_id) {
        if (!slugsMapByHnId[t.hn_id]) {
          slugsMapByHnId[t.hn_id] = {};
        }
        slugsMapByHnId[t.hn_id][t.lang] = t.slug;
      }
    });

    const mappedPosts = dbPosts.map(post => {
      const dynamicSlugs = post.hn_id ? slugsMapByHnId[post.hn_id] : undefined;
      return mapDbPostToBlogPost(post, dynamicSlugs);
    });

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
