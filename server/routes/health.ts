import { promises as fs } from "fs";
import type { RequestHandler } from "express";

type HealthStatus = "ok" | "degraded";

const safeCheckGeneratedDir = async () => {
  const dir = process.env.GENERATED_DIR?.trim();
  if (!dir) {
    return { checked: false };
  }
  try {
    await fs.access(dir);
    return { checked: true, ok: true };
  } catch (error) {
    return {
      checked: true,
      ok: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

export const handleHealth: RequestHandler = async (_req, res) => {
  const generated = await safeCheckGeneratedDir();
  const degraded = generated.checked && !generated.ok;
  const status: HealthStatus = degraded ? "degraded" : "ok";

  res.status(degraded ? 503 : 200).json({
    status,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    commit: process.env.SOURCE_COMMIT ?? null,
    generatedDir: generated,
  });
};
