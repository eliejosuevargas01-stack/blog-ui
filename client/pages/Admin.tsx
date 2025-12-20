import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";

import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Seo } from "@/components/Seo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { buildPath, translations, type Language } from "@/lib/i18n";
import { fetchPosts, type BlogPost } from "@/lib/posts";
import { formatPostDate } from "@/lib/utils";

const CATEGORY_OPTIONS = ["ia", "tech", "marketing/seo", "business"] as const;

type MetaTag = NonNullable<BlogPost["metaTags"]>[number];

type PostsStatus = "loading" | "idle" | "error";

type PostDraft = {
  title: string;
  slug: string;
  excerpt: string;
  description: string;
  content: string;
  contentHtml: string;
  category: string;
  image: string;
  imageAlt: string;
  imageThumb: string;
  images: string;
  tags: string;
  date: string;
  author: string;
  readTime: string;
  featured: boolean;
  metaTitle: string;
  metaDescription: string;
  metaTags: string;
};

const normalizeOptional = (value: string) => {
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
};

const normalizeList = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }
  const items = trimmed
    .split(/[,;\n]+/g)
    .map((item) => item.trim())
    .filter(Boolean);
  return items.length > 0 ? Array.from(new Set(items)) : undefined;
};

const stringifyList = (value?: string[]) => (value?.length ? value.join(", ") : "");

const stringifyMetaTags = (value?: BlogPost["metaTags"]) => {
  if (!value || value.length === 0) {
    return "";
  }
  return JSON.stringify(value, null, 2);
};

const parseMetaTagsInput = (value: string): MetaTag[] | undefined | null => {
  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    return null;
  }
  if (Array.isArray(parsed)) {
    const tags = parsed
      .map((item) => {
        if (!item || typeof item !== "object") {
          return null;
        }
        const record = item as Record<string, unknown>;
        const content =
          typeof record.content === "string" ? record.content.trim() : "";
        const name =
          typeof record.name === "string" ? record.name.trim() : undefined;
        const property =
          typeof record.property === "string"
            ? record.property.trim()
            : undefined;
        if (!content || (!name && !property)) {
          return null;
        }
        return { name: name || undefined, property: property || undefined, content };
      })
      .filter(Boolean) as MetaTag[];
    return tags.length > 0 ? tags : undefined;
  }
  if (parsed && typeof parsed === "object") {
    const tags = Object.entries(parsed as Record<string, unknown>)
      .map(([key, contentValue]) => {
        const name = key.trim();
        const content =
          typeof contentValue === "string" ? contentValue.trim() : "";
        if (!name || !content) {
          return null;
        }
        return { name, content };
      })
      .filter(Boolean) as MetaTag[];
    return tags.length > 0 ? tags : undefined;
  }
  return null;
};

const buildDraft = (post: BlogPost): PostDraft => ({
  title: post.title ?? "",
  slug: post.slug ?? "",
  excerpt: post.excerpt ?? "",
  description: post.description ?? "",
  content: post.content ?? "",
  contentHtml: post.contentHtml ?? "",
  category: post.category ?? "",
  image: post.image ?? "",
  imageAlt: post.imageAlt ?? "",
  imageThumb: post.imageThumb ?? "",
  images: stringifyList(post.images),
  tags: stringifyList(post.tags),
  date: post.date ?? "",
  author: post.author ?? "",
  readTime: post.readTime ?? "",
  featured: post.featured ?? false,
  metaTitle: post.metaTitle ?? "",
  metaDescription: post.metaDescription ?? "",
  metaTags: stringifyMetaTags(post.metaTags),
});

interface AdminProps {
  lang: Language;
}

