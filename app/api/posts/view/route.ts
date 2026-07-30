import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { cookies } from "next/headers";
import { verifyToken } from "../../../../lib/auth";

export async function POST(req: Request) {
  try {
    const { postId } = await req.json();

    if (!postId) {
      return NextResponse.json({ error: "postId é necessário" }, { status: 400 });
    }

    // Verificar se há token de admin na sessão
    const adminToken = cookies().get("admin_token")?.value;
    let isAdmin = false;
    if (adminToken) {
      const payload = await verifyToken(adminToken);
      if (payload) isAdmin = true;
    }

    // Se o usuário for ADMIN, NÃO contar a visualização!
    if (isAdmin) {
      return NextResponse.json({ success: true, isIgnoredAdmin: true });
    }

    // Verificar se o post existe no banco de dados
    const existingPost = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, views: true }
    });

    if (!existingPost) {
      return NextResponse.json({ success: true, views: 1, isStaticFallback: true });
    }

    // Caso contrário, incrementar o número de visualizações reais do leitor
    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: { views: { increment: 1 } },
      select: { views: true },
    });

    return NextResponse.json({ success: true, views: updatedPost.views });
  } catch (error: any) {
    console.error("Erro ao registrar visualização:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
