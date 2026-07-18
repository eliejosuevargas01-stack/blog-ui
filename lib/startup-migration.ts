/**
 * startup-migration.ts
 *
 * Migrates posts from the HTML file storage into PostgreSQL on first boot.
 *
 * Logic:
 * 1. Skip entirely if the DB already has any posts (idempotent).
 * 2. Load all posts from /app/html-storage/posts for pt, en, es.
 * 3. Group translations together using the existing `slugs` map field
 *    (e.g. { pt: "slug-pt", en: "slug-en", es: "slug-es" }).
 * 4. Generate a stable fake hn_id (UUID-v4 format) per group, derived
 *    deterministically from the Portuguese slug so it's reproducible.
 * 5. For each group, test every candidate image URL with a HEAD request,
 *    pick the first working one, and share it across all language versions.
 * 6. Upsert all posts into Postgres with the shared hn_id and image.
 */

// Ensures webpack never includes this file in client/edge bundles
import "server-only";

import { prisma } from "./db";
import { createHash } from "crypto";
import fs from "fs";
import path from "path";

const TECH_IMAGES = [
  "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&h=680&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&h=680&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&h=680&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=1200&h=680&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&h=680&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&h=680&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=1200&h=680&fit=crop&auto=format",
];

function fallbackImage(index: number) {
  return TECH_IMAGES[index % TECH_IMAGES.length];
}

// ─── HTML Parsing ──────────────────────────────────────────────────────────────

function parsePostHtml(html: string, fallbackIdx = 0) {
  let title = "";
  const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (h1Match) {
    title = h1Match[1].replace(/<[^>]*>/g, "").trim();
    html = html.replace(/<h1[^>]*>[\s\S]*?<\/h1>/i, "");
  }

  // Replace placeholder src
  let counter = 0;
  let cleanHtml = html
    .replace(/src="COLE_LINK_IMAGEM_AQUI"/gi, () => `src="${fallbackImage(counter++)}"`)
    .replace(/src='COLE_LINK_IMAGEM_AQUI'/gi, () => `src='${fallbackImage(counter++)}'`);

  // Find all image URLs from the HTML content
  const imgSrcRegex = /<img[^>]+src=["']([^"']+)["']/gi;
  const imageUrls: string[] = [];
  let imgMatch: RegExpExecArray | null;
  while ((imgMatch = imgSrcRegex.exec(cleanHtml)) !== null) {
    if (imgMatch[1] && imgMatch[1].startsWith("http")) {
      imageUrls.push(imgMatch[1]);
    }
  }

  const mainImage = imageUrls[0] || fallbackImage(fallbackIdx);

  // Split into blocks (by <figure> tags or paragraphs)
  const blocks: { text: string; image: string; focalPoint: string }[] = [];
  const figureRegex = /<figure[^>]*>([\s\S]*?)<\/figure>/gi;
  const figures: { innerHtml: string; index: number; length: number }[] = [];
  let fMatch: RegExpExecArray | null;
  while ((fMatch = figureRegex.exec(cleanHtml)) !== null) {
    figures.push({ innerHtml: fMatch[1], index: fMatch.index, length: fMatch[0].length });
  }

  if (figures.length === 0) {
    const paragraphs = cleanHtml
      .split(/<\/p>/i)
      .map((p) => (p.trim() ? p + "</p>" : ""))
      .filter(Boolean);
    if (paragraphs.length === 0) {
      blocks.push({ text: cleanHtml, image: "", focalPoint: "center" });
    } else {
      const size = Math.ceil(paragraphs.length / 3);
      for (let i = 0; i < 3; i++) {
        const chunk = paragraphs.slice(i * size, (i + 1) * size);
        if (chunk.length > 0) blocks.push({ text: chunk.join("\n"), image: "", focalPoint: "center" });
      }
    }
  } else {
    let cur = 0;
    for (const fig of figures) {
      const text = cleanHtml.substring(cur, fig.index).trim();
      cur = fig.index + fig.length;
      const im = fig.innerHtml.match(/<img[^>]+src=["']([^"']+)["']/i);
      blocks.push({ text, image: im?.[1] || "", focalPoint: "center" });
    }
    const rem = cleanHtml.substring(cur).trim();
    if (rem) blocks.push({ text: rem, image: "", focalPoint: "center" });
  }

  const finalBlocks = blocks.filter((b) => b.text || b.image);
  if (finalBlocks.length === 0) finalBlocks.push({ text: cleanHtml, image: "", focalPoint: "center" });

  return { title: title || "Sem Título", mainImage, imageUrls, blocks: finalBlocks };
}

