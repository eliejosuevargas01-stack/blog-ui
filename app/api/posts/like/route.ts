import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";

export async function POST(req: Request) {
  try {
    const { postId, postTitle } = await req.json();

    if (!postId) {
      return NextResponse.json({ error: "postId é obrigatório." }, { status: 400 });
    }

    // Verificar se o post existe no banco de dados
    const existingPost = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, title: true, likes: true }
    });

    if (!existingPost) {
      return NextResponse.json({ success: true, likes: 1, isStaticFallback: true });
    }

    // Incrementar likes no banco de dados
    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: { likes: { increment: 1 } },
      select: { likes: true, title: true },
    });

    // Registrar notificação para o Admin
    try {
      await prisma.notification.create({
        data: {
          type: "LIKE",
          message: `Um leitor curtiu o post "${postTitle || updatedPost.title}"`,
          postId,
          postTitle: postTitle || updatedPost.title,
        },
      });
    } catch (e) {
      console.warn("Falha ao registrar notificação de curtida", e);
    }

    return NextResponse.json({ success: true, likes: updatedPost.likes });
  } catch (error: any) {
    console.error("Erro na rota de curtida:", error);
    return NextResponse.json({ error: "Erro interno ao registrar curtida." }, { status: 500 });
  }
}
