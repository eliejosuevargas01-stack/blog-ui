import translate, { Translate } from "translate";

import type { Language } from "@/lib/i18n";
import type { BlogPost } from "@/lib/posts";

const TRANSLATE_URL =
  import.meta.env.VITE_TRANSLATE_URL ?? "https://libretranslate.com/translate";
const TRANSLATE_KEY = import.meta.env.VITE_TRANSLATE_KEY ?? undefined;
const CACHE_TTL = 1000 * 60 * 60 * 12;
const MAX_TRANSLATE_CHARS = 4000;
const MAX_TRANSLATE_CONCURRENCY = 3;

const htmlEngine = {
  needkey: false,
  fetch: ({ key, from, to, text }: { key?: string; from: string; to: string; text: string }) => [
    TRANSLATE_URL,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        q: text,
        source: from,
        target: to,
        api_key: key,
        format: "html",
      }),
    },
  ],
  parse: (response: Response) =>
    response.json().then((data: { translatedText?: string; error?: string }) => {
      if (!data) {
        throw new Error("No response found");
      }
      if (data.error) {
        throw new Error(data.error);
      }
      if (!data.translatedText) {
        throw new Error("No response found");
      }
      return data.translatedText;
    }),
};

const textTranslator = Translate({
  engine: "libre",
  url: TRANSLATE_URL,
  key: TRANSLATE_KEY,
  cache: CACHE_TTL,
});

const htmlTranslator = Translate({
  engine: "libre",
  url: TRANSLATE_URL,
  key: TRANSLATE_KEY,
  cache: CACHE_TTL,
  engines: {
    ...(translate.engines ?? {}),
    libre: htmlEngine,
  },
});

const createLimiter = (limit: number) => {
  let active = 0;
  const queue: Array<() => void> = [];

  return async <T>(task: () => Promise<T>): Promise<T> => {
    if (active >= limit) {
      await new Promise<void>((resolve) => queue.push(resolve));
    }
    active += 1;
    try {
      return await task();
    } finally {
      active -= 1;
      const next = queue.shift();
      if (next) {
        next();
      }
    }
  };
};

const translateLimiter = createLimiter(MAX_TRANSLATE_CONCURRENCY);

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
  lang: Language,
  format: "text" | "html",
) => {
  const translator = format === "html" ? htmlTranslator : textTranslator;
  return translateLimiter(() => translator(value, { from: "pt", to: lang }));
};

const safeTranslateChunk = async (
  value: string,
  lang: Language,
  format: "text" | "html",
) => {
  try {
    return await translateChunk(value, lang, format);
  } catch {
    return value;
  }
};

const translateInChunks = async (
  value: string,
  lang: Language,
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
    return safeTranslateChunk(chunks[0] ?? value, lang, format);
  }
  const translated: string[] = [];
  for (const chunk of chunks) {
    translated.push(await safeTranslateChunk(chunk, lang, format));
  }
  return translated.join(separator);
};

const translateValue = async (
  value: string | undefined,
  lang: Language,
  format: "text" | "html",
) => {
  if (!value) {
    return value;
  }
  if (lang === "pt") {
    return value;
  }
  if (!value.trim()) {
    return value;
  }
  if (value.length > MAX_TRANSLATE_CHARS) {
    return translateInChunks(value, lang, format);
  }
  return safeTranslateChunk(value, lang, format);
};

const hasHtml = (value: string | undefined) =>
  Boolean(value && /<[^>]+>/.test(value));

export async function translatePosts(
  posts: BlogPost[],
  lang: Language,
): Promise<BlogPost[]> {
  if (lang === "pt") {
    return posts;
  }

  const translated = await Promise.all(
    posts.map(async (post) => {
      const contentFormat = hasHtml(post.content) ? "html" : "text";
      const [
        title,
        excerpt,
        description,
        content,
        contentHtml,
        metaTitle,
        metaDescription,
      ] = await Promise.all([
        translateValue(post.title, lang, "text"),
        translateValue(post.excerpt, lang, "text"),
        translateValue(post.description, lang, "text"),
        translateValue(post.content, lang, contentFormat),
        translateValue(post.contentHtml, lang, "html"),
        translateValue(post.metaTitle, lang, "text"),
        translateValue(post.metaDescription, lang, "text"),
      ]);

      return {
        ...post,
        title: title ?? post.title,
        excerpt: excerpt ?? post.excerpt,
        description: description ?? post.description,
        content: content ?? post.content,
        contentHtml: contentHtml ?? post.contentHtml,
        category: post.category,
        metaTitle: metaTitle ?? post.metaTitle,
        metaDescription: metaDescription ?? post.metaDescription,
      };
    }),
  );

  return translated;
}
