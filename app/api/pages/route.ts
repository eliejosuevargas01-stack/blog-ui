import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { savePageForLang } from "@/lib/pages-db";
import { languages, type Language } from "@/lib/i18n";

export async function POST(req: NextRequest) {
  const token = cookies().get("admin_token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rootDir =
    process.env.GENERATED_DIR?.trim() || "/app/html-storage/posts";

  try {
    const pageData = await req.json();
    const lang = pageData.lang as Language;

    if (!languages.includes(lang)) {
      return NextResponse.json({ error: "Invalid language" }, { status: 400 });
    }

    if (!pageData.slug || !pageData.title) {
      return NextResponse.json(
        { error: "Slug and Title are required" },
        { status: 400 }
      );
    }

    const savedPage = await savePageForLang(rootDir, lang, pageData);
    return NextResponse.json({ success: true, page: savedPage });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save page" },
      { status: 500 }
    );
  }
}
export const dynamic = 'force-dynamic';
