import type { Metadata } from "next";
import { notFound } from "next/navigation";
import IndexClient from "@/components/IndexClient";
import { loadPostsForLang } from "@/lib/posts-server";
import { languages, translations, type Language } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { lang: string };
}): Promise<Metadata> {
  const { lang } = params;
  const t = translations[lang as Language];
  if (!t) return {};

  return {
    title: t.meta.home.title,
    description: t.meta.home.description,
  };
}

export default async function IndexPage({
  params,
}: {
  params: { lang: string };
}) {
  const { lang } = params;
  if (!languages.includes(lang as Language)) {
    notFound();
  }

  const rootDir =
    process.env.GENERATED_DIR?.trim() || "/app/html-storage/posts";

  let initialPosts: unknown[] = [];
  try {
    const data = await loadPostsForLang(rootDir, lang as Language);
    initialPosts = data.posts;
  } catch (error) {
    console.error("Failed to load posts", error);
  }

  return <IndexClient lang={lang as Language} initialPosts={initialPosts as never} />;
}

