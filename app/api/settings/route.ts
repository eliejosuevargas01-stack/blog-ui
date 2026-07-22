import { NextResponse } from "next/server";
import { getSystemSettings, saveSystemSettings } from "@/lib/settings";

export async function GET() {
  try {
    const settings = getSystemSettings();
    return NextResponse.json(settings);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const current = getSystemSettings();

    const updated = {
      autoTranslateEnabled: typeof body.autoTranslateEnabled === "boolean" 
        ? body.autoTranslateEnabled 
        : current.autoTranslateEnabled
    };

    saveSystemSettings(updated);
    return NextResponse.json({ success: true, settings: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
