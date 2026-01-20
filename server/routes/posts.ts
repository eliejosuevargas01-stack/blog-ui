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

const extractMetaContent = (html: string, attr: "name" | "property", key: string) => {
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(
    `<meta[^>]+${attr}=["']${escaped}["'][^>]*content=["']([^"']+)["'][^>]*>`,
    "i",
  );
  const match = html.match(pattern);
  return match?.[1]?.trim() ?? null;
};

const extractTitle = (html: string) => {
  const match = html.match(/<title>([^<]+)<\/title>/i);
  return match?.[1]?.trim() ?? null;
};

const readHtmlPost = async (
  filePath: string,
  lang: Language,
  slug: string,
): Promise<Record<string, unknown> | null> => {
  try {
    const html = await fs.readFile(filePath, "utf-8");
    const title = extractTitle(html);
    if (!title) {
      return null;
    }
    const description =
      extractMetaContent(html, "name", "description") ?? undefined;
    const image = extractMetaContent(html, "property", "og:image") ?? undefined;
    const publishedAt =
      extractMetaContent(html, "property", "article:published_time") ??
      undefined;
    const updatedAt =
      extractMetaContent(html, "property", "article:modified_time") ??
      undefined;

    return {
      id: `post-${lang}-${slug}`,
      lang,
      slug,
      title,
      excerpt: description,
      description,
      image,
      publishedAt,
      updatedAt,
    };
  } catch {
    return null;
  }
};

const loadHtmlPostsForLang = async (
  rootDir: string,
  lang: Language,
): Promise<Array<Record<string, unknown>>> => {
  const postsDir = path.join(rootDir, lang, "post");
  try {
    const entries = await fs.readdir(postsDir, { withFileTypes: true });
    const records = await Promise.all(
      entries.map(async (entry) => {
        if (!entry.isDirectory()) {
          return null;
        }
        const slug = entry.name;
        const htmlPath = path.join(postsDir, slug, "index.html");
        return readHtmlPost(htmlPath, lang, slug);
      }),
    );
    return records.filter(Boolean) as Array<Record<string, unknown>>;
  } catch {
    return [];
  }
};

const mergePostLists = (
  primary: Array<Record<string, unknown>>,
  fallback: Array<Record<string, unknown>>,
) => {
  const slugs = new Set<string>();
  primary.forEach((post) => {
    const slug = typeof post.slug === "string" ? post.slug : null;
    if (slug) {
      slugs.add(slug);
    }
  });
  const merged = [...primary];
  fallback.forEach((post) => {
    const slug = typeof post.slug === "string" ? post.slug : null;
    if (slug && slugs.has(slug)) {
      return;
    }
    merged.push(post);
    if (slug) {
      slugs.add(slug);
    }
  });
  return merged;
};

const filterPostsByLang = (
  posts: Array<Record<string, unknown>>,
  lang: Language,
) =>
  posts.filter((post) => {
    const postLang =
      typeof post.lang === "string" ? post.lang.trim().toLowerCase() : "";
    if (!postLang) {
      return true;
    }
    return postLang === lang;
  });

const loadPostsForLang = async (
  rootDir: string,
  lang: Language,
): Promise<PostIndex> => {
  const langIndex = await readIndexFile(path.join(rootDir, lang, "posts.json"));
  const htmlPosts = await loadHtmlPostsForLang(rootDir, lang);
  if (langIndex) {
    const filtered = filterPostsByLang(langIndex.posts, lang);
    return { posts: mergePostLists(filtered, htmlPosts) };
  }
  const legacyIndex = await readIndexFile(path.join(rootDir, "posts.json"));
  if (!legacyIndex) {
    return { posts: htmlPosts };
  }
  return {
    posts: mergePostLists(filterPostsByLang(legacyIndex.posts, lang), htmlPosts),
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
