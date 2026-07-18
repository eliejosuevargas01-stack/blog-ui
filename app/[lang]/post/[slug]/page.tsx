import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PostClient from "@/components/PostClient";
import { getDbPostsForLang, prisma, mapDbPostToBlogPost } from "@/lib/db";
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
  
  let post = null;
  try {
    const dbPost = await prisma.post.findUnique({
      where: { slug: decodedSlug }
    });
    if (dbPost && dbPost.lang === lang) {
      let slugs: Record<string, string> = {};
      if (dbPost.hn_id) {
        const translations = await prisma.post.findMany({
          where: { hn_id: dbPost.hn_id },
          select: { lang: true, slug: true }
        });
        translations.forEach(t => {
          slugs[t.lang] = t.slug;
        });
      }
      post = mapDbPostToBlogPost(dbPost, slugs);
    }
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

  let initialPosts = [];
  try {
    initialPosts = await getDbPostsForLang(lang);
  } catch (error) {
    console.error("Failed to load posts", error);
  }

  return <PostClient lang={lang as Language} initialPosts={initialPosts} />;
}
