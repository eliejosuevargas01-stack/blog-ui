import { NextResponse } from "next/server";

export async function POST() {
  try {
    const response = NextResponse.json({ success: true });
    
    // Clear cookie by setting expiration to past
    response.cookies.set({
      name: "auth_token",
      value: "",
      httpOnly: true,
      expires: new Date(0),
      path: "/"
    });

    return response;
  } catch (error: any) {
    console.error("Erro no logout:", error);
    return NextResponse.json({ error: "Erro interno do servidor ao deslogar." }, { status: 500 });
  }
}
