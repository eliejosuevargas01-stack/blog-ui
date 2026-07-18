import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import {
  savePostsForLang,
  resolveSiteOrigin,
} from "@/lib/posts-db";
import { languages } from "@/lib/i18n";

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
  const logs: string[] = [];

  try {
    await fs.mkdir(rootDir, { recursive: true });
    
    // Clean up directories/files
    const targets = [
      "posts.json",
      "pt",
      "en",
      "es",
      "media",
    ].map((entry) => path.join(rootDir, entry));

    for (const target of targets) {
      await fs.rm(target, { recursive: true, force: true });
      logs.push(`delete-all:removed ${target}`);
    }

    await Promise.all(
      languages.map((lang) => savePostsForLang(rootDir, lang, [])),
    );

    return NextResponse.json({ ok: true, logs });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
export const dynamic = 'force-dynamic';
