"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Eye,
  Image as ImageIcon,
  Maximize2,
  Tag as TagIcon,
  User,
  X,
} from "lucide-react";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { NewsletterSection } from "@/components/NewsletterSection";
import { Seo } from "@/components/Seo";
import AudioNarrationPlayer from "@/components/AudioNarrationPlayer";
import PostActionsBar from "@/components/PostActionsBar";
import TableOfContents from "@/components/TableOfContents";
import CommentsSection from "@/components/CommentsSection";
import PostViewTracker from "@/components/PostViewTracker";
import Sidebar from "@/components/Sidebar";
import {
  buildPath,
  buildPostPath,
  languages,
  siteName,
  translations,
  type Language,
} from "@/lib/i18n";
import {
  fetchLivePosts,
  getRelatedPosts,
  getInitialPosts,
  isGuidePost,
  pickGuidePost,
  type BlogPost,
} from "@/lib/posts";
import { formatPostDate } from "@/lib/utils";

interface PostProps {
  lang: Language;
  initialPosts?: BlogPost[];
}

type PostStatus = "loading" | "idle" | "error";

function cleanBlockHtml(html: string): string {
  if (!html) return "";
  return html
    .replace(/<p>\s*(?:Image|Imagem)\s*URL\s*:?\s*https?:\/\/[^\s<]+\s*<\/p>/gi, "")
    .replace(/(?:Image|Imagem)\s*URL\s*:?\s*https?:\/\/[^\s<]+/gi, "")
    .replace(/\{[^}]*\}=\d+\{[^}]*\}/gi, "")
    .trim();
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function injectHeadingIds(html: string): string {
  if (!html) return "";
  return html.replace(/<(h[23])\b([^>]*)>(.*?)<\/\1>/gi, (match, tag, attrs, content) => {
    if (attrs.includes('id=')) return match;
    const cleanText = content.replace(/<[^>]*>/g, "");
    const id = slugify(cleanText);
    return `<${tag}${attrs} id="${id}">${content}</${tag}>`;
  });
}

const resolvePostSlug = (
  post: BlogPost | null,
  lang: Language,
  fallback?: string,
) => post?.slugs?.[lang] ?? post?.slug ?? fallback ?? "";

