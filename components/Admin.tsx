"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import NextImage from "next/image";
import { ArrowLeft, Image as ImageIcon, Pencil, Trash2, Plus, LogOut, FileText, Globe, AlertCircle, Search, Wand2, Sparkles, CheckSquare, Loader2, CheckCircle2, XCircle } from "lucide-react";

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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { generateImagesAction, improveWithAIAction, triggerImprovePostAction } from "@/app/actions";
export interface CustomPage {
  id?: string;
  slug: string;
  lang?: string;
  title: string;
  isStatic?: boolean;
  content?: { bodyHtml?: string };
  seoTitle?: string;
  seoDescription?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

const ADMIN_SESSION_KEY = "seommerce.admin.session";

interface AdminProps {
  lang: Language;
}

interface PostBlockDraft {
  contentHtml: string;
  image: string;
  focalPoint: string;
}

interface PostDraft {
  title: string;
  slug: string;
  category: string;
  tag: string;
  excerpt: string;
  description: string;
  blocks: PostBlockDraft[];
  image: string;
  imageThumb: string;
  images: string;
  tags: string;
  date: string;
  author: string;
  readTime: string;
  featured: boolean;
  published: boolean;
  metaTitle: string;
  metaDescription: string;
  metaTags: string;
}

const DEFAULT_BLOCK_COUNT = 3;

const createEmptyBlock = (): PostBlockDraft => ({
  contentHtml: "",
  image: "",
  focalPoint: "center",
});

const ensureBlockCount = (
  blocks: PostBlockDraft[],
  minimum = DEFAULT_BLOCK_COUNT,
) => {
  const next = [...blocks];
  while (next.length < minimum) {
    next.push(createEmptyBlock());
  }
  return next;
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const toLocalDatetimeString = (dateStr?: string) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60 * 1000);
  return localDate.toISOString().slice(0, 16);
};

const extractBlockImage = (html: string) => {
  const figureMatch = html.match(
    /<figure[^>]*>[\s\S]*?<img[^>]+src=["']([^"']+)["'][^>]*>[\s\S]*?<\/figure>/i,
  );
  if (figureMatch?.[1]) {
    return figureMatch[1];
  }
  const imgMatch = html.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i);
  return imgMatch?.[1] ?? "";
};

const splitContentIntoBlocks = (
  contentHtml: string | null | undefined,
): PostBlockDraft[] => {
  const html = (contentHtml ?? "").trim();
  if (!html) {
    return ensureBlockCount([]);
  }

  const blocks: PostBlockDraft[] = [];
  const figureRegex = /<figure\b[\s\S]*?<\/figure>/gi;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = figureRegex.exec(html)) !== null) {
    const before = html.slice(lastIndex, match.index).trim();
    blocks.push({
      contentHtml: before,
      image: extractBlockImage(match[0]),
      focalPoint: "center",
    });
    lastIndex = match.index + match[0].length;
  }

  const remaining = html.slice(lastIndex).trim();
  if (remaining || blocks.length === 0) {
    blocks.push({
      contentHtml: remaining || html,
      image: "",
      focalPoint: "center",
    });
  }

  return ensureBlockCount(
    blocks.map((block) => ({
      contentHtml: block.contentHtml.trim(),
      image: block.image.trim(),
      focalPoint: block.focalPoint || "center",
    })),
  );
};

const buildContentHtmlFromBlocks = (
  title: string,
  blocks: PostBlockDraft[],
) => {
  const body = blocks
    .map((block) => {
      const content = block.contentHtml.trim();
      const image = block.image.trim();
      const imageHtml = image
        ? `\n<figure>\n  <img src="${image}" alt="${escapeHtml(title)}" />\n</figure>`
        : "";
      return `${content}${imageHtml}`.trim();
    })
    .filter(Boolean)
    .join("\n\n");

  return body.trim();
};

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
  tag: post.tag ?? "",
  excerpt: post.excerpt ?? "",
  description: post.description ?? "",
  blocks: splitContentIntoBlocks(post.contentHtml ?? post.content ?? ""),
  image: post.image ?? "",
  imageThumb: post.imageThumb ?? "",
  images: Array.isArray(post.images) ? post.images.join(", ") : "",
  tags: Array.isArray(post.tags) ? post.tags.join(", ") : "",
  date: post.date ?? "",
  author: post.author ?? "",
  readTime: post.readTime ?? "",
  featured: post.featured ?? false,
  published: post.published ?? false,
  metaTitle: post.metaTitle ?? "",
  metaDescription: post.metaDescription ?? "",
  metaTags: Array.isArray(post.metaTags)
    ? post.metaTags
        .map((tag) => {
          const keys = Object.keys(tag);
          const pairs = keys.map((key) => `${key}=${String((tag as any)[key])}`);
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
    </div>
  );
}

interface BlockLinkMapperProps {
  contentHtml: string;
  currentLang: Language;
  allPosts: BlogPost[];
  onUpdateContentHtml: (newHtml: string) => void;
}

