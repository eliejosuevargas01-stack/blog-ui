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
}

export function getSystemSettings(): SystemSettings {
  const filePath = getSettingsPath();
  if (fs.existsSync(filePath)) {
    try {
      const content = fs.readFileSync(filePath, "utf-8");
      const parsed = JSON.parse(content);
      return {
        autoTranslateEnabled: !!parsed.autoTranslateEnabled
      };
    } catch {
      // Fallback
    }
  }
  return { autoTranslateEnabled: false };
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
