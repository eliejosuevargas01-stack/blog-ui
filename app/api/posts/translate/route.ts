import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const slug = url.searchParams.get("slug");
    const targetLang = url.searchParams.get("targetLang") || "pt";

    if (!slug) {
      return NextResponse.json({ error: "Slug é obrigatória" }, { status: 400 });
    }

    const currentPost = await prisma.post.findUnique({
      where: { slug },
      select: { translationGroupId: true, lang: true }
    });

    if (!currentPost || !currentPost.translationGroupId) {
      return NextResponse.json({ targetSlug: null });
    }

    const translatedPost = await prisma.post.findFirst({
      where: {
        translationGroupId: currentPost.translationGroupId,
        lang: targetLang
      },
      select: { slug: true }
    });

    return NextResponse.json({
      targetSlug: translatedPost ? translatedPost.slug : null
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
