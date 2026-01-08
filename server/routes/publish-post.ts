import { promises as fs } from "fs";
import path from "path";
import { marked } from "marked";
import type { RequestHandler } from "express";

type PostPayload = Record<string, unknown>;

const supportedLangs = new Set(["pt", "en", "es"]);

const pickString = (record: PostPayload, keys: string[]) => {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (trimmed) {
        return trimmed;
      }
    }
  }
  return null;
};

const normalizeSlug = (value: string) =>
  value
    .trim()
    .replace(/^\/+|\/+$/g, "")
    .replace(/\s+/g, "-")
    .toLowerCase();

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const formatIsoDate = (value?: string | null) => {
  if (!value) {
    return null;
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return parsed.toISOString();
};

const resolveSiteOrigin = () => {
  const explicit = process.env.SITE_ORIGIN?.trim();
  if (explicit) {
    return explicit.replace(/\/+$/, "");
  }
  const coolifyUrl = process.env.COOLIFY_URL?.trim();
  if (coolifyUrl) {
    return coolifyUrl.replace(/\/+$/, "");
  }
  const fqdn = process.env.COOLIFY_FQDN?.trim();
  if (fqdn) {
    return `https://${fqdn.replace(/\/+$/, "")}`;
  }
  return "http://localhost:3000";
};

const renderPostHtml = (payload: PostPayload) => {
  const title =
    pickString(payload, ["meta_title", "metaTitle", "seo_title", "seoTitle"]) ??
    pickString(payload, ["titulo", "title", "headline"]) ??
    "Post";
  const description =
    pickString(payload, ["meta_description", "metaDescription"]) ??
    pickString(payload, ["resumo", "excerpt", "summary", "description"]) ??
    "";
  const slug = pickString(payload, ["slug"]) ?? "";
  const langRaw = pickString(payload, ["lang"]) ?? "pt";
  const lang = supportedLangs.has(langRaw) ? langRaw : "pt";
  const image =
    pickString(payload, ["cover_image_url", "image", "imageUrl"]) ?? "";
  const imageAlt =
    pickString(payload, ["cover_image_alt", "imageAlt", "image_alt"]) ?? title;
  const publishedAt =
    pickString(payload, ["publicado_em", "publishedAt", "date"]) ??
    pickString(payload, ["criado_em", "createdAt"]);
  const updatedAt = pickString(payload, ["atualizado_em", "updatedAt"]);
  const contentRaw =
    pickString(payload, ["contentHtml", "conteudo_html"]) ??
    pickString(payload, ["conteudo", "content", "body", "texto"]) ??
    "";
  const hasHtml = /<[^>]+>/.test(contentRaw);
  const contentHtml = hasHtml ? contentRaw : marked.parse(contentRaw);
  const keywords =
    Array.isArray(payload.palavras_chave) && payload.palavras_chave.length > 0
      ? payload.palavras_chave
          .filter((item) => typeof item === "string" && item.trim())
          .join(", ")
      : pickString(payload, ["keywords"]) ?? "";
  const origin = resolveSiteOrigin();
  const canonical = `${origin}/${lang}/post/${normalizeSlug(slug)}`;
  const publishedIso = formatIsoDate(publishedAt);
  const updatedIso = formatIsoDate(updatedAt ?? publishedAt);
  const safeTitle = escapeHtml(title);
  const safeDescription = escapeHtml(description);
  const safeImage = image ? escapeHtml(image) : "";
  const safeImageAlt = escapeHtml(imageAlt);

  return {
    lang,
    slug: normalizeSlug(slug),
    html: `<!doctype html>
<html lang="${lang}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${safeTitle}</title>
    <meta name="description" content="${safeDescription}" />
    <link rel="canonical" href="${escapeHtml(canonical)}" />
    <meta name="robots" content="index,follow" />
    ${keywords ? `<meta name="keywords" content="${escapeHtml(keywords)}" />` : ""}
    <meta property="og:type" content="article" />
    <meta property="og:title" content="${safeTitle}" />
    <meta property="og:description" content="${safeDescription}" />
    <meta property="og:url" content="${escapeHtml(canonical)}" />
    ${safeImage ? `<meta property="og:image" content="${safeImage}" />` : ""}
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${safeTitle}" />
    <meta name="twitter:description" content="${safeDescription}" />
    ${safeImage ? `<meta name="twitter:image" content="${safeImage}" />` : ""}
    ${publishedIso ? `<meta property="article:published_time" content="${publishedIso}" />` : ""}
    ${updatedIso ? `<meta property="article:modified_time" content="${updatedIso}" />` : ""}
    <style>
      :root { color-scheme: light; }
      body { margin: 0; font-family: "Georgia", "Times New Roman", serif; color: #151515; background: #faf8f5; }
      header { padding: 32px 20px 12px; text-align: center; }
      main { max-width: 860px; margin: 0 auto; padding: 0 20px 64px; }
      .meta { color: #6b6b6b; font-size: 14px; margin-bottom: 24px; }
      h1 { font-size: 40px; margin: 0 0 16px; line-height: 1.1; }
      .excerpt { font-size: 18px; color: #3f3f3f; margin-bottom: 24px; }
      .cover { width: 100%; border-radius: 18px; overflow: hidden; margin: 24px 0; }
      .cover img { width: 100%; height: auto; display: block; }
      article { background: #fff; border-radius: 24px; padding: 32px; box-shadow: 0 18px 40px rgba(0,0,0,0.08); }
      article p { line-height: 1.7; font-size: 18px; color: #333; }
      article h2, article h3 { margin-top: 32px; }
      article img { max-width: 100%; border-radius: 16px; }
    </style>
  </head>
  <body>
    <header>
      <div class="meta">${safeDescription}</div>
    </header>
    <main>
      <article>
        <h1>${safeTitle}</h1>
        ${description ? `<p class="excerpt">${safeDescription}</p>` : ""}
        ${safeImage ? `<div class="cover"><img src="${safeImage}" alt="${safeImageAlt}" /></div>` : ""}
        <div class="content">${contentHtml}</div>
      </article>
    </main>
  </body>
</html>`,
  };
};

const collectHtmlFiles = async (rootDir: string) => {
  const entries: string[] = [];
  const walk = async (dir: string) => {
    const items = await fs.readdir(dir, { withFileTypes: true });
    await Promise.all(
      items.map(async (item) => {
        const fullPath = path.join(dir, item.name);
        if (item.isDirectory()) {
          await walk(fullPath);
          return;
        }
        if (item.isFile() && item.name.endsWith(".html")) {
          entries.push(fullPath);
        }
      }),
    );
  };
  await walk(rootDir);
  return entries;
};

const formatSitemapDate = (value: Date) =>
  value.toISOString().split("T")[0];

const buildSitemap = async (rootDir: string, origin: string) => {
  const files = await collectHtmlFiles(rootDir);
  const urls = await Promise.all(
    files.map(async (filePath) => {
      const stat = await fs.stat(filePath);
      const relative = path
        .relative(rootDir, filePath)
        .split(path.sep)
        .join("/");
      const routePath = `/${relative}`
        .replace(/index\\.html$/i, "")
        .replace(/\\.html$/i, "");
      return {
        loc: `${origin}${routePath}`,
        lastmod: formatSitemapDate(stat.mtime),
      };
    }),
  );
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.map(
      (url) =>
        `<url><loc>${escapeHtml(url.loc)}</loc><lastmod>${url.lastmod}</lastmod></url>`,
    ),
    "</urlset>",
  ].join("");
  await fs.writeFile(path.join(rootDir, "sitemap.xml"), xml, "utf-8");
};

