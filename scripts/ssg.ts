import { promises as fs } from "fs";
import path from "path";

import { render } from "../client/entry-server";
import {
  normalizePosts,
  setInitialPosts,
  type BlogPost,
} from "../client/lib/posts";
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

const writePostsJson = async (distDir: string, postsByLang: PostsByLang) => {
  await fs.mkdir(distDir, { recursive: true });
  await fs.writeFile(
    path.join(distDir, "posts.json"),
    JSON.stringify(postsByLang, null, 2),
    "utf-8",
  );

  await Promise.all(
    languages.map(async (lang) => {
      const langDir = path.join(distDir, lang);
      await fs.mkdir(langDir, { recursive: true });
      await fs.writeFile(
        path.join(langDir, "posts.json"),
        JSON.stringify({ posts: postsByLang[lang] }, null, 2),
        "utf-8",
      );
    }),
  );
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
  const initial: PostsByLang = { pt: [], en: [], es: [] };

  const readIndexFile = async (indexPath: string) => {
    try {
      const raw = await fs.readFile(indexPath, "utf-8");
      const parsed = JSON.parse(raw) as { posts?: unknown[] };
      return Array.isArray(parsed.posts) ? parsed.posts : [];
    } catch {
      return null;
    }
  };

  let loadedAny = false;
  await Promise.all(
    languages.map(async (lang) => {
      const indexPath = path.join(rootDir, lang, "posts.json");
      const list = await readIndexFile(indexPath);
      if (!list) {
        return;
      }
      loadedAny = true;
      initial[lang] = normalizePosts(list, lang);
    }),
  );

  if (!loadedAny) {
    const legacyList = await readIndexFile(path.join(rootDir, "posts.json"));
    if (legacyList) {
      languages.forEach((lang) => {
        const filtered = legacyList.filter((item) => {
          if (!item || typeof item !== "object") {
            return false;
          }
          const record = item as Record<string, unknown>;
          return record.lang === lang;
        });
        initial[lang] = normalizePosts(filtered, lang);
      });
    }
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
  const fullPosts = await loadPostsByLang();
  await writePostsJson(distDir, fullPosts);
  const initialPosts = prunePostsForSsg(fullPosts);
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
