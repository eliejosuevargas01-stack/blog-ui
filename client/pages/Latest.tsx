import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";

import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { NewsletterSection } from "@/components/NewsletterSection";
import { Seo } from "@/components/Seo";
import { buildPath, buildPostPath, translations, type Language } from "@/lib/i18n";
import { fetchPublicPosts, type BlogPost } from "@/lib/posts";
import { formatPostDate } from "@/lib/utils";

interface LatestProps {
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

export default function Latest({ lang }: LatestProps) {
  const t = translations[lang];
  const homePath = buildPath(lang, "home");
  const articlesPath = buildPath(lang, "articles");
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [status, setStatus] = useState<PostsStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
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
  }, [lang]);

  const showLoading = status === "loading";
  const showError = status === "error";
  const showEmpty = status === "idle" && posts.length === 0;

  const latestPosts = useMemo(() => {
    return [...posts].sort(
      (a, b) => parseDateValue(b.date) - parseDateValue(a.date),
    );
  }, [posts]);

  const formatDate = (value?: string) => formatPostDate(value, lang);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Seo
        lang={lang}
        page="latest"
        title={t.meta.latest.title}
        description={t.meta.latest.description}
      />
      <Header lang={lang} pageKey="latest" t={t} />

      <main className="flex-1">
        <section className="relative overflow-hidden bg-gradient-to-b from-secondary/10 via-background to-background py-16 sm:py-24">
          <div className="absolute inset-0">
            <div className="absolute -top-32 -right-32 w-72 h-72 bg-secondary/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-32 -left-32 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <Link
              to={homePath}
              className="inline-flex items-center gap-2 text-sm font-semibold text-secondary hover:text-secondary/80 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {t.post.backToHome}
            </Link>

            <div className="mt-10 max-w-4xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 text-xs font-semibold text-secondary uppercase tracking-wide">
                <Sparkles className="w-4 h-4" />
                {t.latest.title}
              </div>
              <h1 className="text-4xl sm:text-6xl font-bold text-foreground mt-4 mb-4">
                {t.latest.title}
              </h1>
              <p className="text-lg sm:text-xl text-foreground/70">
                {t.latest.subtitle}
              </p>
              <div className="mt-6">
                <Link
                  to={articlesPath}
                  className="inline-flex items-center gap-2 px-5 py-3 border-2 border-secondary text-secondary rounded-lg font-semibold hover:bg-secondary hover:text-secondary-foreground transition-all"
                >
                  {t.featured.viewAll}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-24">
          <div className="container mx-auto px-4">
            {showLoading && (
              <div className="space-y-6">
                <p className="text-sm text-foreground/70">{t.posts.loading}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 9 }).map((_, index) => (
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
                <p className="text-sm text-foreground/70">
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
                              width={640}
                              height={360}
                              loading="lazy"
                              decoding="async"
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
                            <p className="text-base text-foreground/70 line-clamp-2 mb-4">
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
        <NewsletterSection t={t} />
      </main>

      <Footer lang={lang} t={t} />
    </div>
  );
}
