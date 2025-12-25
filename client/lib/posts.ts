import { defaultLang, languages, type Language } from "@/lib/i18n";
import { sendWebhook } from "@/lib/webhook";

export interface BlogPost {
  id: string;
  title: string;
  excerpt?: string;
  description?: string;
  content?: string;
  contentHtml?: string;
  category?: string;
  image?: string;
  imageAlt?: string;
  imageThumb?: string;
  images?: string[];
  tags?: string[];
  keywords?: string[];
  date?: string;
  author?: string;
  readTime?: string;
  slug?: string;
  slugs?: Partial<Record<Language, string>>;
  featured?: boolean;
  metaTitle?: string;
  metaDescription?: string;
  metaTags?: Array<{ name?: string; property?: string; content: string }>;
}

const stringValue = (value: unknown) => {
  const normalized =
    typeof value === "number"
      ? String(value)
      : typeof value === "string"
        ? value
        : null;
  if (!normalized) {
    return null;
  }
  const trimmed = normalized.trim();
  return trimmed ? trimmed : null;
};

const stringArrayValue = (value: unknown) => {
  if (!value) {
    return null;
  }
  const normalizeItem = (item: unknown) => {
    const primitive = stringValue(item);
    if (primitive) {
      return primitive;
    }
    if (item && typeof item === "object") {
      const record = item as Record<string, unknown>;
      const candidateKeys = [
        "url",
        "src",
        "image",
        "imageUrl",
        "href",
        "link",
      ];
      for (const key of candidateKeys) {
        const candidate = stringValue(record[key]);
        if (candidate) {
          return candidate;
        }
      }
    }
    return null;
  };
  if (Array.isArray(value)) {
    const values = value
      .map((item) => normalizeItem(item))
      .filter(Boolean) as string[];
    return values.length > 0 ? Array.from(new Set(values)) : null;
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) {
      return null;
    }
    if (
      (trimmed.startsWith("[") && trimmed.endsWith("]")) ||
      (trimmed.startsWith("{") && trimmed.endsWith("}"))
    ) {
      try {
        const parsed = JSON.parse(trimmed) as unknown;
        return stringArrayValue(parsed);
      } catch {
        // Fall through to delimiter parsing.
      }
    }
    const values = trimmed
      .split(/[,;]+/g)
      .map((item) => stringValue(item))
      .filter(Boolean) as string[];
    return values.length > 0 ? Array.from(new Set(values)) : null;
  }
  return null;
};

const normalizeHashtag = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  const withoutHash = trimmed.replace(/^#+/, "");
  return withoutHash ? withoutHash : null;
};

const normalizeHashtagList = (values: string[] | null) => {
  if (!values) {
    return null;
  }
  const normalized = values
    .map((value) => normalizeHashtag(value))
    .filter(Boolean) as string[];
  return normalized.length > 0 ? Array.from(new Set(normalized)) : null;
};

const parseHashtagsValue = (value: unknown): string[] | null => {
  if (!value) {
    return null;
  }
  if (Array.isArray(value)) {
    const values = value
      .map((item) => stringValue(item))
      .filter(Boolean) as string[];
    return normalizeHashtagList(values);
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) {
      return null;
    }
    if (
      (trimmed.startsWith("[") && trimmed.endsWith("]")) ||
      (trimmed.startsWith("{") && trimmed.endsWith("}"))
    ) {
      try {
        const parsed = JSON.parse(trimmed) as unknown;
        return parseHashtagsValue(parsed);
      } catch {
        // Fall through to delimiter parsing.
      }
    }
    const parts = /#/.test(trimmed)
      ? trimmed.split(/\s+/g)
      : trimmed.split(/[,;]+/g);
    const values = parts
      .map((item) => stringValue(item))
      .filter(Boolean) as string[];
    return normalizeHashtagList(values);
  }
  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    const candidateKeys = ["tags", "values", "items", "list"];
    for (const key of candidateKeys) {
      const extracted = parseHashtagsValue(record[key]);
      if (extracted && extracted.length > 0) {
        return extracted;
      }
    }
  }
  return null;
};

