"use client";

import React, { useState, useEffect } from "react";
import { List, ChevronDown, ChevronUp } from "lucide-react";

interface Heading {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  blocks: { text: string }[];
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export default function TableOfContents({ blocks }: TableOfContentsProps) {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [isOpen, setIsOpen] = useState(true);
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    const extractedHeadings: Heading[] = [];
    const headingRegex = /<(h[23])\b[^>]*>(.*?)<\/\1>/gi;

    blocks.forEach((block) => {
      let match;
      while ((match = headingRegex.exec(block.text)) !== null) {
        const level = match[1].toLowerCase() === "h2" ? 2 : 3;
        const rawText = match[2];
        const cleanText = rawText.replace(/<[^>]*>/g, "");
        const id = slugify(cleanText);

        extractedHeadings.push({
          id,
          text: cleanText,
          level,
        });
      }
    });

    setHeadings(extractedHeadings);

    const observerOptions = {
      root: null,
      rootMargin: "0px 0px -70% 0px",
      threshold: 0,
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveId(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    extractedHeadings.forEach((h) => {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    });

    return () => {
      extractedHeadings.forEach((h) => {
        const el = document.getElementById(h.id);
        if (el) observer.unobserve(el);
      });
    };
  }, [blocks]);

  if (headings.length === 0) return null;

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
      setActiveId(id);
    }
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 mb-8 backdrop-blur-md shadow-lg transition-all duration-300">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left outline-none"
      >
        <div className="flex items-center gap-2">
          <List size={16} className="text-cyan-400" />
          <span className="text-sm font-semibold uppercase tracking-wider text-slate-200">
            Índice de Tópicos
          </span>
        </div>
        <div className="text-slate-400 hover:text-white transition-colors">
          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      {isOpen && (
        <ul className="mt-4 space-y-2 border-t border-slate-800/80 pt-4 transition-all duration-300">
          {headings.map((h, idx) => {
            const isActive = activeId === h.id;
            return (
              <li
                key={`${h.id}-${idx}`}
                style={{
                  paddingLeft: h.level === 3 ? "1rem" : "0px",
                }}
              >
                <a
                  href={`#${h.id}`}
                  onClick={(e) => scrollToSection(e, h.id)}
                  className={`block text-xs leading-relaxed transition-all duration-200 border-l-2 pl-3 py-1 ${
                    isActive
                      ? "border-cyan-400 text-cyan-400 font-semibold"
                      : "border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700"
                  }`}
                >
                  {h.text}
                </a>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
