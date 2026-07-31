"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Sparkles, Tag, TrendingUp, Clock } from "lucide-react";
import { translations, type Language } from "@/lib/i18n";
import { NewsletterSection } from "./NewsletterSection";

interface SidebarProps {
  postTags?: string[];
  lang?: string;
  t?: any;
}

export default function Sidebar({ postTags = [], lang = "pt", t: propT }: SidebarProps) {
  const currentLang = (lang as Language) || "pt";
  const t = propT || translations[currentLang] || translations.pt;
  const [recentPosts, setRecentPosts] = useState<any[]>([]);

  useEffect(() => {
    fetch(`/api/posts?lang=${lang}&limit=4`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.posts)) {
          setRecentPosts(data.posts.slice(0, 4));
        }
      })
      .catch(() => {});
  }, [lang]);

  return (
    <aside className="space-y-8">
      {recentPosts.length > 0 && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-md">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp size={16} className="text-cyan-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Em Alta no Blog
            </h3>
          </div>
          <div className="space-y-4">
            {recentPosts.map((p) => {
              const pUrl = p.lang === "en" ? `/en/post/${p.slug}` : p.lang === "es" ? `/es/post/${p.slug}` : `/post/${p.slug}`;
              return (
                <Link
                  key={p.id}
                  href={pUrl}
                  className="group flex gap-3 items-center hover:bg-slate-800/50 p-2 rounded-xl transition-all"
                >
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-slate-950 border border-slate-800">
                    {p.img && (
                      <Image
                        src={p.img}
                        alt={p.title}
                        fill
                        sizes="64px"
                        className="object-cover group-hover:scale-105 transition-transform"
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-semibold text-slate-200 group-hover:text-cyan-400 line-clamp-2 transition-colors">
                      {p.title}
                    </h4>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-1">
                      <Clock size={10} /> {p.readTime || "5 min"}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {postTags.length > 0 && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-md">
          <div className="flex items-center gap-2 mb-4">
            <Tag size={16} className="text-purple-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Tags do Artigo
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {postTags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs rounded-lg transition-colors cursor-pointer"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}

      <NewsletterSection t={t} />
    </aside>
  );
}
