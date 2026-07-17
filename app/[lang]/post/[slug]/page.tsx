import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PostClient from "@/components/PostClient";
import { loadPostsForLang } from "@/lib/posts-server";
import { languages, translations, siteName, type Language } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { lang: string; slug: string };
}): Promise<Metadata> {
  const { lang, slug } = params;
  if (!languages.includes(lang as Language)) {
    return {};
  }
  const decodedSlug = decodeURIComponent(slug);
  const rootDir =
    process.env.GENERATED_DIR?.trim() || "/app/html-storage/posts";
  
  let post = null;
  try {
    const data = await loadPostsForLang(rootDir, lang as Language);
    post = data.posts.find(item => (item.slug ?? item.id) === decodedSlug);
  } catch (error) {
    // Ignore error
  }

  const t = translations[lang as Language];
  if (!post) {
    return {
      title: t?.post.notFoundTitle ?? "Not Found",
      description: t?.post.notFoundDescription ?? "",
    };
  }

  return {
    title: `${post.metaTitle ?? post.title} | ${siteName}`,
    description: post.metaDescription ?? post.description ?? post.excerpt ?? t?.post.notFoundDescription,
  };
}

export default async function PostPage({
  params,
}: {
  params: { lang: string; slug: string };
}) {
  const { lang } = params;
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
    console.error("Failed to load posts", error);
  }

  return <PostClient lang={lang as Language} initialPosts={initialPosts} />;
}