// ─── Image Validation ──────────────────────────────────────────────────────────

async function isImageWorking(url: string): Promise<boolean> {
  if (!url || !url.startsWith("http")) return false;
  try {
    const res = await fetch(url, { method: "HEAD", signal: AbortSignal.timeout(5000) });
    if (!res.ok) return false;
    const ct = res.headers.get("content-type") || "";
    return ct.startsWith("image/") || ct.startsWith("application/octet");
  } catch {
    return false;
  }
}

async function findWorkingImage(candidates: string[], fallbackIdx: number): Promise<string> {
  for (const url of candidates) {
    if (await isImageWorking(url)) return url;
  }
  return fallbackImage(fallbackIdx);
}

// ─── JSON index loading ────────────────────────────────────────────────────────

type PostPayload = Record<string, unknown>;

async function readJsonIndex(filePath: string): Promise<PostPayload[]> {
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed.posts) ? parsed.posts : [];
  } catch {
    return [];
  }
}

async function loadAllPosts(rootDir: string): Promise<Record<string, PostPayload[]>> {
  const langs = ["pt", "en", "es"];
  const result: Record<string, PostPayload[]> = { pt: [], en: [], es: [] };

  // Try per-language index files first
  let hasPerLang = false;
  for (const lang of langs) {
    const p = path.join(rootDir, lang, "posts.json");
    if (fs.existsSync(p)) {
      result[lang] = await readJsonIndex(p);
      hasPerLang = true;
    }
  }
  if (hasPerLang) return result;

  // Fallback: single legacy posts.json
  const legacy = path.join(rootDir, "posts.json");
  if (fs.existsSync(legacy)) {
    const all = await readJsonIndex(legacy);
    for (const lang of langs) {
      result[lang] = all.filter((p) => p.lang === lang);
    }
  }

  return result;
}

// ─── Deterministic hn_id ──────────────────────────────────────────────────────

function makeHnId(ptSlug: string): string {
  // Build a deterministic UUID-shaped ID from the PT slug (createHash imported at top)
  const hash = createHash("md5").update(`migration:${ptSlug}`).digest("hex");
  return `${hash.slice(0,8)}-${hash.slice(8,12)}-${hash.slice(12,16)}-${hash.slice(16,20)}-${hash.slice(20,32)}`;
}

// ─── Main migration ────────────────────────────────────────────────────────────

