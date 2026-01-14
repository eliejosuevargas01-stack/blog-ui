import { promises as fs } from "fs";
import path from "path";

import { render } from "../client/entry-server";
import {
  normalizePosts,
  setInitialPosts,
  type BlogPost,
} from "../client/lib/posts";
import { translatePosts } from "../client/lib/translate";
import {
  buildPath,
  defaultLang,
  languages,
  pageSlugs,
} from "../client/lib/i18n";

type PostsByLang = Record<(typeof languages)[number], BlogPost[]>;

const serializeJson = (value: unknown) =>
  JSON.stringify(value).replace(/</g, "\\u003c");

const prunePostForSsg = (post: BlogPost): BlogPost => {
  const { content, contentHtml, metaTags, images, ...rest } = post;
  return rest;
};

const prunePostsForSsg = (postsByLang: PostsByLang): PostsByLang => {
  const pruned = { ...postsByLang };
  languages.forEach((lang) => {
    pruned[lang] = postsByLang[lang].map(prunePostForSsg);
  });
  return pruned;
};

const resolveOrigin = () => {
  const env =
    process.env.SSG_ORIGIN ??
    process.env.SITE_ORIGIN ??
    process.env.COOLIFY_URL ??
    (process.env.COOLIFY_FQDN ? `https://${process.env.COOLIFY_FQDN}` : "");
  return env.replace(/\/+$/, "");
};

const loadPostsByLang = async (): Promise<PostsByLang> => {
  const rootDir =
    process.env.GENERATED_DIR?.trim() || path.resolve("/app/html-storage/posts");
  const indexPath = path.join(rootDir, "posts.json");
  const initial: PostsByLang = { pt: [], en: [], es: [] };

  try {
    const raw = await fs.readFile(indexPath, "utf-8");
    const parsed = JSON.parse(raw) as { posts?: unknown[] };
    const list = Array.isArray(parsed.posts) ? parsed.posts : [];

    languages.forEach((lang) => {
      const filtered = list.filter((item) => {
        if (!item || typeof item !== "object") {
          return false;
        }
        const record = item as Record<string, unknown>;
        return record.lang === lang;
      });
      initial[lang] = normalizePosts(filtered, lang);
    });
  } catch {
    // If the posts index isn't available, fall back to remote fetch if possible.
  }

  const hasPosts = languages.some((lang) => initial[lang].length > 0);
  if (!hasPosts) {
    const origin = resolveOrigin();
    if (origin) {
      await Promise.all(
        languages.map(async (lang) => {
          try {
            const response = await fetch(`${origin}/api/posts?lang=${lang}`);
            if (!response.ok) {
              return;
            }
            const payload = (await response.json()) as unknown;
            initial[lang] = normalizePosts(payload, lang);
          } catch {
            // Ignore remote fetch errors.
          }
        }),
      );
    }
  }

  const basePosts = initial.pt;
  for (const lang of languages) {
    if (lang === "pt") {
      continue;
    }
    if (initial[lang].length === 0 && basePosts.length > 0) {
      initial[lang] = await translatePosts(basePosts, lang);
    }
  }

  return initial;
};

const buildStaticRoutes = () => {
  const pages: Array<keyof typeof pageSlugs> = [
    "home",
    "articles",
    "latest",
    "tools",
    "about",
    "contact",
    "privacy",
  ];

  return languages.flatMap((lang) =>
    pages.map((page) => buildPath(lang, page)),
  );
};

const injectHead = (template: string, head: string, htmlAttrs: string) => {
  const htmlTag = htmlAttrs ? `<html ${htmlAttrs}>` : "<html>";
  return template
    .replace(/<html[^>]*>/, htmlTag)
    .replace("<!--app-head-->", head);
};

const injectBody = (template: string, appHtml: string, dataScript: string) =>
  template
    .replace("<!--app-html-->", appHtml)
    .replace("<!--app-data-->", dataScript);

const renderRoute = async (
  template: string,
  route: string,
  outputPath: string,
  initialPosts: PostsByLang,
) => {
  setInitialPosts(initialPosts);
  const { appHtml, helmet } = render(route);
  const head = [
    helmet?.title?.toString?.() ?? "",
    helmet?.meta?.toString?.() ?? "",
    helmet?.link?.toString?.() ?? "",
    helmet?.script?.toString?.() ?? "",
  ].join("");
  const htmlAttrs = helmet?.htmlAttributes?.toString?.() ?? "";
  const dataScript = `<script>window.__INITIAL_POSTS__=${serializeJson(
    initialPosts,
  )};</script>`;

  const withHead = injectHead(template, head, htmlAttrs);
  const html = injectBody(withHead, appHtml, dataScript);

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, html, "utf-8");
};

const run = async () => {
  const distDir = path.resolve(process.cwd(), "dist", "spa");
  const templatePath = path.join(distDir, "index.html");
  const template = await fs.readFile(templatePath, "utf-8");
  const initialPosts = prunePostsForSsg(await loadPostsByLang());
  const routes = buildStaticRoutes();

  for (const route of routes) {
    const trimmed = route.replace(/^\/+/, "");
    const outputPath = path.join(distDir, trimmed, "index.html");
    await renderRoute(template, route, outputPath, initialPosts);
  }

  const rootOutput = path.join(distDir, "index.html");
  const defaultPath = buildPath(defaultLang, "home");
  await renderRoute(template, defaultPath, rootOutput, initialPosts);
};

run().catch((error) => {
  console.error("SSG failed", error);
  process.exit(1);
});
