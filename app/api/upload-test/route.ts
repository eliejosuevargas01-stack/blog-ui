import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const cwd = process.cwd();
    const appContents = fs.readdirSync(cwd);
    
    let publicContents: string[] = [];
    let publicExists = false;
    
    const publicPath = path.join(cwd, "public");
    if (fs.existsSync(publicPath)) {
      publicExists = true;
      publicContents = fs.readdirSync(publicPath);
    }
    
    let uploadsPath = path.join(cwd, "uploads");
    let uploadsExists = false;
    let uploadsContents: string[] = [];
    if (fs.existsSync(uploadsPath)) {
      uploadsExists = true;
      uploadsContents = fs.readdirSync(uploadsPath);
    }

    return NextResponse.json({
      cwd,
      envSiteUrl: process.env.NEXT_PUBLIC_SITE_URL || "not-set",
      appContents,
      publicExists,
      publicContents,
      uploadsExists,
      uploadsContents
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
