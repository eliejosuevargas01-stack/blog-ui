/**
 * instrumentation.ts — Next.js server instrumentation hook.
 * Runs once on server startup. If no posts exist in the database,
 * it automatically migrates all posts from the HTML storage directory,
 * groups translations by a shared hn_id, and resolves the best working
 * image across all language versions of the same post.
 */

export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  await new Promise((r) => setTimeout(r, 2000));

  try {
    // webpackIgnore prevents webpack from tracing this module at build time.
    // It is loaded at runtime only by Node.js — fs/path/crypto are available there.
    const { runMigrationIfNeeded } = await import(
      /* webpackIgnore: true */ "./lib/startup-migration"
    );
    await runMigrationIfNeeded();
  } catch (err) {
    console.error("[Startup] Migration failed:", err);
  }
}
