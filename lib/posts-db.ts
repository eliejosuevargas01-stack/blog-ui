import { promises as fs } from "fs";
import path from "path";
import { createHash } from "crypto";
import { marked } from "marked";


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
  const lang = (supportedLangs.has(langRaw as Language) ? langRaw : "pt") as Language;
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
    return { raw: htmlInput, html: marked.parse(htmlInput) as string };
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
  return { raw: contentInput, html: marked.parse(contentInput) as string };
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

const resolveLegacyIndexPath = (rootDir: string) =>
  path.join(rootDir, "posts.json");

const resolveLangIndexPath = (rootDir: string, lang: Language) =>
  path.join(rootDir, lang, "posts.json");

const readIndexFile = async (indexPath: string): Promise<PostPayload[] | null> => {
  try {
    const raw = await fs.readFile(indexPath, "utf-8");
    const parsed = JSON.parse(raw) as { posts?: PostPayload[] };
    return Array.isArray(parsed.posts) ? parsed.posts : [];
  } catch {
    return null;
  }
};

const loadPostsByLang = async (
  rootDir: string,
): Promise<Record<Language, PostPayload[]>> => {
  const initial: Record<Language, PostPayload[]> = { pt: [], en: [], es: [] };
  let hasPerLang = false;

  await Promise.all(
    languages.map(async (lang) => {
      const indexPath = resolveLangIndexPath(rootDir, lang);
      const posts = await readIndexFile(indexPath);
      if (posts) {
        initial[lang] = posts;
        hasPerLang = true;
      }
    }),
  );

  if (hasPerLang) {
    return initial;
  }

  const legacyPosts = await readIndexFile(resolveLegacyIndexPath(rootDir));
  if (!legacyPosts) {
    return initial;
  }

  languages.forEach((lang) => {
    initial[lang] = legacyPosts.filter(
      (post) => typeof post.lang === "string" && post.lang === lang,
    );
  });

  return initial;
};

const savePostsForLang = async (
  rootDir: string,
  lang: Language,
  posts: PostPayload[],
) => {
  const indexPath = resolveLangIndexPath(rootDir, lang);
  await fs.mkdir(path.dirname(indexPath), { recursive: true });
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



const resolveDeleteCandidates = (
  payload: PostPayload,
  posts: PostPayload[],
) => {
  const slugRaw = pickString(payload, ["slug", "postSlug"]) ?? "";
  const slug = slugRaw ? normalizeSlug(slugRaw) : "";
  const id = pickString(payload, ["id", "uuid"]) ?? "";
  const slugsPayload = payload.slugs;
  const slugs =
    slugsPayload && typeof slugsPayload === "object"
      ? Object.values(slugsPayload as Record<string, unknown>)
          .map((value) => (typeof value === "string" ? normalizeSlug(value) : ""))
          .filter(Boolean)
      : [];

  return posts.filter((post) => {
    if (!post || typeof post !== "object") {
      return false;
    }
    const record = post as Record<string, unknown>;
    const postId = pickString(record, ["id", "uuid"]) ?? "";
    const postSlug = pickString(record, ["slug"]) ?? "";
    const postSlugsRaw = record.slugs;
    const postSlugs =
      postSlugsRaw && typeof postSlugsRaw === "object"
        ? Object.values(postSlugsRaw as Record<string, unknown>)
            .map((value) =>
              typeof value === "string" ? normalizeSlug(value) : "",
            )
            .filter(Boolean)
        : [];

    if (id && postId === id) {
      return true;
    }
    if (slug && normalizeSlug(postSlug) === slug) {
      return true;
    }
    if (slug && postSlugs.includes(slug)) {
      return true;
    }
    if (slugs.length > 0 && postSlugs.some((value) => slugs.includes(value))) {
      return true;
    }
    if (slugs.length > 0 && slugs.includes(normalizeSlug(postSlug))) {
      return true;
    }
  return false;
  });
};

const deletePostAssets = async (rootDir: string, entry: PostPayload) => {
  const record = entry as Record<string, unknown>;
  const lang = pickString(record, ["lang"]) ?? "pt";
  const slug = pickString(record, ["slug"]) ?? "";
  if (!slug) {
    return [];
  }
  const mediaDir = path.join(rootDir, "media", lang, slug);
  await fs.rm(mediaDir, { recursive: true, force: true });
  return [mediaDir];
};

export const publishPost = async (payload: PostPayload, rootDir: string) => {
  const normalizedPayload = await localizePostAssets(payload, rootDir);
  const { lang: langRaw, slug, html, meta } = renderPostHtml(normalizedPayload);
  const lang = langRaw as Language;
  if (!slug) {
    throw new Error("Missing slug");
  }

  const postsByLang = await loadPostsByLang(rootDir);
  const posts = postsByLang[lang];
  const entry = buildIndexEntry(normalizedPayload, lang, slug, meta);
  const id = entry.id;
  const existingIndex = posts.findIndex(
    (item) => (item.id === id || item.slug === slug) && item.lang === lang,
  );
  if (existingIndex >= 0) {
    posts[existingIndex] = { ...posts[existingIndex], ...entry };
  } else {
    posts.unshift(entry);
  }
  postsByLang[lang] = posts;
  await savePostsForLang(rootDir, lang, posts);
};



const resolveSlugForLang = (
  payload: PostPayload,
  lang: Language,
) => {
  const record = payload as Record<string, unknown>;
  const slugMapRaw = record.slugs;
  if (slugMapRaw && typeof slugMapRaw === "object") {
    const fromMap = slugMapRaw as Record<string, unknown>;
    const mapped = fromMap[lang];
    if (typeof mapped === "string" && mapped.trim()) {
      return normalizeSlug(mapped);
    }
  }

  const direct = pickString(record, [
    `slug_${lang}`,
    `slug-${lang}`,
    `slug${lang.toUpperCase()}`,
    `slug${lang.charAt(0).toUpperCase()}${lang.slice(1)}`,
  ]);
  if (direct) {
    return normalizeSlug(direct);
  }

  return null;
};

const buildSlugMap = (
  payload: PostPayload,
  lang: Language,
  slug: string,
): Partial<Record<Language, string>> => {
  const map: Partial<Record<Language, string>> = { [lang]: slug };
  languages.forEach((code) => {
    if (code === lang) {
      return;
    }
    const resolved = resolveSlugForLang(payload, code);
    if (resolved) {
      map[code] = resolved;
    }
  });
  return map;
};

export {
  loadPostsByLang,
  savePostsForLang,
  deletePostAssets,
  resolveDeleteCandidates,
  resolvePostIdentity,
  buildSlugMap,
  resolveSiteOrigin,
  pickString,
};