const Field = ({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) => (
  <div className="space-y-2">
    <div className="text-sm font-medium text-foreground">{label}</div>
    {children}
    {hint ? <p className="text-xs text-foreground/60">{hint}</p> : null}
  </div>
);

export default function Admin({ lang }: AdminProps) {
  const t = translations[lang];
  const homePath = buildPath(lang, "home");
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [status, setStatus] = useState<PostsStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, PostDraft>>({});
  const [draftErrors, setDraftErrors] = useState<Record<string, string>>({});
  const [query, setQuery] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadPosts = async () => {
      setStatus("loading");
      setErrorMessage(null);
      setEditingId(null);
      setDrafts({});
      setDraftErrors({});
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

  const filteredPosts = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return posts;
    }
    return posts.filter((post) => {
      const values = [
        post.title,
        post.category,
        post.author,
        post.slug,
        post.id,
      ];
      return values.some(
        (value) => value && value.toLowerCase().includes(normalized),
      );
    });
  }, [posts, query]);

  const showLoading = status === "loading";
  const showError = status === "error";
  const showEmpty = status === "idle" && filteredPosts.length === 0;

  const handleStartEdit = (post: BlogPost) => {
    setEditingId((current) => (current === post.id ? null : post.id));
    setDrafts((prev) =>
      prev[post.id]
        ? prev
        : {
            ...prev,
            [post.id]: buildDraft(post),
          },
    );
  };

  const handleCancel = (postId: string) => {
    setEditingId((current) => (current === postId ? null : current));
    setDrafts((prev) => {
      const next = { ...prev };
      delete next[postId];
      return next;
    });
    setDraftErrors((prev) => {
      const next = { ...prev };
      delete next[postId];
      return next;
    });
  };

  const handleDelete = (postId: string) => {
    if (!window.confirm(t.admin.confirmDelete)) {
      return;
    }
    setPosts((prev) => prev.filter((post) => post.id !== postId));
    if (editingId === postId) {
      setEditingId(null);
    }
    setDrafts((prev) => {
      const next = { ...prev };
      delete next[postId];
      return next;
    });
    setDraftErrors((prev) => {
      const next = { ...prev };
      delete next[postId];
      return next;
    });
  };

  const updateDraft = (
    post: BlogPost,
    key: keyof PostDraft,
    value: PostDraft[keyof PostDraft],
  ) => {
    setDrafts((prev) => {
      const current = prev[post.id] ?? buildDraft(post);
      return {
        ...prev,
        [post.id]: {
          ...current,
          [key]: value,
        },
      };
    });
  };

  const handleSave = (postId: string) => {
    const draft = drafts[postId];
    if (!draft) {
      return;
    }
    const metaTags = parseMetaTagsInput(draft.metaTags);
    if (metaTags === null) {
      setDraftErrors((prev) => ({
        ...prev,
        [postId]: t.admin.errors.metaTags,
      }));
      return;
    }
    setDraftErrors((prev) => {
      const next = { ...prev };
      delete next[postId];
      return next;
    });

    setPosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId) {
          return post;
        }
        return {
          ...post,
          title: draft.title.trim() || post.title,
          slug: normalizeOptional(draft.slug),
          excerpt: normalizeOptional(draft.excerpt),
          description: normalizeOptional(draft.description),
          content: normalizeOptional(draft.content),
          contentHtml: normalizeOptional(draft.contentHtml),
          category: normalizeOptional(draft.category),
          image: normalizeOptional(draft.image),
          imageAlt: normalizeOptional(draft.imageAlt),
          imageThumb: normalizeOptional(draft.imageThumb),
          images: normalizeList(draft.images),
          tags: normalizeList(draft.tags),
          date: normalizeOptional(draft.date),
          author: normalizeOptional(draft.author),
          readTime: normalizeOptional(draft.readTime),
          featured: draft.featured,
          metaTitle: normalizeOptional(draft.metaTitle),
          metaDescription: normalizeOptional(draft.metaDescription),
          metaTags,
        };
      }),
    );
    handleCancel(postId);
  };

  const formatDate = (value?: string) => formatPostDate(value, lang);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Seo
        lang={lang}
        page="admin"
        title={t.meta.admin.title}
        description={t.meta.admin.description}
      />
      <Header lang={lang} pageKey="admin" t={t} />

      <main className="flex-1">
        <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background py-16 sm:py-24">
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
              <h1 className="text-4xl sm:text-6xl font-bold text-foreground">
                {t.admin.title}
              </h1>
              <p className="mt-3 text-lg sm:text-xl text-foreground/70">
                {t.admin.subtitle}
              </p>
              <div className="mt-6 rounded-lg border border-secondary/20 bg-secondary/5 px-4 py-3 text-sm text-secondary">
                {t.admin.notice}
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 sm:py-16">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
              <div>
                <h2 className="text-2xl font-semibold text-foreground">
                  {t.admin.listTitle}
                </h2>
                <p className="text-sm text-foreground/60">
                  {t.admin.listSubtitle}
                </p>
              </div>
              <div className="w-full lg:w-80">
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={t.admin.searchPlaceholder}
                />
              </div>
            </div>

            {showLoading && (
              <div className="space-y-4">
                <p className="text-sm text-foreground/60">{t.posts.loading}</p>
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-28 rounded-lg border border-border bg-card/50 animate-pulse"
                  />
                ))}
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
                  {t.admin.emptyTitle}
                </p>
                <p className="text-sm text-foreground/60">
                  {t.admin.emptyDescription}
                </p>
              </div>
            )}

            {!showLoading && !showError && !showEmpty && (
              <div className="space-y-6">
                {filteredPosts.map((post) => {
                  const isEditing = editingId === post.id;
                  const draft = drafts[post.id] ?? buildDraft(post);
                  const postDate = formatDate(post.date);
                  return (
                    <article
                      key={post.id}
                      className="rounded-xl border border-border bg-card p-6 shadow-sm"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                        <div className="space-y-3">
                          <div className="flex flex-wrap items-center gap-3">
                            <h3 className="text-xl font-semibold text-foreground">
                              {post.title}
                            </h3>
                            {post.featured && (
                              <Badge variant="secondary">
                                {t.admin.fields.featured}
                              </Badge>
                            )}
                            {post.category && (
                              <Badge variant="outline">{post.category}</Badge>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-3 text-xs text-foreground/60">
                            {post.author && <span>{post.author}</span>}
                            {postDate && <span>{postDate}</span>}
                            {post.readTime && <span>{post.readTime}</span>}
                          </div>
                          {(post.excerpt || post.description) && (
                            <p className="text-sm text-foreground/70 max-w-3xl line-clamp-2">
                              {post.excerpt ?? post.description}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="outline"
                            onClick={() => handleStartEdit(post)}
                          >
                            <Pencil className="w-4 h-4" />
                            {isEditing ? t.admin.actions.close : t.admin.actions.edit}
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => handleDelete(post.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                            {t.admin.actions.delete}
                          </Button>
                        </div>
                      </div>

                      {isEditing && (
                        <div className="mt-6 border-t border-border pt-6 space-y-6">
                          <div className="grid grid-cols-1 gap-6">
                            <div>
                              <h4 className="text-sm font-semibold uppercase tracking-wide text-foreground/60 mb-4">
                                {t.admin.sectionBasics}
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Field label={t.admin.fields.id}>
                                  <Input value={post.id} readOnly />
                                </Field>
                                <Field label={t.admin.fields.title}>
                                  <Input
                                    value={draft.title}
                                    onChange={(event) =>
                                      updateDraft(post, "title", event.target.value)
                                    }
                                  />
                                </Field>
                                <Field label={t.admin.fields.slug}>
                                  <Input
                                    value={draft.slug}
                                    onChange={(event) =>
                                      updateDraft(post, "slug", event.target.value)
                                    }
                                  />
                                </Field>
                                <Field
                                  label={t.admin.fields.category}
                                  hint={t.admin.hints.category}
                                >
                                  <Input
                                    list={`category-options-${post.id}`}
                                    value={draft.category}
                                    onChange={(event) =>
                                      updateDraft(
                                        post,
                                        "category",
                                        event.target.value,
                                      )
                                    }
                                  />
                                  <datalist id={`category-options-${post.id}`}>
                                    {CATEGORY_OPTIONS.map((option) => (
                                      <option key={option} value={option} />
                                    ))}
                                  </datalist>
                                </Field>
                                <Field label={t.admin.fields.author}>
                                  <Input
                                    value={draft.author}
                                    onChange={(event) =>
                                      updateDraft(post, "author", event.target.value)
                                    }
                                  />
                                </Field>
                                <Field label={t.admin.fields.date}>
                                  <Input
                                    value={draft.date}
                                    onChange={(event) =>
                                      updateDraft(post, "date", event.target.value)
                                    }
                                  />
                                </Field>
                                <Field label={t.admin.fields.readTime}>
                                  <Input
                                    value={draft.readTime}
                                    onChange={(event) =>
                                      updateDraft(
                                        post,
                                        "readTime",
                                        event.target.value,
                                      )
                                    }
                                  />
                                </Field>
                                <div className="flex items-center justify-between rounded-md border border-input px-3 py-2">
                                  <div>
                                    <p className="text-sm font-medium text-foreground">
                                      {t.admin.fields.featured}
                                    </p>
                                  </div>
                                  <Switch
                                    checked={draft.featured}
                                    onCheckedChange={(checked) =>
                                      updateDraft(post, "featured", checked)
                                    }
                                  />
                                </div>
                              </div>
                            </div>

                            <div>
                              <h4 className="text-sm font-semibold uppercase tracking-wide text-foreground/60 mb-4">
                                {t.admin.sectionContent}
                              </h4>
                              <div className="grid grid-cols-1 gap-4">
                                <Field label={t.admin.fields.excerpt}>
                                  <Textarea
                                    value={draft.excerpt}
                                    onChange={(event) =>
                                      updateDraft(
                                        post,
                                        "excerpt",
                                        event.target.value,
                                      )
                                    }
                                  />
                                </Field>
                                <Field label={t.admin.fields.description}>
                                  <Textarea
                                    value={draft.description}
                                    onChange={(event) =>
                                      updateDraft(
                                        post,
                                        "description",
                                        event.target.value,
                                      )
                                    }
                                  />
                                </Field>
                                <Field label={t.admin.fields.content}>
                                  <Textarea
                                    value={draft.content}
                                    onChange={(event) =>
                                      updateDraft(
                                        post,
                                        "content",
                                        event.target.value,
                                      )
                                    }
                                  />
                                </Field>
                                <Field label={t.admin.fields.contentHtml}>
                                  <Textarea
                                    value={draft.contentHtml}
                                    onChange={(event) =>
                                      updateDraft(
                                        post,
                                        "contentHtml",
                                        event.target.value,
                                      )
                                    }
                                  />
                                </Field>
                              </div>
                            </div>

                            <div>
                              <h4 className="text-sm font-semibold uppercase tracking-wide text-foreground/60 mb-4">
                                {t.admin.sectionMedia}
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Field label={t.admin.fields.image}>
                                  <Input
                                    value={draft.image}
                                    onChange={(event) =>
                                      updateDraft(post, "image", event.target.value)
                                    }
                                  />
                                </Field>
                                <Field label={t.admin.fields.imageAlt}>
                                  <Input
                                    value={draft.imageAlt}
                                    onChange={(event) =>
                                      updateDraft(
                                        post,
                                        "imageAlt",
                                        event.target.value,
                                      )
                                    }
                                  />
                                </Field>
                                <Field label={t.admin.fields.imageThumb}>
                                  <Input
                                    value={draft.imageThumb}
                                    onChange={(event) =>
                                      updateDraft(
                                        post,
                                        "imageThumb",
                                        event.target.value,
                                      )
                                    }
                                  />
                                </Field>
                                <Field
                                  label={t.admin.fields.images}
                                  hint={t.admin.hints.images}
                                >
                                  <Textarea
                                    value={draft.images}
                                    onChange={(event) =>
                                      updateDraft(
                                        post,
                                        "images",
                                        event.target.value,
                                      )
                                    }
                                  />
                                </Field>
                                <Field
                                  label={t.admin.fields.tags}
                                  hint={t.admin.hints.tags}
                                >
                                  <Input
                                    value={draft.tags}
                                    onChange={(event) =>
                                      updateDraft(post, "tags", event.target.value)
                                    }
                                  />
                                </Field>
                              </div>
                            </div>

                            <div>
                              <h4 className="text-sm font-semibold uppercase tracking-wide text-foreground/60 mb-4">
                                {t.admin.sectionSeo}
                              </h4>
                              <div className="grid grid-cols-1 gap-4">
                                <Field label={t.admin.fields.metaTitle}>
                                  <Input
                                    value={draft.metaTitle}
                                    onChange={(event) =>
                                      updateDraft(
                                        post,
                                        "metaTitle",
                                        event.target.value,
                                      )
                                    }
                                  />
                                </Field>
                                <Field label={t.admin.fields.metaDescription}>
                                  <Textarea
                                    value={draft.metaDescription}
                                    onChange={(event) =>
                                      updateDraft(
                                        post,
                                        "metaDescription",
                                        event.target.value,
                                      )
                                    }
                                  />
                                </Field>
                                <Field
                                  label={t.admin.fields.metaTags}
                                  hint={t.admin.hints.metaTags}
                                >
                                  <Textarea
                                    value={draft.metaTags}
                                    onChange={(event) =>
                                      updateDraft(
                                        post,
                                        "metaTags",
                                        event.target.value,
                                      )
                                    }
                                  />
                                </Field>
                              </div>
                            </div>
                          </div>

                          {draftErrors[post.id] && (
                            <div className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                              {draftErrors[post.id]}
                            </div>
                          )}

                          <div className="flex flex-wrap gap-2">
                            <Button
                              onClick={() => handleSave(post.id)}
                              disabled={!draft.title.trim()}
                            >
                              {t.admin.actions.save}
                            </Button>
                            <Button
                              variant="ghost"
                              onClick={() => handleCancel(post.id)}
                            >
                              {t.admin.actions.cancel}
                            </Button>
                          </div>
                        </div>
                      )}
                    </article>
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
