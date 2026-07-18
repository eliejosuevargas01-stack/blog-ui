import fs from "fs/promises";
import path from "path";
import type { Language } from "@/lib/i18n";

export interface CustomPage {
  id: string;
  slug: string;
  lang: string;
  title: string;
  content: {
    bodyHtml: string;
  };
  seoTitle?: string;
  seoDescription?: string;
  createdAt: string;
  updatedAt: string;
}

const fileExists = async (filePath: string) => {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
};

export async function loadPagesForLang(
  rootDir: string,
  lang: Language
): Promise<CustomPage[]> {
  const filePath = path.join(rootDir, lang, "pages.json");
  try {
    if (!(await fileExists(filePath))) {
      return [];
    }
    const raw = await fs.readFile(filePath, "utf-8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function savePageForLang(
  rootDir: string,
  lang: Language,
  pageData: Partial<CustomPage> & { slug: string; title: string }
): Promise<CustomPage> {
  const pages = await loadPagesForLang(rootDir, lang);
  
  const id = pageData.id || `page-${lang}-${pageData.slug}`;
  const now = new Date().toISOString();

  const existingIndex = pages.findIndex((p) => p.id === id);

  const finalPage: CustomPage = {
    id,
    slug: pageData.slug,
    lang,
    title: pageData.title,
    content: pageData.content || { bodyHtml: "" },
    seoTitle: pageData.seoTitle,
    seoDescription: pageData.seoDescription,
    createdAt: existingIndex >= 0 ? pages[existingIndex].createdAt : now,
    updatedAt: now,
  };

  if (existingIndex >= 0) {
    pages[existingIndex] = finalPage;
  } else {
    pages.push(finalPage);
  }

  const dirPath = path.join(rootDir, lang);
  await fs.mkdir(dirPath, { recursive: true });
  await fs.writeFile(
    path.join(dirPath, "pages.json"),
    JSON.stringify(pages, null, 2),
    "utf-8"
  );

  return finalPage;
}

export async function deletePageForLang(
  rootDir: string,
  lang: Language,
  id: string
): Promise<boolean> {
  const pages = await loadPagesForLang(rootDir, lang);
  const filtered = pages.filter((p) => p.id !== id);

  if (filtered.length === pages.length) {
    return false; // Not found
  }

  const dirPath = path.join(rootDir, lang);
  await fs.mkdir(dirPath, { recursive: true });
  await fs.writeFile(
    path.join(dirPath, "pages.json"),
    JSON.stringify(filtered, null, 2),
    "utf-8"
  );

  return true;
}
