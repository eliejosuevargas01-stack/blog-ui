import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "motonapratica-default-jwt-secret-key-123456";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Preencha todos os campos obrigatórios." }, { status: 400 });
    }

    const emailLower = email.toLowerCase().trim();

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: emailLower }
    });

    if (!user) {
      return NextResponse.json({ error: "E-mail ou senha incorretos." }, { status: 400 });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json({ error: "E-mail ou senha incorretos." }, { status: 400 });
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: user.id, name: user.name, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Create response
    const response = NextResponse.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email }
    });

    // Set cookie
    response.cookies.set({
      name: "auth_token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/"
    });

    return response;
  } catch (error: any) {
    console.error("Erro no login:", error);
    return NextResponse.json({ error: "Erro interno do servidor ao autenticar." }, { status: 500 });
  }
}
