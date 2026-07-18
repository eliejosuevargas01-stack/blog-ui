import { NextRequest, NextResponse } from "next/server";
import { resolveSiteOrigin, loadPostsByLang } from "@/lib/posts-db";
import { loadPagesForLang } from "@/lib/pages-db";
import { languages, pageSlugs, type Language, type PageKey } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const origin = resolveSiteOrigin();
  const rootDir = process.env.GENERATED_DIR?.trim() || "/app/html-storage/posts";
  const nowStr = new Date().toISOString();

  interface SitemapEntry {
    loc: string;
    lastmod: string;
    changefreq: string;
    priority: string;
  }

  const entries: SitemapEntry[] = [];

  try {
    // 1. Unify static URLs for all languages
    const staticPageKeys: Exclude<PageKey, "admin">[] = [
      "home",
      "articles",
      "latest",
      "tools",
      "about",
      "contact",
      "privacy",
      "auth",
    ];

    const staticPriorities: Record<string, string> = {
      home: "1.0",
      articles: "0.8",
      latest: "0.8",
      tools: "0.7",
      about: "0.5",
      contact: "0.5",
      privacy: "0.3",
      auth: "0.3",
    };

    const staticChangefreqs: Record<string, string> = {
      home: "daily",
      articles: "daily",
      latest: "daily",
      tools: "weekly",
      about: "monthly",
      contact: "monthly",
      privacy: "monthly",
      auth: "monthly",
    };

    for (const lang of languages) {
      for (const key of staticPageKeys) {
        const slug = pageSlugs[key][lang];
        const path = key === "home" ? `/${lang}` : `/${lang}/${slug}`;
        entries.push({
          loc: `${origin}${path}`,
          lastmod: nowStr,
          changefreq: staticChangefreqs[key],
          priority: staticPriorities[key],
        });
      }
    }

    // 2. Load and add dynamic custom pages
    for (const lang of languages) {
      try {
        const customPages = await loadPagesForLang(rootDir, lang);
        for (const page of customPages) {
          if (!page.slug) continue;
          entries.push({
            loc: `${origin}/${lang}/${page.slug}`,
            lastmod: page.updatedAt || nowStr,
            changefreq: "weekly",
            priority: "0.6",
          });
        }
      } catch (err) {
        console.error(`Error loading custom pages for sitemap in ${lang}:`, err);
      }
    }

    // 3. Load and add dynamic blog posts
    try {
      const postsByLang = await loadPostsByLang(rootDir);
      for (const lang of languages) {
        const posts = postsByLang[lang] || [];
        for (const post of posts) {
          if (!post.slug) continue;
          const postDate = (post.updatedAt || post.publishedAt || post.date || nowStr) as string;
          entries.push({
            loc: `${origin}/${lang}/post/${post.slug}`,
            lastmod: postDate,
            changefreq: "weekly",
            priority: "0.8",
          });
        }
      }
    } catch (err) {
      console.error("Error loading posts for sitemap:", err);
    }

  } catch (err) {
    console.error("General error generating sitemap:", err);
  }

  // 4. Generate XML output
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries.map(
      (entry) =>
        `<url>` +
        `<loc>${escapeXml(entry.loc)}</loc>` +
        `<lastmod>${formatSitemapDate(entry.lastmod)}</lastmod>` +
        `<changefreq>${entry.changefreq}</changefreq>` +
        `<priority>${entry.priority}</priority>` +
        `</url>`
    ),
    "</urlset>",
  ].join("\n");

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=60",
    },
  });
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function formatSitemapDate(value: string): string {
  try {
    const date = new Date(value);
    return date.toISOString().split("T")[0];
  } catch {
    return value.split("T")[0];
  }
}
