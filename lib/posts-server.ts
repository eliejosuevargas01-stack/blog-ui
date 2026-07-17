import { promises as fs } from "fs";
import path from "path";
import type { BlogPost } from "@/lib/posts";
import { languages, type Language } from "@/lib/i18n";

type PostIndex = {
  posts: BlogPost[];
};

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

const stripHtml = (value: string) =>
  value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

const extractContentHtml = (html: string) => {
  const marker = '<div class="content">';
  const startIndex = html.indexOf(marker);
  if (startIndex === -1) {
    return null;
  }

  const contentStart = startIndex + marker.length;
  const tagRegex = /<\/?div\b[^>]*>/gi;
  tagRegex.lastIndex = contentStart;
  let depth = 1;
  let match: RegExpExecArray | null;

  while ((match = tagRegex.exec(html)) !== null) {
    const tag = match[0];
    if (tag.startsWith("</")) {
      depth -= 1;
    } else {
      depth += 1;
    }

    if (depth === 0) {
      const content = html.slice(contentStart, match.index).trim();
      return content || null;
    }
  }

  return null;
};

const hasPostContent = (post: BlogPost) => {
  const content = typeof post.content === "string" ? post.content.trim() : "";
  const contentHtml = typeof post.contentHtml === "string" ? post.contentHtml.trim() : "";
  return Boolean(content || contentHtml);
};

const readHtmlPost = async (
  filePath: string,
  lang: Language,
  slug: string,
): Promise<BlogPost | null> => {
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
    const contentHtml = extractContentHtml(html) ?? undefined;
    const content = contentHtml ? stripHtml(contentHtml) : undefined;

    return {
      id: `post-${lang}-${slug}`,
      lang,
      slug,
      title,
      excerpt: description,
      description,
      image,
      content,
      contentHtml,
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
): Promise<BlogPost[]> => {
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
    return records.filter(Boolean) as BlogPost[];
  } catch {
    return [];
  }
};

const mergePostLists = (
  primary: BlogPost[],
  fallback: BlogPost[],
) => {
  const slugs = new Set<string>();
  const primaryBySlug = new Map<string, BlogPost>();
  primary.forEach((post) => {
    const slug = post.slug ?? null;
    if (slug) {
      slugs.add(slug);
      primaryBySlug.set(slug, post);
    }
  });
  const merged = [...primary];
  fallback.forEach((post) => {
    const slug = post.slug ?? null;
    if (slug && slugs.has(slug)) {
      const target = primaryBySlug.get(slug);
      if (target && !hasPostContent(target) && hasPostContent(post)) {
        target.content = post.content ?? target.content;
        target.contentHtml = post.contentHtml ?? target.contentHtml;
      }
      return;
    }
    merged.push(post);
    if (slug) {
      slugs.add(slug);
      primaryBySlug.set(slug, post);
    }
  });
  return merged;
};

const filterPostsByLang = (
  posts: BlogPost[],
  lang: Language,
) =>
  posts.filter((post) => {
    const postLang =
      typeof post.lang === "string" ? post.lang.trim().toLowerCase() : "";
    return postLang === lang;
  });

export const loadPostsForLang = async (
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

export const loadAllPosts = async (rootDir: string): Promise<PostIndex> => {
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
  const fallback = await readIndexFile(path.join(rootDir, "posts.json"));
  return fallback ?? { posts: [] };
};
