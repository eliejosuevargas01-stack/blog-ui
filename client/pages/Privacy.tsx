import { Link } from "react-router-dom";

import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Seo } from "@/components/Seo";
import { buildPath, translations, type Language } from "@/lib/i18n";

interface PrivacyProps {
  lang: Language;
}

export default function Privacy({ lang }: PrivacyProps) {
  const t = translations[lang];
  const homePath = buildPath(lang, "home");

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Seo
        lang={lang}
        page="privacy"
        title={t.meta.privacy.title}
        description={t.meta.privacy.description}
      />
      <Header lang={lang} pageKey="privacy" t={t} />

      <main className="flex-1">
        <section className="relative overflow-hidden bg-gradient-to-b from-primary/10 via-background to-background py-16 sm:py-24">
          <div className="absolute inset-0">
            <div className="absolute -top-32 -right-32 w-72 h-72 bg-secondary/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-32 -left-32 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl">
              <Link
                to={homePath}
                className="inline-flex items-center gap-2 text-sm font-semibold text-secondary hover:text-secondary/80 transition-colors"
              >
                {t.nav.home}
              </Link>
              <h1 className="text-4xl sm:text-6xl font-bold text-foreground mt-6 mb-4">
                {t.privacy.title}
              </h1>
              <p className="text-lg sm:text-xl text-foreground/80">
                {t.privacy.subtitle}
              </p>
              <p className="mt-4 text-sm text-foreground/80">
                {t.privacy.updatedLabel}: {t.privacy.updatedAt}
              </p>
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl space-y-6">
              {t.privacy.sections.map((section) => (
                <div
                  key={section.title}
                  className="rounded-2xl border border-border bg-card p-8"
                >
                  <h2 className="text-2xl font-semibold text-foreground mb-3">
                    {section.title}
                  </h2>
                  <p className="text-base text-foreground/80 leading-relaxed whitespace-pre-line">
                    {section.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer lang={lang} t={t} />
    </div>
  );
}
