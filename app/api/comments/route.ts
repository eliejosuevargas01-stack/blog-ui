import { NextResponse } from "next/server";
import { prisma } from "../../../lib/db";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "motonapratica-default-jwt-secret-key-123456";

// GET: List comments for a post
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get("postId");

    if (!postId) {
      return NextResponse.json({ error: "O parâmetro postId é obrigatório." }, { status: 400 });
    }

    const comments = await prisma.comment.findMany({
      where: { postId },
      include: {
        user: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { createdAt: "asc" }
    });

    return NextResponse.json({ comments });
  } catch (error: any) {
    console.error("Erro ao buscar comentários:", error);
    return NextResponse.json({ error: "Erro interno do servidor ao buscar comentários." }, { status: 500 });
  }
}

// POST: Add a comment (authenticated)
export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Você precisa estar logado para comentar." }, { status: 401 });
    }

    let decoded: { userId: string; name: string; email: string };
    try {
      decoded = jwt.verify(token, JWT_SECRET) as any;
    } catch (err) {
      return NextResponse.json({ error: "Sessão expirada. Faça login novamente." }, { status: 401 });
    }

    const { content, postId } = await request.json();

    if (!content || !content.trim()) {
      return NextResponse.json({ error: "O comentário não pode ser vazio." }, { status: 400 });
    }

    if (!postId) {
      return NextResponse.json({ error: "O postId é obrigatório." }, { status: 400 });
    }

    // Verify if the post exists
    const post = await prisma.post.findUnique({
      where: { id: postId }
    });

    if (!post) {
      return NextResponse.json({ error: "Post não encontrado." }, { status: 404 });
    }

    // Create comment
    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        postId,
        userId: decoded.userId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return NextResponse.json({ success: true, comment });
  } catch (error: any) {
    console.error("Erro ao salvar comentário:", error);
    return NextResponse.json({ error: "Erro interno do servidor ao postar comentário." }, { status: 500 });
  }
}
