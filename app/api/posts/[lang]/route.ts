import { NextRequest, NextResponse } from "next/server";
import { loadPostsForLang } from "@/lib/posts-server";
import { languages, type Language } from "@/lib/i18n";

export async function GET(
  request: NextRequest,
  { params }: { params: { lang: string } },
) {
  const { lang } = params;
  if (!languages.includes(lang as Language)) {
    return NextResponse.json({ error: "Invalid language" }, { status: 400 });
  }

  const rootDir =
    process.env.GENERATED_DIR?.trim() || "/app/html-storage/posts";

  try {
    const data = await loadPostsForLang(rootDir, lang as Language);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
