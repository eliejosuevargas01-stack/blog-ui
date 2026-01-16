import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { handleHealth } from "./routes/health";
import { handleGeneratedStatus } from "./routes/generated-status";
import { handleGetPosts } from "./routes/posts";
import {
  handleDeletePost,
  handlePublishPost,
  handleRebuildSitemap,
} from "./routes/publish-post";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true, limit: "2mb" }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/healthz", handleHealth);
  app.get("/api/health", handleHealth);
  app.get("/api/demo", handleDemo);
  app.get("/api/posts", handleGetPosts);
  app.post("/api/publish-post", handlePublishPost);
  app.post("/api/rebuild-sitemap", handleRebuildSitemap);
  app.post("/api/delete-post", handleDeletePost);
  app.get("/api/generated-status", handleGeneratedStatus);

  app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    const isPayloadTooLarge =
      typeof err === "object" && err !== null && "type" in err && err.type === "entity.too.large";
    const isParseError =
      typeof err === "object" && err !== null && "type" in err && err.type === "entity.parse.failed";
    if (isPayloadTooLarge) {
      return res.status(413).json({ error: "Payload too large" });
    }
    if (isParseError) {
      return res.status(400).json({ error: "Invalid JSON payload" });
    }
    return res.status(500).json({ error: "Internal server error" });
  });

  return app;
}
