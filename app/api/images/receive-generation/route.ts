import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import fs from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";
import { getUploadsDir } from "@/lib/uploads-storage";

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";
    console.log(`[Image Generation Callback] Incoming POST request. Content-Type: "${contentType}"`);

    let buffer: Buffer | null = null;
    let compoundId = "";
    let fileExtension = "png";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const fileData = formData.get("data");

      compoundId =
        (formData.get("compoundId") as string) ||
        (formData.get("compound_id") as string) ||
        (formData.get("idPost") as string) ||
        req.nextUrl.searchParams.get("compoundId") ||
        req.nextUrl.searchParams.get("compound_id") ||
        "";

      if (!fileData || typeof fileData === "string") {
        return NextResponse.json(
          { error: "Arquivo binário ausente no campo 'data' da requisição multipart/form-data." },
          { status: 400 }
        );
      }

      const fileObj = fileData as File;
      const arrayBuffer = await fileObj.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);

      if (fileObj.name) {
        const ext = path.extname(fileObj.name).replace(/^\./, "");
        if (ext) fileExtension = ext;
      }
    } else {
      const body = await req.json();
      compoundId = body.compoundId || body.compound_id || "";
      const tempImageUrl = body.tempImageUrl;

      if (tempImageUrl) {
        console.log(`[Image Generation Callback] Downloading image from temp URL: ${tempImageUrl}`);
        const imgResponse = await fetch(tempImageUrl);
        if (!imgResponse.ok) {
          return NextResponse.json(
            { error: `Falha ao baixar imagem da URL temporária (Status HTTP ${imgResponse.status}).` },
            { status: 500 }
          );
        }
        const arrayBuffer = await imgResponse.arrayBuffer();
        buffer = Buffer.from(arrayBuffer);
      }
    }

    if (!buffer || !compoundId) {
      return NextResponse.json(
        { error: "É necessário fornecer o arquivo de imagem (campo 'data' ou 'tempImageUrl') e o identificador 'compoundId'." },
        { status: 400 }
      );
    }

    // Split compoundId by '='
    const parts = compoundId.split("=");
    if (parts.length < 2) {
      return NextResponse.json(
        { error: "Formato de compoundId inválido. Esperado 'postId=lugar' (ex: post-uuid-1234=1)." },
        { status: 400 }
      );
    }

    const postId = parts[0];
    const locationIndex = parseInt(parts[1], 10);

    if (isNaN(locationIndex) || locationIndex < 1) {
      return NextResponse.json(
        { error: "Índice de localização inválido. Deve ser um número maior ou igual a 1." },
        { status: 400 }
      );
    }

    // Find target posts by ID or by slug fallback
    let targetPosts = await prisma.post.findMany({
      where: {
        OR: [
          { id: postId },
          { slug: postId }
        ]
      }
    });

    if (targetPosts.length === 0) {
      return NextResponse.json(
        { error: `Nenhum post encontrado para o id ou slug '${postId}'.` },
        { status: 404 }
      );
    }

    // Save image to persistent storage directory (uses /app/html-storage/uploads if on Coolify persistent volume)
    const uploadsDir = getUploadsDir();
    await fs.mkdir(uploadsDir, { recursive: true });

    const fileName = `generated-${Date.now()}-${Math.round(Math.random() * 1e9)}.${fileExtension}`;
    const fullPath = path.join(uploadsDir, fileName);
    await fs.writeFile(fullPath, buffer);

    const publicUrl = `/uploads/${fileName}`;
    console.log(`[Image Generation Callback] Saved binary image to disk: ${fullPath} -> Accessible at ${publicUrl}`);

    // Update target posts in database
    for (const post of targetPosts) {
      let updatedImg = post.img;
      let blocks: any[] = [];

      if (Array.isArray(post.blocks)) {
        blocks = [...post.blocks];
      } else if (typeof post.blocks === "string") {
        try {
          blocks = JSON.parse(post.blocks);
        } catch {
          blocks = [];
        }
      }

      if (locationIndex === 1) {
        // Location 1 = Hero Image
        updatedImg = publicUrl;
      } else {
        // Location N (where N > 1) = Block N-2
        const blockIndex = locationIndex - 2;
        if (blockIndex >= 0 && blockIndex < blocks.length) {
          blocks[blockIndex] = {
            ...blocks[blockIndex],
            image: publicUrl
          };
        }
      }

      await prisma.post.update({
        where: {
          id_lang: {
            id: post.id,
            lang: post.lang
          }
        },
        data: {
          img: updatedImg,
          blocks: blocks
        }
      });

      revalidatePath(`/${post.lang}`);
      revalidatePath(`/${post.lang}/post/${post.slug}`);
    }

    return NextResponse.json({
      success: true,
      message: `Imagem binária recebida e aplicada com sucesso ao post '${postId}' (lugar ${locationIndex}).`,
      imageUrl: publicUrl,
      updatedPostsCount: targetPosts.length
    });
  } catch (error: any) {
    console.error("[Image Generation Callback] Erro ao processar callback de imagem:", error);
    return NextResponse.json(
      { error: "Erro interno ao processar callback de imagem", details: error.message },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
