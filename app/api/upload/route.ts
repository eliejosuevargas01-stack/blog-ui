import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import sharp from "sharp";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado." }, { status: 400 });
    }

    // Validar tipo de arquivo
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Apenas imagens (JPEG, PNG, WEBP, AVIF, GIF) são permitidas." },
        { status: 400 }
      );
    }

    // Validar tamanho do arquivo (máx 10MB antes de compressão)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "O tamanho máximo permitido é 10MB." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const inputBuffer = Buffer.from(bytes);

    // Processar imagem com sharp: redimensionar para max 1400px de largura e converter para WebP
    const optimizedBuffer = await sharp(inputBuffer)
      .rotate() // Corrigir orientação EXIF automaticamente
      .resize({ width: 1400, withoutEnlargement: true }) // Nunca aumenta o tamanho original
      .webp({ quality: 82 })
      .toBuffer();

    // Gerar nome de arquivo seguro com extensão .webp
    const filename = `${Date.now()}-${Math.floor(Math.random() * 100000)}.webp`;
    const uploadDir = path.join(process.cwd(), "uploads");
    const filePath = path.join(uploadDir, filename);

    // Garantir que o diretório existe (cria recursivamente se necessário)
    await mkdir(uploadDir, { recursive: true });

    // Salvar o buffer otimizado em disco
    await writeFile(filePath, optimizedBuffer);

    // Retorna a URL pública relativa
    return NextResponse.json({ url: `/uploads/${filename}` });
  } catch (error: any) {
    console.error("Erro durante o upload do arquivo:", error);
    return NextResponse.json(
      { error: "Erro interno ao salvar arquivo no servidor." },
      { status: 500 }
    );
  }
}
