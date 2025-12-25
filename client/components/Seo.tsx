import { useEffect } from "react";

import {
  type Language,
  type PageKey,
  buildAlternatePaths,
  buildPath,
  defaultLang,
} from "@/lib/i18n";

const localeMap: Record<Language, string> = {
  pt: "pt_BR",
  en: "en_US",
  es: "es_ES",
};

const hreflangMap: Record<Language, string> = {
  pt: "pt-BR",
  en: "en",
  es: "es",
};

interface SeoProps {
  lang: Language;
  page?: PageKey;
  title: string;
  description: string;
  canonicalPath?: string;
  alternatePaths?: Partial<Record<Language, string>>;
  metaTags?: Array<{ name?: string; property?: string; content: string }>;
  jsonLd?: Record<string, unknown> | Array<Record<string, unknown>>;
}

function upsertMeta(selector: string, attrs: Record<string, string>) {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement("meta");
    document.head.appendChild(element);
  }
  Object.entries(attrs).forEach(([key, value]) => {
    element?.setAttribute(key, value);
  });
}

function upsertLink(selector: string, attrs: Record<string, string>) {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement("link");
    document.head.appendChild(element);
  }
  Object.entries(attrs).forEach(([key, value]) => {
    element?.setAttribute(key, value);
  });
}

function upsertScript(
  selector: string,
  attrs: Record<string, string>,
  text: string,
) {
  let element = document.head.querySelector(selector) as HTMLScriptElement | null;
  if (!element) {
    element = document.createElement("script");
    document.head.appendChild(element);
  }
  Object.entries(attrs).forEach(([key, value]) => {
    element?.setAttribute(key, value);
  });
  if (element && element.textContent !== text) {
    element.textContent = text;
  }
}

export function Seo({
  lang,
  page,
  title,
  description,
  canonicalPath,
  alternatePaths,
  metaTags,
  jsonLd,
}: SeoProps) {
  useEffect(() => {
    document.documentElement.lang = hreflangMap[lang] ?? lang;
    document.title = title;

    upsertMeta('meta[name="description"]', {
      name: "description",
      content: description,
    });
    upsertMeta('meta[name="robots"]', {
      name: "robots",
      content: "index, follow",
    });
    upsertMeta('meta[property="og:title"]', {
      property: "og:title",
      content: title,
    });
    upsertMeta('meta[property="og:description"]', {
      property: "og:description",
      content: description,
    });
    upsertMeta('meta[property="og:type"]', {
      property: "og:type",
      content: "website",
    });
    upsertMeta('meta[property="og:site_name"]', {
      property: "og:site_name",
      content: "seommerce.shop",
    });
    upsertMeta('meta[property="og:locale"]', {
      property: "og:locale",
      content: localeMap[lang],
    });
    upsertMeta('meta[name="twitter:card"]', {
      name: "twitter:card",
      content: "summary_large_image",
    });
    upsertMeta('meta[name="twitter:title"]', {
      name: "twitter:title",
      content: title,
    });
    upsertMeta('meta[name="twitter:description"]', {
      name: "twitter:description",
      content: description,
    });

    if (metaTags) {
      metaTags.forEach((tag) => {
        if (!tag.content) {
          return;
        }
        if (tag.name) {
          upsertMeta(`meta[name="${tag.name}"]`, {
            name: tag.name,
            content: tag.content,
          });
          return;
        }
        if (tag.property) {
          upsertMeta(`meta[property="${tag.property}"]`, {
            property: tag.property,
            content: tag.content,
          });
        }
      });
    }

    const origin = window.location.origin;
    const resolvedCanonicalPath =
      canonicalPath ?? (page ? buildPath(lang, page) : window.location.pathname);
    const canonicalUrl = `${origin}${resolvedCanonicalPath}`;
    upsertMeta('meta[property="og:url"]', {
      property: "og:url",
      content: canonicalUrl,
    });
    upsertLink('link[rel="canonical"]', {
      rel: "canonical",
      href: canonicalUrl,
    });

    const alternates = alternatePaths ?? (page ? buildAlternatePaths(page) : null);
    if (alternates) {
      (Object.entries(alternates) as Array<[Language, string]>).forEach(
        ([langCode, path]) => {
          if (!path) {
            return;
          }
          const hreflang = hreflangMap[langCode] ?? langCode;
          upsertLink(`link[rel="alternate"][hreflang="${hreflang}"]`, {
            rel: "alternate",
            hreflang,
            href: `${origin}${path}`,
          });
        },
      );

      const defaultPath =
        alternates[defaultLang] ??
        (page ? buildPath(defaultLang, page) : resolvedCanonicalPath);
      upsertLink('link[rel="alternate"][hreflang="x-default"]', {
        rel: "alternate",
        hreflang: "x-default",
        href: `${origin}${defaultPath}`,
      });
    }

    const jsonLdSelector = 'script[data-seo="jsonld"]';
    if (jsonLd) {
      upsertScript(
        jsonLdSelector,
        {
          type: "application/ld+json",
          "data-seo": "jsonld",
        },
        JSON.stringify(jsonLd),
      );
    } else {
      document.head.querySelector(jsonLdSelector)?.remove();
    }
  }, [
    lang,
    page,
    title,
    description,
    canonicalPath,
    alternatePaths,
    metaTags,
    jsonLd,
  ]);

  return null;
}
