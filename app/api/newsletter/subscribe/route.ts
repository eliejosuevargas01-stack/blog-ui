import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, name } = body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "E-mail inválido." }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name ? String(name).trim() : null;

    // Verificar se já está cadastrado
    const existing = await prisma.subscriber.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      return NextResponse.json({ success: true, message: "E-mail já cadastrado na newsletter." });
    }

    // Criar novo assinante
    const subscriber = await prisma.subscriber.create({
      data: {
        email: cleanEmail,
        name: cleanName,
      },
    });

    // Registrar notificação no sistema para o Admin acompanhar
    try {
      await prisma.notification.create({
        data: {
          type: "REGISTER",
          message: `Novo leitor se inscreveu na newsletter: ${cleanEmail}${cleanName ? ` (${cleanName})` : ""}`,
          userEmail: cleanEmail,
          userName: cleanName,
        },
      });
    } catch (e) {
      console.warn("Não foi possível criar a notificação de cadastro", e);
    }

    return NextResponse.json({ success: true, subscriber });
  } catch (error: any) {
    console.error("Erro na rota de newsletter:", error);
    return NextResponse.json({ error: "Erro interno ao processar inscrição." }, { status: 500 });
  }
}
