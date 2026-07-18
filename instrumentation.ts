/**
 * instrumentation.ts — Next.js server instrumentation hook.
 * Runs once on server startup. If no posts exist in the database,
 * it automatically migrates all posts from the HTML storage directory,
 * groups translations by a shared hn_id, and resolves the best working
 * image across all language versions of the same post.
 */

export async function register() {
  // Only run on the Node.js runtime (not edge), and only in production-like envs
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  // Delay to ensure DB connection is ready
  await new Promise((r) => setTimeout(r, 2000));

  try {
    const { runMigrationIfNeeded } = await import("./lib/startup-migration");
    await runMigrationIfNeeded();
  } catch (err) {
    console.error("[Startup] Migration failed:", err);
  }
}