export default function Post({ lang, initialPosts: propsInitialPosts }: PostProps) {
  const t = translations[lang];
  const params = useParams();
  const slugParam = useMemo(() => {
    const slug = params?.slug;
    if (!slug) {
      return "";
    }
    const slugStr = Array.isArray(slug) ? slug[0] : slug;
    try {
      return decodeURIComponent(slugStr);
    } catch {
      return slugStr;
    }
  }, [params?.slug]);
  const initialPosts = propsInitialPosts ?? getInitialPosts(lang);
  const [posts, setPosts] = useState<BlogPost[]>(() => initialPosts ?? []);
  const [status, setStatus] = useState<PostStatus>(
    initialPosts ? "idle" : "loading",
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [activeAlt, setActiveAlt] = useState<string | null>(null);

  const articlesPath = buildPath(lang, "articles");

  useEffect(() => {
    let isMounted = true;
    const shouldSurfaceError = !initialPosts;

    const loadPosts = async () => {
      if (!initialPosts) {
        setStatus("loading");
      }
      setErrorMessage(null);
      try {
        const response = await fetchLivePosts(lang);
        if (!isMounted) {
          return;
        }
        setPosts(response);
        setStatus("idle");
      } catch (error) {
        if (!isMounted) {
          return;
        }
        if (shouldSurfaceError) {
          setPosts([]);
          setStatus("error");
          setErrorMessage(error instanceof Error ? error.message : null);
          return;
        }
        setStatus("idle");
      }
    };

    loadPosts();

    return () => {
      isMounted = false;
    };
  }, [lang, initialPosts]);

  const post = useMemo(() => {
    return posts.find((item) => {
      const candidate = String(item.slug ?? item.id);
      if (!candidate) {
        return false;
      }
      try {
        return decodeURIComponent(candidate) === slugParam;
      } catch {
        return candidate === slugParam;
      }
    });
  }, [posts, slugParam]);

  const guideCandidates = useMemo(
    () => posts.filter(isGuidePost),
    [posts],
  );
  const relatedPosts = useMemo(() => {
    if (!post) {
      return [];
    }
    return getRelatedPosts(posts, post, 2);
  }, [posts, post]);

  const languagePaths = useMemo(() => {
    if (!slugParam && !post) {
      return undefined;
    }
    const paths: Partial<Record<Language, string>> = {};
    languages.forEach((language) => {
      const fallbackSlug = language === lang ? slugParam : undefined;
      const slug = resolvePostSlug(post, language, fallbackSlug);
      if (slug) {
        paths[language] = buildPostPath(language, slug);
      }
    });
    return Object.keys(paths).length > 0 ? paths : undefined;
  }, [lang, post, slugParam]);

  const canonicalSlug = resolvePostSlug(post, lang, slugParam);
  const canonicalPath = canonicalSlug ? buildPostPath(lang, canonicalSlug) : undefined;
  const seoTitle = post
    ? `${post.metaTitle ?? post.title} | ${siteName}`
    : t.post.notFoundTitle;
  const seoDescription =
    post?.metaDescription ??
    post?.description ??
    post?.excerpt ??
    t.post.notFoundDescription;

  const publishedDate = post?.publishedAt ?? post?.date;
  const updatedDate = post?.updatedAt ?? post?.date;
  const formattedPublishedDate = publishedDate
    ? formatPostDate(typeof publishedDate === "string" ? publishedDate : publishedDate.toISOString(), lang)
    : null;
  const formattedUpdatedDate = updatedDate
    ? formatPostDate(typeof updatedDate === "string" ? updatedDate : updatedDate.toISOString(), lang)
    : null;

  const coverImage = post?.image ?? post?.images?.[0] ?? null;
  const coverImageAlt = post?.imageAlt ?? post?.title ?? "Post image";

  const dynamicPostTags: string[] = post?.tags || [post?.category || post?.tag || "Tecnologia"].filter(Boolean);

  const blocks: any[] = useMemo(() => {
    if (!post) return [];
    if (Array.isArray(post.blocks) && post.blocks.length > 0) return post.blocks;
    if (typeof post.blocks === "string") {
      try {
        return JSON.parse(post.blocks);
      } catch (e) {
        // fallback
      }
    }
    const paragraphs = (post.content ?? post.contentHtml ?? "").split("\n\n").filter(Boolean);
    const htmlParagraphs = paragraphs.map((p: string) => {
      if (p.startsWith("**") && p.endsWith("**")) {
        return `<h2>${p.replace(/\*\*/g, "")}</h2>`;
      }
      return `<p>${p.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')}</p>`;
    });

    const size = Math.ceil(htmlParagraphs.length / 3);
    const result: any[] = [];
    for (let i = 0; i < 3; i++) {
      result.push({
        text: htmlParagraphs.slice(i * size, (i + 1) * size).join("\n"),
        image: "",
        focalPoint: "center"
      });
    }
    return result;
  }, [post]);

  const contentClassName =
    "prose prose-invert max-w-none text-slate-300 text-base leading-relaxed prose-headings:text-white prose-headings:font-bold prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3 prose-p:text-slate-300 prose-p:leading-relaxed prose-strong:text-white prose-a:text-cyan-400 prose-a:font-semibold hover:prose-a:text-cyan-300 prose-ul:my-6 prose-ol:my-6 prose-li:marker:text-cyan-400 prose-blockquote:border-l-4 prose-blockquote:border-cyan-500/50 prose-blockquote:bg-slate-900/60 prose-blockquote:py-3 prose-blockquote:px-5 prose-blockquote:rounded-r-xl prose-blockquote:text-slate-300 prose-hr:border-slate-800 prose-img:rounded-2xl prose-img:border prose-img:border-slate-800 prose-img:shadow-lg";

  const openImage = useCallback(
    (src: string, alt?: string) => {
      setActiveImage(src);
      setActiveAlt(alt ?? post?.title ?? "Post image");
    },
    [post?.title],
  );

  const closeImage = useCallback(() => {
    setActiveImage(null);
    setActiveAlt(null);
  }, []);

  const showLoading = status === "loading";
  const showError = status === "error";
  const showNotFound = status === "idle" && !post;

  return (
    <div className="flex flex-col min-h-screen bg-[#090d16] text-slate-100">
      <Seo
        lang={lang}
        title={seoTitle}
        description={seoDescription}
        canonicalPath={canonicalPath}
        alternatePaths={languagePaths}
      />
      <Header lang={lang} pageKey="home" t={t} languagePaths={languagePaths} />

      {post && <PostViewTracker postId={post.id} />}

      <main className="flex-1">
        {showLoading && (
          <div className="container mx-auto px-4 py-16 space-y-6">
            <div className="h-96 rounded-3xl border border-slate-800 bg-slate-900/50 animate-pulse" />
            <div className="space-y-4 max-w-4xl mx-auto">
              <div className="h-10 w-2/3 bg-slate-900 rounded-xl" />
              <div className="h-4 w-full bg-slate-900 rounded-lg" />
              <div className="h-4 w-4/5 bg-slate-900 rounded-lg" />
            </div>
          </div>
        )}

        {showError && (
          <div className="container mx-auto px-4 py-16 max-w-3xl">
            <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 px-6 py-6 text-rose-300">
              <p className="text-base font-semibold">{t.posts.errorTitle}</p>
              <p className="text-sm opacity-80">{errorMessage ?? t.posts.errorDescription}</p>
            </div>
          </div>
        )}

        {showNotFound && (
          <div className="container mx-auto px-4 py-20 max-w-xl text-center">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/80 px-8 py-12 backdrop-blur-md">
              <h1 className="text-3xl font-bold text-white mb-3">{t.post.notFoundTitle}</h1>
              <p className="text-slate-400 mb-8">{t.post.notFoundDescription}</p>
              <Link
                href={buildPath(lang, "home")}
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl font-bold uppercase tracking-wider text-xs transition-all shadow-lg shadow-cyan-500/20"
              >
                <ArrowLeft className="w-4 h-4" />
                {t.post.backToHome}
              </Link>
            </div>
          </div>
        )}

        {post && !showLoading && !showError && (
          <article className="pb-16">
            {/* HERO BANNER SECTION */}
            <div className="relative w-full overflow-hidden" style={{ height: "55vh", minHeight: "380px" }}>
              {coverImage ? (
                <Image
                  src={coverImage}
                  alt={coverImageAlt}
                  fill
                  priority
                  sizes="100vw"
                  className="object-cover"
                  style={{ objectPosition: (post as any).imgFocalPoint || "center" }}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950/40" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#090d16] via-[#090d16]/60 to-transparent" />

              <div className="absolute inset-0 flex flex-col justify-end max-w-7xl mx-auto px-4 md:px-8 pb-10 z-10">
                <Link
                  href={buildPath(lang, "home")}
                  className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400 hover:text-cyan-300 transition-colors mb-4 w-fit"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {t.post.backToHome}
                </Link>

                <div className="flex flex-wrap items-center gap-3 mb-3">
                  {post.category && (
                    <span className="px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-bold uppercase tracking-wider">
                      {post.category}
                    </span>
                  )}
                  {post.readTime && (
                    <span className="inline-flex items-center gap-1.5 text-xs text-slate-300">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" />
                      {post.readTime}
                    </span>
                  )}
                  {(post as any).views !== undefined && (
                    <span className="inline-flex items-center gap-1.5 text-xs text-slate-300">
                      <Eye className="w-3.5 h-3.5 text-purple-400" />
                      {(post as any).views || 0} visualizações
                    </span>
                  )}
                  {formattedPublishedDate && (
                    <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      {formattedPublishedDate}
                    </span>
                  )}
                </div>

                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight max-w-4xl">
                  {post.title}
                </h1>
              </div>
            </div>

            {/* CONTENT + SIDEBAR GRID */}
            <div className="max-w-7xl mx-auto px-4 md:px-8 mt-8 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-12">
              <div>
                {/* Excerpt callout box */}
                {(post.excerpt || post.description) && (
                  <p className="text-lg text-slate-300 leading-relaxed border-l-4 border-cyan-400 pl-5 py-2 mb-8 bg-slate-900/60 rounded-r-2xl border-y border-r border-slate-800/60 italic">
                    {post.excerpt ?? post.description}
                  </p>
                )}

                {/* Audio Narration Player */}
                <AudioNarrationPlayer audioUrl={(post as any).audioUrl} title={post.title} lang={lang} />

                {/* Post Actions Bar (Likes + Share) */}
                <PostActionsBar postId={post.id} postTitle={post.title} initialLikes={(post as any).likes || 0} />

                {/* Table of Contents */}
                <TableOfContents blocks={blocks} />

                {/* Dynamic Content Blocks Loop */}
                <div className="space-y-8">
                  {blocks.map((block: any, i: number) => {
                    const cleanedText = cleanBlockHtml(injectHeadingIds(block.text || ""));
                    const hasImageInText = cleanedText.includes("<img");
                    const isImageAlreadyInText = block.image && cleanedText.includes(block.image);

                    return (
                      <div key={i} className="flex flex-col gap-6">
                        <div
                          className={contentClassName}
                          dangerouslySetInnerHTML={{ __html: cleanedText }}
                        />

                        {block.image && !hasImageInText && !isImageAlreadyInText && (
                          <div className="relative overflow-hidden w-full h-[380px] border border-slate-800 rounded-2xl shadow-xl bg-slate-950">
                            <Image
                              src={block.image}
                              alt={`Ilustração do bloco ${i + 1}`}
                              fill
                              className="object-cover"
                              style={{ objectPosition: block.focalPoint || "center" }}
                              loading="lazy"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Dynamic Tags Row */}
                {dynamicPostTags.length > 0 && (
                  <div className="mt-10 pt-6 border-t border-slate-800 flex items-center gap-3 flex-wrap">
                    <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">Tags:</span>
                    {dynamicPostTags.map((tag) => (
                      <Link
                        key={tag}
                        href={`${articlesPath}?tag=${encodeURIComponent(tag.replace(/^#+/, "").trim())}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-900 border border-slate-800 hover:border-cyan-500/50 text-xs font-semibold text-slate-300 hover:text-cyan-400 rounded-xl transition-all"
                      >
                        <TagIcon className="w-3 h-3 text-cyan-400" />
                        #{tag.replace(/^#+/, "").trim()}
                      </Link>
                    ))}
                  </div>
                )}

                {/* Related Posts */}
                {relatedPosts.length > 0 && (
                  <div className="mt-14 pt-10 border-t border-slate-800">
                    <div className="flex items-center gap-3 mb-6">
                      <span className="block w-1.5 h-7 bg-gradient-to-b from-cyan-400 to-blue-600 rounded-full" />
                      <h3 className="text-2xl font-bold uppercase tracking-wider text-white">
                        Posts Recomendados
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {relatedPosts.map((p) => {
                        const pUrl = buildPostPath(lang, resolvePostSlug(p, lang));
                        return (
                          <article key={p.id} className="group bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-slate-700 hover:shadow-xl hover:shadow-cyan-950/30">
                            <Link href={pUrl} className="block">
                              <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
                                {p.image && (
                                  <Image
                                    src={p.image}
                                    alt={p.title}
                                    fill
                                    sizes="(max-width: 640px) 100vw, 50vw"
                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                  />
                                )}
                                {p.category && (
                                  <span className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-slate-950/80 border border-slate-700 text-cyan-400 backdrop-blur-md">
                                    {p.category}
                                  </span>
                                )}
                              </div>
                              <div className="p-5">
                                <h4 className="text-base font-bold text-white line-clamp-2 group-hover:text-cyan-400 transition-colors mb-2">
                                  {p.title}
                                </h4>
                                {p.readTime && (
                                  <span className="text-xs text-slate-400 flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5 text-cyan-400" /> {p.readTime}
                                  </span>
                                )}
                              </div>
                            </Link>
                          </article>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Comments Section */}
                <CommentsSection postId={post.id} />
              </div>

              {/* Sidebar */}
              <Sidebar postTags={dynamicPostTags} lang={lang} t={t} />
            </div>
          </article>
        )}
      </main>

      <Footer lang={lang} t={t} />
    </div>
  );
}
