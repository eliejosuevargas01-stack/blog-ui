"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import NextImage from "next/image";
import { ArrowLeft, Image as ImageIcon, Pencil, Trash2, Plus, LogOut, FileText, Globe, AlertCircle, Search } from "lucide-react";

import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Seo } from "@/components/Seo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  allowedCategories,
  buildPath,
  languages,
  translations,
  type Language,
} from "@/lib/i18n";
import {
  deletePost,
  editPost,
  fetchPosts,
  type BlogPost,
} from "@/lib/posts";
import { formatPostDate } from "@/lib/utils";
import { type CustomPage } from "@/lib/pages-db";

const ADMIN_SESSION_KEY = "seommerce.admin.session";

interface AdminProps {
  lang: Language;
}

interface PostDraft {
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  description: string;
  content: string;
  contentHtml: string;
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
}

interface PageDraft {
  slug: string;
  title: string;
  bodyHtml: string;
  seoTitle: string;
  seoDescription: string;
}

const buildDraft = (post: BlogPost): PostDraft => ({
  title: post.title ?? "",
  slug: post.slug ?? "",
  category: post.category ?? "",
  excerpt: post.excerpt ?? "",
  description: post.description ?? "",
  content: post.content ?? "",
  contentHtml: post.contentHtml ?? "",
  image: post.image ?? "",
  imageAlt: post.imageAlt ?? "",
  imageThumb: post.imageThumb ?? "",
  images: Array.isArray(post.images) ? post.images.join(", ") : "",
  tags: Array.isArray(post.tags) ? post.tags.join(", ") : "",
  date: post.date ?? "",
  author: post.author ?? "",
  readTime: post.readTime ?? "",
  featured: post.featured ?? false,
  metaTitle: post.metaTitle ?? "",
  metaDescription: post.metaDescription ?? "",
  metaTags: Array.isArray(post.metaTags)
    ? post.metaTags
        .map((tag) => {
          const keys = Object.keys(tag) as Array<keyof typeof tag>;
          const pairs = keys.map((key) => `${key}=${tag[key]}`);
          return pairs.join("; ");
        })
        .join("\n")
    : "",
});

const buildPageDraft = (page: CustomPage): PageDraft => ({
  slug: page.slug ?? "",
  title: page.title ?? "",
  bodyHtml: page.content?.bodyHtml ?? "",
  seoTitle: page.seoTitle ?? "",
  seoDescription: page.seoDescription ?? "",
});

