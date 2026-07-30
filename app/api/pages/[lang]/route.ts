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
