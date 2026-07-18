import type { Metadata } from "next";
import { notFound } from "next/navigation";
import IndexClient from "@/components/IndexClient";
import { getDbPostsForLang } from "@/lib/db";
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

  let initialPosts: unknown[] = [];
  try {
    initialPosts = await getDbPostsForLang(lang);
  } catch (error) {
    console.error("Failed to load posts from database", error);
  }

  return <IndexClient lang={lang as Language} initialPosts={initialPosts as never} />;
}

