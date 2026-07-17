import { NextRequest, NextResponse } from "next/server";
import {
  deletePostAssets,
  resolveDeleteCandidates,
  loadPostsByLang,
  savePostsForLang,
  buildSitemap,
  resolveSiteOrigin,
  pickString,
} from "@/lib/posts-db";
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
  const logs: string[] = [];

  try {
    const payload = await req.json() as PostPayload;
    const postsByLang = await loadPostsByLang(rootDir);
    const posts = languages.flatMap((lang) => postsByLang[lang]);
    const targets = resolveDeleteCandidates(payload, posts);

    if (targets.length === 0) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const deleted: Array<{ lang: string; slug: string }> = [];
    for (const entry of targets) {
      const record = entry as Record<string, unknown>;
      const lang = pickString(record, ["lang"]) ?? "pt";
      const slug = pickString(record, ["slug"]) ?? "";
      logs.push(`delete:start lang=${lang} slug=${slug}`);
      const removedPaths = await deletePostAssets(rootDir, entry);
      removedPaths.forEach((pathItem) => logs.push(`delete:file ${pathItem}`));
      deleted.push({ lang, slug });
      logs.push(`delete:done lang=${lang} slug=${slug}`);
    }

    const remainingByLang: Record<Language, PostPayload[]> = {
      pt: [],
      en: [],
      es: [],
    };
    languages.forEach((lang) => {
      remainingByLang[lang] = postsByLang[lang].filter(
        (entry) => !targets.includes(entry),
      );
    });
    await Promise.all(
      languages.map((lang) =>
        savePostsForLang(rootDir, lang, remainingByLang[lang]),
      ),
    );
    await buildSitemap(rootDir, origin);
    logs.push("sitemap:rebuilt");

    return NextResponse.json({
      ok: true,
      deletedCount: deleted.length,
      deleted,
      logs,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
export const dynamic = 'force-dynamic';
