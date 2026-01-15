import { promises as fs } from "fs";
import path from "path";
import { createHash } from "crypto";
import { marked } from "marked";
import type { RequestHandler } from "express";

type PostPayload = Record<string, unknown>;

const languages = ["pt", "en", "es"] as const;
type Language = (typeof languages)[number];
const supportedLangs = new Set<Language>(languages);

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

const slugifyFromText = (value: string) => {
  const normalized = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9\s-]/g, " ")
    .replace(/\s+/g, "-");
  return normalizeSlug(normalized);
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

const resolveTranslateConfig = () => ({
  url: process.env.VITE_TRANSLATE_URL ?? "https://libretranslate.com/translate",
  key: process.env.VITE_TRANSLATE_KEY ?? undefined,
});

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

const parseStructuredContent = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed.startsWith("{") || !trimmed.endsWith("}")) {
    return null;
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    return null;
  }
  if (!parsed || typeof parsed !== "object") {
    return null;
  }
  const record = parsed as Record<string, unknown>;
  const paragraphs: string[] = [];
  const numberedKeys = Object.keys(record)
    .filter((key) => /^paragrafo_\d+$/.test(key))
    .sort((a, b) => {
      const left = Number(a.split("_")[1]);
      const right = Number(b.split("_")[1]);
      return left - right;
    });
  numberedKeys.forEach((key) => {
    const value = record[key];
    if (typeof value === "string" && value.trim()) {
      paragraphs.push(value.trim());
    }
  });
  const tech = record.paragrafos_explicacao_tecnologica;
  if (Array.isArray(tech)) {
    tech.forEach((value) => {
      if (typeof value === "string" && value.trim()) {
        paragraphs.push(value.trim());
      }
    });
  }
  const finalParagraph = record.paragrafo_final;
  if (typeof finalParagraph === "string" && finalParagraph.trim()) {
    paragraphs.push(finalParagraph.trim());
  }
  if (paragraphs.length === 0) {
    return null;
  }
  return {
    text: paragraphs.join("\n\n"),
    html: paragraphs.map((text) => `<p>${escapeHtml(text)}</p>`).join("\n"),
  };
};

