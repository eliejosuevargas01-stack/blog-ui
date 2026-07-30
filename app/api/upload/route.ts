import { NextResponse } from "next/server";
import { readdir } from "fs/promises";
import path from "path";
import { saveOptimizedImageBuffer, processImageBase64, saveAudioBuffer } from "@/lib/image-utils";

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const json = await request.json();
      const base64Str = json.image || json.file || json.base64 || json.audio;
      if (!base64Str || typeof base64Str !== "string") {
        return NextResponse.json(
          { error: "Nenhuma string base64 válida enviada no JSON (use 'image', 'file', 'audio' ou 'base64')." },
          { status: 400 }
        );
      }

      if (json.audio || (json.type && json.type.startsWith("audio"))) {
        const cleanBase64 = base64Str.replace(/^data:audio\/[a-z0-9\+\-]+;base64,/i, "").trim();
        const inputBuffer = Buffer.from(cleanBase64, "base64");
        const ext = json.ext || "mp3";
        const audioUrl = await saveAudioBuffer(inputBuffer, ext);
        return NextResponse.json({ url: audioUrl });
      }

      const imageUrl = await processImageBase64(base64Str);
      return NextResponse.json({ url: imageUrl });
    } else {
      const formData = await request.formData();
      const file = formData.get("file") as File;

      if (!file) {
        return NextResponse.json({ error: "Nenhum arquivo enviado." }, { status: 400 });
      }

      const isAudio = file.type.startsWith("audio/") || /\.(mp3|wav|ogg|m4a|aac|webm)$/i.test(file.name);
      const allowedImageTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];

      if (!isAudio && !allowedImageTypes.includes(file.type)) {
        return NextResponse.json(
          { error: "Apenas imagens (JPEG, PNG, WEBP, AVIF, GIF) e áudios (MP3, WAV, OGG, M4A, AAC, WEBM) são permitidos." },
          { status: 400 }
        );
      }

      const maxSize = 100 * 1024 * 1024; // Max 100MB
      if (file.size > maxSize) {
        return NextResponse.json(
          { error: "O tamanho máximo permitido é 100MB." },
          { status: 400 }
        );
      }

      const bytes = await file.arrayBuffer();
      const inputBuffer = Buffer.from(bytes);

      if (isAudio) {
        const ext = file.name.split(".").pop() || "mp3";
        const audioUrl = await saveAudioBuffer(inputBuffer, ext);
        return NextResponse.json({ url: audioUrl });
      }

      const imageUrl = await saveOptimizedImageBuffer(inputBuffer);
      return NextResponse.json({ url: imageUrl });
    }
  } catch (error: any) {
    console.error("Erro durante o upload do arquivo:", error);
    return NextResponse.json(
      { error: "Erro interno ao salvar arquivo no servidor." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const imagesSet = new Set<string>();

    // Varrer estritamente os arquivos salvos no volume /uploads do servidor
    const uploadDir = path.join(process.cwd(), "uploads");
    try {
      const files = await readdir(uploadDir);
      // Filtras apenas imagens originais e ignorar arquivos de cache (.w300.webp, etc) e pastas ocultas
      const validFiles = files.filter(
        file => /\.(webp|jpg|jpeg|png|gif|avif)$/i.test(file) && !/\.w\d+\./i.test(file) && !file.startsWith(".")
      );
      validFiles.forEach(file => imagesSet.add(`/uploads/${file}`));
    } catch (e) {
      // Diretório ainda não existe
    }

    return NextResponse.json({ images: Array.from(imagesSet) });
  } catch (err: any) {
    console.error("Erro ao listar galeria:", err);
    return NextResponse.json({ images: [] });
  }
}

export async function DELETE(request: Request) {
  try {
    const { url, action } = await request.json();
    const uploadDir = path.join(process.cwd(), "uploads");

    // AÇÃO 1: Purgar imagens do disco que não estejam vinculadas a nenhum post ou página
    if (action === "purge_unused") {
      const { PrismaClient } = await import("@prisma/client");
      const prisma = new PrismaClient();
      const usedImagesSet = new Set<string>();

      try {
        const posts = await prisma.post.findMany({ select: { img: true, blocks: true } });
        for (const p of posts) {
          if (p.img && typeof p.img === "string") {
            const fname = p.img.split("/uploads/").pop()?.split("?")[0];
            if (fname) usedImagesSet.add(fname);
          }
          if (p.blocks) {
            let bList: any[] = [];
            if (Array.isArray(p.blocks)) bList = p.blocks;
            else if (typeof p.blocks === "string") {
              try { bList = JSON.parse(p.blocks); } catch (e) {}
            }
            for (const b of bList) {
              if (b && typeof b.image === "string") {
                const fname = b.image.split("/uploads/").pop()?.split("?")[0];
                if (fname) usedImagesSet.add(fname);
              }
              if (b && typeof b.text === "string" && b.text.includes("/uploads/")) {
                const matches = b.text.match(/\/uploads\/[a-zA-Z0-9._-]+/g);
                if (matches) {
                  matches.forEach(m => {
                    const fname = m.split("/uploads/").pop();
                    if (fname) usedImagesSet.add(fname);
                  });
                }
              }
            }
          }
        }

        const pages = await prisma.page.findMany({ select: { content: true } });
        for (const pg of pages) {
          if (pg.content) {
            const contentStr = typeof pg.content === "string" ? pg.content : JSON.stringify(pg.content);
            const matches = contentStr.match(/\/uploads\/[a-zA-Z0-9._-]+/g);
            if (matches) {
              matches.forEach(m => {
                const fname = m.split("/uploads/").pop();
                if (fname) usedImagesSet.add(fname);
              });
            }
          }
        }
      } catch (err) {
        console.error("Erro ao verificar imagens em uso:", err);
      } finally {
        await prisma.$disconnect();
      }

      let deletedCount = 0;
      try {
        const files = await readdir(uploadDir);
        const { unlink } = await import("fs/promises");
        for (const file of files) {
          if (/\.(webp|jpg|jpeg|png|gif|avif)$/i.test(file) && !usedImagesSet.has(file)) {
            try {
              await unlink(path.join(uploadDir, file));
              deletedCount++;
            } catch (e) {}
          }
        }
      } catch (e) {}

      return NextResponse.json({
        success: true,
        count: deletedCount,
        message: `${deletedCount} imagens não utilizadas foram deletadas do servidor.`
      });
    }

    // AÇÃO 2: Zerar completamente todas as imagens do volume /uploads
    if (action === "purge_all") {
      let deletedCount = 0;
      try {
        const files = await readdir(uploadDir);
        const { unlink, rm } = await import("fs/promises");
        for (const file of files) {
          if (file.startsWith(".")) continue;
          if (/\.(webp|jpg|jpeg|png|gif|avif)$/i.test(file)) {
            try {
              await unlink(path.join(uploadDir, file));
              deletedCount++;
            } catch (e) {}
          }
        }
        // Deletar pasta de cache se existir
        const cacheDir = path.join(uploadDir, ".cache");
        try {
          await rm(cacheDir, { recursive: true, force: true });
        } catch (e) {}
      } catch (e) {}

      return NextResponse.json({
        success: true,
        count: deletedCount,
        message: `Galeria zerada. ${deletedCount} imagens foram deletadas.`
      });
    }

    // AÇÃO 3: Exclusão individual por URL
    if (url && typeof url === "string") {
      if (url.startsWith("/uploads/")) {
        const filename = path.basename(url);
        const filePath = path.join(uploadDir, filename);
        try {
          const { unlink } = await import("fs/promises");
          await unlink(filePath);
        } catch (err: any) {
          console.warn("Arquivo não encontrado no disco ou já removido:", err.message);
        }
      }
      return NextResponse.json({ success: true, message: "Imagem excluída da galeria." });
    }

    return NextResponse.json({ error: "Parâmetros de requisição inválidos." }, { status: 400 });
  } catch (error: any) {
    console.error("Erro ao deletar imagem da galeria:", error);
    return NextResponse.json({ error: "Erro interno ao deletar imagem." }, { status: 500 });
  }
}
