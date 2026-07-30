import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";

export async function POST(req: Request) {
  try {
    const { postId, postTitle, network } = await req.json();

    if (postId) {
      await prisma.notification.create({
        data: {
          type: "SHARE",
          message: `Um leitor compartilhou o post "${postTitle || 'Artigo'}" no ${network || 'Redes Sociais'}`,
          postId,
          postTitle,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false });
  }
}
