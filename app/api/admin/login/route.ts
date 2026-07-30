import { NextResponse } from "next/server";
import { checkCredentials, signToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();
    if (!username || !password) {
      return NextResponse.json({ error: "Preencha todos os campos." }, { status: 400 });
    }

    const isValid = checkCredentials(username, password);
    if (!isValid) {
      return NextResponse.json({ error: "Usuário ou senha incorretos." }, { status: 401 });
    }

    const token = await signToken(username);
    const response = NextResponse.json({ success: true, user: username });
    response.cookies.set({
      name: "admin_token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    return response;
  } catch (error: any) {
    return NextResponse.json({ error: "Erro no login de admin" }, { status: 500 });
  }
}