function Field({
  label,
  children,
  hint,
  error,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
  error?: string;
}) {
  return (
    <div className="space-y-1.5 w-full">
      <Label className="text-xs uppercase tracking-wider text-foreground/80">{label}</Label>
      {children}
      {hint && <p className="text-xs text-foreground/60">{hint}</p>}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export default function Admin({ lang }: AdminProps) {
  const t = translations[lang];
  const homePath = buildPath(lang, "home");
  const { toast } = useToast();

  const [authStatus, setAuthStatus] = useState<"checking" | "authenticated" | "unauthenticated">("checking");
  const [sessionUser, setSessionUser] = useState<string | null>(null);
  
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [loginLoading, setLoginLoading] = useState(false);

  // Tabs state
  const [activeTab, setActiveTab] = useState<"posts" | "pages">("posts");

  // Posts states
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [postsStatus, setPostsStatus] = useState<"idle" | "loading" | "error">("loading");
  const [postsQuery, setPostsQuery] = useState("");
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [postDrafts, setPostDrafts] = useState<Record<string, PostDraft>>({});
  const [postSavingId, setPostSavingId] = useState<string | null>(null);
  const [postDeletingId, setPostDeletingId] = useState<string | null>(null);
  const [postDraftErrors, setPostDraftErrors] = useState<Record<string, string>>({});

  // Pages states
  const [pages, setPages] = useState<CustomPage[]>([]);
  const [pagesStatus, setPagesStatus] = useState<"idle" | "loading" | "error">("loading");
  const [pagesQuery, setPagesQuery] = useState("");
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [pageDrafts, setPageDrafts] = useState<Record<string, PageDraft>>({});
  const [pageSavingId, setPageSavingId] = useState<string | null>(null);
  const [pageDeletingId, setPageDeletingId] = useState<string | null>(null);
  const [pageDraftErrors, setPageDraftErrors] = useState<Record<string, string>>({});

  const isAuthenticated = authStatus === "authenticated";
  const isCheckingAuth = authStatus === "checking";

  // Check auth state on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch("/api/admin/me");
        if (response.ok) {
          const data = await response.json();
          if (data.authenticated) {
            setSessionUser(data.user);
            setAuthStatus("authenticated");
            return;
          }
        }
      } catch (e) {
        console.error("Auth check failed:", e);
      }
      setAuthStatus("unauthenticated");
    };
    checkSession();
  }, []);

  // Fetch posts when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const loadPosts = async () => {
        setPostsStatus("loading");
        try {
          const data = await fetchPosts(lang, true);
          setPosts(data);
          setPostsStatus("idle");
        } catch {
          setPostsStatus("error");
        }
      };
      loadPosts();
    }
  }, [isAuthenticated, lang]);

  // Fetch pages when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const loadPages = async () => {
        setPagesStatus("loading");
        try {
          const response = await fetch(`/api/pages/${lang}`);
          if (response.ok) {
            const data = await response.json();
            setPages(data);
            setPagesStatus("idle");
          } else {
            setPagesStatus("error");
          }
        } catch {
          setPagesStatus("error");
        }
      };
      loadPages();
    }
  }, [isAuthenticated, lang]);

  // Login handler
  const handleLoginSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoginLoading(true);
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: loginData.email,
          password: loginData.password,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        toast({
          title: t.auth.errorTitle,
          description: data.error ?? t.auth.errorDescription,
          variant: "destructive",
        });
        return;
      }
      
      setSessionUser(loginData.email);
      setAuthStatus("authenticated");
      toast({
        title: t.auth.loginSuccessTitle,
        description: t.auth.loginSuccessDescription,
      });
    } catch {
      toast({
        title: t.auth.errorTitle,
        description: t.auth.errorDescription,
        variant: "destructive",
      });
    } finally {
      setLoginLoading(false);
    }
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } catch {}
    setSessionUser(null);
    setAuthStatus("unauthenticated");
  };

  // POSTS CRUD HANDLERS
  const handleStartEditPost = (post: BlogPost) => {
    setEditingPostId(post.id);
    setPostDrafts((prev) => ({
      ...prev,
      [post.id]: buildDraft(post),
    }));
  };

  const handleCancelEditPost = (postId: string) => {
    setEditingPostId(null);
    setPostDraftErrors((prev) => {
      const next = { ...prev };
      delete next[postId];
      return next;
    });
    if (postId.startsWith("temp-")) {
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    }
  };

  const handleCreatePost = () => {
    const tempId = `temp-${Date.now()}`;
    const blankPost: BlogPost = {
      id: tempId,
      title: "Novo Artigo",
      slug: "",
      excerpt: "",
      description: "",
      content: "",
      contentHtml: "",
      category: allowedCategories[0] || "",
      image: "",
      imageAlt: "",
      imageThumb: "",
      images: [],
      tags: [],
      date: new Date().toISOString().split("T")[0],
      author: sessionUser || "Admin",
      readTime: "5 min",
      featured: false,
      metaTitle: "",
      metaDescription: "",
      metaTags: [],
    };
    
    setPosts((prev) => [blankPost, ...prev]);
    setPostDrafts((prev) => ({
      ...prev,
      [tempId]: buildDraft(blankPost),
    }));
    setEditingPostId(tempId);
  };

  const handleSavePost = async (postId: string) => {
    const draft = postDrafts[postId];
    const target = posts.find((p) => p.id === postId);
    if (!draft || !target) return;

    if (!draft.title.trim()) {
      setPostDraftErrors((prev) => ({ ...prev, [postId]: "O título é obrigatório" }));
      return;
    }
    if (!draft.slug.trim()) {
      setPostDraftErrors((prev) => ({ ...prev, [postId]: "O slug é obrigatório" }));
      return;
    }

    const payloadPost: BlogPost = {
      ...target,
      id: postId.startsWith("temp-") ? undefined : postId,
      title: draft.title.trim(),
      slug: draft.slug.trim(),
      category: draft.category || allowedCategories[0],
      excerpt: draft.excerpt,
      description: draft.description || draft.excerpt,
      content: draft.content,
      image: draft.image,
      imageAlt: draft.imageAlt,
      imageThumb: draft.imageThumb || draft.image,
      images: draft.images ? draft.images.split(",").map((s) => s.trim()).filter(Boolean) : [],
      tags: draft.tags ? draft.tags.split(",").map((s) => s.trim()).filter(Boolean) : [],
      date: draft.date || new Date().toISOString(),
      author: draft.author || sessionUser || "Admin",
      readTime: draft.readTime || "5 min",
      featured: draft.featured,
      metaTitle: draft.metaTitle || draft.title,
      metaDescription: draft.metaDescription || draft.excerpt,
    };

    setPostSavingId(postId);
    try {
      await editPost(payloadPost, lang);
      
      // Reload posts to get final IDs and order from disk
      const refreshed = await fetchPosts(lang, true);
      setPosts(refreshed);

      toast({ title: t.admin.toast.saveSuccess });
      setEditingPostId(null);
    } catch (error) {
      toast({
        title: t.admin.toast.saveError,
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setPostSavingId(null);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm(t.admin.confirmDelete)) return;
    const target = posts.find((p) => p.id === postId);
    if (!target) return;

    setPostDeletingId(postId);
    try {
      await deletePost(target, lang);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      toast({ title: "Artigo excluído com sucesso." });
    } catch (error) {
      toast({
        title: "Erro ao excluir artigo",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setPostDeletingId(null);
    }
  };

  // PAGES CRUD HANDLERS
  const handleStartEditPage = (page: CustomPage) => {
    setEditingPageId(page.id);
    setPageDrafts((prev) => ({
      ...prev,
      [page.id]: buildPageDraft(page),
    }));
  };

  const handleCancelEditPage = (pageId: string) => {
    setEditingPageId(null);
    setPageDraftErrors((prev) => {
      const next = { ...prev };
      delete next[pageId];
      return next;
    });
    if (pageId.startsWith("temp-")) {
      setPages((prev) => prev.filter((p) => p.id !== pageId));
    }
  };

  const handleCreatePage = () => {
    const tempId = `temp-${Date.now()}`;
    const blankPage: CustomPage = {
      id: tempId,
      slug: "",
      lang,
      title: "Nova Página",
      content: { bodyHtml: "" },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setPages((prev) => [blankPage, ...prev]);
    setPageDrafts((prev) => ({
      ...prev,
      [tempId]: buildPageDraft(blankPage),
    }));
    setEditingPageId(tempId);
  };

  const handleSavePage = async (pageId: string) => {
    const draft = pageDrafts[pageId];
    const target = pages.find((p) => p.id === pageId);
    if (!draft || !target) return;

    if (!draft.title.trim()) {
      setPageDraftErrors((prev) => ({ ...prev, [pageId]: "O título é obrigatório" }));
      return;
    }
    if (!draft.slug.trim()) {
      setPageDraftErrors((prev) => ({ ...prev, [pageId]: "O slug é obrigatório" }));
      return;
    }

    const payload = {
      id: pageId.startsWith("temp-") ? undefined : pageId,
      slug: draft.slug.trim(),
      lang,
      title: draft.title.trim(),
      content: {
        bodyHtml: draft.bodyHtml,
      },
      seoTitle: draft.seoTitle || undefined,
      seoDescription: draft.seoDescription || undefined,
    };

    setPageSavingId(pageId);
    try {
      const response = await fetch("/api/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Erro ao salvar página");
      }

      // Reload pages
      const resList = await fetch(`/api/pages/${lang}`);
      if (resList.ok) {
        const listData = await resList.json();
        setPages(listData);
      }

      toast({ title: "Página salva com sucesso." });
      setEditingPageId(null);
    } catch (error) {
      toast({
        title: "Erro ao salvar página",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setPageSavingId(null);
    }
  };

  const handleDeletePage = async (pageId: string) => {
    if (!confirm("Tem certeza que deseja excluir esta página?")) return;

    setPageDeletingId(pageId);
    try {
      const response = await fetch(`/api/pages/${lang}?id=${pageId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Erro ao deletar página");
      }

      setPages((prev) => prev.filter((p) => p.id !== pageId));
      toast({ title: "Página excluída com sucesso." });
    } catch (error) {
      toast({
        title: "Erro ao excluir página",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setPageDeletingId(null);
    }
  };

  // Filter computations
  const filteredPosts = useMemo(() => {
    const normalizedQuery = postsQuery.trim().toLowerCase();
    if (!normalizedQuery) return posts;
    return posts.filter((post) => {
      const matchTitle = post.title?.toLowerCase().includes(normalizedQuery);
      const matchAuthor = post.author?.toLowerCase().includes(normalizedQuery);
      const matchCategory = post.category?.toLowerCase().includes(normalizedQuery);
      const matchSlug = post.slug?.toLowerCase().includes(normalizedQuery);
      return matchTitle || matchAuthor || matchCategory || matchSlug;
    });
  }, [posts, postsQuery]);

  const filteredPages = useMemo(() => {
    const normalizedQuery = pagesQuery.trim().toLowerCase();
    if (!normalizedQuery) return pages;
    return pages.filter((page) => {
      const matchTitle = page.title?.toLowerCase().includes(normalizedQuery);
      const matchSlug = page.slug?.toLowerCase().includes(normalizedQuery);
      return matchTitle || matchSlug;
    });
  }, [pages, pagesQuery]);

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
        {/* Banner Section */}
        <section className="border-b border-border bg-card/40 py-12">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 text-sm text-foreground/60 mb-2">
                  <Link href={homePath} className="inline-flex items-center gap-1 hover:text-foreground">
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>{t.nav.home}</span>
                  </Link>
                  <span>/</span>
                  <span className="text-foreground">Admin</span>
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  {t.admin.title}
                </h1>
                <p className="mt-2 text-foreground/80">
                  {t.admin.subtitle}
                </p>
              </div>

              {isAuthenticated && (
                <div className="flex items-center gap-4 bg-background border border-border rounded-xl px-4 py-2.5 shadow-sm">
                  <div className="text-right">
                    <p className="text-xs text-foreground/60">Logado como</p>
                    <p className="text-sm font-semibold text-foreground">{sessionUser}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={handleLogout} className="text-muted-foreground hover:text-foreground">
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Workspace Section */}
        <section className="py-12">
          <div className="container mx-auto px-4 max-w-7xl">
            {!isAuthenticated ? (
              // Login Panel
              <div className="max-w-md mx-auto">
                <Card className="border border-border/80 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-secondary" />
                  <CardHeader className="text-center pt-8">
                    <CardTitle className="text-2xl font-bold">{t.admin.loginTitle}</CardTitle>
                    <CardDescription>{t.admin.loginSubtitle}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-8">
                    {isCheckingAuth ? (
                      <div className="flex justify-center py-8">
                        <div className="w-6 h-6 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
                      </div>
                    ) : (
                      <form onSubmit={handleLoginSubmit} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="admin-email">{t.auth.emailLabel}</Label>
                          <Input
                            id="admin-email"
                            type="text"
                            placeholder="Email ou usuário"
                            value={loginData.email}
                            onChange={(e) => setLoginData((prev) => ({ ...prev, email: e.target.value }))}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="admin-password">{t.auth.passwordLabel}</Label>
                          <Input
                            id="admin-password"
                            type="password"
                            placeholder="Sua senha secreta"
                            value={loginData.password}
                            onChange={(e) => setLoginData((prev) => ({ ...prev, password: e.target.value }))}
                            required
                          />
                        </div>
                        <Button type="submit" className="w-full mt-4" disabled={loginLoading}>
                          {loginLoading ? "Verificando..." : t.auth.loginButton}
                        </Button>
                      </form>
                    )}
                  </CardContent>
                </Card>
              </div>
            ) : (
              // Authenticated Dashboard
              <div className="space-y-8">
                {/* Tabs switcher */}
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <div className="flex items-center gap-2 bg-muted/65 p-1 rounded-lg border border-border">
                    <button
                      onClick={() => setActiveTab("posts")}
                      className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${
                        activeTab === "posts"
                          ? "bg-background text-foreground shadow-sm"
                          : "text-foreground/60 hover:text-foreground"
                      }`}
                    >
                      <Globe className="w-4 h-4" />
                      Artigos ({posts.length})
                    </button>
                    <button
                      onClick={() => setActiveTab("pages")}
                      className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${
                        activeTab === "pages"
                          ? "bg-background text-foreground shadow-sm"
                          : "text-foreground/60 hover:text-foreground"
                      }`}
                    >
                      <FileText className="w-4 h-4" />
                      Páginas ({pages.length})
                    </button>
                  </div>

                  {activeTab === "posts" ? (
                    <Button onClick={handleCreatePost} className="gap-2">
                      <Plus className="w-4 h-4" /> Novo Artigo
                    </Button>
                  ) : (
                    <Button onClick={handleCreatePage} className="gap-2">
                      <Plus className="w-4 h-4" /> Nova Página
                    </Button>
                  )}
                </div>

                {/* POSTS WORKSPACE */}
                {activeTab === "posts" && (
                  <div className="space-y-6">
                    <div className="flex items-center bg-card border border-border rounded-xl px-3 py-2 max-w-md shadow-sm">
                      <Search className="w-4 h-4 text-foreground/40 mr-2 shrink-0" />
                      <input
                        type="text"
                        placeholder={t.admin.searchPlaceholder}
                        value={postsQuery}
                        onChange={(e) => setPostsQuery(e.target.value)}
                        className="bg-transparent border-none outline-none text-sm w-full text-foreground"
                      />
                    </div>

                    {postsStatus === "loading" && (
                      <div className="flex justify-center py-12">
                        <div className="w-8 h-8 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}

                    {postsStatus === "error" && (
                      <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-4 rounded-lg flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        <span>Ocorreu um erro ao carregar os artigos.</span>
                      </div>
                    )}

                    {postsStatus === "idle" && filteredPosts.length === 0 && (
                      <div className="border border-border border-dashed bg-card/40 rounded-xl p-12 text-center">
                        <Globe className="w-8 h-8 text-foreground/30 mx-auto mb-3" />
                        <h3 className="text-lg font-semibold">{t.admin.emptyTitle}</h3>
                        <p className="text-sm text-foreground/60 mt-1">{t.admin.emptyDescription}</p>
                      </div>
                    )}

                    {postsStatus === "idle" && filteredPosts.length > 0 && (
                      <div className="space-y-4">
                        {filteredPosts.map((post) => {
                          const isEditing = editingPostId === post.id;
                          const draft = postDrafts[post.id] ?? buildDraft(post);
                          const isSaving = postSavingId === post.id;
                          const isDeleting = postDeletingId === post.id;
                          const isBusy = isSaving || isDeleting;
                          const previewSrc = post.imageThumb || post.image || (post.images && post.images[0]) || "";

                          return (
                            <Card key={post.id} className="border border-border/80 bg-card overflow-hidden">
                              <CardContent className="p-6">
                                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                                  <div className="flex flex-col sm:flex-row gap-4">
                                    <div className="h-20 w-28 sm:h-24 sm:w-36 shrink-0 overflow-hidden rounded-lg border border-border bg-muted flex items-center justify-center relative">
                                      {previewSrc ? (
                                        <NextImage
                                          src={previewSrc}
                                          alt={post.title || ""}
                                          width={144}
                                          height={96}
                                          className="h-full w-full object-cover"
                                        />
                                      ) : (
                                        <ImageIcon className="h-6 w-6 text-foreground/30" />
                                      )}
                                    </div>
                                    <div className="space-y-2">
                                      <div className="flex flex-wrap items-center gap-2">
                                        <h3 className="text-lg font-bold text-foreground leading-tight">
                                          {post.title}
                                        </h3>
                                        {post.featured && <Badge variant="secondary">Destaque</Badge>}
                                        {post.category && <Badge variant="outline">{post.category}</Badge>}
                                      </div>
                                      <div className="text-xs text-foreground/60 flex items-center gap-3">
                                        <span>Por: {post.author || "Admin"}</span>
                                        <span>•</span>
                                        <span>{formatPostDate(post.date, lang)}</span>
                                        <span>•</span>
                                        <span>{post.readTime}</span>
                                      </div>
                                      {post.excerpt && (
                                        <p className="text-sm text-foreground/75 line-clamp-2">{post.excerpt}</p>
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2 self-end lg:self-start">
                                    <Button
                                      variant={isEditing ? "ghost" : "outline"}
                                      size="sm"
                                      onClick={() => (isEditing ? handleCancelEditPost(post.id) : handleStartEditPost(post))}
                                      disabled={isBusy}
                                    >
                                      <Pencil className="w-3.5 h-3.5 mr-1.5" />
                                      {isEditing ? "Fechar" : "Editar"}
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      onClick={() => handleDeletePost(post.id)}
                                      disabled={isBusy || post.id.startsWith("temp-")}
                                    >
                                      <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                                      {isDeleting ? "Excluindo..." : "Excluir"}
                                    </Button>
                                  </div>
                                </div>

                                {isEditing && (
                                  <div className="mt-8 pt-6 border-t border-border space-y-6">
                                    {postDraftErrors[post.id] && (
                                      <div className="bg-destructive/10 border border-destructive/20 text-destructive text-xs p-3 rounded-md flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4 shrink-0" />
                                        <span>{postDraftErrors[post.id]}</span>
                                      </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <Field label="ID do Artigo">
                                        <Input value={post.id.startsWith("temp-") ? "(Gerado ao salvar)" : post.id} readOnly className="bg-muted text-foreground/60" />
                                      </Field>
                                      <Field label="Título">
                                        <Input
                                          value={draft.title}
                                          onChange={(e) => setPostDrafts((prev) => ({ ...prev, [post.id]: { ...draft, title: e.target.value } }))}
                                        />
                                      </Field>
                                      <Field label="Slug (URL)">
                                        <Input
                                          value={draft.slug}
                                          onChange={(e) => setPostDrafts((prev) => ({ ...prev, [post.id]: { ...draft, slug: e.target.value } }))}
                                        />
                                      </Field>
                                      <Field label="Categoria">
                                        <Input
                                          value={draft.category}
                                          onChange={(e) => setPostDrafts((prev) => ({ ...prev, [post.id]: { ...draft, category: e.target.value } }))}
                                        />
                                      </Field>
                                      <Field label="Autor">
                                        <Input
                                          value={draft.author}
                                          onChange={(e) => setPostDrafts((prev) => ({ ...prev, [post.id]: { ...draft, author: e.target.value } }))}
                                        />
                                      </Field>
                                      <Field label="Tempo de Leitura">
                                        <Input
                                          value={draft.readTime}
                                          onChange={(e) => setPostDrafts((prev) => ({ ...prev, [post.id]: { ...draft, readTime: e.target.value } }))}
                                        />
                                      </Field>
                                    </div>

                                    <div className="space-y-4">
                                      <Field label="Resumo (Excerpt)">
                                        <Textarea
                                          rows={2}
                                          value={draft.excerpt}
                                          onChange={(e) => setPostDrafts((prev) => ({ ...prev, [post.id]: { ...draft, excerpt: e.target.value } }))}
                                        />
                                      </Field>
                                      <Field label="Descrição SEO">
                                        <Textarea
                                          rows={2}
                                          value={draft.description}
                                          onChange={(e) => setPostDrafts((prev) => ({ ...prev, [post.id]: { ...draft, description: e.target.value } }))}
                                        />
                                      </Field>
                                      <Field label="Conteúdo (Markdown)">
                                        <Textarea
                                          rows={12}
                                          className="font-mono text-sm leading-relaxed"
                                          value={draft.content}
                                          onChange={(e) => setPostDrafts((prev) => ({ ...prev, [post.id]: { ...draft, content: e.target.value } }))}
                                        />
                                      </Field>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <Field label="Imagem Destacada (URL)">
                                        <Input
                                          value={draft.image}
                                          onChange={(e) => setPostDrafts((prev) => ({ ...prev, [post.id]: { ...draft, image: e.target.value } }))}
                                        />
                                      </Field>
                                      <Field label="Texto Alternativo da Imagem">
                                        <Input
                                          value={draft.imageAlt}
                                          onChange={(e) => setPostDrafts((prev) => ({ ...prev, [post.id]: { ...draft, imageAlt: e.target.value } }))}
                                        />
                                      </Field>
                                    </div>

                                    <div className="flex items-center space-x-2 bg-muted/30 p-4 rounded-lg border border-border">
                                      <Switch
                                        id={`featured-${post.id}`}
                                        checked={draft.featured}
                                        onCheckedChange={(checked) => setPostDrafts((prev) => ({ ...prev, [post.id]: { ...draft, featured: checked } }))}
                                      />
                                      <Label htmlFor={`featured-${post.id}`}>Marcar como artigo em Destaque</Label>
                                    </div>

                                    <div className="flex items-center justify-end gap-3">
                                      <Button variant="ghost" onClick={() => handleCancelEditPost(post.id)}>
                                        Cancelar
                                      </Button>
                                      <Button onClick={() => handleSavePost(post.id)} disabled={isSaving}>
                                        {isSaving ? "Salvando..." : "Salvar Artigo"}
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* PAGES WORKSPACE */}
                {activeTab === "pages" && (
                  <div className="space-y-6">
                    <div className="flex items-center bg-card border border-border rounded-xl px-3 py-2 max-w-md shadow-sm">
                      <Search className="w-4 h-4 text-foreground/40 mr-2 shrink-0" />
                      <input
                        type="text"
                        placeholder="Buscar páginas por título ou slug..."
                        value={pagesQuery}
                        onChange={(e) => setPagesQuery(e.target.value)}
                        className="bg-transparent border-none outline-none text-sm w-full text-foreground"
                      />
                    </div>

                    {pagesStatus === "loading" && (
                      <div className="flex justify-center py-12">
                        <div className="w-8 h-8 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}

                    {pagesStatus === "error" && (
                      <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-4 rounded-lg flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        <span>Ocorreu um erro ao carregar as páginas.</span>
                      </div>
                    )}

                    {pagesStatus === "idle" && filteredPages.length === 0 && (
                      <div className="border border-border border-dashed bg-card/40 rounded-xl p-12 text-center">
                        <FileText className="w-8 h-8 text-foreground/30 mx-auto mb-3" />
                        <h3 className="text-lg font-semibold">Nenhuma página encontrada</h3>
                        <p className="text-sm text-foreground/60 mt-1">Crie páginas customizadas para este idioma.</p>
                      </div>
                    )}

                    {pagesStatus === "idle" && filteredPages.length > 0 && (
                      <div className="space-y-4">
                        {filteredPages.map((page) => {
                          const isEditing = editingPageId === page.id;
                          const draft = pageDrafts[page.id] ?? buildPageDraft(page);
                          const isSaving = pageSavingId === page.id;
                          const isDeleting = pageDeletingId === page.id;
                          const isBusy = isSaving || isDeleting;

                          return (
                            <Card key={page.id} className="border border-border/80 bg-card overflow-hidden">
                              <CardContent className="p-6">
                                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                                  <div className="space-y-1">
                                    <h3 className="text-lg font-bold text-foreground leading-tight">
                                      {page.title}
                                    </h3>
                                    <div className="text-xs text-foreground/60 flex items-center gap-3">
                                      <span>Rota: <code className="bg-muted px-1 py-0.5 rounded text-foreground/90 font-mono">/{lang}/{page.slug || "(vazio)"}</code></span>
                                      <span>•</span>
                                      <span>Atualizado em: {new Date(page.updatedAt).toLocaleDateString()}</span>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2 self-end lg:self-start">
                                    <Button
                                      variant={isEditing ? "ghost" : "outline"}
                                      size="sm"
                                      onClick={() => (isEditing ? handleCancelEditPage(page.id) : handleStartEditPage(page))}
                                      disabled={isBusy}
                                    >
                                      <Pencil className="w-3.5 h-3.5 mr-1.5" />
                                      {isEditing ? "Fechar" : "Editar"}
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      onClick={() => handleDeletePage(page.id)}
                                      disabled={isBusy || page.id.startsWith("temp-")}
                                    >
                                      <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                                      {isDeleting ? "Excluindo..." : "Excluir"}
                                    </Button>
                                  </div>
                                </div>

                                {isEditing && (
                                  <div className="mt-8 pt-6 border-t border-border space-y-6">
                                    {pageDraftErrors[page.id] && (
                                      <div className="bg-destructive/10 border border-destructive/20 text-destructive text-xs p-3 rounded-md flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4 shrink-0" />
                                        <span>{pageDraftErrors[page.id]}</span>
                                      </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <Field label="ID da Página">
                                        <Input value={page.id.startsWith("temp-") ? "(Gerado ao salvar)" : page.id} readOnly className="bg-muted text-foreground/60" />
                                      </Field>
                                      <Field label="Título">
                                        <Input
                                          value={draft.title}
                                          onChange={(e) => setPageDrafts((prev) => ({ ...prev, [page.id]: { ...draft, title: e.target.value } }))}
                                        />
                                      </Field>
                                      <Field label="Slug (Caminho da URL)">
                                        <Input
                                          value={draft.slug}
                                          onChange={(e) => setPageDrafts((prev) => ({ ...prev, [page.id]: { ...draft, slug: e.target.value } }))}
                                          placeholder="ex: termos-de-uso"
                                        />
                                      </Field>
                                      <Field label="Título SEO (Opcional)">
                                        <Input
                                          value={draft.seoTitle}
                                          onChange={(e) => setPageDrafts((prev) => ({ ...prev, [page.id]: { ...draft, seoTitle: e.target.value } }))}
                                        />
                                      </Field>
                                    </div>

                                    <div className="space-y-4">
                                      <Field label="Descrição SEO (Opcional)">
                                        <Textarea
                                          rows={2}
                                          value={draft.seoDescription}
                                          onChange={(e) => setPageDrafts((prev) => ({ ...prev, [page.id]: { ...draft, seoDescription: e.target.value } }))}
                                        />
                                      </Field>
                                      <Field label="Conteúdo do Corpo (HTML da Página)">
                                        <Textarea
                                          rows={12}
                                          className="font-mono text-sm leading-relaxed"
                                          value={draft.bodyHtml}
                                          onChange={(e) => setPageDrafts((prev) => ({ ...prev, [page.id]: { ...draft, bodyHtml: e.target.value } }))}
                                          placeholder="<p>Escreva o código HTML da página aqui...</p>"
                                        />
                                      </Field>
                                    </div>

                                    <div className="flex items-center justify-end gap-3">
                                      <Button variant="ghost" onClick={() => handleCancelEditPage(page.id)}>
                                        Cancelar
                                      </Button>
                                      <Button onClick={() => handleSavePage(page.id)} disabled={isSaving}>
                                        {isSaving ? "Salvando..." : "Salvar Página"}
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer lang={lang} t={t} />
    </div>
  );
}
