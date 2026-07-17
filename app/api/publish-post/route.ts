import { NextRequest, NextResponse } from "next/server";
import { publishPost, buildSlugMap, resolvePostIdentity, resolveSiteOrigin, buildSitemap } from "@/lib/posts-db";
import { languages, type Language } from "@/lib/i18n";

type PostPayload = Record<string, unknown>;

export async function POST(req: NextRequest) {
  const token = process.env.PUBLISH_TOKEN;
  if (token) {
    const incoming =
      req.headers.get("x-publish-token") ??
      req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ??
      "";
    if (incoming !== token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const rootDir =
    process.env.GENERATED_DIR?.trim() || "/app/html-storage/posts";
  const origin = resolveSiteOrigin();

  try {
    const payload = await req.json();
    const posts = Array.isArray(payload)
      ? payload
      : Array.isArray(payload?.posts)
        ? payload.posts
        : [payload];

    const published = [];
    const logs: string[] = [];

    const { searchParams } = new URL(req.url);
    const forcedLang = searchParams.get("lang") as Language | null;

    for (const post of posts) {
      const basePayload = post as PostPayload;
      const localizedPayload =
        forcedLang && languages.includes(forcedLang)
          ? { ...basePayload, lang: forcedLang }
          : basePayload;
      const { lang: sourceLang, slug } = resolvePostIdentity(localizedPayload);
      if (!slug) {
        throw new Error("Missing slug");
      }
      logs.push(`publish:start slug=${slug} lang=${sourceLang}`);
      const slugMap = buildSlugMap(localizedPayload, sourceLang as Language, slug);
      const entryPayload: PostPayload = {
        ...localizedPayload,
        lang: sourceLang,
        slug,
        slugs: slugMap,
      };

      await publishPost(entryPayload, rootDir);
      logs.push(`publish:done lang=${sourceLang} slug=${slug}`);

      const links: Partial<Record<Language, string>> = {};
      if (slugMap.pt) {
        links.pt = `${origin}/pt/post/${slugMap.pt}`;
      }
      if (slugMap.en) {
        links.en = `${origin}/en/post/${slugMap.en}`;
      }
      if (slugMap.es) {
        links.es = `${origin}/es/post/${slugMap.es}`;
      }

      published.push({ slug, links });
      logs.push(
        `publish:links pt=${slugMap.pt ?? ""} en=${slugMap.en ?? ""} es=${slugMap.es ?? ""}`,
      );
    }
    await buildSitemap(rootDir, origin);
    logs.push("sitemap:rebuilt");

    return NextResponse.json({ ok: true, count: posts.length, posts: published, logs });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
export const dynamic = 'force-dynamic';
