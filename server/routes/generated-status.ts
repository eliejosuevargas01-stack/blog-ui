import { promises as fs } from "fs";
import path from "path";
import type { RequestHandler } from "express";

type GeneratedEntry = {
  path: string;
  url: string;
  updatedAt: string;
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

const getGeneratedRoot = () =>
  process.env.GENERATED_DIR?.trim() || path.resolve(process.cwd(), "generated");

const collectHtmlFiles = async (rootDir: string) => {
  const entries: string[] = [];
  const walk = async (dir: string) => {
    const items = await fs.readdir(dir, { withFileTypes: true });
    await Promise.all(
      items.map(async (item) => {
        const fullPath = path.join(dir, item.name);
        if (item.isDirectory()) {
          await walk(fullPath);
          return;
        }
        if (item.isFile() && item.name.endsWith(".html")) {
          entries.push(fullPath);
        }
      }),
    );
  };
  await walk(rootDir);
  return entries;
};

const toRoutePath = (rootDir: string, filePath: string) => {
  const relative = path
    .relative(rootDir, filePath)
    .split(path.sep)
    .join("/");
  const withoutIndex = relative.replace(/index\\.html$/i, "");
  const withoutExt = withoutIndex.replace(/\\.html$/i, "");
  const normalized = `/${withoutExt}`.replace(/\/+$/, "");
  return normalized || "/";
};

const parseSitemapUrls = (xml: string) => {
  const urls: string[] = [];
  const regex = /<loc>([^<]+)<\/loc>/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(xml)) !== null) {
    urls.push(match[1].trim());
  }
  return urls;
};

export const handleGeneratedStatus: RequestHandler = async (_req, res) => {
  const rootDir = getGeneratedRoot();
  const origin = resolveSiteOrigin();

  try {
    let htmlFiles: string[] = [];
    try {
      await fs.access(rootDir);
      htmlFiles = await collectHtmlFiles(rootDir);
    } catch {
      htmlFiles = [];
    }
    const generatedPages: GeneratedEntry[] = await Promise.all(
      htmlFiles.map(async (filePath) => {
        const stat = await fs.stat(filePath);
        const routePath = toRoutePath(rootDir, filePath);
        return {
          path: routePath,
          url: `${origin}${routePath}`,
          updatedAt: stat.mtime.toISOString(),
        };
      }),
    );

    let sitemapEntries: string[] = [];
    const sitemapPath = path.join(rootDir, "sitemap.xml");
    try {
      const xml = await fs.readFile(sitemapPath, "utf-8");
      sitemapEntries = parseSitemapUrls(xml);
    } catch {
      sitemapEntries = [];
    }

    const sitemapPaths = new Set(
      sitemapEntries.map((url) => url.replace(origin, "") || "/"),
    );
    const generatedPaths = new Set(generatedPages.map((page) => page.path));

    const missingInSitemap = Array.from(generatedPaths).filter(
      (entry) => !sitemapPaths.has(entry),
    );
    const missingInGenerated = Array.from(sitemapPaths).filter(
      (entry) => !generatedPaths.has(entry),
    );

    res.json({
      generatedPages,
      sitemapEntries,
      missingInSitemap,
      missingInGenerated,
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
