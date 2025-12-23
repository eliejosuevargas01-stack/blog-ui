import type { Language } from "@/lib/i18n";
import type { BlogPost } from "@/lib/posts";

export type TopicSummary = {
  slug: string;
  title: string;
  count: number;
};

const slugifyTopic = (value: string) => {
  const normalized = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  const slug = normalized
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug;
};

export const normalizeTopicKey = (value?: string | null): string | null => {
  if (!value) {
    return null;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  const slug = slugifyTopic(trimmed);
  return slug ? slug : null;
};

export const buildTopicPath = (lang: Language, value: string) => {
  const slug = normalizeTopicKey(value);
  return slug ? `/${lang}/${slug}` : `/${lang}`;
};

export const collectTopicSummaries = (posts: BlogPost[]): TopicSummary[] => {
  const summaries = new Map<string, TopicSummary>();

  posts.forEach((post) => {
    const label = post.category?.trim();
    if (!label) {
      return;
    }
    const slug = normalizeTopicKey(label);
    if (!slug) {
      return;
    }
    const existing = summaries.get(slug);
    if (existing) {
      existing.count += 1;
      return;
    }
    summaries.set(slug, { slug, title: label, count: 1 });
  });

  return Array.from(summaries.values());
};