const resolveContentParts = (payload: PostPayload) => {
  const htmlInput =
    pickString(payload, ["contentHtml", "conteudo_html"]) ?? "";
  if (htmlInput) {
    const hasHtml = /<[^>]+>/.test(htmlInput);
    if (hasHtml) {
      return { raw: htmlInput, html: htmlInput };
    }
    return { raw: htmlInput, html: marked.parse(htmlInput) };
  }
  const contentInput =
    pickString(payload, ["conteudo", "content", "body", "texto"]) ?? "";
  if (!contentInput) {
    return { raw: "", html: "" };
  }
  const structured = parseStructuredContent(contentInput);
  if (structured) {
    return { raw: structured.text, html: structured.html };
  }
  const hasHtml = /<[^>]+>/.test(contentInput);
  if (hasHtml) {
    return { raw: contentInput, html: contentInput };
  }
  return { raw: contentInput, html: marked.parse(contentInput) };
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
  const { raw: contentRaw, html: contentHtml } = resolveContentParts(payload);
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

const MAX_TRANSLATE_CHARS = 4000;
const HTML_SPLIT_REGEX =
  /(<\/(?:p|h[1-6]|li|blockquote|pre|code|section|article|div)>|<br\s*\/?>)/gi;
const HTML_BOUNDARY_REGEX =
  /^(<\/(?:p|h[1-6]|li|blockquote|pre|code|section|article|div)>|<br\s*\/?>)$/i;

const splitTextUnits = (value: string) => {
  const parts = value.split(/\n\s*\n+/g).filter((part) => part.trim());
  return parts.length > 0 ? parts : [value];
};

const splitHtmlUnits = (value: string) => {
  const parts = value.split(HTML_SPLIT_REGEX).filter(Boolean);
  if (parts.length <= 1) {
    return [value];
  }
  const units: string[] = [];
  let buffer = "";
  for (const part of parts) {
    buffer += part;
    if (HTML_BOUNDARY_REGEX.test(part)) {
      units.push(buffer);
      buffer = "";
    }
  }
  if (buffer) {
    units.push(buffer);
  }
  return units.length > 0 ? units : [value];
};

const splitByLength = (value: string, maxLength: number) => {
  const chunks: string[] = [];
  for (let index = 0; index < value.length; index += maxLength) {
    chunks.push(value.slice(index, index + maxLength));
  }
  return chunks.length > 0 ? chunks : [value];
};

const splitBySentences = (value: string) => {
  const matches = value.match(/[^.!?]+[.!?]+|[^.!?]+$/g);
  if (!matches) {
    return [value];
  }
  const sentences = matches.map((sentence) => sentence.trim()).filter(Boolean);
  return sentences.length > 0 ? sentences : [value];
};

const splitLongTextUnits = (units: string[], maxLength: number) => {
  const expanded: string[] = [];
  for (const unit of units) {
    if (unit.length <= maxLength) {
      expanded.push(unit);
      continue;
    }
    const sentences = splitBySentences(unit);
    for (const sentence of sentences) {
      if (sentence.length <= maxLength) {
        expanded.push(sentence);
      } else {
        expanded.push(...splitByLength(sentence, maxLength));
      }
    }
  }
  return expanded.length > 0 ? expanded : units;
};

const groupUnits = (
  units: string[],
  maxLength: number,
  separator: string,
) => {
  const chunks: string[] = [];
  let buffer = "";

  for (const unit of units) {
    const candidate = buffer ? `${buffer}${separator}${unit}` : unit;
    if (candidate.length > maxLength && buffer) {
      chunks.push(buffer);
      buffer = unit;
      continue;
    }
    buffer = candidate;
  }

  if (buffer) {
    chunks.push(buffer);
  }

  return chunks.length > 0 ? chunks : [units.join(separator)];
};

const translateChunk = async (
  value: string,
  from: Language,
  to: Language,
  format: "text" | "html",
) => {
  const { url, key } = resolveTranslateConfig();
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      q: value,
      source: from,
      target: to,
      api_key: key,
      format,
    }),
  });
  if (!response.ok) {
    throw new Error(`Translate failed (${response.status})`);
  }
  const data = (await response.json()) as { translatedText?: string; error?: string };
  if (!data || data.error || !data.translatedText) {
    throw new Error(data?.error ?? "Translate failed");
  }
  return data.translatedText;
};

const safeTranslateChunk = async (
  value: string,
  from: Language,
  to: Language,
  format: "text" | "html",
) => {
  try {
    return await translateChunk(value, from, to, format);
  } catch {
    return value;
  }
};

const translateInChunks = async (
  value: string,
  from: Language,
  to: Language,
  format: "text" | "html",
) => {
  const separator = format === "text" ? "\n\n" : "";
  const baseUnits =
    format === "html" ? splitHtmlUnits(value) : splitTextUnits(value);
  const units =
    format === "html"
      ? baseUnits
      : splitLongTextUnits(baseUnits, MAX_TRANSLATE_CHARS);
  const chunks = groupUnits(units, MAX_TRANSLATE_CHARS, separator);
  if (chunks.length === 1) {
    return safeTranslateChunk(chunks[0] ?? value, from, to, format);
  }
  const translated: string[] = [];
  for (const chunk of chunks) {
    translated.push(await safeTranslateChunk(chunk, from, to, format));
  }
  return translated.join(separator);
};

const translateValue = async (
  value: string | undefined,
  from: Language,
  to: Language,
  format: "text" | "html",
) => {
  if (!value) {
    return value;
  }
  if (from === to) {
    return value;
  }
  if (!value.trim()) {
    return value;
  }
  if (value.length > MAX_TRANSLATE_CHARS) {
    return translateInChunks(value, from, to, format);
  }
  return safeTranslateChunk(value, from, to, format);
};

const resolveContentHtml = (payload: PostPayload) =>
  resolveContentParts(payload).html;

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

