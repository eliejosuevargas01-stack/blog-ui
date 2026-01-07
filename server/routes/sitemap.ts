import type { RequestHandler } from "express";

import { allowedCategories, buildPath, buildPostPath, languages } from "@/lib/i18n";
import { fetchPublicPosts } from "@/lib/posts";
import { buildTopicPath } from "@/lib/topics";

const staticPages = [
  "home",
  "articles",
  "latest",
  "tools",
  "about",
  "contact",
  "privacy",
] as const;

const formatDate = (value?: string | null) => {
  if (!value) {
    return null;
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return parsed.toISOString().split("T")[0];
};

const escapeXml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const resolveOrigin = (req: Parameters<RequestHandler>[0]) => {
  const forwardedProto = req.headers["x-forwarded-proto"];
  const forwardedHost = req.headers["x-forwarded-host"];
  const proto = Array.isArray(forwardedProto)
    ? forwardedProto[0]
    : forwardedProto || req.protocol;
  const host = Array.isArray(forwardedHost)
    ? forwardedHost[0]
    : forwardedHost || req.get("host");
  return host ? `${proto}://${host}` : `${req.protocol}://localhost`;
};

export const handleSitemap: RequestHandler = async (req, res) => {
  try {
    const origin = resolveOrigin(req);
    const entries = new Map<string, string | null>();

    const addEntry = (path: string, lastmod?: string | null) => {
      if (!path) {
        return;
      }
      const loc = `${origin}${path}`;
      const formatted = formatDate(lastmod);
      const existing = entries.get(loc);
      if (!existing || (formatted && formatted > existing)) {
        entries.set(loc, formatted);
      }
    };

    staticPages.forEach((page) => {
      languages.forEach((lang) => {
        addEntry(buildPath(lang, page));
      });
    });

    const postsByLang = await Promise.all(
      languages.map(async (lang) => ({
        lang,
        posts: await fetchPublicPosts(lang),
      })),
    );

    postsByLang.forEach(({ lang, posts }) => {
      allowedCategories.forEach((category) => {
        addEntry(buildTopicPath(lang, category));
      });

      posts.forEach((post) => {
        const slug = post.slugs?.[lang] ?? post.slug ?? post.id;
        if (!slug) {
          return;
        }
        addEntry(
          buildPostPath(lang, slug),
          post.updatedAt ?? post.date ?? null,
        );
      });
    });

    const urls = Array.from(entries.entries()).map(([loc, lastmod]) => {
      const lastmodTag = lastmod ? `<lastmod>${lastmod}</lastmod>` : "";
      return `<url><loc>${escapeXml(loc)}</loc>${lastmodTag}</url>`;
    });

    const xml = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      ...urls,
      "</urlset>",
    ].join("");

    res.set("Content-Type", "application/xml");
    res.send(xml);
  } catch (error) {
    res.status(500).send("Unable to generate sitemap.");
  }
};
