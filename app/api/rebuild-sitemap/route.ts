import { NextRequest, NextResponse } from "next/server";
import { buildSitemap, resolveSiteOrigin } from "@/lib/posts-db";

export async function POST(req: NextRequest) {
  const rootDir =
    process.env.GENERATED_DIR?.trim() || "/app/html-storage/posts";
  const origin = resolveSiteOrigin();
  try {
    await buildSitemap(rootDir, origin);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
export const dynamic = 'force-dynamic';