export async function runMigrationIfNeeded() {
  const rootDir = process.env.GENERATED_DIR?.trim() || "/app/html-storage/posts";

  if (!fs.existsSync(rootDir)) {
    console.log("[Migration] Storage dir not found, skipping:", rootDir);
    return;
  }

  // Check if DB already has posts — skip if it does
  const existing = await prisma.post.count();
  if (existing > 0) {
    console.log(`[Migration] DB already has ${existing} posts, skipping migration.`);
    return;
  }

  console.log("[Migration] Starting automatic post migration from:", rootDir);

  const postsByLang = await loadAllPosts(rootDir);
  const langs = ["pt", "en", "es"] as const;

  // ── Step 1: Index all posts by slug for fast lookup ──────────────────────────
  const bySlug = new Map<string, { lang: string; post: PostPayload }>();
  for (const lang of langs) {
    for (const post of postsByLang[lang]) {
      const slug = (post.slug as string || "").trim();
      if (slug) bySlug.set(slug, { lang, post });
    }
  }

  // ── Step 2: Build translation groups using the `slugs` map ──────────────────
  // Each group: { hn_id, posts: [{ lang, slug, post }] }
  type Group = { hn_id: string; posts: { lang: string; slug: string; post: PostPayload }[] };
  const groups: Group[] = [];
  const processedSlugs = new Set<string>();

  for (const lang of langs) {
    for (const post of postsByLang[lang]) {
      const slug = (post.slug as string || "").trim();
      if (!slug || processedSlugs.has(slug)) continue;

      const slugsMap = (post.slugs as Record<string, string> | null) || null;
      const group: Group = { hn_id: "", posts: [] };

      if (slugsMap && typeof slugsMap === "object") {
        // This post knows about all its translations
        for (const [l, s] of Object.entries(slugsMap)) {
          const normalizedS = (s as string).trim();
          if (!normalizedS) continue;
          const found = bySlug.get(normalizedS);
          if (found && !processedSlugs.has(normalizedS)) {
            group.posts.push({ lang: l, slug: normalizedS, post: found.post });
            processedSlugs.add(normalizedS);
          } else if (!found && normalizedS === slug) {
            // current post slug itself
            group.posts.push({ lang, slug, post });
            processedSlugs.add(slug);
          }
        }
      } else {
        // No slugs map — treat as standalone
        group.posts.push({ lang, slug, post });
        processedSlugs.add(slug);
      }

      if (group.posts.length === 0) continue;

      // Derive hn_id from PT slug if available, else first slug in group
      const ptEntry = group.posts.find((p) => p.lang === "pt");
      group.hn_id = makeHnId(ptEntry?.slug || group.posts[0].slug);
      groups.push(group);
    }
  }

  console.log(`[Migration] Found ${groups.length} translation groups.`);

  // ── Step 3: For each group, find the best working image ─────────────────────
  let migrated = 0;
  let fallbackIdx = 0;

  for (const group of groups) {
    // Collect all candidate image URLs from every post in the group
    const candidateUrls: string[] = [];
    const parsedPosts: Array<{
      lang: string;
      slug: string;
      post: PostPayload;
      parsed: ReturnType<typeof parsePostHtml>;
    }> = [];

    for (const { lang, slug, post } of group.posts) {
      const html = (post.contentHtml as string) || (post.content as string) || "";
      const parsed = parsePostHtml(html, fallbackIdx);

      // Direct image field first, then HTML images
      const directImg = (post.image as string) || (post.cover_image_url as string) || "";
      if (directImg) candidateUrls.unshift(directImg); // prefer direct field
      candidateUrls.push(...parsed.imageUrls);

      parsedPosts.push({ lang, slug, post, parsed });
    }

    // Deduplicate candidates
    const uniqueCandidates = Array.from(new Set(candidateUrls.filter(Boolean)));

    // Find the first working image (HEAD request)
    console.log(`[Migration] Testing ${uniqueCandidates.length} image(s) for group ${group.hn_id}...`);
    const sharedImage = await findWorkingImage(uniqueCandidates, fallbackIdx);
    console.log(`[Migration] Resolved image: ${sharedImage}`);
    fallbackIdx++;

    // ── Step 4: Upsert all posts with shared hn_id and image ──────────────────
    for (const { lang, slug, post, parsed } of parsedPosts) {
      const title = (post.title as string) || parsed.title;
      const excerpt = (post.excerpt as string) || (post.description as string) || "";
      const tags: string[] = Array.isArray(post.tags) ? post.tags : [];
      const html = (post.contentHtml as string) || (post.content as string) || "";
      const wordCount = html.replace(/<[^>]*>/g, " ").split(/\s+/).filter(Boolean).length;
      const readTime = (post.readTime as string) || `${Math.max(1, Math.round(wordCount / 200))} min`;
      const mainTag = (post.tag as string) || tags[0] || "Geral";
      const seoKeywords = tags.join(", ");
      const postDate = post.date ? new Date(post.date as string) : new Date("2025-01-01T07:00:00Z");
      const slugsMap = (post.slugs as Record<string, string>) || null;

      // Update the blocks to use the shared working image in the hero
      const blocks = parsed.blocks.map((b, i) => ({
        ...b,
        image: i === 0 && !b.image ? "" : b.image, // keep content block images as-is
      }));

      try {
        await prisma.post.upsert({
          where: { slug },
          update: {
            lang, date: postDate, hn_id: group.hn_id,
            slugs: slugsMap as any,
            tag: mainTag, category: (post.category as string) || (lang === "pt" ? "Mercado Tech" : "Tech Market"),
            title, excerpt, readTime,
            img: sharedImage, imgFocalPoint: "center",
            blocks: blocks as any,
            seoTitle: (post.metaTitle as string) || title,
            seoDescription: (post.metaDescription as string) || excerpt,
            seoKeywords,
          },
          create: {
            slug, lang, date: postDate, hn_id: group.hn_id,
            slugs: slugsMap as any,
            tag: mainTag, category: (post.category as string) || (lang === "pt" ? "Mercado Tech" : "Tech Market"),
            title, excerpt, readTime,
            img: sharedImage, imgFocalPoint: "center",
            blocks: blocks as any,
            seoTitle: (post.metaTitle as string) || title,
            seoDescription: (post.metaDescription as string) || excerpt,
            seoKeywords,
          },
        });
        console.log(`[Migration] ✓ [${lang}] ${slug}`);
        migrated++;
      } catch (err: any) {
        console.error(`[Migration] ✗ [${lang}] ${slug}:`, err.message);
      }
    }
  }

  console.log(`[Migration] ✅ Done. ${migrated} posts inserted into the database.`);
}
