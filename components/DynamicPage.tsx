"use client";

import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Seo } from "@/components/Seo";
import { translations, type Language } from "@/lib/i18n";
import type { CustomPage } from "@/lib/pages-db";

interface DynamicPageProps {
  page: CustomPage;
  lang: Language;
}

export function DynamicPage({ page, lang }: DynamicPageProps) {
  const bodyHtml = page.content?.bodyHtml || "";
  const t = translations[lang];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Seo
        lang={lang}
        title={page.seoTitle || page.title}
        description={page.seoDescription || ""}
      />
      <Header lang={lang} pageKey="about" t={t} />

      <main className="flex-1 py-16 sm:py-24">
        <article className="container mx-auto px-4 max-w-3xl">
          <header className="mb-10 pb-6 border-b border-border">
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl leading-none">
              {page.title}
            </h1>
            <p className="mt-3 text-xs text-foreground/40 font-mono">
              Atualizado em {new Date(page.updatedAt).toLocaleDateString()}
            </p>
          </header>

          <div
            className="prose prose-invert max-w-none text-foreground/85 leading-relaxed space-y-6"
            dangerouslySetInnerHTML={{ __html: bodyHtml }}
          />
        </article>
      </main>

      <Footer lang={lang} t={t} />
    </div>
  );
}
export default DynamicPage;
