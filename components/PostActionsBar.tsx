"use client";

import { useState } from "react";
import { Heart, Share2, Copy, Check, MessageCircle, Twitter, Facebook } from "lucide-react";

interface PostActionsBarProps {
  postId: number | string;
  postTitle: string;
  initialLikes?: number;
}

export default function PostActionsBar({ postId, postTitle, initialLikes = 0 }: PostActionsBarProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [hasLiked, setHasLiked] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loadingLike, setLoadingLike] = useState(false);

  const currentUrl = typeof window !== "undefined" ? window.location.href : "";
  const encodedUrl = encodeURIComponent(currentUrl);
  const encodedText = encodeURIComponent(`Confira este post no CuriosoTech: "${postTitle}"`);

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
    <div className="bg-slate-900/80 border border-slate-800 p-4 my-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl backdrop-blur-md">
      <div className="flex items-center gap-3">
        <button
          onClick={handleLike}
          disabled={hasLiked}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all rounded-xl ${
            hasLiked
              ? "bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-lg shadow-rose-500/20"
              : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-pink-500/40"
          }`}
        >
          <Heart size={16} className={hasLiked ? "fill-white" : "text-pink-400"} />
          <span>{hasLiked ? "Curtido" : "Curtir"}</span>
          <span className="ml-1 bg-black/40 px-2 py-0.5 rounded-lg text-[11px] font-mono">{likes}</span>
        </button>
        <span className="text-xs text-slate-400 hidden sm:inline">
          Gostou do conteúdo? Deixe seu apoio!
        </span>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs uppercase tracking-wider text-slate-400 mr-1 flex items-center gap-1">
          <Share2 size={13} className="text-cyan-400" /> Compartilhar:
        </span>

        <a
          href={`https://api.whatsapp.com/send?text=${encodedText}%20${encodedUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => handleSocialClick("WhatsApp")}
          className="p-2 bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-white transition-colors rounded-xl border border-[#25D366]/20"
          title="Compartilhar no WhatsApp"
        >
          <MessageCircle size={16} />
        </a>

        <a
          href={`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => handleSocialClick("X")}
          className="p-2 bg-slate-800 text-slate-200 hover:bg-white hover:text-black transition-colors rounded-xl border border-slate-700"
          title="Compartilhar no X (Twitter)"
        >
          <Twitter size={16} />
        </a>

        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => handleSocialClick("Facebook")}
          className="p-2 bg-[#1877F2]/10 text-[#1877F2] hover:bg-[#1877F2] hover:text-white transition-colors rounded-xl border border-[#1877F2]/20"
          title="Compartilhar no Facebook"
        >
          <Facebook size={16} />
        </a>

        <button
          onClick={handleCopyLink}
          className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 text-xs text-slate-300 hover:text-white border border-slate-700 transition-colors rounded-xl"
          title="Copiar Link do Post"
        >
          {copied ? (
            <>
              <Check size={14} className="text-emerald-400" />
              <span className="text-emerald-400 font-semibold">Copiado!</span>
            </>
          ) : (
            <>
              <Copy size={14} />
              <span>Copiar Link</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
