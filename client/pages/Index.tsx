import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Seo } from "@/components/Seo";
import {
  buildPath,
  buildPostPath,
  translations,
  type Language,
} from "@/lib/i18n";
import { fetchPublicPosts, getInitialPosts, isGuidePost, type BlogPost } from "@/lib/posts";
import { formatPostDate } from "@/lib/utils";

interface IndexProps {
  lang: Language;
}

type PostsStatus = "loading" | "idle" | "error";

const parseDateValue = (value: string | undefined) => {
  if (!value) {
    return 0;
  }
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? 0 : time;
};

const normalizeText = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const buildSearchText = (post: BlogPost) =>
  normalizeText(
    [
      post.title,
      post.excerpt,
      post.description,
      post.category,
      ...(post.tags ?? []),
      ...(post.keywords ?? []),
    ]
      .filter(Boolean)
      .join(" "),
  );

const postMatchesKeywords = (post: BlogPost, keywords: string[]) => {
  const haystack = buildSearchText(post);
  const tokens = new Set(haystack.match(/[a-z0-9]+/g) ?? []);
  return keywords.some((keyword) => {
    const normalized = normalizeText(keyword);
    if (!normalized) {
      return false;
    }
    if (normalized.length <= 2) {
      return tokens.has(normalized);
    }
    return haystack.includes(normalized);
  });
};

const aiKeywords = [
  "inteligencia artificial",
  "inteligência artificial",
  "ia",
  "ai",
  "machine learning",
  "algoritmo",
  "modelos",
  "llm",
  "automacao",
  "automação",
];

const isAiPost = (post: BlogPost) => postMatchesKeywords(post, aiKeywords);