const publishPost = async (payload: PostPayload, rootDir: string) => {
  const { lang, slug, html } = renderPostHtml(payload);
  if (!slug) {
    throw new Error("Missing slug");
  }
  const postDir = path.join(rootDir, lang, "post", slug);
  await fs.mkdir(postDir, { recursive: true });
  await fs.writeFile(path.join(postDir, "index.html"), html, "utf-8");
};

export const handlePublishPost: RequestHandler = async (req, res) => {
  const token = process.env.PUBLISH_TOKEN;
  if (token) {
    const incoming =
      req.header("x-publish-token") ??
      req.header("authorization")?.replace(/^Bearer\\s+/i, "") ??
      "";
    if (incoming !== token) {
      return res.status(401).json({ error: "Unauthorized" });
    }
  }

  const rootDir =
    process.env.GENERATED_DIR?.trim() || path.resolve(process.cwd(), "generated");
  const origin = resolveSiteOrigin();

  try {
    const payload = req.body;
    const posts = Array.isArray(payload)
      ? payload
      : Array.isArray(payload?.posts)
        ? payload.posts
        : [payload];

    for (const post of posts) {
      await publishPost(post as PostPayload, rootDir);
    }
    await buildSitemap(rootDir, origin);

    res.json({ ok: true, count: posts.length });
  } catch (error) {
    res
      .status(500)
      .json({ error: error instanceof Error ? error.message : "Unknown error" });
  }
};

export const handleRebuildSitemap: RequestHandler = async (_req, res) => {
  const rootDir =
    process.env.GENERATED_DIR?.trim() || path.resolve(process.cwd(), "generated");
  const origin = resolveSiteOrigin();
  try {
    await buildSitemap(rootDir, origin);
    res.json({ ok: true });
  } catch (error) {
    res
      .status(500)
      .json({ error: error instanceof Error ? error.message : "Unknown error" });
  }
};
