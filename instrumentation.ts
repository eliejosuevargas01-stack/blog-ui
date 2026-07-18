/**
 * instrumentation.ts — Next.js server instrumentation hook.
 * Runs once on server startup. If no posts exist in the database,
 * it automatically migrates all posts from the HTML storage directory,
 * groups translations by a shared hn_id, and resolves the best working
 * image across all language versions of the same post.
 */

import { runMigrationIfNeeded } from "./lib/startup-migration";

export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  await new Promise((r) => setTimeout(r, 2000));

  try {
    await runMigrationIfNeeded();
  } catch (err) {
    console.error("[Startup] Migration failed:", err);
  }
}
