import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import sharp from "sharp";

export const dynamic = "force-dynamic";

const UPLOADS_DIR = path.join(process.cwd(), "uploads");

export async function GET(
  request: Request,
  { params }: { params: { filename: string } }
) {
  try {
    const { filename } = params;
    const decodedFilename = decodeURIComponent(filename);
    const ext = path.extname(decodedFilename).toLowerCase();
    const filePath = path.join(UPLOADS_DIR, decodedFilename);

    // Verificar se o arquivo original existe
    if (!fs.existsSync(filePath)) {
      return new Response("Arquivo não encontrado", { status: 404 });
    }

    // Obter parâmetro de largura ?w=
    const { searchParams } = new URL(request.url);
    const wParam = searchParams.get("w");
    let targetWidth = 1400; // Largura padrão
    if (wParam) {
      const parsedWidth = parseInt(wParam, 10);
      if (!isNaN(parsedWidth) && parsedWidth > 0 && parsedWidth <= 2500) {
        targetWidth = parsedWidth;
      }
    }

    // Suportar conversão e redimensionamento para formatos de imagem comuns
    if (ext === ".jpg" || ext === ".jpeg" || ext === ".png" || ext === ".webp") {
      // Nome do arquivo em cache ex: foto-123.w600.webp
      const cacheFilename = decodedFilename.replace(/\.(jpe?g|png|webp)$/i, "") + `.w${targetWidth}.webp`;
      const cachePath = path.join(UPLOADS_DIR, cacheFilename);

      // Checar se já existe versão correspondente em cache no disco
      if (!fs.existsSync(cachePath)) {
        const inputBuffer = fs.readFileSync(filePath);
        const webpBuffer = await sharp(inputBuffer)
          .rotate() // Corrigir orientação EXIF automaticamente
          .resize({ width: targetWidth, withoutEnlargement: true })
          .webp({ quality: 82 })
          .toBuffer();
        fs.writeFileSync(cachePath, webpBuffer);
      }

      const webpBuffer = fs.readFileSync(cachePath);
      return new Response(webpBuffer, {
        headers: {
          "Content-Type": "image/webp",
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    }

    // Para outros formatos (ex: gif, svg): servir diretamente
    const fileBuffer = fs.readFileSync(filePath);
    let contentType = "application/octet-stream";
    if (ext === ".gif") contentType = "image/gif";
    else if (ext === ".svg") contentType = "image/svg+xml";
    else if (ext === ".avif") contentType = "image/avif";

    return new Response(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error: any) {
    console.error("Erro ao servir arquivo:", error);
    return new Response("Erro interno do servidor", { status: 500 });
  }
}
