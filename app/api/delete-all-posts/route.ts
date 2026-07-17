import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import {
  cleanupLegacyGenerated,
  savePostsForLang,
  buildSitemap,
  resolveSiteOrigin,
} from "@/lib/posts-db";
import { languages } from "@/lib/i18n";

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
    await fs.mkdir(rootDir, { recursive: true });
    const targets = [
      "posts.json",
      "sitemap.xml",
      "pt",
      "en",
      "es",
      "media",
    ].map((entry) => path.join(rootDir, entry));

    for (const target of targets) {
      await fs.rm(target, { recursive: true, force: true });
      logs.push(`delete-all:removed ${target}`);
    }

    await cleanupLegacyGenerated(rootDir, logs);

    await Promise.all(
      languages.map((lang) => savePostsForLang(rootDir, lang, [])),
    );
    await buildSitemap(rootDir, origin);
    logs.push("sitemap:rebuilt");

    return NextResponse.json({ ok: true, logs });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
export const dynamic = 'force-dynamic';
