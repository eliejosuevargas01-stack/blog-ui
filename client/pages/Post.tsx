import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Image as ImageIcon,
  Maximize2,
  User,
  X,
} from "lucide-react";
import { marked } from "marked";

import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { NewsletterSection } from "@/components/NewsletterSection";
import { Seo } from "@/components/Seo";
import {
  buildPath,
  buildPostPath,
  languages,
  siteName,
  translations,
  type Language,
} from "@/lib/i18n";
import {
  fetchPublicPosts,
  getRelatedPosts,
  getInitialPosts,
  isGuidePost,
  pickGuidePost,
  type BlogPost,
} from "@/lib/posts";
import { formatPostDate } from "@/lib/utils";

interface PostProps {
  lang: Language;
}

type PostStatus = "loading" | "idle" | "error";

const normalizeHeadingHtml = (value: string) =>
  value.replace(/<\/?h1\b/gi, (match) => match.replace(/h1/i, "h2"));

const resolvePostSlug = (
  post: BlogPost | null,
  lang: Language,
  fallback?: string,
) => post?.slugs?.[lang] ?? post?.slug ?? fallback ?? "";

export default function Post({ lang }: PostProps) {
  const t = translations[lang];
  const params = useParams();
  const slugParam = useMemo(() => {
    if (!params.slug) {
      return "";
    }
    try {
      return decodeURIComponent(params.slug);
    } catch {
      return params.slug;
    }
  }, [params.slug]);
  const initialPosts = getInitialPosts(lang);
  const [posts, setPosts] = useState<BlogPost[]>(() => initialPosts ?? []);
  const [status, setStatus] = useState<PostStatus>(
    initialPosts ? "idle" : "loading",
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [activeAlt, setActiveAlt] = useState<string | null>(null);

  const articlesPath = buildPath(lang, "articles");

  useEffect(() => {
    if (initialPosts) {
      return;
    }
    let isMounted = true;

    const loadPosts = async () => {
      setStatus("loading");
      setErrorMessage(null);
      try {
        const response = await fetchPublicPosts(lang);
        if (!isMounted) {
          return;
        }
        setPosts(response);
        setStatus("idle");
      } catch (error) {
        if (!isMounted) {
          return;
        }
        setPosts([]);
        setStatus("error");
        setErrorMessage(error instanceof Error ? error.message : null);
      }
    };

    loadPosts();

    return () => {
      isMounted = false;
    };
  }, [lang, initialPosts]);

  const post = useMemo(() => {
    return posts.find((item) => {
      const candidate = item.slug ?? item.id;
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
    return getRelatedPosts(posts, post, 3);
  }, [posts, post]);
  const guidePost = useMemo(() => {
    if (!post) {
      return null;
    }
    return pickGuidePost(guideCandidates, post);
  }, [guideCandidates, post]);

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
  const guideSlug = guidePost
    ? resolvePostSlug(guidePost, lang, guidePost.slug ?? guidePost.id)
    : "";
  const guidePath = guideSlug ? buildPostPath(lang, guideSlug) : undefined;
  const seoTitle = post
    ? `${post.metaTitle ?? post.title} | ${siteName}`
    : t.post.notFoundTitle;
  const seoDescription =
    post?.metaDescription ??
    post?.description ??
    post?.excerpt ??
    t.post.notFoundDescription;
  const hasInlineHtml =
    post?.content && /<[^>]+>/.test(post.content) ? true : false;
  const publishedDate = post?.publishedAt ?? post?.date;
  const updatedDate = post?.updatedAt ?? post?.date;
  const formattedPublishedDate = publishedDate
    ? formatPostDate(publishedDate, lang)
    : null;
  const formattedUpdatedDate = updatedDate
    ? formatPostDate(updatedDate, lang)
    : null;
  const coverImage = post?.image ?? post?.images?.[0] ?? null;
  const coverImageThumb = post?.imageThumb ?? coverImage;
  const coverImageAlt = post?.imageAlt ?? post?.title ?? "Post image";
  const galleryImages =
    post?.images?.filter((image) => image && image !== coverImage) ?? [];
  const keywords = post?.keywords ?? post?.tags ?? null;
  const keywordString =
    keywords && keywords.length > 0 ? keywords.join(", ") : null;
  const mergedMetaTags = useMemo(() => {
    const tags = post?.metaTags ? [...post.metaTags] : [];
    if (coverImage && !tags.some((tag) => tag.property === "og:image")) {
      tags.push({ property: "og:image", content: coverImage });
    }
    if (coverImage && !tags.some((tag) => tag.name === "twitter:image")) {
      tags.push({ name: "twitter:image", content: coverImage });
    }
    if (keywordString && !tags.some((tag) => tag.name === "keywords")) {
      tags.push({ name: "keywords", content: keywordString });
    }
    return tags.length > 0 ? tags : undefined;
  }, [post?.metaTags, keywordString, coverImage]);
  const canonicalUrl = useMemo(() => {
    if (!canonicalPath) {
      return typeof window !== "undefined" ? window.location.href : undefined;
    }
    if (typeof window === "undefined") {
      return canonicalPath;
    }
    return `${window.location.origin}${canonicalPath}`;
  }, [canonicalPath]);
  const jsonLd = useMemo(() => {
    if (!post) {
      return undefined;
    }
    const keywordList = keywords ?? [];
    const about =
      keywordList.length > 0
        ? keywordList.map((keyword) => ({
            "@type": "Thing",
            name: keyword,
          }))
        : undefined;
    return {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      description: seoDescription,
      image: coverImage ? [coverImage] : undefined,
      author: post.author ? { "@type": "Person", name: post.author } : undefined,
      publisher: {
        "@type": "Organization",
        name: siteName,
      },
      datePublished: publishedDate ?? undefined,
      dateModified: updatedDate ?? publishedDate ?? undefined,
      inLanguage: lang === "pt" ? "pt-BR" : lang,
      mainEntityOfPage: canonicalUrl
        ? { "@type": "WebPage", "@id": canonicalUrl }
        : undefined,
      keywords: keywordString ?? undefined,
      about,
      articleSection: post.category ?? undefined,
      url: canonicalUrl ?? undefined,
    };
  }, [
    post,
    seoDescription,
    coverImage,
    canonicalUrl,
    lang,
    keywords,
    keywordString,
    publishedDate,
    updatedDate,
  ]);
  const contentClassName =
    "prose prose-neutral max-w-none prose-headings:text-foreground prose-headings:font-semibold prose-h2:mt-10 prose-h3:mt-8 prose-p:text-foreground/80 prose-strong:text-foreground prose-a:text-secondary prose-a:font-semibold hover:prose-a:text-secondary/80 prose-ul:my-6 prose-ol:my-6 prose-li:marker:text-secondary/70 prose-blockquote:border-l-4 prose-blockquote:border-secondary/40 prose-blockquote:bg-muted/60 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:text-foreground/80 prose-hr:border-border/70 prose-img:rounded-2xl prose-img:border prose-img:border-border/80 prose-img:shadow-sm";
  const markdownContent = useMemo(() => {
    if (!post?.content || post.contentHtml || hasInlineHtml) {
      return null;
    }
    try {
      const html = marked.parse(post.content, { async: false });
      return normalizeHeadingHtml(html);
    } catch {
      return null;
    }
  }, [post?.content, post?.contentHtml, hasInlineHtml]);

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

  useEffect(() => {
    if (!activeImage) {
      return;
    }
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeImage();
      }
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [activeImage, closeImage]);

  const showLoading = status === "loading";
  const showError = status === "error";
  const showNotFound = status === "idle" && !post;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Seo
        lang={lang}
        title={seoTitle}
        description={seoDescription}
        canonicalPath={canonicalPath}
        alternatePaths={languagePaths}
        metaTags={mergedMetaTags}
        jsonLd={jsonLd}
      />
      <Header lang={lang} pageKey="home" t={t} languagePaths={languagePaths} />

      <main className="flex-1">
        <section className="py-12 sm:py-16">
          <div className="container mx-auto px-4">
            <Link
              to={buildPath(lang, "home")}
              className="inline-flex items-center gap-2 text-sm font-semibold text-secondary hover:text-secondary/80 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {t.post.backToHome}
            </Link>

            {showLoading && (
              <div className="mt-10 space-y-6">
                <p className="text-sm text-foreground/80">{t.post.loading}</p>
                <div className="h-64 rounded-2xl border border-border bg-card/50 animate-pulse" />
                <div className="space-y-3">
                  <div className="h-8 w-2/3 bg-card/60 rounded" />
                  <div className="h-4 w-full bg-card/60 rounded" />
                  <div className="h-4 w-4/5 bg-card/60 rounded" />
                </div>
              </div>
            )}

            {showError && (
              <div className="mt-10 rounded-xl border border-destructive/40 bg-destructive/10 px-6 py-6 text-destructive">
                <p className="text-base font-semibold">{t.posts.errorTitle}</p>
                <p className="text-sm opacity-80">
                  {errorMessage ?? t.posts.errorDescription}
                </p>
              </div>
            )}

            {showNotFound && (
              <div className="mt-12 rounded-2xl border border-border bg-card px-8 py-10 text-center">
                <h1 className="text-2xl font-bold text-foreground mb-3">
                  {t.post.notFoundTitle}
                </h1>
                <p className="text-foreground/80 mb-6">
                  {t.post.notFoundDescription}
                </p>
                <Link
                  to={buildPath(lang, "home")}
                  className="inline-flex items-center gap-2 px-5 py-3 border-2 border-secondary text-secondary rounded-lg font-semibold hover:bg-secondary hover:text-secondary-foreground transition-all"
                >
                  {t.post.backToHome}
                </Link>
              </div>
            )}

            {post && !showLoading && !showError && (
              <article className="mt-10">
                <div className="max-w-5xl mx-auto">
                  <header className="rounded-3xl border border-border/70 bg-card/80 p-8 shadow-sm">
                    {post.category && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-secondary/15 text-secondary text-xs font-semibold uppercase tracking-wide">
                        {post.category}
                      </span>
                    )}
                    <h1 className="text-5xl sm:text-6xl font-bold text-foreground mt-4 mb-4">
                      {post.title}
                    </h1>
                    {(post.excerpt || post.description) && (
                      <p className="text-lg sm:text-xl text-foreground/80 mb-6 rounded-2xl border border-border/70 bg-muted/60 px-6 py-4 italic">
                        {post.excerpt ?? post.description}
                      </p>
                    )}
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {post.tags.map((tag) => {
                          const normalizedTag = tag.replace(/^#+/, "").trim();
                          if (!normalizedTag) {
                            return null;
                          }
                          return (
                            <Link
                              key={tag}
                              to={{
                                pathname: articlesPath,
                                search: `?tag=${encodeURIComponent(normalizedTag)}`,
                              }}
                              className="inline-flex items-center rounded-full border border-border bg-background/70 px-3 py-1 text-xs font-semibold text-foreground/80 hover:border-secondary hover:text-secondary transition-colors"
                            >
                              #{normalizedTag}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-foreground/80">
                      {post.author && (
                        <span className="inline-flex items-center gap-2">
                          <User className="w-4 h-4" />
                          {post.author}
                        </span>
                      )}
                      {formattedPublishedDate && (
                        <span className="inline-flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {t.post.publishedLabel} {formattedPublishedDate}
                        </span>
                      )}
                      {formattedUpdatedDate && (
                        <span className="inline-flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {t.post.updatedLabel} {formattedUpdatedDate}
                        </span>
                      )}
                      {post.readTime && (
                        <span className="inline-flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {post.readTime}
                        </span>
                      )}
                    </div>
                  </header>

                  <div className="mt-8 overflow-hidden rounded-3xl border border-border/70 bg-muted/60">
                    <div className="aspect-video w-full">
                      {coverImage ? (
                        <button
                          type="button"
                          onClick={() => openImage(coverImage, coverImageAlt)}
                          className="group relative h-full w-full cursor-zoom-in"
                          aria-label="Open image"
                        >
                          <img
                            src={coverImageThumb ?? coverImage}
                            alt={coverImageAlt}
                            width={1200}
                            height={675}
                            loading="eager"
                            fetchPriority="high"
                            decoding="async"
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/0 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                          <div className="absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                            <Maximize2 className="h-4 w-4" />
                          </div>
                        </button>
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/10">
                          <ImageIcon className="h-10 w-10 text-foreground/30" />
                        </div>
                      )}
                    </div>
                  </div>

                  {galleryImages.length > 0 && (
                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                      {galleryImages.map((image, index) => (
                        <div
                          key={`${image}-${index}`}
                          className="overflow-hidden rounded-2xl border border-border/70 bg-muted/50"
                        >
                          <div className="aspect-video w-full">
                            <button
                              type="button"
                              onClick={() =>
                                openImage(image, `${post.title} ${index + 1}`)
                              }
                              className="group relative h-full w-full cursor-zoom-in"
                              aria-label="Open image"
                            >
                              <img
                                src={image}
                                alt={`${post.title} ${index + 1}`}
                                width={1200}
                                height={675}
                                loading="lazy"
                                decoding="async"
                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/0 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                              <div className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                                <Maximize2 className="h-4 w-4" />
                              </div>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-10">
                    {post.contentHtml ? (
                      <div
                        className={contentClassName}
                        dangerouslySetInnerHTML={{
                          __html: normalizeHeadingHtml(post.contentHtml),
                        }}
                      />
                    ) : post.content && hasInlineHtml ? (
                      <div
                        className={contentClassName}
                        dangerouslySetInnerHTML={{
                          __html: normalizeHeadingHtml(post.content),
                        }}
                      />
                    ) : post.content ? (
                      markdownContent ? (
                        <div
                          className={contentClassName}
                          dangerouslySetInnerHTML={{ __html: markdownContent }}
                        />
                      ) : (
                        <div className={contentClassName}>
                          {post.content.split(/\n\s*\n/).map((paragraph, index) => (
                            <p key={index}>{paragraph}</p>
                          ))}
                        </div>
                      )
                    ) : null}
                  </div>

                  {guidePost && guidePath && relatedPosts.length >= 2 && (
                    <div className="mt-12 border-t border-border pt-10">
                      <div className="grid gap-8 lg:grid-cols-[1.2fr_2fr]">
                        <div className="rounded-2xl border border-border bg-card/70 p-6">
                          <h2 className="text-lg font-semibold text-foreground mb-4">
                            {t.post.guideTitle}
                          </h2>
                          <Link
                            to={guidePath}
                            className="block rounded-xl border border-border bg-background p-4 hover:border-secondary hover:shadow-lg transition-all"
                          >
                            <h3 className="text-xl font-bold text-foreground mb-2">
                              {guidePost.title}
                            </h3>
                            {(guidePost.excerpt || guidePost.description) && (
                              <p className="text-sm text-foreground/80 line-clamp-3">
                                {guidePost.excerpt ?? guidePost.description}
                              </p>
                            )}
                          </Link>
                        </div>

                        <div className="rounded-2xl border border-border bg-muted/40 p-6">
                          <h2 className="text-lg font-semibold text-foreground mb-4">
                            {t.post.relatedTitle}
                          </h2>
                          <div className="grid gap-4 sm:grid-cols-2">
                            {relatedPosts.map((related) => {
                              const relatedSlug = resolvePostSlug(
                                related,
                                lang,
                                related.slug ?? related.id,
                              );
                              const relatedPath = relatedSlug
                                ? buildPostPath(lang, relatedSlug)
                                : buildPath(lang, "home");
                              return (
                                <Link
                                  key={related.id}
                                  to={relatedPath}
                                  className="block rounded-xl border border-border bg-background p-4 hover:border-secondary hover:shadow-lg transition-all"
                                >
                                  <h3 className="text-base font-semibold text-foreground mb-2 line-clamp-2">
                                    {related.title}
                                  </h3>
                                  {(related.excerpt || related.description) && (
                                    <p className="text-sm text-foreground/80 line-clamp-3">
                                      {related.excerpt ?? related.description}
                                    </p>
                                  )}
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </article>
            )}
          </div>
        </section>
        <NewsletterSection t={t} />
      </main>

      {activeImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 py-10"
          role="dialog"
          aria-modal="true"
          onClick={closeImage}
        >
          <button
            type="button"
            onClick={closeImage}
            className="absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-full bg-black/70 text-white transition hover:bg-black/90"
            aria-label="Close image"
          >
            <X className="h-4 w-4" />
          </button>
          <div
            className="w-full max-w-5xl"
            onClick={(event) => event.stopPropagation()}
          >
            <img
              src={activeImage}
              alt={activeAlt ?? coverImageAlt}
              className="max-h-[80vh] w-full rounded-2xl border border-white/10 bg-black/40 object-contain shadow-2xl"
            />
          </div>
        </div>
      )}

      <Footer lang={lang} t={t} />
    </div>
  );
}
