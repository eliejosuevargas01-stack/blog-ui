import type { Language } from "@/lib/i18n";

export const TOPICS = [
  { key: "ia", slug: "ia" },
  { key: "tech", slug: "tech" },
  { key: "marketing/seo", slug: "marketing-seo" },
  { key: "business", slug: "business" },
] as const;

export type TopicKey = (typeof TOPICS)[number]["key"];
export type TopicSlug = (typeof TOPICS)[number]["slug"];

export const TOPIC_KEYS = TOPICS.map((topic) => topic.key);

export const topicSlugFromKey = (key: TopicKey): TopicSlug => {
  const match = TOPICS.find((topic) => topic.key === key);
  return match?.slug ?? "ia";
};

export const topicKeyFromSlug = (slug: string): TopicKey | null => {
  const normalized = slug.trim().toLowerCase();
  const match = TOPICS.find((topic) => topic.slug === normalized);
  return match?.key ?? null;
};

export const normalizeTopicKey = (value?: string | null): TopicKey | null => {
  if (!value) {
    return null;
  }
  const normalized = value.trim().toLowerCase();
  return TOPIC_KEYS.includes(normalized as TopicKey)
    ? (normalized as TopicKey)
    : null;
};

export const buildTopicPath = (lang: Language, key: TopicKey) =>
  `/${lang}/${topicSlugFromKey(key)}`;