export default function Index({ lang }: IndexProps) {
  const t = translations[lang];
  const articlesPath = buildPath(lang, "articles");
  const latestPath = buildPath(lang, "latest");
  const formatDate = (value?: string) => formatPostDate(value, lang);
  const initialPosts = getInitialPosts(lang);
  const [posts, setPosts] = useState<BlogPost[]>(() => initialPosts ?? []);
  const [status, setStatus] = useState<PostsStatus>(
    initialPosts ? "idle" : "loading",
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

  const portal = useMemo(() => {
    const sorted = [...posts].sort(
      (a, b) => parseDateValue(b.date) - parseDateValue(a.date),
    );
    const aiPosts = sorted.filter(isAiPost);
    const guidePosts = sorted.filter(isGuidePost);
    const featuredCandidates = sorted.filter((post) => post.featured);
    const rotatingPool = (featuredCandidates.length > 0
      ? featuredCandidates
      : sorted
    ).slice(0, 6);
    const rotationIndex =
      rotatingPool.length > 0
        ? Math.floor(Date.now() / (1000 * 60 * 60 * 24)) % rotatingPool.length
        : 0;
    const highlightPost =
      rotatingPool.length > 0 ? rotatingPool[rotationIndex] : null;

    const usedIds = new Set<string>();
    if (highlightPost) {
      usedIds.add(highlightPost.id);
    }

    const impactTopics = [
      {
        key: "work",
        label: t.home.affectsYou.topics.work,
        keywords: [
          "trabalho",
          "emprego",
          "carreira",
          "profissao",
          "profissão",
          "work",
          "job",
          "empleo",
          "trabajo",
          "produtividade",
        ],
      },
      {
        key: "money",
        label: t.home.affectsYou.topics.money,
        keywords: [
          "dinheiro",
          "financas",
          "finanças",
          "preco",
          "preço",
          "economia",
          "investimento",
          "money",
          "finance",
          "finanzas",
          "precio",
        ],
      },
      {
        key: "consumption",
        label: t.home.affectsYou.topics.consumption,
        keywords: [
          "consumo",
          "compras",
          "compra",
          "consumidor",
          "shopping",
          "consumption",
          "buying",
          "recomendacao",
          "recomendação",
          "recomendacion",
        ],
      },
      {
        key: "privacy",
        label: t.home.affectsYou.topics.privacy,
        keywords: [
          "privacidade",
          "dados",
          "rastreamento",
          "vigilancia",
          "vigilância",
          "privacy",
          "data",
          "tracking",
          "seguranca",
          "segurança",
          "seguridad",
        ],
      },
    ];

    const pickTopicPost = (keywords: string[]) => {
      const direct = aiPosts.find(
        (post) => !usedIds.has(post.id) && postMatchesKeywords(post, keywords),
      );
      if (direct) {
        usedIds.add(direct.id);
        return direct;
      }
      const fallback = aiPosts.find((post) => !usedIds.has(post.id));
      if (fallback) {
        usedIds.add(fallback.id);
        return fallback;
      }
      return null;
    };

    const affectCards = impactTopics.map((topic) => ({
      ...topic,
      post: pickTopicPost(topic.keywords),
    }));

    const aiFeed = aiPosts
      .filter((post) => !usedIds.has(post.id))
      .slice(0, 6);

    const curiosityFeed = sorted
      .filter(
        (post) =>
          !usedIds.has(post.id) && !isAiPost(post) && !isGuidePost(post),
      )
      .slice(0, 6);

    const latestFeed = sorted.slice(0, 6);
    const guideFeed = guidePosts.slice(0, 4);

    return {
      highlightPost,
      affectCards,
      aiFeed,
      curiosityFeed,
      latestFeed,
      guideFeed,
    };
  }, [posts, lang]);

  const showLoading = status === "loading";
  const showError = status === "error";
  const showEmpty = status === "idle" && posts.length === 0;

  const renderPostCard = (post: BlogPost, badge?: string) => {
    const postSlug = post.slugs?.[lang] ?? post.slug ?? post.id;
    const postPath = buildPostPath(lang, postSlug);
    const postDate = formatDate(post.date);
    const footerText = post.readTime ?? postDate;

    return (
      <Link
        key={post.id}
        to={postPath}
        className="group block rounded-xl border border-border bg-card hover:border-secondary transition-all hover:shadow-lg"
      >
        <article className="h-full">
          <div className="h-40 bg-gradient-to-br from-primary/20 to-secondary/20 overflow-hidden">
            {post.image ? (
              <img
                src={post.imageThumb ?? post.image}
                alt={post.title}
                width={640}
                height={360}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Sparkles className="w-10 h-10 text-secondary/30" />
              </div>
            )}
          </div>
          <div className="p-5">
            {badge ? (
              <div className="inline-block px-2 py-1 bg-secondary/15 text-secondary text-xs font-semibold rounded mb-3">
                {badge}
              </div>
            ) : post.category ? (
              <div className="inline-block px-2 py-1 bg-primary/10 text-primary text-xs font-semibold rounded mb-3">
                {post.category}
              </div>
            ) : null}
            <h3 className="text-xl font-bold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
              {post.title}
            </h3>
            {(post.excerpt || post.description) && (
              <p className="text-base text-foreground/80 line-clamp-2 mb-4">
                {post.excerpt ?? post.description}
              </p>
            )}
            {footerText && (
              <div className="flex items-center justify-between text-xs text-foreground/50">
                <span>{footerText}</span>
                <ArrowRight className="w-4 h-4 text-secondary group-hover:translate-x-1 transition-transform" />
              </div>
            )}
          </div>
        </article>
      </Link>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Seo
        lang={lang}
        page="home"
        title={t.meta.home.title}
        description={t.meta.home.description}
      />
      <Header lang={lang} pageKey="home" t={t} />

      <main className="flex-1">
        <section
          id="featured"
          className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background py-20 sm:py-28"
        >
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-secondary/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mb-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/10 rounded-full border border-secondary/20 mb-6">
                <Sparkles className="w-4 h-4 text-secondary" />
                <span className="text-sm font-medium text-secondary">
                  {t.hero.badge}
                </span>
              </div>
              <h1 className="text-4xl sm:text-6xl font-bold text-foreground mb-4">
                {t.hero.title}
              </h1>
              <p className="text-base sm:text-lg text-foreground/80 leading-relaxed">
                {t.hero.institutional}
              </p>
            </div>

            <div className="mb-8">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
                {t.home.highlight.title}
              </h2>
              <p className="text-lg text-foreground/80">
                {t.home.highlight.subtitle}
              </p>
            </div>

            {showLoading && (
              <div className="h-[420px] rounded-3xl border border-border bg-card/50 animate-pulse" />
            )}

            {showError && (
              <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-6 py-6 text-destructive">
                <p className="text-base font-semibold">{t.posts.errorTitle}</p>
                <p className="text-sm opacity-80">
                  {errorMessage ?? t.posts.errorDescription}
                </p>
              </div>
            )}

            {!showLoading && !showError && portal.highlightPost && (
              <Link
                to={buildPostPath(
                  lang,
                  portal.highlightPost.slugs?.[lang] ??
                    portal.highlightPost.slug ??
                    portal.highlightPost.id,
                )}
                className="group grid gap-6 lg:grid-cols-[1.2fr_0.8fr] rounded-3xl border border-border bg-card/80 overflow-hidden hover:border-secondary transition-all hover:shadow-2xl"
              >
                <div className="p-8 lg:p-10 flex flex-col justify-center">
                  {portal.highlightPost.category && (
                    <span className="inline-flex w-fit items-center px-3 py-1 rounded-full bg-secondary/15 text-secondary text-xs font-semibold uppercase tracking-wide mb-4">
                      {portal.highlightPost.category}
                    </span>
                  )}
                  <h3 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                    {portal.highlightPost.title}
                  </h3>
                  {(portal.highlightPost.excerpt ||
                    portal.highlightPost.description) && (
                    <p className="text-lg text-foreground/80 mb-6">
                      {portal.highlightPost.excerpt ??
                        portal.highlightPost.description}
                    </p>
                  )}
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-secondary">
                    {t.home.highlight.cta}
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
                <div className="relative h-64 lg:h-full bg-muted">
                  {portal.highlightPost.image ? (
                    <img
                      src={
                        portal.highlightPost.imageThumb ??
                        portal.highlightPost.image
                      }
                      alt={portal.highlightPost.title}
                      width={1200}
                      height={675}
                      loading="eager"
                      fetchPriority="high"
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
                      <Sparkles className="w-16 h-16 text-secondary/40" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                </div>
              </Link>
            )}

            {!showLoading && !showError && showEmpty && (
              <div className="rounded-xl border border-border bg-card px-6 py-8 text-center">
                <p className="text-lg font-semibold text-foreground mb-2">
                  {t.posts.emptyTitle}
                </p>
                <p className="text-sm text-foreground/80">
                  {t.posts.emptyDescription}
                </p>
              </div>
            )}
          </div>
        </section>

        <section id="impact" className="py-16 sm:py-24 border-b border-border">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
                {t.home.affectsYou.title}
              </h2>
              <p className="text-lg text-foreground/80">
                {t.home.affectsYou.subtitle}
              </p>
            </div>

            {showLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-40 rounded-2xl border border-border bg-card/50 animate-pulse"
                  />
                ))}
              </div>
            )}

            {!showLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {portal.affectCards.map((topic) => {
                  if (!topic.post) {
                    return (
                      <div
                        key={topic.key}
                        className="rounded-2xl border border-dashed border-border bg-muted/40 p-6"
                      >
                        <span className="text-xs font-semibold uppercase tracking-wide text-secondary">
                          {topic.label}
                        </span>
                        <p className="mt-4 text-base text-foreground/80">
                          {t.home.affectsYou.empty}
                        </p>
                      </div>
                    );
                  }

                  const postSlug =
                    topic.post.slugs?.[lang] ??
                    topic.post.slug ??
                    topic.post.id;
                  const postPath = buildPostPath(lang, postSlug);

                  return (
                    <Link
                      key={topic.key}
                      to={postPath}
                      className="group rounded-2xl border border-border bg-card/70 overflow-hidden hover:border-secondary hover:shadow-xl transition-all"
                    >
                      {topic.post.imageThumb || topic.post.image ? (
                        <div className="h-40 bg-muted/60 overflow-hidden">
                          <img
                            src={topic.post.imageThumb ?? topic.post.image}
                            alt={topic.post.title}
                            width={640}
                            height={360}
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      ) : (
                        <div className="h-40 bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                          <Sparkles className="w-10 h-10 text-secondary/30" />
                        </div>
                      )}
                      <div className="p-6">
                        <span className="text-xs font-semibold uppercase tracking-wide text-secondary">
                          {topic.label}
                        </span>
                        <h3 className="mt-4 text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                          {topic.post.title}
                        </h3>
                        {(topic.post.excerpt || topic.post.description) && (
                          <p className="mt-3 text-base text-foreground/80 line-clamp-3">
                            {topic.post.excerpt ?? topic.post.description}
                          </p>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        <section id="ai" className="py-16 sm:py-24 border-b border-border">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
                {t.home.ai.title}
              </h2>
              <p className="text-lg text-foreground/80">
                {t.home.ai.subtitle}
              </p>
            </div>

            {showLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-64 rounded-lg border border-border bg-card/50 animate-pulse"
                  />
                ))}
              </div>
            )}

            {!showLoading && portal.aiFeed.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {portal.aiFeed.map((post) => renderPostCard(post))}
              </div>
            )}

            {!showLoading && portal.aiFeed.length === 0 && (
              <div className="rounded-xl border border-border bg-card px-6 py-8 text-center">
                <p className="text-lg font-semibold text-foreground mb-2">
                  {t.posts.emptyTitle}
                </p>
                <p className="text-sm text-foreground/80">
                  {t.posts.emptyDescription}
                </p>
              </div>
            )}
          </div>
        </section>

        <section id="topics" className="py-16 sm:py-24 border-b border-border">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
                {t.home.curiosities.title}
              </h2>
              <p className="text-lg text-foreground/80">
                {t.home.curiosities.subtitle}
              </p>
            </div>

            {showLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-64 rounded-lg border border-border bg-card/50 animate-pulse"
                  />
                ))}
              </div>
            )}

            {!showLoading && portal.curiosityFeed.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {portal.curiosityFeed.map((post) => renderPostCard(post))}
              </div>
            )}

            {!showLoading && portal.curiosityFeed.length === 0 && (
              <div className="rounded-xl border border-border bg-card px-6 py-8 text-center">
                <p className="text-lg font-semibold text-foreground mb-2">
                  {t.posts.emptyTitle}
                </p>
                <p className="text-sm text-foreground/80">
                  {t.posts.emptyDescription}
                </p>
              </div>
            )}
          </div>
        </section>

        <section id="latest" className="py-16 sm:py-24 border-b border-border">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
                {t.home.latest.title}
              </h2>
              <p className="text-lg text-foreground/80">
                {t.home.latest.subtitle}
              </p>
            </div>

            {showLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-64 rounded-lg border border-border bg-card/50 animate-pulse"
                  />
                ))}
              </div>
            )}

            {!showLoading && portal.latestFeed.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {portal.latestFeed.map((post) => renderPostCard(post))}
              </div>
            )}

            {!showLoading && portal.latestFeed.length === 0 && (
              <div className="rounded-xl border border-border bg-card px-6 py-8 text-center">
                <p className="text-lg font-semibold text-foreground mb-2">
                  {t.posts.emptyTitle}
                </p>
                <p className="text-sm text-foreground/80">
                  {t.posts.emptyDescription}
                </p>
              </div>
            )}

            {!showLoading && portal.latestFeed.length > 0 && (
              <div className="mt-10 text-center">
                <Link
                  to={latestPath}
                  className="px-6 py-3 border-2 border-primary text-primary rounded-lg font-semibold hover:bg-primary hover:text-primary-foreground transition-all inline-flex items-center gap-2 group"
                >
                  {t.home.latest.cta}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            )}
          </div>
        </section>

        <section id="guides" className="py-16 sm:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
                {t.home.guides.title}
              </h2>
              <p className="text-lg text-foreground/80">
                {t.home.guides.subtitle}
              </p>
            </div>

            {showLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-64 rounded-lg border border-border bg-card/50 animate-pulse"
                  />
                ))}
              </div>
            )}

            {!showLoading && portal.guideFeed.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {portal.guideFeed.map((post) =>
                  renderPostCard(post, t.post.guideTitle),
                )}
              </div>
            )}

            {!showLoading && portal.guideFeed.length === 0 && (
              <div className="rounded-xl border border-border bg-card px-6 py-8 text-center">
                <p className="text-lg font-semibold text-foreground mb-2">
                  {t.home.guides.empty}
                </p>
                <p className="text-sm text-foreground/80">
                  {t.posts.emptyDescription}
                </p>
              </div>
            )}

            {!showLoading && portal.guideFeed.length > 0 && (
              <div className="mt-10 text-center">
                <Link
                  to={articlesPath}
                  className="px-6 py-3 border-2 border-secondary text-secondary rounded-lg font-semibold hover:bg-secondary hover:text-secondary-foreground transition-all inline-flex items-center gap-2 group"
                >
                  {t.home.guides.cta}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer lang={lang} t={t} />
    </div>
  );
}