function BlockLinkMapper({
  contentHtml,
  currentLang,
  allPosts,
  onUpdateContentHtml,
}: BlockLinkMapperProps) {
  const langPosts = useMemo(() => {
    return allPosts.filter((p) => (p.lang ?? "pt") === currentLang);
  }, [allPosts, currentLang]);

  const links = useMemo(() => {
    if (!contentHtml) return [];
    const regex = /<a\s+[^>]*href=["']([^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi;
    const matches = [];
    let match;
    while ((match = regex.exec(contentHtml)) !== null) {
      matches.push({
        fullMatch: match[0],
        href: match[1],
        anchorText: match[2].replace(/<[^>]*>/g, "").trim(),
        index: match.index,
      });
    }
    return matches;
  }, [contentHtml]);

  if (links.length === 0) {
    return null;
  }

  const handleSelectPostForLink = (fullMatch: string, targetSlug: string) => {
    if (!targetSlug) return;
    const targetUrl = `/${currentLang}/post/${targetSlug}`;
    const updatedLink = fullMatch.replace(/href=["']([^"']*)["']/i, `href="${targetUrl}"`);
    const newHtml = contentHtml.replace(fullMatch, updatedLink);
    onUpdateContentHtml(newHtml);
  };

  return (
    <div className="mt-3 rounded-lg border border-border/70 bg-background/60 p-3 space-y-2">
      <div className="flex items-center gap-2 text-xs font-semibold text-foreground/80">
        <Globe className="w-3.5 h-3.5 text-secondary" />
        <span>Links Encontrados neste Bloco (Filtrados por idioma: {currentLang.toUpperCase()}):</span>
      </div>
      <div className="space-y-2">
        {links.map((link, idx) => (
          <div
            key={`${link.href}-${idx}`}
            className="flex flex-wrap items-center justify-between gap-2 rounded border border-border/50 bg-card p-2 text-xs"
          >
            <div className="flex flex-col max-w-md">
              <span className="font-medium text-foreground">{link.anchorText || "Link sem texto"}</span>
              <span className="text-[11px] text-foreground/60 truncate">{link.href}</span>
            </div>
            <select
              className="bg-muted border border-border rounded px-2.5 py-1 text-xs text-foreground outline-none focus:border-secondary"
              onChange={(e) => handleSelectPostForLink(link.fullMatch, e.target.value)}
              defaultValue=""
            >
              <option value="" disabled>
                Mapear para Post ({currentLang.toUpperCase()})...
              </option>
              {langPosts.map((p) => (
                <option key={p.id + p.slug} value={p.slug}>
                  {p.title} (/{currentLang}/post/{p.slug})
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}

interface FocalPointPickerProps {
  imageSrc: string;
  focalPoint: string;
  onChangeFocalPoint: (fp: string) => void;
}

function FocalPointPicker({
  imageSrc,
  focalPoint,
  onChangeFocalPoint,
}: FocalPointPickerProps) {
  const [imgErrorCount, setImgErrorCount] = useState(0);

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
    onChangeFocalPoint(`${x}% ${y}%`);
  };

  const match = focalPoint ? focalPoint.match(/(\d+)%\s+(\d+)%/) : null;
  const posX = match ? `${match[1]}%` : "50%";
  const posY = match ? `${match[2]}%` : "50%";

  let displaySrc = imageSrc;
  if (imgErrorCount === 1 && imageSrc.startsWith("/uploads/")) {
    displaySrc = `https://curiosotech.online${imageSrc}`;
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-foreground/70">
        <span>Ponto Focal ({focalPoint || "center"}):</span>
        <button
          type="button"
          className="text-secondary text-[11px] hover:underline"
          onClick={() => onChangeFocalPoint("center")}
        >
          Resetar ao Centro
        </button>
      </div>

      {imageSrc && imgErrorCount < 2 ? (
        <div
          className="relative aspect-video w-full cursor-crosshair overflow-hidden rounded-lg border border-border bg-muted/40"
          onClick={handleImageClick}
          title="Clique na imagem para definir o Ponto Focal"
        >
          <img
            src={displaySrc}
            alt="Preview"
            onError={() => setImgErrorCount((prev) => prev + 1)}
            className="h-full w-full object-cover"
            style={{ objectPosition: focalPoint || "center" }}
          />
          <div
            className="absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-destructive shadow-md pointer-events-none"
            style={{ left: posX, top: posY }}
          />
          <div className="absolute bottom-1 right-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] text-white font-mono">
            {posX} {posY}
          </div>
        </div>
      ) : (
        <div className="flex aspect-video w-full items-center justify-center rounded-lg border border-dashed border-border bg-muted/20 text-xs text-foreground/50">
          {imageSrc ? "Erro ao carregar miniatura" : "Sem imagem para preview"}
        </div>
      )}
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
  const [activeTab, setActiveTab] = useState<"posts" | "pages" | "settings">("posts");

  // Posts states
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [postsStatus, setPostsStatus] = useState<"idle" | "loading" | "error">("loading");
  const [postsQuery, setPostsQuery] = useState("");
  const [editingPostId, setEditingPostId] = useState<number | string | null>(null);
  const [postDrafts, setPostDrafts] = useState<Record<number | string, PostDraft>>({});
  const [postSavingId, setPostSavingId] = useState<number | string | null>(null);
  const [postDeletingId, setPostDeletingId] = useState<number | string | null>(null);
  const [postDraftErrors, setPostDraftErrors] = useState<Record<number | string, string>>({});

  // Content language management
  const [selectedLang, setSelectedLang] = useState<Language>(lang);

  // Pages states
  const [pages, setPages] = useState<CustomPage[]>([]);
  const [pagesStatus, setPagesStatus] = useState<"idle" | "loading" | "error">("loading");
  const [pagesQuery, setPagesQuery] = useState("");
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [pageDrafts, setPageDrafts] = useState<Record<string, PageDraft>>({});
  const [pageSavingId, setPageSavingId] = useState<string | null>(null);
  const [pageDeletingId, setPageDeletingId] = useState<string | null>(null);
  const [pageDraftErrors, setPageDraftErrors] = useState<Record<string, string>>({});

  // Plugin & Batch Image states
  const [autoTranslateEnabled, setAutoTranslateEnabled] = useState<boolean>(false);
  const [autoImageEnabled, setAutoImageEnabled] = useState<boolean>(true);
  const [autoImageHero, setAutoImageHero] = useState<boolean>(true);
  const [autoImageBlock1, setAutoImageBlock1] = useState<boolean>(false);
  const [autoImageBlock2, setAutoImageBlock2] = useState<boolean>(false);
  const [autoImageBlock3, setAutoImageBlock3] = useState<boolean>(false);
  const [autoImageBlock4, setAutoImageBlock4] = useState<boolean>(false);
  const [schedulerEnabled, setSchedulerEnabled] = useState<boolean>(true);
  const [schedulerHour, setSchedulerHour] = useState<string>("07:00");

  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const [batchModalPostId, setBatchModalPostId] = useState<number | string | null>(null);
  const [batchSelectedSlots, setBatchSelectedSlots] = useState<Record<number, boolean>>({ 1: true });

  // Popup / Modal de status de ações de Webhook
  const [webhookModal, setWebhookModal] = useState<{
    isOpen: boolean;
    status: "loading" | "success" | "error";
    title: string;
    actionName: string;
    postTitle?: string;
    message?: string;
    details?: string;
  }>({
    isOpen: false,
    status: "loading",
    title: "",
    actionName: "",
  });

  const router = useRouter();

  useEffect(() => {
    setSelectedLang(lang);
  }, [lang]);

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
        // Ignored
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
          const data = await fetchPosts(selectedLang, true);
          setPosts(data);
          setPostsStatus("idle");
        } catch {
          setPostsStatus("error");
        }
      };
      loadPosts();
    }
  }, [isAuthenticated, selectedLang]);

  // Fetch pages when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const loadPages = async () => {
        setPagesStatus("loading");
        try {
          const response = await fetch(`/api/pages/${selectedLang}`);
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
  }, [isAuthenticated, selectedLang]);

  // Fetch settings when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetch("/api/settings")
        .then((res) => res.json())
        .then((data) => {
          if (typeof data.autoTranslateEnabled === "boolean") setAutoTranslateEnabled(data.autoTranslateEnabled);
          if (typeof data.autoImageEnabled === "boolean") setAutoImageEnabled(data.autoImageEnabled);
          if (typeof data.autoImageHero === "boolean") setAutoImageHero(data.autoImageHero);
          if (typeof data.autoImageBlock1 === "boolean") setAutoImageBlock1(data.autoImageBlock1);
          if (typeof data.autoImageBlock2 === "boolean") setAutoImageBlock2(data.autoImageBlock2);
          if (typeof data.autoImageBlock3 === "boolean") setAutoImageBlock3(data.autoImageBlock3);
          if (typeof data.autoImageBlock4 === "boolean") setAutoImageBlock4(data.autoImageBlock4);
          if (typeof data.schedulerEnabled === "boolean") setSchedulerEnabled(data.schedulerEnabled);
          if (typeof data.schedulerHour === "string") setSchedulerHour(data.schedulerHour);
        })
        .catch(console.error);
    }
  }, [isAuthenticated]);

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

  const handleCancelEditPost = (postId: number | string) => {
    setEditingPostId(null);
    setPostDraftErrors((prev) => {
      const next = { ...prev };
      delete next[postId];
      return next;
    });
    if (typeof postId === "string" && postId.startsWith("temp-")) {
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
      category: allowedCategories[0] || "",
      tag: "Notícias",
      image: "",
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

  const getCurrentPostDraft = (postId: number | string) => {
    const existing = postDrafts[postId];
    if (existing) {
      return existing;
    }
    const target = posts.find((post) => post.id === postId);
    return target ? buildDraft(target) : null;
  };

  const buildPublishPayload = (post: BlogPost, draft: PostDraft, overrides: Record<string, unknown> = {}) => {
    const titleVal = (draft.title || "").trim();
    const slugVal = (draft.slug || "").trim();
    const keywords = (draft.tags || "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    const primaryKeyword = draft.tag || keywords[0] || post.tag || "Notícias";
    const contentHtml = buildContentHtmlFromBlocks(titleVal, draft.blocks || []);

    return {
      output: {
        titulo: titleVal,
        title: titleVal,
        conteudo_html: contentHtml,
        slug: slugVal,
        categoria: draft.category || post.category || "Mercado Tech",
        url_categoria: `/${selectedLang}/${draft.category ? draft.category.toLowerCase().replace(/\s+/g, "-") : "posts"}`,
        excerpt: draft.excerpt || "",
        meta_title: draft.metaTitle || titleVal,
        meta_description: draft.metaDescription || draft.excerpt || "",
        tags: keywords,
        palavra_chave_principal: primaryKeyword,
        imagem_destaque: draft.image || post.image || "",
        hero_image: draft.image || post.image || "",
        hero_focal_point: "center",
        hn_id: post.hnId || undefined,
        date: draft.date || post.date || new Date().toISOString(),
        id: post.id && (typeof post.id === "string" ? !post.id.startsWith("temp-") : true) ? post.id : undefined,
        published: !!draft.published,
        ...overrides,
      },
    };
  };

  const handlePostBlockChange = (
    postId: number | string,
    index: number,
    field: keyof PostBlockDraft,
    value: string,
  ) => {
    setPostDrafts((prev) => {
      const draft = prev[postId];
      if (!draft) {
        return prev;
      }
      const blocks = [...draft.blocks];
      blocks[index] = {
        ...blocks[index],
        [field]: value,
      };
      return {
        ...prev,
        [postId]: {
          ...draft,
          blocks,
        },
      };
    });
  };

  const handleAddPostBlock = (postId: number | string) => {
    setPostDrafts((prev) => {
      const draft = prev[postId];
      if (!draft) {
        return prev;
      }
      return {
        ...prev,
        [postId]: {
          ...draft,
          blocks: [...draft.blocks, createEmptyBlock()],
        },
      };
    });
  };

  const handleRemovePostBlock = (postId: number | string, index: number) => {
    setPostDrafts((prev) => {
      const draft = prev[postId];
      if (!draft || draft.blocks.length <= DEFAULT_BLOCK_COUNT) {
        return prev;
      }
      const blocks = draft.blocks.filter((_, currentIndex) => currentIndex !== index);
      return {
        ...prev,
        [postId]: {
          ...draft,
          blocks: ensureBlockCount(blocks),
        },
      };
    });
  };

  const handleSavePost = async (postId: number | string) => {
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

    setPostSavingId(postId);
    try {
      await editPost(buildPublishPayload(target, draft) as any, selectedLang);
      
      // Reload posts to get final IDs and order from disk
      const refreshed = await fetchPosts(selectedLang, true);
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

  const handleGenerateSingleImage = async (postId: number | string, placeIndex: number, promptText?: string) => {
    const compoundId = `${postId}=${placeIndex}`;
    const webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || process.env.N8N_WEBHOOK_URL || "";
    
    setWebhookModal({
      isOpen: true,
      status: "loading",
      title: "Gerando Imagem de Bloco...",
      actionName: "Imagem Única (action=generate_img)",
      details: `CompoundId: ${compoundId}`,
    });

    if (!webhookUrl) {
      setWebhookModal({
        isOpen: true,
        status: "error",
        title: "Falha ao Executar Ação",
        actionName: "Imagem Única",
        message: "A variável NEXT_PUBLIC_N8N_WEBHOOK_URL não está configurada no ambiente.",
      });
      toast({
        title: "Webhook não configurado",
        description: "A variável NEXT_PUBLIC_N8N_WEBHOOK_URL não está configurada.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate_img",
          compoundId: compoundId,
          prompt: promptText || "Imagem conceitual de tecnologia e mercado",
        }),
      });

      if (response.ok) {
        setWebhookModal({
          isOpen: true,
          status: "success",
          title: "Ação Executada com Êxito!",
          actionName: "Imagem Única (action=generate_img)",
          message: `O webhook do n8n foi acionado com sucesso para gerar a imagem do bloco (${compoundId}).`,
        });
        toast({
          title: "Webhook acionado com sucesso!",
          description: `Disparo efetuado para compoundId: ${compoundId}`,
        });
      } else {
        setWebhookModal({
          isOpen: true,
          status: "error",
          title: "Falha ao Executar Ação",
          actionName: "Imagem Única (action=generate_img)",
          message: `O servidor do webhook respondeu com erro HTTP ${response.status}`,
        });
        toast({
          title: "Aviso no webhook",
          description: `Webhook respondeu com status ${response.status}`,
        });
      }
    } catch (err: any) {
      setWebhookModal({
        isOpen: true,
        status: "error",
        title: "Erro de Comunicação",
        actionName: "Imagem Única",
        message: err.message || "Não foi possível se conectar ao webhook do n8n.",
      });
      toast({
        title: "Erro ao comunicar com webhook",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const handleManualTranslate = async (postId: number | string) => {
    const draft = postDrafts[postId] || posts.find((p) => p.id === postId);
    if (!draft) return;
    const webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || process.env.N8N_WEBHOOK_URL || "";

    setWebhookModal({
      isOpen: true,
      status: "loading",
      title: "Solicitando Tradução...",
      actionName: "Tradução Automática (action=translate)",
      postTitle: draft.title,
    });

    if (!webhookUrl) {
      setWebhookModal({
        isOpen: true,
        status: "error",
        title: "Falha ao Executar Ação",
        actionName: "Tradução Automática",
        postTitle: draft.title,
        message: "A variável NEXT_PUBLIC_N8N_WEBHOOK_URL não está configurada no ambiente.",
      });
      toast({
        title: "Webhook não configurado",
        description: "A variável NEXT_PUBLIC_N8N_WEBHOOK_URL não está configurada.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "translate",
          id: postId,
          lang: lang,
          title: draft.title,
          excerpt: draft.excerpt,
          blocks: (postDrafts[postId]?.blocks || []).map((b: any) => ({
            text: b.contentHtml || b.text || "",
            image: b.image || "",
            focalPoint: b.focalPoint || "center",
          })),
        }),
      });

      if (response.ok) {
        setWebhookModal({
          isOpen: true,
          status: "success",
          title: "Ação Executada com Êxito!",
          actionName: "Tradução Automática (action=translate)",
          postTitle: draft.title,
          message: "O webhook do n8n recebeu o pedido de tradução com sucesso e iniciará o processamento.",
        });
        toast({
          title: "Tradução Solicitada!",
          description: "Webhook do n8n acionado para tradução.",
        });
      } else {
        setWebhookModal({
          isOpen: true,
          status: "error",
          title: "Falha ao Executar Ação",
          actionName: "Tradução Automática",
          postTitle: draft.title,
          message: `O webhook do n8n respondeu com erro HTTP ${response.status}`,
        });
        toast({
          title: "Erro no Webhook",
          description: `Status ${response.status}`,
          variant: "destructive",
        });
      }
    } catch (err: any) {
      setWebhookModal({
        isOpen: true,
        status: "error",
        title: "Erro de Comunicação",
        actionName: "Tradução Automática",
        postTitle: draft.title,
        message: err.message || "Falha ao conectar com o servidor de webhook do n8n.",
      });
      toast({
        title: "Erro de Conexão",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const handleImprovePost = async (post: BlogPost) => {
    setWebhookModal({
      isOpen: true,
      status: "loading",
      title: "Reescrevendo Artigo...",
      actionName: "IA Redatora (action=improve_post)",
      postTitle: post.title,
    });

    try {
      const res = await triggerImprovePostAction({
        id: (post as any).translationGroupId || String(post.id),
        title: post.title,
        slug: post.slug,
        category: post.category || post.tag,
        excerpt: post.excerpt || post.description,
        content: post.content || post.contentHtml,
        lang: selectedLang,
      });

      if (res && res.error) {
        setWebhookModal({
          isOpen: true,
          status: "error",
          title: "Falha ao Executar Ação",
          actionName: "IA Redatora",
          postTitle: post.title,
          message: res.error,
        });
        toast({
          title: "Erro no webhook",
          description: res.error,
          variant: "destructive",
        });
      } else {
        setWebhookModal({
          isOpen: true,
          status: "success",
          title: "Ação Executada com Êxito!",
          actionName: "IA Redatora (action=improve_post)",
          postTitle: post.title,
          message: "A IA redatora recebeu a solicitação com sucesso e iniciou a reescrita do artigo.",
        });
        toast({
          title: "Post enviado com sucesso!",
          description: "A IA redatora recebeu o post e está reescrevendo o assunto do zero.",
        });
      }
    } catch (err: any) {
      setWebhookModal({
        isOpen: true,
        status: "error",
        title: "Erro de Conexão",
        actionName: "IA Redatora",
        postTitle: post.title,
        message: err.message || "Erro de comunicação com o servidor de webhook.",
      });
      toast({
        title: "Erro ao enviar para IA redatora",
        description: err.message || "Erro de comunicação com o servidor.",
        variant: "destructive",
      });
    }
  };

  const handleImproveWithAI = async (post: BlogPost) => {
    const draft = postDrafts[post.id] || buildDraft(post);
    const translationGroupId = String((post as any).translationGroupId || (post as any).translation_group_id || post.id);

    setWebhookModal({
      isOpen: true,
      status: "loading",
      title: "Melhorando com IA...",
      actionName: "Melhorar com IA (action=update)",
      postTitle: draft.title,
    });

    try {
      const res = await improveWithAIAction({
        translationGroupId,
        title: draft.title || post.title,
        excerpt: draft.excerpt || post.excerpt || draft.description || post.description || "",
        lang: selectedLang,
      });

      if (res && res.error) {
        setWebhookModal({
          isOpen: true,
          status: "error",
          title: "Falha ao Executar Ação",
          actionName: "Melhorar com IA (action=update)",
          postTitle: draft.title,
          message: res.error,
        });
        toast({
          title: "Erro no webhook",
          description: res.error,
          variant: "destructive",
        });
      } else {
        setWebhookModal({
          isOpen: true,
          status: "success",
          title: "Ação Executada com Êxito!",
          actionName: "Melhorar com IA (action=update)",
          postTitle: draft.title,
          message: "A solicitação 'Melhorar com IA' foi processada e enviada com sucesso para o webhook do n8n.",
        });
        toast({
          title: "Sucesso!",
          description: "Solicitação 'Melhorar com IA' enviada com sucesso ao webhook n8n.",
        });
      }
    } catch (err: any) {
      setWebhookModal({
        isOpen: true,
        status: "error",
        title: "Erro de Conexão",
        actionName: "Melhorar com IA",
        postTitle: draft.title,
        message: err.message || "Falha de conexão com o webhook n8n.",
      });
      toast({
        title: "Erro de Conexão",
        description: err.message || "Falha ao enviar requisição",
        variant: "destructive",
      });
    }
  };

  const handleGenerateImages = async (post: BlogPost) => {
    const draft = postDrafts[post.id] || buildDraft(post);
    const translationGroupId = String((post as any).translationGroupId || (post as any).translation_group_id || post.id);

    setWebhookModal({
      isOpen: true,
      status: "loading",
      title: "Gerando Imagens com IA...",
      actionName: "Gerar Imagens (action=img)",
      postTitle: draft.title,
    });

    try {
      const blocks = (draft.blocks || []).map((b, idx) => ({
        blockIndex: idx + 1,
        text: b.contentHtml || "",
        image: b.image || "",
      }));

      const res = await generateImagesAction({
        translationGroupId,
        title: draft.title || post.title,
        excerpt: draft.excerpt || post.excerpt || "",
        category: draft.category || post.category || "",
        tag: draft.tag || post.tag || "",
        readTime: draft.readTime || post.readTime || "",
        lang: selectedLang,
        seoTitle: draft.metaTitle || (post as any).seoTitle || draft.title || post.title,
        seoDescription: draft.metaDescription || (post as any).seoDescription || draft.excerpt || post.excerpt || "",
        seoKeywords: draft.tags || (post as any).seoKeywords || "",
        blocks,
      });

      if (res && res.error) {
        setWebhookModal({
          isOpen: true,
          status: "error",
          title: "Falha ao Executar Ação",
          actionName: "Gerar Imagens (action=img)",
          postTitle: draft.title,
          message: res.error,
        });
        toast({
          title: "Erro no webhook",
          description: res.error,
          variant: "destructive",
        });
      } else {
        setWebhookModal({
          isOpen: true,
          status: "success",
          title: "Ação Executada com Êxito!",
          actionName: "Gerar Imagens (action=img)",
          postTitle: draft.title,
          message: "Solicitação 'Gerar Imagens' enviada com sucesso para o webhook do n8n com todo o conteúdo parseado sem HTML.",
        });
        toast({
          title: "Imagens Solicitadas!",
          description: "Solicitação 'Gerar Imagens' enviada com sucesso ao webhook n8n com conteúdo sem HTML.",
        });
      }
    } catch (err: any) {
      setWebhookModal({
        isOpen: true,
        status: "error",
        title: "Erro de Conexão",
        actionName: "Gerar Imagens",
        postTitle: draft.title,
        message: err.message || "Falha ao comunicar com o webhook do n8n.",
      });
      toast({
        title: "Erro de Conexão",
        description: err.message || "Falha ao enviar requisição",
        variant: "destructive",
      });
    }
  };

  const handleOpenBatchImageModal = (postId: number | string) => {
    setBatchModalPostId(postId);
    const draft = postDrafts[postId];
    const initialSlots: Record<number, boolean> = { 1: true };
    if (draft && draft.blocks) {
      draft.blocks.forEach((_, idx) => {
        initialSlots[idx + 2] = true;
      });
    }
    setBatchSelectedSlots(initialSlots);
    setBatchModalOpen(true);
  };

  const handleExecuteBatchImageGenerate = async () => {
    if (!batchModalPostId) return;
    const selectedIndexes = Object.entries(batchSelectedSlots)
      .filter(([_, isSelected]) => isSelected)
      .map(([indexStr]) => parseInt(indexStr, 10));

    if (selectedIndexes.length === 0) {
      toast({ title: "Nenhuma imagem selecionada", variant: "destructive" });
      return;
    }

    setBatchModalOpen(false);
    toast({
      title: "Gerando Imagens em Lote...",
      description: `Iniciando geração para ${selectedIndexes.length} imagens`,
    });

    const draft = postDrafts[batchModalPostId];

    for (const placeIdx of selectedIndexes) {
      const compoundId = `${batchModalPostId}=${placeIdx}`;
      let altPrompt = draft?.title || "Tecnologia";
      if (placeIdx > 1 && draft?.blocks?.[placeIdx - 2]) {
        altPrompt = draft.blocks[placeIdx - 2].contentHtml.replace(/<[^>]*>/g, "").slice(0, 100) || altPrompt;
      }

      await handleGenerateSingleImage(batchModalPostId, placeIdx, altPrompt);
    }
  };

  const handleDeletePost = async (postId: number | string) => {
    if (!confirm(t.admin.confirmDelete)) return;
    const target = posts.find((p) => p.id === postId);
    if (!target) return;

    setPostDeletingId(postId);
    try {
      await deletePost(target, selectedLang);
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

  const handleTogglePublish = async (post: BlogPost) => {
    console.log("[Admin] handleTogglePublish clicked for post:", post);
    const nextPublished = !post.published;
    let draft;
    try {
      draft = getCurrentPostDraft(post.id) ?? buildDraft(post);
      console.log("[Admin] Resolved draft:", draft);
    } catch (e) {
      console.error("[Admin] Error resolving draft:", e);
      toast({
        title: "Erro ao resolver rascunho",
        description: e instanceof Error ? e.message : String(e),
        variant: "destructive",
      });
      return;
    }

    setPostSavingId(post.id);
    try {
      const payload = buildPublishPayload(post, { ...draft, published: nextPublished });
      console.log("[Admin] Sending edit/publish payload to API:", payload);
      const res = await editPost(payload as any, selectedLang);
      console.log("[Admin] editPost API response:", res);
      
      console.log("[Admin] Fetching refreshed post list...");
      const refreshed = await fetchPosts(selectedLang, true);
      console.log("[Admin] Refreshed posts received. Count:", refreshed.length);
      setPosts(refreshed);
      console.log("[Admin] setPosts state updated.");
      toast({
        title: nextPublished ? "Artigo publicado!" : "Artigo revertido para rascunho.",
      });
    } catch (error) {
      console.error("[Admin] Error in handleTogglePublish:", error);
      toast({
        title: "Erro ao atualizar status",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setPostSavingId(null);
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
      const resList = await fetch(`/api/pages/${selectedLang}`);
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
      const response = await fetch(`/api/pages/${selectedLang}?id=${pageId}`, {
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
                  <span className="text-foreground">Palien CMS</span>
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  Palien <span className="text-secondary">CMS</span>
                </h1>
                <p className="mt-2 text-foreground/80">
                  Gerencie posts, páginas e funções do blog.
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
                      Gerar Posts
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
                      Editar Páginas
                    </button>
                    <button
                      onClick={() => setActiveTab("settings")}
                      className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${
                        activeTab === "settings"
                          ? "bg-background text-foreground shadow-sm"
                          : "text-foreground/60 hover:text-foreground"
                      }`}
                    >
                      <FileText className="w-4 h-4" />
                      Funções
                    </button>
                  </div>

                  {activeTab === "posts" ? (
                    <Button onClick={handleCreatePost} className="gap-2">
                      <Plus className="w-4 h-4" /> Novo Artigo
                    </Button>
                  ) : activeTab === "pages" ? (
                    <Button onClick={handleCreatePage} className="gap-2">
                      <Plus className="w-4 h-4" /> Nova Página
                    </Button>
                  ) : (
                    <div className="text-xs uppercase tracking-wider text-foreground/50">
                      Área reservada
                    </div>
                  )}
                </div>

                {/* POSTS WORKSPACE */}
                {activeTab === "posts" && (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                      <div className="flex items-center bg-card border border-border rounded-xl px-3 py-2 w-full sm:max-w-md shadow-sm">
                        <Search className="w-4 h-4 text-foreground/40 mr-2 shrink-0" />
                        <input
                          type="text"
                          placeholder={t.admin.searchPlaceholder}
                          value={postsQuery}
                          onChange={(e) => setPostsQuery(e.target.value)}
                          className="bg-transparent border-none outline-none text-sm w-full text-foreground"
                        />
                      </div>

                      <div className="flex bg-muted/60 p-1 rounded-lg border border-border shrink-0">
                        {(["pt", "en", "es"] as const).map((langCode) => (
                          <button
                            key={langCode}
                            onClick={() => {
                              setSelectedLang(langCode);
                              router.push(`/admin?lang=${langCode}`);
                            }}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                              selectedLang === langCode
                                ? "bg-card text-foreground shadow-sm"
                                : "text-foreground/60 hover:text-foreground"
                            }`}
                          >
                            {langCode === "pt" ? "Português" : langCode === "en" ? "English" : "Español"}
                          </button>
                        ))}
                      </div>
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
                                        {post.tag && <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">{post.tag}</Badge>}
                                        {post.published ? (
                                          <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20">Publicado</Badge>
                                        ) : (
                                          <Badge className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border-amber-500/20">Rascunho</Badge>
                                        )}
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

                                      {/* n8n Automation Checklist */}
                                      {post.lang === "pt" && (post.imageStatus || post.translationStatus) && (
                                        <div className="mt-3 p-3 bg-muted/40 rounded-lg border border-border/60 max-w-xl text-xs space-y-2">
                                          <div className="font-semibold text-foreground/80 flex items-center gap-1.5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                                            Progresso da Automação (n8n)
                                          </div>
                                          
                                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                                            {/* Image checklist */}
                                            {post.imageStatus && (() => {
                                              const imgMap = typeof post.imageStatus === "string" ? JSON.parse(post.imageStatus) : post.imageStatus;
                                              return (
                                                <div className="space-y-1">
                                                  <span className="text-[10px] text-foreground/50 uppercase tracking-wider block mb-1">Geração de Imagens</span>
                                                  {Object.entries(imgMap).map(([key, val]) => (
                                                    <div key={key} className="flex items-center gap-1.5">
                                                      <span>{val ? "✅" : "⏳"}</span>
                                                      <span className="font-mono text-[11px] capitalize text-foreground/75">
                                                        {key.replace("imagem_", "").replace("img-", "")}
                                                      </span>
                                                    </div>
                                                  ))}
                                                </div>
                                              );
                                            })()}
                                            
                                            {/* Translation checklist */}
                                            {post.translationStatus && (() => {
                                              const transMap = typeof post.translationStatus === "string" ? JSON.parse(post.translationStatus) : post.translationStatus;
                                              const getLabel = (status: string) => {
                                                if (status === "completed") return "✅ Concluído";
                                                if (status === "sent") return "📤 Traduzindo...";
                                                return "⏳ Pendente";
                                              };
                                              return (
                                                <div className="space-y-1">
                                                  <span className="text-[10px] text-foreground/50 uppercase tracking-wider block mb-1">Traduções</span>
                                                  <div className="flex items-center justify-between text-foreground/75">
                                                    <span>Inglês (EN):</span>
                                                    <span className="font-medium">{getLabel(transMap.en)}</span>
                                                  </div>
                                                  <div className="flex items-center justify-between text-foreground/75">
                                                    <span>Espanhol (ES):</span>
                                                    <span className="font-medium">{getLabel(transMap.es)}</span>
                                                  </div>
                                                </div>
                                              );
                                            })()}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex flex-wrap items-center gap-2 self-end lg:self-start">
                                     <Button
                                       variant="outline"
                                       size="sm"
                                       className="border-purple-500/40 text-purple-400 hover:bg-purple-500/15 font-semibold"
                                       onClick={() => handleImproveWithAI(post)}
                                       disabled={isBusy || String(post.id).startsWith("temp-")}
                                     >
                                       <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                                       Melhorar com IA
                                     </Button>
                                     <Button
                                       variant="outline"
                                       size="sm"
                                       className="border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/15 font-semibold"
                                       onClick={() => handleGenerateImages(post)}
                                       disabled={isBusy || String(post.id).startsWith("temp-")}
                                     >
                                       <ImageIcon className="w-3.5 h-3.5 mr-1.5" />
                                       Gerar Imagens
                                     </Button>
                                    <Button
                                      variant={post.published ? "secondary" : "default"}
                                      size="sm"
                                      onClick={() => handleTogglePublish(post)}
                                      disabled={isBusy || String(post.id).startsWith("temp-")}
                                    >
                                      {post.published ? "Despublicar" : "Publicar"}
                                    </Button>
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
                                      disabled={isBusy || String(post.id).startsWith("temp-")}
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
                                        <Input value={String(post.id).startsWith("temp-") ? "(Gerado ao salvar)" : post.id} readOnly className="bg-muted text-foreground/60" />
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
                                      <Field label="Tag Principal">
                                        <Input
                                          value={draft.tag}
                                          onChange={(e) => setPostDrafts((prev) => ({ ...prev, [post.id]: { ...draft, tag: e.target.value } }))}
                                          placeholder="Ex: IA, Review, Lançamento"
                                        />
                                      </Field>
                                      <Field label="Categoria">
                                        <select
                                          value={draft.category}
                                          onChange={(e) => setPostDrafts((prev) => ({ ...prev, [post.id]: { ...draft, category: e.target.value } }))}
                                          className="w-full bg-[#222222] border border-border rounded-sm text-[14px] text-foreground px-4 py-2.5 outline-none focus:border-primary/50"
                                        >
                                          {allowedCategories.map((cat) => (
                                            <option key={cat} value={cat}>
                                              {cat}
                                            </option>
                                          ))}
                                        </select>
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
                                      <Field label="Data e Hora de Publicação">
                                        <Input
                                          type="datetime-local"
                                          value={toLocalDatetimeString(draft.date)}
                                          onChange={(e) => {
                                            const val = e.target.value;
                                            const isoString = val ? new Date(val).toISOString() : "";
                                            setPostDrafts((prev) => ({ ...prev, [post.id]: { ...draft, date: isoString } }));
                                          }}
                                        />
                                      </Field>
                                    </div>

                                    <div className="space-y-4">
                                      <Field label="Resumo / Excerpt">
                                        <Textarea
                                          rows={2}
                                          value={draft.excerpt}
                                          onChange={(e) => setPostDrafts((prev) => ({ ...prev, [post.id]: { ...draft, excerpt: e.target.value } }))}
                                        />
                                      </Field>
                                      <Field label="Meta Description Customizado">
                                        <Textarea
                                          rows={2}
                                          value={draft.description}
                                          onChange={(e) => setPostDrafts((prev) => ({ ...prev, [post.id]: { ...draft, description: e.target.value } }))}
                                        />
                                      </Field>
                                      <Field
                                        label="Blocos de Conteúdo"
                                        hint={`3 blocos padrão. Você pode adicionar mais e remover os extras.`}
                                      >
                                        <div className="space-y-4">
                                          <div className="flex items-center justify-between gap-3">
                                            <p className="text-xs text-foreground/60">
                                              O conteúdo de cada bloco aceita HTML bruto, como no payload de publicação.
                                            </p>
                                            <Button
                                              type="button"
                                              size="sm"
                                              variant="outline"
                                              className="gap-2"
                                              onClick={() => handleAddPostBlock(post.id)}
                                            >
                                              <Plus className="w-3.5 h-3.5" />
                                              Adicionar Bloco
                                            </Button>
                                          </div>

                                          <div className="space-y-4">
                                            {draft.blocks.map((block, blockIndex) => {
                                              const canRemove = draft.blocks.length > DEFAULT_BLOCK_COUNT;
                                              return (
                                                <div key={`${post.id}-block-${blockIndex}`} className="rounded-xl border border-border/80 bg-muted/20 p-4 space-y-4">
                                                  <div className="flex items-center justify-between gap-3 border-b border-border/60 pb-3">
                                                    <div>
                                                      <p className="text-sm font-semibold text-foreground">Bloco {blockIndex + 1}</p>
                                                      <p className="text-xs text-foreground/50">Conteúdo HTML + imagem opcional</p>
                                                    </div>
                                                    <Button
                                                      type="button"
                                                      variant="ghost"
                                                      size="icon"
                                                      className="text-foreground/60 hover:text-destructive"
                                                      onClick={() => handleRemovePostBlock(post.id, blockIndex)}
                                                      disabled={!canRemove}
                                                      title={canRemove ? "Remover bloco" : "Mínimo de 3 blocos"}
                                                    >
                                                      <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                  </div>

                                                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                                    {/* Lado Esquerdo (2 colunas): Editor de texto HTML + BlockLinkMapper */}
                                                    <div className="lg:col-span-2 space-y-3">
                                                      <Field label={`Conteúdo do Bloco ${blockIndex + 1} (HTML / Markdown)`}>
                                                        <Textarea
                                                          rows={9}
                                                          className="font-mono text-sm leading-relaxed"
                                                          value={block.contentHtml}
                                                          onChange={(e) =>
                                                            handlePostBlockChange(
                                                              post.id,
                                                              blockIndex,
                                                              "contentHtml",
                                                              e.target.value,
                                                            )
                                                          }
                                                          placeholder="<h2>Subtítulo</h2><p>Texto do bloco...</p>"
                                                        />
                                                      </Field>

                                                      <BlockLinkMapper
                                                        contentHtml={block.contentHtml}
                                                        currentLang={lang}
                                                        allPosts={posts}
                                                        onUpdateContentHtml={(newHtml) =>
                                                          handlePostBlockChange(
                                                            post.id,
                                                            blockIndex,
                                                            "contentHtml",
                                                            newHtml,
                                                          )
                                                        }
                                                      />
                                                    </div>

                                                    {/* Lado Direito (1 coluna): Imagem do Bloco + Input + Botão 'Criar Imagem' + Focal Point Picker */}
                                                    <div className="space-y-3 rounded-lg border border-border/60 bg-muted/20 p-3">
                                                      <div className="flex items-center justify-between">
                                                        <span className="text-xs font-semibold text-foreground">IMAGEM DO BLOCO {blockIndex + 1}</span>
                                                        <Button
                                                          type="button"
                                                          size="sm"
                                                          variant="secondary"
                                                          className="h-7 text-xs gap-1.5"
                                                          onClick={() => handleGenerateSingleImage(post.id, blockIndex + 2, block.contentHtml.replace(/<[^>]*>/g, "").slice(0, 100))}
                                                        >
                                                          <Wand2 className="w-3 h-3 text-secondary" />
                                                          Criar Imagem
                                                        </Button>
                                                      </div>

                                                      <Field label="URL da Imagem">
                                                        <Input
                                                          value={block.image}
                                                          onChange={(e) =>
                                                            handlePostBlockChange(
                                                              post.id,
                                                              blockIndex,
                                                              "image",
                                                              e.target.value,
                                                            )
                                                          }
                                                          placeholder="https://... ou /uploads/..."
                                                        />
                                                      </Field>

                                                      <FocalPointPicker
                                                        imageSrc={block.image}
                                                        focalPoint={block.focalPoint}
                                                        onChangeFocalPoint={(fp) =>
                                                          handlePostBlockChange(
                                                            post.id,
                                                            blockIndex,
                                                            "focalPoint",
                                                            fp,
                                                          )
                                                        }
                                                      />
                                                    </div>
                                                  </div>
                                                </div>
                                              );
                                            })}
                                          </div>
                                        </div>
                                      </Field>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <Field label="Imagem de Destaque / Hero">
                                        <Input
                                          value={draft.image}
                                          onChange={(e) => setPostDrafts((prev) => ({ ...prev, [post.id]: { ...draft, image: e.target.value } }))}
                                        />
                                      </Field>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div className="flex items-center space-x-2 bg-muted/30 p-4 rounded-lg border border-border">
                                        <Switch
                                          id={`featured-${post.id}`}
                                          checked={draft.featured}
                                          onCheckedChange={(checked) => setPostDrafts((prev) => ({ ...prev, [post.id]: { ...draft, featured: checked } }))}
                                        />
                                        <Label htmlFor={`featured-${post.id}`}>Marcar como artigo em Destaque</Label>
                                      </div>

                                      <div className="flex items-center space-x-2 bg-muted/30 p-4 rounded-lg border border-border">
                                        <Switch
                                          id={`published-${post.id}`}
                                          checked={draft.published}
                                          onCheckedChange={(checked) => setPostDrafts((prev) => ({ ...prev, [post.id]: { ...draft, published: checked } }))}
                                        />
                                        <Label htmlFor={`published-${post.id}`}>Status: {draft.published ? "Publicado (Visível)" : "Rascunho (Oculto)"}</Label>
                                      </div>
                                    </div>

                                    <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                                       <Button
                                         type="button"
                                         variant="outline"
                                         onClick={() => handleImproveWithAI(post)}
                                         className="gap-2 text-xs border-purple-500/40 text-purple-400 hover:bg-purple-500/15 font-semibold"
                                       >
                                         <Sparkles className="w-3.5 h-3.5" />
                                         Melhorar com IA
                                       </Button>
                                       <Button
                                         type="button"
                                         variant="outline"
                                         onClick={() => handleGenerateImages(post)}
                                         className="gap-2 text-xs border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/15 font-semibold"
                                       >
                                         <ImageIcon className="w-3.5 h-3.5" />
                                         Gerar Imagens
                                       </Button>
                                       <Button
                                         type="button"
                                         variant="outline"
                                         onClick={() => handleOpenBatchImageModal(post.id)}
                                         className="gap-2 text-xs"
                                       >
                                         <Wand2 className="w-3.5 h-3.5 text-secondary" />
                                         Criar Lote de Fotos
                                       </Button>
                                      <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => handleManualTranslate(post.id)}
                                        className="gap-2 text-xs"
                                      >
                                        <Globe className="w-3.5 h-3.5 text-secondary" />
                                        Traduzir
                                      </Button>
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
                    <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                      <div className="flex items-center bg-card border border-border rounded-xl px-3 py-2 w-full sm:max-w-md shadow-sm">
                        <Search className="w-4 h-4 text-foreground/40 mr-2 shrink-0" />
                        <input
                          type="text"
                          placeholder="Buscar páginas por título ou slug..."
                          value={pagesQuery}
                          onChange={(e) => setPagesQuery(e.target.value)}
                          className="bg-transparent border-none outline-none text-sm w-full text-foreground"
                        />
                      </div>

                      <div className="flex bg-muted/60 p-1 rounded-lg border border-border shrink-0">
                        {(["pt", "en", "es"] as const).map((langCode) => (
                          <button
                            key={langCode}
                            onClick={() => {
                              setSelectedLang(langCode);
                              router.push(`/admin?lang=${langCode}`);
                            }}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                              selectedLang === langCode
                                ? "bg-card text-foreground shadow-sm"
                                : "text-foreground/60 hover:text-foreground"
                            }`}
                          >
                            {langCode === "pt" ? "Português" : langCode === "en" ? "English" : "Español"}
                          </button>
                        ))}
                      </div>
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
                                      <span>Rota: <code className="bg-muted px-1 py-0.5 rounded text-foreground/90 font-mono">/{selectedLang}/{page.slug || "(vazio)"}</code></span>
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

                {activeTab === "settings" && (() => {
                  const handleSaveSetting = async (updatedFields: Record<string, unknown>) => {
                    try {
                      const response = await fetch("/api/settings", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(updatedFields),
                      });
                      if (response.ok) {
                        toast({
                          title: "Configurações salvas",
                          description: "As alterações foram gravadas com sucesso no servidor."
                        });
                      }
                    } catch (error) {
                      console.error("Erro ao salvar configurações:", error);
                    }
                  };

                  return (
                    <div className="space-y-6">
                      <div className="border-b border-border pb-3">
                        <h2 className="text-2xl font-bold tracking-tight text-foreground">Funções e Plugins</h2>
                        <p className="mt-1 text-sm text-foreground/70">
                          Gerencie as automações, webhooks e integrações ativas no painel Curiosotech.
                        </p>
                      </div>

                      {/* Card 1: Tradução Automática */}
                      <Card className="border border-border/80 bg-card">
                        <CardHeader>
                          <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                            <Globe className="w-5 h-5 text-secondary" />
                            Plugins de Tradução & Automação
                          </CardTitle>
                          <CardDescription>
                            Configure se o sistema deve acionar automaticamente os serviços de tradução ao receber novos posts via API.
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted/20">
                            <div className="space-y-1 pr-4">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-foreground text-sm">Tradução Automática de Posts via API</span>
                                <Badge variant={autoTranslateEnabled ? "default" : "outline"} className="text-[10px]">
                                  {autoTranslateEnabled ? "Ativado" : "Desativado"}
                                </Badge>
                              </div>
                              <p className="text-xs text-foreground/70">
                                Quando ativado, ao receber a publicação de um novo artigo através da API automática, o sistema enviará uma requisição para o webhook de tradução do n8n.
                              </p>
                            </div>
                            <Switch
                              checked={autoTranslateEnabled}
                              onCheckedChange={async (checked) => {
                                setAutoTranslateEnabled(checked);
                                await handleSaveSetting({ autoTranslateEnabled: checked });
                              }}
                            />
                          </div>
                        </CardContent>
                      </Card>

                      {/* Card 2: Geração de Imagens por IA */}
                      <Card className="border border-border/80 bg-card">
                        <CardHeader>
                          <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                            <Wand2 className="w-5 h-5 text-secondary" />
                            Geração de Imagens por IA (API / n8n)
                          </CardTitle>
                          <CardDescription>
                            Configure se o sistema deve gerar automaticamente imagens por Inteligência Artificial para novos artigos recebidos da API.
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted/20">
                            <div className="space-y-1 pr-4">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-foreground text-sm">Geração Automática de Imagens</span>
                                <Badge variant={autoImageEnabled ? "default" : "outline"} className="text-[10px]">
                                  {autoImageEnabled ? "Ativado" : "Desativado"}
                                </Badge>
                              </div>
                              <p className="text-xs text-foreground/70">
                                Quando ativado, envia requisições para a API do n8n para desenhar imagens com base no contexto do artigo.
                              </p>
                            </div>
                            <Switch
                              checked={autoImageEnabled}
                              onCheckedChange={async (checked) => {
                                setAutoImageEnabled(checked);
                                await handleSaveSetting({ autoImageEnabled: checked });
                              }}
                            />
                          </div>

                          {autoImageEnabled && (
                            <div className="p-4 rounded-xl border border-border bg-muted/10 space-y-4">
                              <div className="text-sm font-semibold text-foreground">Selecione quais imagens gerar automaticamente:</div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                <label className="flex items-center space-x-2.5 text-sm text-foreground cursor-pointer select-none">
                                  <input
                                    type="checkbox"
                                    checked={autoImageHero}
                                    onChange={async (e) => {
                                      const val = e.target.checked;
                                      setAutoImageHero(val);
                                      await handleSaveSetting({ autoImageHero: val });
                                    }}
                                    className="rounded border-border bg-[#222222] text-primary focus:ring-0 focus:ring-offset-0 h-4 w-4"
                                  />
                                  <span>Imagem de Destaque / Hero</span>
                                </label>

                                <label className="flex items-center space-x-2.5 text-sm text-foreground cursor-pointer select-none">
                                  <input
                                    type="checkbox"
                                    checked={autoImageBlock1}
                                    onChange={async (e) => {
                                      const val = e.target.checked;
                                      setAutoImageBlock1(val);
                                      await handleSaveSetting({ autoImageBlock1: val });
                                    }}
                                    className="rounded border-border bg-[#222222] text-primary focus:ring-0 focus:ring-offset-0 h-4 w-4"
                                  />
                                  <span>Imagem do Bloco 1</span>
                                </label>

                                <label className="flex items-center space-x-2.5 text-sm text-foreground cursor-pointer select-none">
                                  <input
                                    type="checkbox"
                                    checked={autoImageBlock2}
                                    onChange={async (e) => {
                                      const val = e.target.checked;
                                      setAutoImageBlock2(val);
                                      await handleSaveSetting({ autoImageBlock2: val });
                                    }}
                                    className="rounded border-border bg-[#222222] text-primary focus:ring-0 focus:ring-offset-0 h-4 w-4"
                                  />
                                  <span>Imagem do Bloco 2</span>
                                </label>

                                <label className="flex items-center space-x-2.5 text-sm text-foreground cursor-pointer select-none">
                                  <input
                                    type="checkbox"
                                    checked={autoImageBlock3}
                                    onChange={async (e) => {
                                      const val = e.target.checked;
                                      setAutoImageBlock3(val);
                                      await handleSaveSetting({ autoImageBlock3: val });
                                    }}
                                    className="rounded border-border bg-[#222222] text-primary focus:ring-0 focus:ring-offset-0 h-4 w-4"
                                  />
                                  <span>Imagem do Bloco 3</span>
                                </label>

                                <label className="flex items-center space-x-2.5 text-sm text-foreground cursor-pointer select-none">
                                  <input
                                    type="checkbox"
                                    checked={autoImageBlock4}
                                    onChange={async (e) => {
                                      const val = e.target.checked;
                                      setAutoImageBlock4(val);
                                      await handleSaveSetting({ autoImageBlock4: val });
                                    }}
                                    className="rounded border-border bg-[#222222] text-primary focus:ring-0 focus:ring-offset-0 h-4 w-4"
                                  />
                                  <span>Imagem do Bloco 4</span>
                                </label>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      {/* Card 3: Temporizador de Publicação */}
                      <Card className="border border-border/80 bg-card">
                        <CardHeader>
                          <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                            <CheckSquare className="w-5 h-5 text-secondary" />
                            Temporizador de Publicação Automática
                          </CardTitle>
                          <CardDescription>
                            Configure as regras de agendamento automático de data e hora para posts vindos via API.
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted/20">
                            <div className="space-y-1 pr-4">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-foreground text-sm">Agendamento Automático (Scheduler)</span>
                                <Badge variant={schedulerEnabled ? "default" : "outline"} className="text-[10px]">
                                  {schedulerEnabled ? "Ativado" : "Desativado"}
                                </Badge>
                              </div>
                              <p className="text-xs text-foreground/70">
                                Quando ativado, os novos artigos serão agendados para a próxima data disponível no horário padrão definido.
                              </p>
                            </div>
                            <Switch
                              checked={schedulerEnabled}
                              onCheckedChange={async (checked) => {
                                setSchedulerEnabled(checked);
                                await handleSaveSetting({ schedulerEnabled: checked });
                              }}
                            />
                          </div>

                          {schedulerEnabled && (
                            <div className="p-4 rounded-xl border border-border bg-muted/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                              <div className="space-y-1">
                                <div className="text-xs font-semibold text-foreground">Horário Padrão de Publicação (Diário)</div>
                                <p className="text-[11px] text-foreground/60">Os posts serão publicados automaticamente neste horário do dia.</p>
                              </div>
                              <Input
                                type="time"
                                value={schedulerHour}
                                onChange={async (e) => {
                                  const val = e.target.value;
                                  setSchedulerHour(val);
                                  await handleSaveSetting({ schedulerHour: val });
                                }}
                                className="w-[150px] bg-card text-foreground"
                              />
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Modal Criar Imagens Em Lote */}
      {batchModalOpen && batchModalPostId && (() => {
        const draft = postDrafts[batchModalPostId];
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2 font-semibold text-lg text-foreground">
                  <Wand2 className="w-5 h-5 text-secondary" />
                  <span>Gerar Imagens por IA (Em Lote)</span>
                </div>
                <button
                  type="button"
                  onClick={() => setBatchModalOpen(false)}
                  className="text-foreground/60 hover:text-foreground text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs text-foreground/70">
                Selecione abaixo quais imagens você deseja gerar via inteligência artificial para o post <strong>"{draft?.title || batchModalPostId}"</strong>:
              </p>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {/* Hero Image option (Place 1) */}
                <label className="flex items-start gap-3 p-3 rounded-lg border border-border bg-muted/20 cursor-pointer hover:bg-muted/40 transition-colors">
                  <input
                    type="checkbox"
                    checked={!!batchSelectedSlots[1]}
                    onChange={(e) =>
                      setBatchSelectedSlots((prev) => ({ ...prev, 1: e.target.checked }))
                    }
                    className="mt-0.5 rounded border-border"
                  />
                  <div className="space-y-0.5 text-xs">
                    <span className="font-semibold text-foreground block">img-hero (Imagem de Destaque / Hero)</span>
                    <span className="text-foreground/60 italic">{draft?.title || "Hero Alt"}</span>
                  </div>
                </label>

                {/* Blocks Image options (Place N = index + 2) */}
                {draft?.blocks?.map((b, idx) => {
                  const placeIdx = idx + 2;
                  const previewText = b.contentHtml.replace(/<[^>]*>/g, "").slice(0, 80) || `Bloco ${idx + 1}`;
                  return (
                    <label
                      key={`slot-${placeIdx}`}
                      className="flex items-start gap-3 p-3 rounded-lg border border-border bg-muted/20 cursor-pointer hover:bg-muted/40 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={!!batchSelectedSlots[placeIdx]}
                        onChange={(e) =>
                          setBatchSelectedSlots((prev) => ({ ...prev, [placeIdx]: e.target.checked }))
                        }
                        className="mt-0.5 rounded border-border"
                      />
                      <div className="space-y-0.5 text-xs">
                        <span className="font-semibold text-foreground block">img-bloco-{idx + 1} (Bloco {idx + 1})</span>
                        <span className="text-foreground/60 italic truncate block max-w-sm">{previewText}</span>
                      </div>
                    </label>
                  );
                })}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                <Button variant="ghost" size="sm" onClick={() => setBatchModalOpen(false)}>
                  Cancelar
                </Button>
                <Button size="sm" onClick={handleExecuteBatchImageGenerate} className="gap-2">
                  <Wand2 className="w-3.5 h-3.5" />
                  Enviar Solicitação
                </Button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* MODAL POPUP ESTILIZADO DE STATUS DE WEBHOOK */}
      <Dialog
        open={webhookModal.isOpen}
        onOpenChange={(open) => setWebhookModal((prev) => ({ ...prev, isOpen: open }))}
      >
        <DialogContent className="sm:max-w-md border border-border/80 bg-card/95 backdrop-blur-xl rounded-2xl p-6 shadow-2xl">
          <DialogHeader className="flex flex-col items-center text-center space-y-3">
            {webhookModal.status === "loading" && (
              <div className="w-16 h-16 rounded-full bg-secondary/15 border border-secondary/30 flex items-center justify-center animate-pulse">
                <Loader2 className="w-8 h-8 text-secondary animate-spin" />
              </div>
            )}
            {webhookModal.status === "success" && (
              <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                <CheckCircle2 className="w-9 h-9" />
              </div>
            )}
            {webhookModal.status === "error" && (
              <div className="w-16 h-16 rounded-full bg-destructive/15 border border-destructive/30 flex items-center justify-center text-destructive shadow-[0_0_20px_rgba(239,68,68,0.2)]">
                <XCircle className="w-9 h-9" />
              </div>
            )}

            <DialogTitle className="text-xl font-bold text-foreground">
              {webhookModal.title}
            </DialogTitle>

            {webhookModal.actionName && (
              <Badge variant="outline" className="text-[11px] uppercase tracking-wider font-semibold px-3 py-0.5 border-secondary/40 text-secondary bg-secondary/10">
                {webhookModal.actionName}
              </Badge>
            )}
          </DialogHeader>

          <div className="space-y-3 my-2 text-center">
            {webhookModal.postTitle && (
              <p className="text-xs text-foreground/70 font-medium">
                Artigo: <strong className="text-foreground">{webhookModal.postTitle}</strong>
              </p>
            )}
            {webhookModal.message && (
              <div className={`p-4 rounded-xl border text-xs leading-relaxed text-left ${
                webhookModal.status === "success"
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
                  : webhookModal.status === "error"
                  ? "bg-destructive/10 border-destructive/20 text-destructive-foreground"
                  : "bg-muted/50 border-border text-foreground/80"
              }`}>
                {webhookModal.message}
              </div>
            )}
            {webhookModal.details && (
              <p className="text-[11px] font-mono text-foreground/50 truncate">
                {webhookModal.details}
              </p>
            )}
          </div>

          <DialogFooter className="sm:justify-center mt-2">
            <Button
              type="button"
              variant={webhookModal.status === "error" ? "destructive" : "default"}
              className="w-full sm:w-auto px-8 font-semibold rounded-xl"
              onClick={() => setWebhookModal((prev) => ({ ...prev, isOpen: false }))}
              disabled={webhookModal.status === "loading"}
            >
              {webhookModal.status === "loading" ? "Aguardando..." : "Entendido"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer lang={lang} t={t} />
    </div>
  );
}
