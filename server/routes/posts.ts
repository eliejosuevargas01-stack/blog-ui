import { promises as fs } from "fs";
import path from "path";
import type { RequestHandler } from "express";

type PostIndex = {
  posts: Array<Record<string, unknown>>;
};

const loadPostIndex = async (rootDir: string): Promise<PostIndex> => {
  const indexPath = path.join(rootDir, "posts.json");
  try {
    const raw = await fs.readFile(indexPath, "utf-8");
    const parsed = JSON.parse(raw) as PostIndex;
    return Array.isArray(parsed.posts) ? parsed : { posts: [] };
  } catch {
    return { posts: [] };
  }
};

export const handleGetPosts: RequestHandler = async (req, res) => {
  const rootDir =
    process.env.GENERATED_DIR?.trim() || path.resolve(process.cwd(), "generated");
  const lang = typeof req.query.lang === "string" ? req.query.lang : null;

  try {
    const index = await loadPostIndex(rootDir);
    const posts = lang
      ? index.posts.filter(
          (post) => typeof post.lang === "string" && post.lang === lang,
        )
      : index.posts;
    res.json({ posts });
  } catch (error) {
    res
      .status(500)
      .json({ error: error instanceof Error ? error.message : "Unknown error" });
  }
};
