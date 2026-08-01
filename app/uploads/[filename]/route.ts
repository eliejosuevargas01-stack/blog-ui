import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  const { filename } = params;
  if (!filename) {
    return new NextResponse("Not Found", { status: 404 });
  }

  // Prevenir Path Traversal
  const safeFilename = path.basename(filename);
  const uploadDir = path.join(process.cwd(), "uploads");
  const filePath = path.join(uploadDir, safeFilename);

  try {
    const fileBuffer = await fs.readFile(filePath);

    const ext = path.extname(safeFilename).toLowerCase();
    let contentType = "application/octet-stream";
    if (ext === ".webp") contentType = "image/webp";
    else if (ext === ".avif") contentType = "image/avif";
    else if (ext === ".png") contentType = "image/png";
    else if (ext === ".jpg" || ext === ".jpeg") contentType = "image/jpeg";
    else if (ext === ".gif") contentType = "image/gif";
    else if (ext === ".svg") contentType = "image/svg+xml";
    else if (ext === ".mp3") contentType = "audio/mpeg";
    else if (ext === ".wav") contentType = "audio/wav";

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    return new NextResponse("Not Found", { status: 404 });
  }
}
