import { promises as fs } from "fs";
import path from "path";
import type { RequestHandler } from "express";

type PostIndex = {
  posts: Array<Record<string, unknown>>;
};

const languages = ["pt", "en", "es"] as const;
type Language = (typeof languages)[number];

const isLanguage = (value: string | null): value is Language =>
  value === "pt" || value === "en" || value === "es";

const readIndexFile = async (indexPath: string): Promise<PostIndex | null> => {
  try {
    const raw = await fs.readFile(indexPath, "utf-8");
    const parsed = JSON.parse(raw) as PostIndex;
    return Array.isArray(parsed.posts) ? parsed : { posts: [] };
  } catch {
    return null;
  }
};

const loadPostsForLang = async (
  rootDir: string,
  lang: Language,
): Promise<PostIndex> => {
  const langIndex = await readIndexFile(path.join(rootDir, lang, "posts.json"));
  if (langIndex) {
    return langIndex;
  }
  const legacyIndex = await readIndexFile(path.join(rootDir, "posts.json"));
  if (!legacyIndex) {
    return { posts: [] };
  }
  return {
    posts: legacyIndex.posts.filter(
      (post) => typeof post.lang === "string" && post.lang === lang,
    ),
  };
};

const loadAllPosts = async (rootDir: string): Promise<PostIndex> => {
  const perLang = await Promise.all(
    languages.map((lang) =>
      readIndexFile(path.join(rootDir, lang, "posts.json")),
    ),
  );
  const hasPerLang = perLang.some(Boolean);
  if (hasPerLang) {
    return {
      posts: perLang.flatMap((entry) => entry?.posts ?? []),
    };
  }
  return (await readIndexFile(path.join(rootDir, "posts.json"))) ?? { posts: [] };
};

export const handleGetPosts: RequestHandler = async (req, res) => {
  const rootDir =
    process.env.GENERATED_DIR?.trim() || path.resolve("/app/html-storage/posts");
  const langParam =
    typeof req.query.lang === "string" ? req.query.lang.trim() : null;
  const lang = isLanguage(langParam) ? langParam : null;

  try {
    const index = lang
      ? await loadPostsForLang(rootDir, lang)
      : await loadAllPosts(rootDir);
    res.json({ posts: index.posts });
  } catch (error) {
    res
      .status(500)
      .json({ error: error instanceof Error ? error.message : "Unknown error" });
  }
};