const extractDriveId = (value: string) => {
  const driveShortMatch = value.match(
    /^https?:\/\/lh3\.googleusercontent\.com\/(?:u\/\d+\/)?d\/([^/?#]+)/i,
  );
  if (driveShortMatch) {
    return driveShortMatch[1];
  }
  const driveFileMatch = value.match(
    /^https?:\/\/drive\.google\.com\/file\/d\/([^/]+)\/?/i,
  );
  if (driveFileMatch) {
    return driveFileMatch[1];
  }
  const driveOpenMatch = value.match(
    /^https?:\/\/drive\.google\.com\/open\?id=([^&]+)/i,
  );
  if (driveOpenMatch) {
    return driveOpenMatch[1];
  }
  const driveUcMatch = value.match(
    /^https?:\/\/drive\.google\.com\/uc\?[^#]*id=([^&]+)/i,
  );
  if (driveUcMatch) {
    return driveUcMatch[1];
  }
  const driveThumbMatch = value.match(
    /^https?:\/\/drive\.google\.com\/thumbnail\?[^#]*id=([^&]+)/i,
  );
  if (driveThumbMatch) {
    return driveThumbMatch[1];
  }
  return null;
};

const buildDriveImage = (id: string) =>
  `https://lh3.googleusercontent.com/d/${id}`;

const buildDriveThumbnail = (id: string, size: string) =>
  `https://drive.google.com/thumbnail?id=${id}&sz=${size}`;

const normalizeImageUrl = (value: string | null) => {
  if (!value) {
    return null;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  const driveId = extractDriveId(trimmed);
  if (driveId) {
    return buildDriveImage(driveId);
  }
  return trimmed;
};

const normalizeImageThumbnailUrl = (
  value: string | null,
  size = "w1200",
) => {
  if (!value) {
    return null;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  const driveId = extractDriveId(trimmed);
  if (driveId) {
    return buildDriveThumbnail(driveId, size);
  }
  return trimmed;
};

const normalizeImageList = (values: string[] | null) => {
  if (!values) {
    return null;
  }
  const normalized = values
    .map((item) => normalizeImageUrl(item))
    .filter(Boolean) as string[];
  if (normalized.length === 0) {
    return null;
  }
  return Array.from(new Set(normalized));
};

const formatReadTimeValue = (value: string | null) => {
  if (!value) {
    return null;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  if (/^\d+([.,]\d+)?$/.test(trimmed)) {
    return `${trimmed} min`;
  }
  return trimmed;
};

const booleanValue = (value: unknown) => {
  if (typeof value === "boolean") {
    return value;
  }
  if (value === 1) {
    return true;
  }
  if (value === 0) {
    return false;
  }
  if (value === "true") {
    return true;
  }
  if (value === "false") {
    return false;
  }
  return null;
};

const pickString = (record: Record<string, unknown>, keys: string[]) => {
  for (const key of keys) {
    const value = stringValue(record[key]);
    if (value) {
      return value;
    }
  }
  return null;
};

const pickStringArray = (record: Record<string, unknown>, keys: string[]) => {
  for (const key of keys) {
    const value = stringArrayValue(record[key]);
    if (value) {
      return value;
    }
  }
  return null;
};

const LANGUAGE_VARIANTS: Record<Language, string[]> = {
  pt: ["pt", "pt-br", "pt_br", "ptbr", "pt-BR", "pt_BR", "ptBR"],
  en: ["en", "en-us", "en_us", "enus", "en-US", "en_US", "enUS"],
  es: ["es", "es-es", "es_es", "eses", "es-ES", "es_ES", "esES"],
};

const TRANSLATION_CONTAINERS = [
  "translations",
  "translation",
  "i18n",
  "locales",
  "languages",
] as const;

const getLanguageVariants = (lang: Language) =>
  LANGUAGE_VARIANTS[lang] ?? [lang];

const buildLocalizedKeys = (key: string, lang: Language) => {
  const variants = new Set<string>();
  const suffixes = getLanguageVariants(lang);
  const upper = lang.toUpperCase();
  const titleCase = `${lang.charAt(0).toUpperCase()}${lang.slice(1)}`;

  variants.add(`${key}${titleCase}`);
  variants.add(`${key}${upper}`);

  suffixes.forEach((suffix) => {
    variants.add(`${key}_${suffix}`);
    variants.add(`${key}-${suffix}`);
  });

  return Array.from(variants);
};

const pickFromLanguageObject = <T>(
  value: unknown,
  lang: Language,
  extractor: (input: unknown) => T | null,
) => {
  if (!value || typeof value !== "object") {
    return null;
  }
  const record = value as Record<string, unknown>;
  for (const variant of getLanguageVariants(lang)) {
    const candidate = extractor(record[variant]);
    if (candidate) {
      return candidate;
    }
  }
  return null;
};

const pickFromRecord = <T>(
  record: Record<string, unknown>,
  keys: string[],
  extractor: (input: unknown) => T | null,
) => {
  for (const key of keys) {
    const value = extractor(record[key]);
    if (value) {
      return value;
    }
  }
  return null;
};

const pickFromTranslationContainer = <T>(
  record: Record<string, unknown>,
  keys: string[],
  lang: Language,
  extractor: (input: unknown) => T | null,
) => {
  for (const containerKey of TRANSLATION_CONTAINERS) {
    const containerValue = record[containerKey];
    if (!containerValue || typeof containerValue !== "object") {
      continue;
    }
    const container = containerValue as Record<string, unknown>;

    for (const variant of getLanguageVariants(lang)) {
      const langRecord = container[variant];
      if (langRecord && typeof langRecord === "object") {
        const value = pickFromRecord(
          langRecord as Record<string, unknown>,
          keys,
          extractor,
        );
        if (value) {
          return value;
        }
      }
    }

    for (const key of keys) {
      const value = pickFromLanguageObject(container[key], lang, extractor);
      if (value) {
        return value;
      }
    }
  }
  return null;
};

const pickLocalizedValue = <T>(
  record: Record<string, unknown>,
  keys: string[],
  lang: Language,
  extractor: (input: unknown) => T | null,
  fallbackToBase = true,
) => {
  for (const key of keys) {
    for (const localizedKey of buildLocalizedKeys(key, lang)) {
      const value = extractor(record[localizedKey]);
      if (value) {
        return value;
      }
    }
    const nestedValue = pickFromLanguageObject(record[key], lang, extractor);
    if (nestedValue) {
      return nestedValue;
    }
  }

  const containerValue = pickFromTranslationContainer(
    record,
    keys,
    lang,
    extractor,
  );
  if (containerValue) {
    return containerValue;
  }

  return fallbackToBase ? pickFromRecord(record, keys, extractor) : null;
};

const pickLocalizedString = (
  record: Record<string, unknown>,
  keys: string[],
  lang: Language,
  fallbackToBase = true,
) => pickLocalizedValue(record, keys, lang, stringValue, fallbackToBase);

const pickLocalizedStringArray = (
  record: Record<string, unknown>,
  keys: string[],
  lang: Language,
  fallbackToBase = true,
) => pickLocalizedValue(record, keys, lang, stringArrayValue, fallbackToBase);

const collectLocalizedStrings = (
  record: Record<string, unknown>,
  keys: string[],
) => {
  const collected: Partial<Record<Language, string>> = {};
  languages.forEach((lang) => {
    const value = pickLocalizedString(
      record,
      keys,
      lang,
      lang === defaultLang,
    );
    if (value) {
      collected[lang] = value;
    }
  });
  return collected;
};

const parseMetaTagsFromHtml = (
  value: string,
): Array<{ name?: string; property?: string; content: string }> | undefined => {
  const matches = value.match(/<meta\s+[^>]*>/gi);
  if (!matches) {
    return undefined;
  }

  const tags: Array<{ name?: string; property?: string; content: string }> = [];
  const attrRegex = /([a-zA-Z:-]+)\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/g;

  matches.forEach((tag) => {
    const attrs: Record<string, string> = {};
    let match: RegExpExecArray | null;
    while ((match = attrRegex.exec(tag))) {
      const attrName = match[1].toLowerCase();
      const attrValue = match[3] ?? match[4] ?? match[5] ?? "";
      if (attrValue) {
        attrs[attrName] = attrValue;
      }
    }

    const content = attrs.content;
    const name = attrs.name;
    const property = attrs.property;
    if (content && (name || property)) {
      tags.push({ name, property, content });
    }
  });

  return tags.length > 0 ? tags : undefined;
};

const parseMetaTags = (
  value: unknown,
): Array<{ name?: string; property?: string; content: string }> | undefined => {
  if (!value) {
    return undefined;
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) {
      return undefined;
    }
    if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
      try {
        const parsed = JSON.parse(trimmed) as unknown;
        return parseMetaTags(parsed);
      } catch {
        // Fall through to HTML parsing.
      }
    }
    return parseMetaTagsFromHtml(trimmed);
  }
  if (Array.isArray(value)) {
    const tags = value.flatMap((item) => {
      if (typeof item === "string") {
        return parseMetaTagsFromHtml(item) ?? [];
      }
      if (!item || typeof item !== "object") {
        return [];
      }
      const record = item as Record<string, unknown>;
      const content = stringValue(record.content);
      if (!content) {
        return [];
      }
      const name = stringValue(record.name);
      const property = stringValue(record.property);
      return [{ name: name ?? undefined, property: property ?? undefined, content }];
    });
    return tags.length > 0 ? tags : undefined;
  }
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    const tags = Object.entries(record)
      .map(([key, contentValue]) => {
        const content = stringValue(contentValue);
        if (!content) {
          return null;
        }
        return { name: key, content };
      })
      .filter(Boolean) as Array<{ name?: string; property?: string; content: string }>;
    return tags.length > 0 ? tags : undefined;
  }
  return undefined;
};

const extractPostArray = (payload: unknown): unknown[] => {
  if (Array.isArray(payload)) {
    return payload;
  }
  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    if (Array.isArray(record.posts)) {
      return record.posts;
    }
    if (Array.isArray(record.data)) {
      return record.data;
    }
    if (record.data && typeof record.data === "object") {
      const nested = record.data as Record<string, unknown>;
      if (Array.isArray(nested.posts)) {
        return nested.posts;
      }
    }
  }
  return [];
};

export function normalizePosts(
  payload: unknown,
  lang: Language = defaultLang,
): BlogPost[] {
  const list = extractPostArray(payload);

  return list
    .map((item, index) => {
      if (!item || typeof item !== "object") {
        return null;
      }
      const record = item as Record<string, unknown>;
      const title = pickLocalizedString(
        record,
        ["title", "titulo", "name", "headline"],
        lang,
      );
      if (!title) {
        return null;
      }

      const id =
        pickString(record, ["id", "slug", "uuid"]) ?? `post-${index}`;
      const excerpt = pickLocalizedString(
        record,
        ["excerpt", "summary", "resumo", "descricao", "description"],
        lang,
      );
      const description =
        pickLocalizedString(
          record,
          ["description", "descricao", "summary", "resumo"],
          lang,
        ) ?? undefined;
      const contentHtml = pickLocalizedString(
        record,
        [
          "contentHtml",
          "html",
          "bodyHtml",
          "content_html",
          "conteudo_html",
          "conteudoHtml",
        ],
        lang,
      );
      const content = pickLocalizedString(
        record,
        ["content", "body", "texto", "text", "conteudo"],
        lang,
      );
      const category = pickString(record, ["category", "categoria", "tag"]);
      const image = pickString(record, [
        "image",
        "coverImage",
        "imageUrl",
        "thumbnail",
        "cover",
        "imagem",
        "imagemUrl",
        "imagem_url",
        "imagem_capa",
        "capa",
        "cover_image_url",
        "cover_image",
        "coverImageUrl",
      ]);
      const imageThumb = pickString(record, [
        "imageThumb",
        "image_thumb",
        "thumbnailUrl",
        "thumbnail_url",
        "thumb",
        "thumbUrl",
        "thumb_url",
        "imageThumbUrl",
        "image_thumb_url",
      ]);
      const imageAlt = pickLocalizedString(
        record,
        [
          "imageAlt",
          "image_alt",
          "cover_image_alt",
          "coverImageAlt",
          "imagem_alt",
          "alt",
        ],
        lang,
      );
      const images = pickStringArray(record, [
        "images",
        "imagens",
        "gallery",
        "galeria",
        "media",
      ]);
      const date = pickString(record, [
        "date",
        "publishedAt",
        "published_at",
        "publicado_em",
        "createdAt",
        "created_at",
        "criado_em",
        "updatedAt",
        "updated_at",
        "atualizado_em",
      ]);
      const author = pickString(record, [
        "author",
        "authorName",
        "autor",
      ]);
      const readTime = formatReadTimeValue(
        pickString(record, [
          "readTime",
          "readingTime",
          "tempo_leitura_minutos",
          "tempoLeituraMinutos",
          "read_time_minutes",
          "reading_time_minutes",
          "readingTimeMinutes",
        ]),
      );
      const slugMap = collectLocalizedStrings(record, ["slug"]);
      const slug =
        pickLocalizedString(record, ["slug"], lang) ?? slugMap[lang];
      const featured = booleanValue(record.featured) ?? undefined;
      const metaTitle = pickLocalizedString(
        record,
        [
          "metaTitle",
          "meta_title",
          "seoTitle",
          "seo_title",
          "titleSeo",
          "titleSEO",
        ],
        lang,
      );
      const metaDescription = pickLocalizedString(
        record,
        [
          "metaDescription",
          "meta_description",
          "seoDescription",
          "seo_description",
          "descriptionMeta",
        ],
        lang,
      );
      const keywords = pickLocalizedStringArray(
        record,
        [
          "keywords",
          "keyword",
          "palavras_chave",
          "palavrasChave",
          "palavras-chave",
          "seoKeywords",
          "seo_keywords",
        ],
        lang,
      );
      const hashtags =
        pickLocalizedValue(
          record,
          ["hashtags", "hashTags", "hash_tags"],
          lang,
          parseHashtagsValue,
        ) ?? parseHashtagsValue(record.hashtags);
      const tags =
        normalizeHashtagList(
          hashtags ??
            pickLocalizedStringArray(record, ["tags", "tag"], lang) ??
            keywords ??
            null,
        ) ?? undefined;
      const metaTags = parseMetaTags(
        record.metaTags ?? record.meta_tags ?? record.meta,
      );
      const normalizedImage = normalizeImageUrl(image);
      const normalizedImages = normalizeImageList(images);
      const coverImage = normalizedImage ?? normalizedImages?.[0] ?? null;
      const coverImageThumb =
        normalizeImageThumbnailUrl(imageThumb ?? coverImage) ??
        normalizeImageUrl(imageThumb) ??
        coverImage;

      return {
        id,
        title,
        excerpt: excerpt ?? undefined,
        description,
        content: content ?? undefined,
        contentHtml: contentHtml ?? undefined,
        category: category ?? undefined,
        image: coverImage ?? undefined,
        imageAlt: imageAlt ?? undefined,
        imageThumb: coverImageThumb ?? undefined,
        images: normalizedImages ?? undefined,
        tags: tags ?? undefined,
        keywords: keywords ?? undefined,
        date: date ?? undefined,
        author: author ?? undefined,
        readTime: readTime ?? undefined,
        slug: slug ?? undefined,
        slugs: Object.keys(slugMap).length > 0 ? slugMap : undefined,
        featured,
        metaTitle: metaTitle ?? undefined,
        metaDescription: metaDescription ?? description ?? undefined,
        metaTags,
      } satisfies BlogPost;
    })
    .filter(Boolean) as BlogPost[];
}

export async function fetchPosts(lang: Language): Promise<BlogPost[]> {
  const response = await sendWebhook({ action: "get_posts", lang });
  return normalizePosts(response, lang);
}

export async function editPost(
  post: BlogPost,
  lang: Language,
  token?: string,
) {
  const categoria = post.category ?? undefined;
  return sendWebhook({
    action: "edit_post",
    lang,
    id: post.id,
    title: post.title,
    slug: post.slug ?? undefined,
    excerpt: post.excerpt ?? undefined,
    description: post.description ?? undefined,
    content: post.content ?? undefined,
    contentHtml: post.contentHtml ?? undefined,
    categoria,
    category: categoria,
    image: post.image ?? undefined,
    imageAlt: post.imageAlt ?? undefined,
    imageThumb: post.imageThumb ?? undefined,
    images: post.images ?? undefined,
    tags: post.tags ?? undefined,
    date: post.date ?? undefined,
    author: post.author ?? undefined,
    readTime: post.readTime ?? undefined,
    featured: post.featured ?? undefined,
    metaTitle: post.metaTitle ?? undefined,
    metaDescription: post.metaDescription ?? undefined,
    metaTags: post.metaTags ?? undefined,
    token,
  });
}

export async function deletePost(
  post: BlogPost,
  lang: Language,
  token?: string,
) {
  return sendWebhook({
    action: "delete_post",
    lang,
    id: post.id,
    slug: post.slug ?? undefined,
    token,
  });
}
