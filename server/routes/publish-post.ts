import { promises as fs } from "fs";
import path from "path";
import { createHash } from "crypto";
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

const resolvePostIdentity = (payload: PostPayload) => {
  const slugRaw = pickString(payload, ["slug"]) ?? "";
  const langRaw = pickString(payload, ["lang"]) ?? "pt";
  const lang = supportedLangs.has(langRaw) ? langRaw : "pt";
  return { lang, slug: normalizeSlug(slugRaw) };
};

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

const IMAGE_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".avif",
  ".gif",
  ".svg",
]);

const CONTENT_TYPE_EXTENSIONS = new Map<string, string>([
  ["image/jpeg", ".jpg"],
  ["image/jpg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
  ["image/avif", ".avif"],
  ["image/gif", ".gif"],
  ["image/svg+xml", ".svg"],
]);

const decodeHtmlEntities = (value: string) =>
  value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");

const isRemoteUrl = (value: string) => /^https?:\/\//i.test(value);

const resolveImageExtensionFromUrl = (value: string) => {
  try {
    const ext = path.extname(new URL(value).pathname).toLowerCase();
    return IMAGE_EXTENSIONS.has(ext) ? ext : null;
  } catch {
    return null;
  }
};

const resolveImageExtensionFromContentType = (value: string | null) => {
  if (!value) {
    return null;
  }
  const normalized = value.split(";")[0].trim().toLowerCase();
  return CONTENT_TYPE_EXTENSIONS.get(normalized) ?? null;
};

const fileExists = async (filePath: string) => {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
};

const buildMediaPublicPath = (lang: string, slug: string, fileName: string) =>
  path.posix.join("/media", lang, slug, fileName);

const localizeImageUrl = async (
  url: string | null,
  options: {
    rootDir: string;
    lang: string;
    slug: string;
    prefix: string;
    cache: Map<string, string>;
  },
) => {
  if (!url) {
    return null;
  }
  const decoded = decodeHtmlEntities(url);
  if (!isRemoteUrl(decoded)) {
    return url;
  }
  const cached = options.cache.get(decoded);
  if (cached) {
    return cached;
  }

  const mediaDir = path.join(options.rootDir, "media", options.lang, options.slug);
  await fs.mkdir(mediaDir, { recursive: true });

  const hash = createHash("sha1").update(decoded).digest("hex").slice(0, 12);
  const extFromUrl = resolveImageExtensionFromUrl(decoded);
  if (extFromUrl) {
    const candidateName = `${options.prefix}-${hash}${extFromUrl}`;
    const candidatePath = path.join(mediaDir, candidateName);
    if (await fileExists(candidatePath)) {
      const publicPath = buildMediaPublicPath(
        options.lang,
        options.slug,
        candidateName,
      );
      options.cache.set(decoded, publicPath);
      return publicPath;
    }
  }

  let response: Response;
  try {
    response = await fetch(decoded);
  } catch {
    return url;
  }
  if (!response.ok) {
    return url;
  }

  const contentType = response.headers.get("content-type");
  if (contentType && !contentType.toLowerCase().startsWith("image/")) {
    return url;
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  const extFromType = resolveImageExtensionFromContentType(contentType);
  const finalExt = extFromType ?? extFromUrl ?? ".jpg";
  const fileName = `${options.prefix}-${hash}${finalExt}`;
  const filePath = path.join(mediaDir, fileName);

  if (!(await fileExists(filePath))) {
    await fs.writeFile(filePath, buffer);
  }

  const publicPath = buildMediaPublicPath(options.lang, options.slug, fileName);
  options.cache.set(decoded, publicPath);
  return publicPath;
};

const parseSrcsetUrls = (value: string) =>
  value
    .split(",")
    .map((part) => part.trim().split(/\s+/)[0])
    .filter(Boolean);

const collectHtmlImageUrls = (html: string) => {
  const matches = new Map<string, Set<string>>();
  const addUrl = (raw: string) => {
    const decoded = decodeHtmlEntities(raw);
    if (!isRemoteUrl(decoded)) {
      return;
    }
    const bucket = matches.get(decoded) ?? new Set<string>();
    bucket.add(raw);
    matches.set(decoded, bucket);
  };

  const srcRegex = /<img\b[^>]*?\bsrc=["']([^"']+)["'][^>]*>/gi;
  const srcsetRegex = /\bsrcset=["']([^"']+)["']/gi;
  let match: RegExpExecArray | null;

  while ((match = srcRegex.exec(html)) !== null) {
    addUrl(match[1]);
  }
  while ((match = srcsetRegex.exec(html)) !== null) {
    parseSrcsetUrls(match[1]).forEach(addUrl);
  }

  return matches;
};

const localizeHtmlImages = async (
  html: string,
  options: {
    rootDir: string;
    lang: string;
    slug: string;
    cache: Map<string, string>;
  },
) => {
  const matches = collectHtmlImageUrls(html);
  if (matches.size === 0) {
    return html;
  }

  let updated = html;
  for (const [decoded, raws] of matches) {
    const localized = await localizeImageUrl(decoded, {
      ...options,
      prefix: "image",
    });
    if (!localized || localized === decoded) {
      continue;
    }
    raws.forEach((raw) => {
      updated = updated.split(raw).join(localized);
    });
  }

  return updated;
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
  const { lang, slug } = resolvePostIdentity(payload);
  const postSegment = "post";
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
  const canonical = `${origin}/${lang}/${postSegment}/${slug}`;
  const publishedIso = formatIsoDate(publishedAt);
  const updatedIso = formatIsoDate(updatedAt ?? publishedAt);
  const safeTitle = escapeHtml(title);
  const safeDescription = escapeHtml(description);
  const safeImage = image ? escapeHtml(image) : "";
  const safeImageAlt = escapeHtml(imageAlt);

  return {
    lang,
    slug,
    meta: {
      title,
      description,
      image,
      imageAlt,
      publishedAt,
      updatedAt,
      contentRaw,
      contentHtml,
      keywords,
    },
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

const normalizeArray = (value: unknown): string[] | null => {
  if (!value) {
    return null;
  }
  if (Array.isArray(value)) {
    const values = value
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter(Boolean);
    return values.length > 0 ? values : null;
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) {
      return null;
    }
    return trimmed.split(/[,;]+/g).map((item) => item.trim()).filter(Boolean);
  }
  return null;
};

const resolveContentHtml = (payload: PostPayload) => {
  const html =
    pickString(payload, [
      "contentHtml",
      "conteudo_html",
      "html",
      "bodyHtml",
      "content_html",
      "conteudoHtml",
    ]) ?? "";
  if (html) {
    return html;
  }
  const content =
    pickString(payload, ["conteudo", "content", "body", "texto"]) ?? "";
  if (!content) {
    return "";
  }
  const hasHtml = /<[^>]+>/.test(content);
  if (hasHtml) {
    return content;
  }
  try {
    return marked.parse(content, { async: false });
  } catch {
    return "";
  }
};

const localizePostAssets = async (payload: PostPayload, rootDir: string) => {
  const { lang, slug } = resolvePostIdentity(payload);
  if (!slug) {
    return payload;
  }

  const cache = new Map<string, string>();
  const prefix = "image";
  const localize = (url: string | null) =>
    localizeImageUrl(url, { rootDir, lang, slug, prefix, cache });

  const coverImage =
    pickString(payload, ["cover_image_url", "image", "imageUrl"]) ?? null;
  const localizedCover = coverImage ? await localize(coverImage) : null;
  if (localizedCover) {
    payload.cover_image_url = localizedCover;
    payload.image = localizedCover;
    payload.imageUrl = localizedCover;
  }

  const thumbImage =
    pickString(payload, [
      "imageThumb",
      "image_thumb",
      "thumbnailUrl",
      "thumbnail_url",
      "thumb",
      "thumbUrl",
      "thumb_url",
      "imageThumbUrl",
      "image_thumb_url",
    ]) ?? null;
  const localizedThumb = thumbImage ? await localize(thumbImage) : null;
  if (localizedThumb) {
    payload.imageThumb = localizedThumb;
    payload.image_thumb = localizedThumb;
    payload.thumbnailUrl = localizedThumb;
    payload.thumbnail_url = localizedThumb;
    payload.thumb = localizedThumb;
    payload.thumbUrl = localizedThumb;
    payload.thumb_url = localizedThumb;
    payload.imageThumbUrl = localizedThumb;
    payload.image_thumb_url = localizedThumb;
  }

  const images =
    normalizeArray(payload.images ?? payload.imagens) ??
    normalizeArray(payload.galeria);
  if (images && images.length > 0) {
    const localizedImages: string[] = [];
    for (const image of images) {
      const localized = await localize(image);
      if (localized) {
        localizedImages.push(localized);
      }
    }
    if (localizedImages.length > 0) {
      payload.images = localizedImages;
      payload.imagens = localizedImages;
      payload.galeria = localizedImages;
    }
  }

  const contentHtml = resolveContentHtml(payload);
  if (contentHtml) {
    const localizedContent = await localizeHtmlImages(contentHtml, {
      rootDir,
      lang,
      slug,
      cache,
    });
    payload.contentHtml = localizedContent;
    payload.conteudo_html = localizedContent;
  }

  return payload;
};

const loadPostIndex = async (rootDir: string) => {
  const indexPath = path.join(rootDir, "posts.json");
  try {
    const raw = await fs.readFile(indexPath, "utf-8");
    const parsed = JSON.parse(raw) as { posts?: PostPayload[] };
    return Array.isArray(parsed.posts) ? parsed.posts : [];
  } catch {
    return [];
  }
};

const savePostIndex = async (rootDir: string, posts: PostPayload[]) => {
  const indexPath = path.join(rootDir, "posts.json");
  const payload = { posts };
  await fs.writeFile(indexPath, JSON.stringify(payload, null, 2), "utf-8");
};

const buildIndexEntry = (
  payload: PostPayload,
  lang: string,
  slug: string,
  meta: {
    title: string;
    description: string;
    image: string;
    imageAlt: string;
    publishedAt: string | null;
    updatedAt: string | null;
    contentRaw: string;
    contentHtml: string;
    keywords: string;
  },
) => {
  const id = pickString(payload, ["id", "uuid"]) ?? `post-${lang}-${slug}`;
  const tags =
    normalizeArray(payload.tags ?? payload.tag) ??
    normalizeArray(payload.etiquetas ?? payload.palavras_chave) ??
    normalizeArray(payload.keywords);
  const images =
    normalizeArray(payload.images ?? payload.imagens) ??
    normalizeArray(payload.galeria);

  return {
    ...payload,
    id,
    lang,
    slug,
    title: meta.title,
    excerpt: meta.description,
    description: meta.description,
    content: meta.contentRaw,
    contentHtml: meta.contentHtml,
    image: meta.image,
    imageAlt: meta.imageAlt,
    images: images ?? undefined,
    tags: tags ?? undefined,
    keywords: meta.keywords
      ? meta.keywords
          .split(/[,;]+/g)
          .map((item) => item.trim())
          .filter(Boolean)
      : undefined,
    publishedAt: meta.publishedAt ?? undefined,
    updatedAt: meta.updatedAt ?? undefined,
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
        .replace(/index\.html$/i, "")
        .replace(/\.html$/i, "");
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
  const normalizedPayload = await localizePostAssets(payload, rootDir);
  const { lang, slug, html, meta } = renderPostHtml(normalizedPayload);
  if (!slug) {
    throw new Error("Missing slug");
  }
  const postDir = path.join(rootDir, lang, "post", slug);
  await fs.mkdir(postDir, { recursive: true });
  await fs.writeFile(path.join(postDir, "index.html"), html, "utf-8");

  const posts = await loadPostIndex(rootDir);
  const entry = buildIndexEntry(normalizedPayload, lang, slug, meta);
  const existingIndex = posts.findIndex(
    (item) => item.slug === slug && item.lang === lang,
  );
  if (existingIndex >= 0) {
    posts[existingIndex] = { ...posts[existingIndex], ...entry };
  } else {
    posts.unshift(entry);
  }
  await savePostIndex(rootDir, posts);
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
    process.env.GENERATED_DIR?.trim() || path.resolve("/app/html-storage/posts");
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
    process.env.GENERATED_DIR?.trim() || path.resolve("/app/html-storage/posts");
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
