import { Link } from "react-router-dom";
import { ArrowRight, Gauge, Sparkles, Wrench } from "lucide-react";

import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Seo } from "@/components/Seo";
import { buildPath, translations, type Language } from "@/lib/i18n";

const toolVisuals = [
  {
    icon: Wrench,
    glow: "from-primary/20 to-transparent",
  },
  {
    icon: Gauge,
    glow: "from-secondary/20 to-transparent",
  },
  {
    icon: Sparkles,
    glow: "from-primary/15 to-secondary/10",
  },
];

interface ToolsProps {
  lang: Language;
}

export default function Tools({ lang }: ToolsProps) {
  const t = translations[lang];
  const homePath = buildPath(lang, "home");

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Seo
        lang={lang}
        page="tools"
        title={t.meta.tools.title}
        description={t.meta.tools.description}
      />
      <Header lang={lang} pageKey="tools" t={t} />

      <main className="flex-1">
        <section className="relative overflow-hidden bg-gradient-to-b from-secondary/10 via-background to-background py-20 sm:py-28">
          <div className="absolute inset-0">
            <div className="absolute -top-32 -right-32 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-32 -left-32 w-72 h-72 bg-secondary/10 rounded-full blur-3xl" />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/10 rounded-full border border-secondary/20 mb-6">
                <Sparkles className="w-4 h-4 text-secondary" />
                <span className="text-sm font-medium text-secondary">
                  {t.tools.badge}
                </span>
              </div>

              <h1 className="text-4xl sm:text-6xl font-bold text-foreground mb-6">
                {t.tools.heroTitle}
              </h1>
              <p className="text-lg sm:text-xl text-foreground/70 mb-8">
                {t.tools.heroSubtitle}
              </p>

              <Link
                to={{ pathname: homePath, hash: "#newsletter" }}
                className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-lg font-semibold hover:shadow-xl hover:shadow-primary/20 transition-all hover:scale-105"
              >
                {t.tools.ctaButton}
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-24 border-b border-border">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                {t.tools.gridTitle}
              </h2>
              <p className="text-lg text-foreground/60">
                {t.tools.gridSubtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {t.tools.cards.map((tool, index) => {
                const visual = toolVisuals[index % toolVisuals.length];
                const Icon = visual.icon;
                return (
                  <article key={tool.title} className="relative group">
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${visual.glow} rounded-xl blur-xl transition-all group-hover:blur-2xl`}
                    />
                    <div className="relative h-full border border-border bg-card rounded-xl p-8 hover:border-secondary transition-all hover:shadow-xl">
                      <div className="flex items-center justify-between mb-6">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                          <Icon className="w-6 h-6 text-primary-foreground" />
                        </div>
                        <span className="text-xs font-semibold uppercase tracking-wide text-secondary">
                          {tool.status}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-foreground mb-3">
                        {tool.title}
                      </h3>
                      <p className="text-foreground/60 text-sm">
                        {tool.description}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="rounded-2xl border border-border bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-10 text-center">
                <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
                  {t.tools.ctaTitle}
                </h3>
                <p className="text-foreground/70 mb-6">
                  {t.tools.ctaSubtitle}
                </p>
                <Link
                  to={{ pathname: homePath, hash: "#newsletter" }}
                  className="inline-flex items-center gap-2 px-6 py-3 border-2 border-secondary text-secondary rounded-lg font-semibold hover:bg-secondary hover:text-secondary-foreground transition-all"
                >
                  {t.tools.ctaButton}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer lang={lang} t={t} />
    </div>
  );
}