const buildSlugMap = async (
  payload: PostPayload,
  sourceLang: Language,
  slug: string,
) => {
  const { meta } = renderPostHtml(payload);
  const map: Record<Language, string> = {
    pt: slug,
    en: slug,
    es: slug,
  };

  for (const lang of languages) {
    if (lang === sourceLang) {
      continue;
    }
    const translatedTitle = await translateValue(
      meta.title,
      sourceLang,
      lang,
      "text",
    );
    const candidate =
      translatedTitle && translatedTitle.trim()
        ? slugifyFromText(translatedTitle)
        : "";
    map[lang] = candidate || slug;
  }

  return map;
};

const applyTranslatedValue = (
  payload: PostPayload,
  keys: string[],
  value?: string,
) => {
  if (!value) {
    return;
  }
  keys.forEach((key) => {
    payload[key] = value;
  });
};

const translatePostPayload = async (
  payload: PostPayload,
  sourceLang: Language,
  targetLang: Language,
  slugMap: Record<Language, string>,
) => {
  const { meta } = renderPostHtml(payload);
  const translated: PostPayload = {
    ...payload,
    lang: targetLang,
    slug: slugMap[targetLang],
    slugs: slugMap,
  };

  const title = await translateValue(meta.title, sourceLang, targetLang, "text");
  const description = await translateValue(
    meta.description,
    sourceLang,
    targetLang,
    "text",
  );
  const contentRaw = await translateValue(
    meta.contentRaw,
    sourceLang,
    targetLang,
    "text",
  );
  const contentHtml = await translateValue(
    meta.contentHtml,
    sourceLang,
    targetLang,
    "html",
  );
  const imageAlt = await translateValue(
    meta.imageAlt,
    sourceLang,
    targetLang,
    "text",
  );

  applyTranslatedValue(
    translated,
    ["meta_title", "metaTitle", "seo_title", "seoTitle", "titulo", "title", "headline"],
    title,
  );
  applyTranslatedValue(
    translated,
    ["meta_description", "metaDescription", "resumo", "excerpt", "summary", "description"],
    description,
  );
  applyTranslatedValue(
    translated,
    ["contentHtml", "conteudo_html"],
    contentHtml,
  );
  applyTranslatedValue(
    translated,
    ["conteudo", "content", "body", "texto"],
    contentRaw,
  );
  applyTranslatedValue(
    translated,
    ["cover_image_alt", "imageAlt", "image_alt"],
    imageAlt,
  );

  return translated;
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

    const published = [];
    const logs: string[] = [];

    for (const post of posts) {
      const basePayload = post as PostPayload;
      const { lang: sourceLang, slug } = resolvePostIdentity(basePayload);
      if (!slug) {
        throw new Error("Missing slug");
      }
      logs.push(`publish:start slug=${slug} lang=${sourceLang}`);
      const slugMap = await buildSlugMap(basePayload, sourceLang, slug);
      const seedPayload: PostPayload = {
        ...basePayload,
        lang: sourceLang,
        slug,
        slugs: slugMap,
      };

      const variants = await Promise.all(
        languages.map(async (targetLang) =>
          targetLang === sourceLang
            ? seedPayload
            : translatePostPayload(seedPayload, sourceLang, targetLang, slugMap),
        ),
      );

      for (const variant of variants) {
        await publishPost(variant, rootDir);
        const targetLang = resolvePostIdentity(variant).lang;
        const targetSlug = resolvePostIdentity(variant).slug || slugMap[targetLang];
        logs.push(`publish:done lang=${targetLang} slug=${targetSlug}`);
      }

      published.push({
        slug,
        links: {
          pt: `${origin}/pt/post/${slugMap.pt}`,
          en: `${origin}/en/post/${slugMap.en}`,
          es: `${origin}/es/post/${slugMap.es}`,
        },
      });
      logs.push(`publish:links pt=${slugMap.pt} en=${slugMap.en} es=${slugMap.es}`);
    }
    await buildSitemap(rootDir, origin);
    logs.push("sitemap:rebuilt");

    res.json({ ok: true, count: posts.length, posts: published, logs });
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
