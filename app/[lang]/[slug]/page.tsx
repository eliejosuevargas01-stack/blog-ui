import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { languages, pageSlugs, translations, type Language, type PageKey } from "@/lib/i18n";
import { normalizeTopicKey } from "@/lib/topics";
import { loadPostsForLang } from "@/lib/posts-server";
import { loadPagesForLang } from "@/lib/pages-db";

// Import migrated components
import About from "@/components/About";
import Contact from "@/components/Contact";
import Privacy from "@/components/Privacy";
import Articles from "@/components/Articles";
import Latest from "@/components/Latest";
import Tools from "@/components/Tools";
import Auth from "@/components/Auth";
import Admin from "@/components/Admin";
import Topic from "@/components/Topic";
import DynamicPage from "@/components/DynamicPage";

export const dynamic = "force-dynamic";

const getPageKeyBySlug = (slug: string, lang: Language): PageKey | null => {
  const decoded = decodeURIComponent(slug).toLowerCase();
  for (const [key, slugMap] of Object.entries(pageSlugs)) {
    const target = (slugMap as Record<Language, string>)[lang]?.toLowerCase();
    if (target === decoded) {
      return key as PageKey;
    }
  }
  return null;
};

export async function generateMetadata({
  params,
}: {
  params: { lang: string; slug: string };
}): Promise<Metadata> {
  const { lang, slug } = params;
  if (!languages.includes(lang as Language)) {
    return {};
  }
  const t = translations[lang as Language];
  if (!t) return {};

  // 1. Check if it's a page slug
  const pageKey = getPageKeyBySlug(slug, lang as Language);
  if (pageKey) {
    const meta = t.meta[pageKey as keyof typeof t.meta] as { title: string; description: string } | undefined;
    if (meta) {
      return {
        title: meta.title,
        description: meta.description,
      };
    }
  }

  // 2. Check if it's a topic slug
  const normalizedTopic = normalizeTopicKey(slug);
  if (normalizedTopic) {
    const topicCard = t.categories.cards.find(
      (card) => normalizeTopicKey(card.title) === normalizedTopic,
    );
    if (topicCard) {
      const fallbackTitle = slug ? slug.replace(/-/g, " ") : "";
      const topicTitle = topicCard.title ?? fallbackTitle;
      const metaTitle = t.topic.metaTitle.replace("{topic}", topicTitle);
      const metaDescription = t.topic.metaDescription.replace("{topic}", topicTitle);
      return {
        title: metaTitle,
        description: metaDescription,
      };
    }
  }

  // 3. Check if it's a dynamic custom page
  try {
    const rootDir = process.env.GENERATED_DIR?.trim() || "/app/html-storage/posts";
    const pages = await loadPagesForLang(rootDir, lang as Language);
    const matched = pages.find((p) => p.slug === slug);
    if (matched) {
      return {
        title: matched.seoTitle || matched.title,
        description: matched.seoDescription || "",
      };
    }
  } catch (e) {
    // Ignore error
  }

  return {};
}

export default async function CatchAllPage({
  params,
}: {
  params: { lang: string; slug: string };
}) {
  const { lang, slug } = params;
  if (!languages.includes(lang as Language)) {
    notFound();
  }

  const rootDir =
    process.env.GENERATED_DIR?.trim() || "/app/html-storage/posts";
  
  let initialPosts = [];
  try {
    const data = await loadPostsForLang(rootDir, lang as Language);
    initialPosts = data.posts;
  } catch (error) {
    // Fail silently, components have loading/error fallbacks
  }

  // 1. Check if slug matches a translated page slug
  const pageKey = getPageKeyBySlug(slug, lang as Language);
  if (pageKey) {
    switch (pageKey) {
      case "about":
        return <About lang={lang as Language} />;
      case "contact":
        return <Contact lang={lang as Language} />;
      case "privacy":
        return <Privacy lang={lang as Language} />;
      case "articles":
        return <Articles lang={lang as Language} initialPosts={initialPosts} />;
      case "latest":
        return <Latest lang={lang as Language} initialPosts={initialPosts} />;
      case "tools":
        return <Tools lang={lang as Language} />;
      case "auth":
        return <Auth lang={lang as Language} />;
      case "admin":
        return <Admin lang={lang as Language} />;
      default:
        notFound();
    }
  }

  // 2. Check if slug matches a topic / category
  const normalizedTopic = normalizeTopicKey(slug);
  if (normalizedTopic) {
    const t = translations[lang as Language];
    const isTopic = t.categories.cards.some(
      (card) => normalizeTopicKey(card.title) === normalizedTopic,
    );
    if (isTopic) {
      return <Topic lang={lang as Language} topicSlug={slug} initialPosts={initialPosts} />;
    }
  }

  // 3. Check if slug matches a custom dynamic page from the JSON files
  try {
    const pages = await loadPagesForLang(rootDir, lang as Language);
    const matchedPage = pages.find((p) => p.slug === slug);
    if (matchedPage) {
      return <DynamicPage page={matchedPage} lang={lang as Language} />;
    }
  } catch (e) {
    // Ignore error
  }

  // 4. Fallback: Page not found
  notFound();
}
