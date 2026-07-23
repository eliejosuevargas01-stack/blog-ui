import fs from "fs";
import path from "path";

const SETTINGS_FILE_PATH = "/app/html-storage/settings.json";
const FALLBACK_SETTINGS_FILE_PATH = path.join(process.cwd(), "uploads", "settings.json");

function getSettingsPath(): string {
  if (fs.existsSync("/app/html-storage")) {
    return SETTINGS_FILE_PATH;
  }
  return FALLBACK_SETTINGS_FILE_PATH;
}

export interface SystemSettings {
  autoTranslateEnabled: boolean;
  autoImageEnabled: boolean;
  autoImageHero: boolean;
  autoImageBlock1: boolean;
  autoImageBlock2: boolean;
  autoImageBlock3: boolean;
  autoImageBlock4: boolean;
  schedulerEnabled: boolean;
  schedulerHour: string;
}

export function getSystemSettings(): SystemSettings {
  const filePath = getSettingsPath();
  if (fs.existsSync(filePath)) {
    try {
      const content = fs.readFileSync(filePath, "utf-8");
      const parsed = JSON.parse(content);
      return {
        autoTranslateEnabled: parsed.autoTranslateEnabled !== undefined ? !!parsed.autoTranslateEnabled : false,
        autoImageEnabled: parsed.autoImageEnabled !== undefined ? !!parsed.autoImageEnabled : true,
        autoImageHero: parsed.autoImageHero !== undefined ? !!parsed.autoImageHero : true,
        autoImageBlock1: parsed.autoImageBlock1 !== undefined ? !!parsed.autoImageBlock1 : false,
        autoImageBlock2: parsed.autoImageBlock2 !== undefined ? !!parsed.autoImageBlock2 : false,
        autoImageBlock3: parsed.autoImageBlock3 !== undefined ? !!parsed.autoImageBlock3 : false,
        autoImageBlock4: parsed.autoImageBlock4 !== undefined ? !!parsed.autoImageBlock4 : false,
        schedulerEnabled: parsed.schedulerEnabled !== undefined ? !!parsed.schedulerEnabled : true,
        schedulerHour: parsed.schedulerHour !== undefined ? String(parsed.schedulerHour) : "07:00",
      };
    } catch {
      // Fallback
    }
  }
  return {
    autoTranslateEnabled: false,
    autoImageEnabled: true,
    autoImageHero: true,
    autoImageBlock1: false,
    autoImageBlock2: false,
    autoImageBlock3: false,
    autoImageBlock4: false,
    schedulerEnabled: true,
    schedulerHour: "07:00"
  };
}

export function saveSystemSettings(settings: SystemSettings) {
  const filePath = getSettingsPath();
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    try {
      fs.mkdirSync(dir, { recursive: true });
    } catch {}
  }
  fs.writeFileSync(filePath, JSON.stringify(settings, null, 2), "utf-8");
}
