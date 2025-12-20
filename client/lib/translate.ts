import translate, { Translate } from "translate";

import type { Language } from "@/lib/i18n";
import type { BlogPost } from "@/lib/posts";

const TRANSLATE_URL =
  import.meta.env.VITE_TRANSLATE_URL ?? "https://libretranslate.com/translate";
const TRANSLATE_KEY = import.meta.env.VITE_TRANSLATE_KEY ?? undefined;
const CACHE_TTL = 1000 * 60 * 60 * 12;

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
  const translator = format === "html" ? htmlTranslator : textTranslator;
  return translator(value, { from: "pt", to: lang });
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
      try {
        const contentFormat = hasHtml(post.content) ? "html" : "text";
        const [
          title,
          excerpt,
          description,
          content,
          contentHtml,
          category,
          metaTitle,
          metaDescription,
        ] = await Promise.all([
          translateValue(post.title, lang, "text"),
          translateValue(post.excerpt, lang, "text"),
          translateValue(post.description, lang, "text"),
          translateValue(post.content, lang, contentFormat),
          translateValue(post.contentHtml, lang, "html"),
          translateValue(post.category, lang, "text"),
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
          category: category ?? post.category,
          metaTitle: metaTitle ?? post.metaTitle,
          metaDescription: metaDescription ?? post.metaDescription,
        };
      } catch {
        return post;
      }
    }),
  );

  return translated;
}
