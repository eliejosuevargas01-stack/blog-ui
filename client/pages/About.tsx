import { Link } from "react-router-dom";

import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Seo } from "@/components/Seo";
import { buildPath, translations, type Language } from "@/lib/i18n";

interface AboutProps {
  lang: Language;
}

export default function About({ lang }: AboutProps) {
  const t = translations[lang];
  const homePath = buildPath(lang, "home");

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Seo
        lang={lang}
        page="about"
        title={t.meta.about.title}
        description={t.meta.about.description}
      />
      <Header lang={lang} pageKey="about" t={t} />

      <main className="flex-1">
        <section className="relative overflow-hidden bg-gradient-to-b from-secondary/10 via-background to-background py-16 sm:py-24">
          <div className="absolute inset-0">
            <div className="absolute -top-32 -right-32 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-32 -left-32 w-72 h-72 bg-secondary/10 rounded-full blur-3xl" />
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
                {t.about.title}
              </h1>
              <p className="text-lg sm:text-xl text-foreground/80">
                {t.about.subtitle}
              </p>
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl space-y-10">
              <div className="rounded-2xl border border-border bg-card p-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
                  {t.about.identityTitle}
                </h2>
                <p className="text-lg text-foreground/80 leading-relaxed">
                  {t.about.identityText}
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-muted/50 p-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
                  {t.about.focusTitle}
                </h2>
                <ul className="space-y-3 text-base text-foreground/80">
                  {t.about.focusItems.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span className="mt-1 h-2.5 w-2.5 rounded-full bg-secondary" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer lang={lang} t={t} />
    </div>
  );
}
