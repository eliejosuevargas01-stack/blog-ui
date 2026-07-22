import fs from "fs";
import path from "path";

export function getUploadsDir(): string {
  if (process.env.UPLOADS_DIR) {
    const envDir = process.env.UPLOADS_DIR;
    if (!fs.existsSync(envDir)) {
      try { fs.mkdirSync(envDir, { recursive: true }); } catch {}
    }
    return envDir;
  }

  // Check if Coolify persistent storage volume /app/html-storage exists
  if (fs.existsSync("/app/html-storage")) {
    const persistentDir = "/app/html-storage/uploads";
    if (!fs.existsSync(persistentDir)) {
      try { fs.mkdirSync(persistentDir, { recursive: true }); } catch {}
    }
    return persistentDir;
  }

  const defaultDir = path.join(process.cwd(), "uploads");
  if (!fs.existsSync(defaultDir)) {
    try { fs.mkdirSync(defaultDir, { recursive: true }); } catch {}
  }
  return defaultDir;
}
