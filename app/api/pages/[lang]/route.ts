import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { loadPagesForLang, deletePageForLang } from "@/lib/pages-db";
import { languages, type Language } from "@/lib/i18n";

export async function GET(
  req: NextRequest,
  { params }: { params: { lang: string } }
) {
  const { lang } = params;
  if (!languages.includes(lang as Language)) {
    return NextResponse.json({ error: "Invalid language" }, { status: 400 });
  }

  const rootDir =
    process.env.GENERATED_DIR?.trim() || "/app/html-storage/posts";

  const pages = await loadPagesForLang(rootDir, lang as Language);
  return NextResponse.json(pages);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { lang: string } }
) {
  const token = cookies().get("admin_token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { lang } = params;
  if (!languages.includes(lang as Language)) {
    return NextResponse.json({ error: "Invalid language" }, { status: 400 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing page ID" }, { status: 400 });
  }

  const rootDir =
    process.env.GENERATED_DIR?.trim() || "/app/html-storage/posts";

  try {
    const success = await deletePageForLang(rootDir, lang as Language, id);
    if (success) {
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete page" },
      { status: 500 }
    );
  }
}
export const dynamic = 'force-dynamic';
