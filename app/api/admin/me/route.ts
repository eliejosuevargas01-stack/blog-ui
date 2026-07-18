import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const token = cookies().get("admin_token")?.value;
  if (!token) {
    return NextResponse.json({ authenticated: false });
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return NextResponse.json({ authenticated: false });
  }

  return NextResponse.json({
    authenticated: true,
    user: payload.username,
  });
}
export const dynamic = 'force-dynamic';
