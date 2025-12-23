import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Sparkles,
  TrendingUp,
  Zap,
  Brain,
  LineChart,
} from "lucide-react";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Seo } from "@/components/Seo";
import { NewsletterSection } from "@/components/NewsletterSection";
import {
  buildPath,
  buildPostPath,
  translations,
  type Language,
} from "@/lib/i18n";
import { fetchPosts, type BlogPost } from "@/lib/posts";
import {
  buildTopicPath,
  collectTopicSummaries,
  normalizeTopicKey,
} from "@/lib/topics";
import { formatPostDate } from "@/lib/utils";

const categoryVisuals = [
  {
    icon: Brain,
    color: "from-purple-500/10 to-transparent",
  },
  {
    icon: Zap,
    color: "from-blue-500/10 to-transparent",
  },
  {
    icon: TrendingUp,
    color: "from-emerald-500/10 to-transparent",
  },
  {
    icon: LineChart,
    color: "from-amber-500/10 to-transparent",
  },
];

const categoryLabels = {
  pt: { about: "Artigos sobre", singular: "artigo", plural: "artigos" },
  en: { about: "Articles about", singular: "article", plural: "articles" },
  es: { about: "Articulos sobre", singular: "articulo", plural: "articulos" },
} as const;

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

export default function Index({ lang }: IndexProps) {
  const t = translations[lang];
  const homePath = buildPath(lang, "home");
  const articlesPath = buildPath(lang, "articles");
  const latestPath = buildPath(lang, "latest");
  const formatDate = (value?: string) => formatPostDate(value, lang);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [status, setStatus] = useState<PostsStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadPosts = async () => {
      setStatus("loading");
      setErrorMessage(null);
      try {
        const response = await fetchPosts(lang);
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
  }, [lang]);

  const { featuredPosts, latestPosts } = useMemo(() => {
    const featuredCandidates = posts.filter((post) => post.featured);
    const featuredList =
      featuredCandidates.length > 0 ? featuredCandidates : posts.slice(0, 3);
    const latestList = [...posts].sort(
      (a, b) => parseDateValue(b.date) - parseDateValue(a.date),
    );
    return {
      featuredPosts: featuredList,
      latestPosts: latestList,
    };
  }, [posts]);

  const categoryCards = useMemo(() => {
    const summaries = collectTopicSummaries(posts);
    const labels = categoryLabels[lang] ?? categoryLabels.pt;
    const baseCards = new Map<string, (typeof t.categories.cards)[number]>();
    t.categories.cards.forEach((card) => {
      const key = normalizeTopicKey(card.title);
      if (key) {
        baseCards.set(key, card);
      }
    });

    const cards = summaries.map((summary) => {
      const baseCard = baseCards.get(summary.slug);
      const title = baseCard?.title ?? summary.title;
      const description =
        baseCard?.description ?? `${labels.about} ${title}`;
      return {
        key: summary.slug,
        title,
        description,
        count: summary.count,
      };
    });

    cards.sort(
      (a, b) => b.count - a.count || a.title.localeCompare(b.title),
    );

    return cards.map((card) => ({
      key: card.key,
      title: card.title,
      description: card.description,
      count: `${card.count} ${
        card.count === 1 ? labels.singular : labels.plural
      }`,
    }));
  }, [posts, t.categories.cards, lang]);

  const showLoading = status === "loading";
  const showError = status === "error";
  const showEmpty = status === "idle" && posts.length === 0;

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
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background py-20 sm:py-32">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-secondary/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/10 rounded-full border border-secondary/20 mb-6">
                <Sparkles className="w-4 h-4 text-secondary" />
                <span className="text-sm font-medium text-secondary">
                  {t.hero.badge}
                </span>
              </div>

              <h1 className="text-5xl sm:text-7xl font-bold bg-gradient-to-r from-primary via-primary to-secondary bg-clip-text text-transparent mb-6">
                {t.hero.title}
              </h1>

              <p className="text-xl sm:text-2xl text-foreground/70 mb-8 leading-relaxed">
                {t.hero.description.lead}
                <span className="font-semibold text-primary">
                  {t.hero.highlights.technology}
                </span>
                ,{" "}
                <span className="font-semibold text-secondary">
                  {t.hero.highlights.ai}
                </span>
                ,{" "}
                <span className="font-semibold text-primary">
                  {t.hero.highlights.business}
                </span>
                {t.hero.description.and}
                <span className="font-semibold text-secondary">
                  {t.hero.highlights.marketing}
                </span>
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Link
                  to={{ pathname: homePath, hash: "#newsletter" }}
                  className="px-8 py-4 bg-primary text-primary-foreground rounded-lg font-semibold hover:shadow-xl hover:shadow-primary/20 transition-all hover:scale-105 flex items-center justify-center gap-2 group"
                >
                  {t.hero.ctaPrimary}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to={latestPath}
                  className="px-8 py-4 border-2 border-secondary text-secondary rounded-lg font-semibold hover:bg-secondary hover:text-secondary-foreground transition-all"
                >
                  {t.hero.ctaSecondary}
                </Link>
              </div>

              <p className="text-sm text-foreground/50">{t.hero.stat}</p>
            </div>
          </div>
        </section>

        {/* Featured Articles Section */}
        <section
          id="featured"
          className="scroll-mt-24 py-20 sm:py-32 border-b border-border"
        >
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto mb-16">
              <h2 className="text-5xl sm:text-6xl font-bold text-foreground mb-4">
                {t.featured.title}
              </h2>
              <p className="text-xl text-foreground/60">
                {t.featured.subtitle}
              </p>
            </div>

            {showLoading && (
              <div className="space-y-6">
                <p className="text-sm text-foreground/60">{t.posts.loading}</p>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div
                      key={index}
                      className={`rounded-xl border border-border bg-card/50 animate-pulse ${
                        index === 0 ? "lg:col-span-2 lg:row-span-2 h-96" : "h-64"
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

            {showError && (
              <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-6 py-6 text-destructive">
                <p className="text-base font-semibold">{t.posts.errorTitle}</p>
                <p className="text-sm opacity-80">
                  {errorMessage ?? t.posts.errorDescription}
                </p>
              </div>
            )}

            {showEmpty && (
              <div className="rounded-xl border border-border bg-card px-6 py-8 text-center">
                <p className="text-lg font-semibold text-foreground mb-2">
                  {t.posts.emptyTitle}
                </p>
                <p className="text-sm text-foreground/60">
                  {t.posts.emptyDescription}
                </p>
              </div>
            )}

            {!showLoading && !showError && !showEmpty && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {featuredPosts.map((post, index) => {
                  const postSlug = post.slug ?? post.id;
                  const postPath = buildPostPath(lang, postSlug);
                  const postDate = formatDate(post.date);
                  return (
                    <Link
                      key={post.id}
                      to={postPath}
                      className={`group block rounded-xl overflow-hidden border border-border bg-card hover:border-secondary transition-all hover:shadow-xl hover:shadow-secondary/10 ${
                        index === 0 ? "lg:col-span-2 lg:row-span-2" : ""
                      }`}
                    >
                      <article className="h-full">
                        <div
                          className={`relative overflow-hidden bg-muted ${
                            index === 0 ? "h-96" : "h-48"
                          }`}
                        >
                      {post.image ? (
                        <img
                          src={post.imageThumb ?? post.image}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
                          <Sparkles className="w-12 h-12 text-secondary/40" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      {post.category && (
                        <div className="absolute top-4 left-4">
                          <span className="inline-block px-3 py-1 bg-secondary text-secondary-foreground text-xs font-semibold rounded-full">
                            {post.category}
                          </span>
                        </div>
                      )}
                        </div>

                        <div className="p-6">
                      <h3 className="text-2xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors line-clamp-2">
                        {post.title}
                      </h3>

                      {(post.excerpt || post.description) && (
                        <p className="text-foreground/60 text-base mb-4 line-clamp-2">
                          {post.excerpt ?? post.description}
                        </p>
                      )}

                      {(post.author || postDate || post.readTime) && (
                        <div className="flex items-center justify-between pt-4 border-t border-border text-xs text-foreground/50">
                          <div className="flex items-center gap-2">
                            {post.author && <span>{post.author}</span>}
                            {post.author && postDate && <span>•</span>}
                            {postDate && <span>{postDate}</span>}
                          </div>
                          {post.readTime && <span>{post.readTime}</span>}
                        </div>
                      )}
                        </div>
                      </article>
                    </Link>
                  );
                })}
              </div>
            )}

            {!showLoading && !showError && !showEmpty && (
              <div className="mt-12 text-center">
                <Link
                  to={articlesPath}
                  className="px-6 py-3 border-2 border-primary text-primary rounded-lg font-semibold hover:bg-primary hover:text-primary-foreground transition-all inline-flex items-center gap-2 group"
                >
                  {t.featured.viewAll}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Categories Section */}
        <section
          id="topics"
          className="scroll-mt-24 py-20 sm:py-32 border-b border-border"
        >
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto mb-16">
              <h2 className="text-5xl sm:text-6xl font-bold text-foreground mb-4">
                {t.categories.title}
              </h2>
              <p className="text-xl text-foreground/60">
                {t.categories.subtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {categoryCards.map((cat, index) => {
                const visual = categoryVisuals[index % categoryVisuals.length];
                const Icon = visual.icon;
                const topicPath = buildTopicPath(lang, cat.key);
                return (
                  <Link
                    key={cat.key}
                    to={topicPath}
                    className="relative group"
                  >
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${visual.color} rounded-xl blur-xl transition-all group-hover:blur-2xl`}
                    />
                    <div className="relative border border-border bg-card rounded-xl p-8 hover:border-secondary transition-all hover:shadow-xl">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center mb-4">
                        <Icon className="w-6 h-6 text-primary-foreground" />
                      </div>
                      <h3 className="text-3xl font-bold text-foreground mb-2">
                        {cat.title}
                      </h3>
                      <p className="text-foreground/60 mb-4 text-lg">
                        {cat.description}
                      </p>
                      <div className="flex items-center justify-between pt-4 border-t border-border">
                        <span className="text-sm text-secondary font-semibold">
                          {cat.count}
                        </span>
                        <ArrowRight className="w-4 h-4 text-secondary group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        <NewsletterSection t={t} />

        {/* Recent Articles Preview */}
        <section id="latest" className="scroll-mt-24 py-20 sm:py-32">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto mb-16">
              <h2 className="text-5xl sm:text-6xl font-bold text-foreground mb-4">
                {t.latest.title}
              </h2>
              <p className="text-xl text-foreground/60">
                {t.latest.subtitle}
              </p>
            </div>

            {showLoading && (
              <div className="space-y-6">
                <p className="text-sm text-foreground/60">{t.posts.loading}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div
                      key={index}
                      className="h-64 rounded-lg border border-border bg-card/50 animate-pulse"
                    />
                  ))}
                </div>
              </div>
            )}

            {showError && (
              <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-6 py-6 text-destructive">
                <p className="text-base font-semibold">{t.posts.errorTitle}</p>
                <p className="text-sm opacity-80">
                  {errorMessage ?? t.posts.errorDescription}
                </p>
              </div>
            )}

            {showEmpty && (
              <div className="rounded-xl border border-border bg-card px-6 py-8 text-center">
                <p className="text-lg font-semibold text-foreground mb-2">
                  {t.posts.emptyTitle}
                </p>
                <p className="text-sm text-foreground/60">
                  {t.posts.emptyDescription}
                </p>
              </div>
            )}

            {!showLoading && !showError && !showEmpty && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {latestPosts.map((post) => {
                  const postSlug = post.slug ?? post.id;
                  const postPath = buildPostPath(lang, postSlug);
                  const postDate = formatDate(post.date);
                  const footerText = post.readTime ?? postDate;
                  return (
                    <Link
                      key={post.id}
                      to={postPath}
                      className="group block rounded-lg border border-border bg-card hover:border-secondary transition-all hover:shadow-lg"
                    >
                      <article className="h-full">
                        <div className="h-40 bg-gradient-to-br from-primary/20 to-secondary/20 overflow-hidden">
                      {post.image ? (
                        <img
                          src={post.imageThumb ?? post.image}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Sparkles className="w-12 h-12 text-secondary/30" />
                        </div>
                      )}
                        </div>
                        <div className="p-5">
                      {post.category && (
                        <div className="inline-block px-2 py-1 bg-primary/10 text-primary text-xs font-semibold rounded mb-3">
                          {post.category}
                        </div>
                      )}
                      <h3 className="text-xl font-bold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                        {post.title}
                      </h3>
                      {(post.excerpt || post.description) && (
                        <p className="text-base text-foreground/60 line-clamp-2 mb-4">
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
                })}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer lang={lang} t={t} />
    </div>
  );
}
