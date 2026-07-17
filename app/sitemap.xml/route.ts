import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function GET(request: NextRequest) {
  const rootDir =
    process.env.GENERATED_DIR?.trim() || "/app/html-storage/posts";
  const filePath = path.join(rootDir, "sitemap.xml");

  try {
    const xmlContent = await fs.readFile(filePath, "utf-8");
    return new NextResponse(xmlContent, {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    return new NextResponse("Not Found", { status: 404 });
  }
}
