"use client";

import { useState } from "react";
import { Heart, Share2, Copy, Check, MessageCircle, Twitter, Facebook } from "lucide-react";

import { type Language } from "@/lib/i18n";

interface PostActionsBarProps {
  postId: number | string;
  postTitle: string;
  initialLikes?: number;
  lang?: Language;
}

const actionTranslations = {
  pt: {
    like: "Curtir",
    liked: "Curtido",
    support: "Gostou do conteúdo? Deixe seu apoio!",
    share: "Compartilhar:",
    copy: "Copiar Link",
    copied: "Copiado!",
    shareMsg: "Confira este post no CuriosoTech: ",
  },
  en: {
    like: "Like",
    liked: "Liked",
    support: "Liked the content? Leave your support!",
    share: "Share:",
    copy: "Copy Link",
    copied: "Copied!",
    shareMsg: "Check out this post on CuriosoTech: ",
  },
  es: {
    like: "Me gusta",
    liked: "Te gusta",
    support: "¿Te gustó el contenido? ¡Deja tu apoyo!",
    share: "Compartir:",
    copy: "Copiar Enlace",
    copied: "¡Copiado!",
    shareMsg: "Echa un vistazo a este post en CuriosoTech: ",
  },
};

export default function PostActionsBar({ postId, postTitle, initialLikes = 0, lang = "pt" }: PostActionsBarProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [hasLiked, setHasLiked] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loadingLike, setLoadingLike] = useState(false);

  const t = actionTranslations[lang] ?? actionTranslations.pt;

  const currentUrl = typeof window !== "undefined" ? window.location.href : "";
  const encodedUrl = encodeURIComponent(currentUrl);
  const encodedText = encodeURIComponent(`${t.shareMsg}"${postTitle}"`);

  const handleLike = async () => {
    if (hasLiked || loadingLike) return;

    setLoadingLike(true);
    setLikes((prev) => prev + 1);
    setHasLiked(true);

    try {
      await fetch("/api/posts/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, postTitle }),
      });
    } catch (err) {
      console.error("Erro ao registrar curtida:", err);
    } finally {
      setLoadingLike(false);
    }
  };

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);

      fetch("/api/posts/share-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, postTitle, network: "CopyLink" }),
      }).catch(() => {});
    }
  };

  const handleSocialClick = (network: string) => {
    fetch("/api/posts/share-log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId, postTitle, network }),
    }).catch(() => {});
  };

  return (
    <div className="bg-card border border-border p-4 my-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl shadow-sm">
      <div className="flex items-center gap-3">
        <button
          onClick={handleLike}
          disabled={hasLiked}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all rounded-xl border ${
            hasLiked
              ? "bg-secondary text-secondary-foreground border-secondary"
              : "bg-muted hover:bg-muted/80 text-foreground border-border"
          }`}
        >
          <Heart size={16} className={hasLiked ? "fill-current text-secondary-foreground" : "text-secondary"} />
          <span>{hasLiked ? t.liked : t.like}</span>
          <span className="ml-1 bg-background/50 px-2 py-0.5 rounded-lg text-[11px] font-mono">{likes}</span>
        </button>
        <span className="text-xs text-foreground/70 hidden sm:inline">
          {t.support}
        </span>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs uppercase tracking-wider text-foreground/70 mr-1 flex items-center gap-1">
          <Share2 size={13} className="text-secondary" /> {t.share}
        </span>

        <a
          href={`https://api.whatsapp.com/send?text=${encodedText}%20${encodedUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => handleSocialClick("WhatsApp")}
          className="p-2 bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-white transition-colors rounded-xl border border-[#25D366]/20"
          title="WhatsApp"
        >
          <MessageCircle size={16} />
        </a>

        <a
          href={`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => handleSocialClick("X")}
          className="p-2 bg-muted text-foreground hover:bg-foreground hover:text-background transition-colors rounded-xl border border-border"
          title="X (Twitter)"
        >
          <Twitter size={16} />
        </a>

        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => handleSocialClick("Facebook")}
          className="p-2 bg-[#1877F2]/10 text-[#1877F2] hover:bg-[#1877F2] hover:text-white transition-colors rounded-xl border border-[#1877F2]/20"
          title="Facebook"
        >
          <Facebook size={16} />
        </a>

        <button
          onClick={handleCopyLink}
          className="flex items-center gap-1.5 px-3 py-2 bg-muted text-xs text-foreground/80 hover:text-foreground border border-border transition-colors rounded-xl"
          title={t.copy}
        >
          {copied ? (
            <>
              <Check size={14} className="text-emerald-500" />
              <span className="text-emerald-500 font-semibold">{t.copied}</span>
            </>
          ) : (
            <>
              <Copy size={14} />
              <span>{t.copy}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
