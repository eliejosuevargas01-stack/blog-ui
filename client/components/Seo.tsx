import { Helmet } from "@/lib/helmet";

import {
  type Language,
  type PageKey,
  buildAlternatePaths,
  buildPath,
  defaultLang,
  siteName,
} from "@/lib/i18n";
import { brandAssets } from "@/lib/branding";

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

const resolveSiteOrigin = () => {
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }
  const viteOrigin =
    typeof import.meta !== "undefined"
      ? (import.meta as { env?: Record<string, string> }).env?.VITE_SITE_ORIGIN
      : undefined;
  const nodeOrigin =
    typeof process !== "undefined"
      ? process.env.SITE_ORIGIN ??
        process.env.COOLIFY_URL ??
        (process.env.COOLIFY_FQDN
          ? `https://${process.env.COOLIFY_FQDN}`
          : "")
      : "";
  const env = viteOrigin ?? nodeOrigin ?? "";
  return env.replace(/\/+$/, "");
};

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
  const origin = resolveSiteOrigin();
  const defaultOgImage = origin ? `${origin}${brandAssets.ogDefault}` : "";
  const hasOgImage = metaTags?.some((tag) => tag.property === "og:image");
  const hasTwitterImage = metaTags?.some(
    (tag) => tag.name === "twitter:image",
  );
  const resolvedCanonicalPath =
    canonicalPath ?? (page ? buildPath(lang, page) : "");
  const canonicalUrl = origin
    ? `${origin}${resolvedCanonicalPath}`
    : resolvedCanonicalPath;
  const alternates = alternatePaths ?? (page ? buildAlternatePaths(page) : null);
  const defaultPath =
    alternates?.[defaultLang] ??
    (page ? buildPath(defaultLang, page) : resolvedCanonicalPath);

  return (
    <Helmet htmlAttributes={{ lang: hreflangMap[lang] ?? lang }}>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="robots" content="index, follow" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content={localeMap[lang]} />
      {canonicalUrl ? <meta property="og:url" content={canonicalUrl} /> : null}
      {canonicalUrl ? <link rel="canonical" href={canonicalUrl} /> : null}
      {!hasOgImage && defaultOgImage ? (
        <meta property="og:image" content={defaultOgImage} />
      ) : null}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {!hasTwitterImage && defaultOgImage ? (
        <meta name="twitter:image" content={defaultOgImage} />
      ) : null}
      {metaTags?.map((tag, index) => {
        if (!tag.content) {
          return null;
        }
        if (tag.name) {
          return (
            <meta key={`${tag.name}-${index}`} name={tag.name} content={tag.content} />
          );
        }
        if (tag.property) {
          return (
            <meta
              key={`${tag.property}-${index}`}
              property={tag.property}
              content={tag.content}
            />
          );
        }
        return null;
      })}
      {alternates
        ? (Object.entries(alternates) as Array<[Language, string]>).map(
            ([langCode, path]) =>
              path ? (
                <link
                  key={langCode}
                  rel="alternate"
                  hrefLang={hreflangMap[langCode] ?? langCode}
                  href={origin ? `${origin}${path}` : path}
                />
              ) : null,
          )
        : null}
      {defaultPath ? (
        <link
          rel="alternate"
          hrefLang="x-default"
          href={origin ? `${origin}${defaultPath}` : defaultPath}
        />
      ) : null}
      {jsonLd ? (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      ) : null}
    </Helmet>
  );
}
