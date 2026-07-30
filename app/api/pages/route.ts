import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const pages = await prisma.page.findMany({
      orderBy: { createdAt: "desc" }
    });
    return NextResponse.json(pages);
  } catch (error: any) {
    return NextResponse.json({ error: "Erro ao buscar páginas" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { slug, title, isStatic, content, seoTitle, seoDescription } = body;
    if (!slug || !title) {
      return NextResponse.json({ error: "Slug e título são obrigatórios." }, { status: 400 });
    }

    const page = await prisma.page.upsert({
      where: { slug },
      update: {
        title,
        isStatic: !!isStatic,
        content: content || {},
        seoTitle,
        seoDescription,
      },
      create: {
        slug,
        title,
        isStatic: !!isStatic,
        content: content || {},
        seoTitle,
        seoDescription,
      },
    });

    return NextResponse.json({ success: true, page });
  } catch (error: any) {
    return NextResponse.json({ error: "Erro ao salvar página" }, { status: 500 });
  }
}
