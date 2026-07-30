import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "motonapratica-default-jwt-secret-key-123456";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const cookieStore = cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    let decoded: { userId: string; name: string; email: string };
    try {
      decoded = jwt.verify(token, JWT_SECRET) as any;
    } catch (err) {
      return NextResponse.json({ error: "Sessão inválida." }, { status: 401 });
    }

    // Find the comment
    const comment = await prisma.comment.findUnique({
      where: { id }
    });

    if (!comment) {
      return NextResponse.json({ error: "Comentário não encontrado." }, { status: 404 });
    }

    // Check ownership
    if (comment.userId !== decoded.userId) {
      return NextResponse.json({ error: "Você não tem permissão para deletar este comentário." }, { status: 403 });
    }

    // Delete comment
    await prisma.comment.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Erro ao deletar comentário:", error);
    return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 });
  }
}
