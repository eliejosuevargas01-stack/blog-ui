import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "motonapratica-default-jwt-secret-key-123456";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json({ user: null });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; name: string; email: string };
      return NextResponse.json({
        user: {
          id: decoded.userId,
          name: decoded.name,
          email: decoded.email
        }
      });
    } catch (err) {
      // Invalid/expired token
      return NextResponse.json({ user: null });
    }
  } catch (error: any) {
    console.error("Erro em auth/me:", error);
    return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 });
  }
}
