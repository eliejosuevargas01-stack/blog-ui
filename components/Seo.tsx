import type { Language, PageKey } from "@/lib/i18n";

interface SeoProps {
  lang: Language;
  page?: PageKey;
  title: string;
  description: string;
  canonicalPath?: string;
  alternatePaths?: Partial<Record<Language, string>>;
  metaTags?: Array<{ name?: string; property?: string; content: string }>;
  jsonLd?: Record<string, unknown> | Array<Record<string, unknown>>;
}

export function Seo({}: SeoProps) {
  // Next.js handles SEO/metadata natively using the Metadata API
  // defined at the page level (generateMetadata).
  return null;
}
