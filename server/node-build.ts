import path from "path";
import { createServer } from "./index";
import * as express from "express";

const app = createServer();
const port = process.env.PORT || 3000;

// In production, serve the built SPA files
const __dirname = import.meta.dirname;
const distPath = path.join(__dirname, "../spa");
const generatedPath =
  process.env.GENERATED_DIR?.trim() || path.resolve("/app/html-storage/posts");

// Serve static files
app.use((req, res, next) => {
  if (req.path.startsWith("/api/")) {
    return next();
  }
  return next();
});
// Serve only generated assets (media) and sitemap; keep SPA for pages.
app.use("/media", express.static(path.join(generatedPath, "media")));
app.get("/sitemap.xml", (_req, res) => {
  res.sendFile(path.join(generatedPath, "sitemap.xml"));
});
app.use(express.static(distPath));

// Handle React Router - serve index.html for all non-API routes
app.get("/", (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

app.get(/^\/(pt|en|es)(\/.*)?$/, (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

app.listen(port, () => {
  console.log(`🚀 Fusion Starter server running on port ${port}`);
  console.log(`📱 Frontend: http://localhost:${port}`);
  console.log(`🔧 API: http://localhost:${port}/api`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("🛑 Received SIGTERM, shutting down gracefully");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("🛑 Received SIGINT, shutting down gracefully");
  process.exit(0);
});
