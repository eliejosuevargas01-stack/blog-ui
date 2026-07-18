import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { publishPost, buildSlugMap, resolvePostIdentity, resolveSiteOrigin } from "@/lib/posts-db";
import { languages, type Language } from "@/lib/i18n";

type PostPayload = Record<string, unknown>;

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

  if (!isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rootDir =
    process.env.GENERATED_DIR?.trim() || "/app/html-storage/posts";
  const origin = resolveSiteOrigin();

  try {
    const payload = await req.json();
    let posts: PostPayload[] = [];
    if (payload && typeof payload === "object") {
      if (Array.isArray(payload)) {
        posts = payload;
      } else if ("output" in payload) {
        posts = Array.isArray(payload.output) ? payload.output : [payload.output];
      } else if (Array.isArray(payload.posts)) {
        posts = payload.posts;
      } else {
        posts = [payload];
      }
    }

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

    return NextResponse.json({ ok: true, count: posts.length, posts: published, logs });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
export const dynamic = 'force-dynamic';
