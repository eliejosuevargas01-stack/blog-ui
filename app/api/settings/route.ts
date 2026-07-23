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
        : current.autoTranslateEnabled,
      autoImageEnabled: typeof body.autoImageEnabled === "boolean" 
        ? body.autoImageEnabled 
        : current.autoImageEnabled,
      autoImageHero: typeof body.autoImageHero === "boolean" 
        ? body.autoImageHero 
        : current.autoImageHero,
      autoImageBlock1: typeof body.autoImageBlock1 === "boolean" 
        ? body.autoImageBlock1 
        : current.autoImageBlock1,
      autoImageBlock2: typeof body.autoImageBlock2 === "boolean" 
        ? body.autoImageBlock2 
        : current.autoImageBlock2,
      autoImageBlock3: typeof body.autoImageBlock3 === "boolean" 
        ? body.autoImageBlock3 
        : current.autoImageBlock3,
      autoImageBlock4: typeof body.autoImageBlock4 === "boolean" 
        ? body.autoImageBlock4 
        : current.autoImageBlock4,
      schedulerEnabled: typeof body.schedulerEnabled === "boolean" 
        ? body.schedulerEnabled 
        : current.schedulerEnabled,
      schedulerHour: typeof body.schedulerHour === "string" 
        ? body.schedulerHour 
        : current.schedulerHour
    };

    saveSystemSettings(updated);
    return NextResponse.json({ success: true, settings: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
