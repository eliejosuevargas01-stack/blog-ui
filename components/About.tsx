"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Cpu, Globe2, Sparkles, User, ShieldCheck } from "lucide-react";

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
        title="Sobre o CuriosoTech · Tecnologia, Geopolítica e Curiosidades"
        description="Conheça a proposta editorial do CuriosoTech, portal fundado por Eliezer Vargas focado nos bastidores da tecnologia, inteligência artificial e geopolítica."
      />
      <Header lang={lang} pageKey="about" t={t} />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden bg-gradient-to-b from-secondary/15 via-background to-background py-16 sm:py-24 border-b border-border">
          <div className="absolute inset-0">
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl">
              <Link
                href={homePath}
                className="inline-flex items-center gap-2 text-sm font-semibold text-secondary hover:text-secondary/80 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                {t.nav.home}
              </Link>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-secondary/15 text-secondary rounded-full border border-secondary/20 mt-6 mb-4 text-xs font-semibold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Editorial & Manifesto</span>
              </div>
              <h1 className="text-4xl sm:text-6xl font-bold text-foreground mb-4">
                Sobre o CuriosoTech
              </h1>
              <p className="text-lg sm:text-xl text-foreground/80 leading-relaxed">
                Curiosidades aprofundadas sobre os bastidores da tecnologia, inteligência artificial e as grandes disputas da geopolítica global.
              </p>
            </div>
          </div>
        </section>

        {/* PROPOSTA EDITORIAL E CARROS-CHEFE */}
        <section className="py-16 sm:py-24 border-b border-border">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl space-y-12">
              
              {/* Carros-Chefe */}
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-3">
                  Nossos Carros-Chefe Editoriais
                </h2>
                <p className="text-base text-foreground/80 mb-8">
                  Diferente da cobertura comum de notícias diárias, o CuriosoTech investiga as dinâmicas que moldam o futuro:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="rounded-2xl border border-border bg-card p-6 hover:border-secondary transition-all">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                      <Cpu className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2">
                      1. Tecnologia & IA Invisível
                    </h3>
                    <p className="text-sm text-foreground/80 leading-relaxed">
                      Investigamos o funcionamento dos modelos de inteligência artificial, novos hardwares, algoritmos de recomendação e como o código invisível toma decisões por nós na rotina diária.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-border bg-card p-6 hover:border-secondary transition-all">
                    <div className="w-12 h-12 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center mb-4">
                      <Globe2 className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2">
                      2. Geopolítica & Soberania Digital
                    </h3>
                    <p className="text-sm text-foreground/80 leading-relaxed">
                      Analisamos a corrida global por semicondutores, ciberguerra, disputa de patentes e como a tecnologia virou o principal campo de batalha de poder entre superpotências.
                    </p>
                  </div>
                </div>
              </div>

              {/* Bloco do Tom Editorial */}
              <div className="rounded-2xl border border-border bg-card/60 p-8">
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <ShieldCheck className="w-6 h-6 text-secondary" />
                  Tom Editorial e Independência
                </h2>
                <p className="text-base text-foreground/80 leading-relaxed space-y-4">
                  No CuriosoTech, o foco não é a tecnologia pela tecnologia, nem o sensacionalismo de manchetes vazias. Buscamos revelar a <strong>consequência humana, social e econômica</strong> de cada avanço ou disputa internacional, sempre com curiosidade e olhar crítico.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* BLOCO DO AUTOR / FUNDADOR (ELIEZER VARGAS) */}
        <section className="py-16 sm:py-24 bg-card/40">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl">
              <div className="flex items-center gap-3 mb-8">
                <span className="block w-1.5 h-7 bg-secondary rounded-full" />
                <h2 className="text-3xl font-bold text-foreground">
                  Quem Escreve Aqui
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-8 items-start rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-xl">
                {/* Lugar da Imagem do Autor */}
                <div className="relative group mx-auto md:mx-0 w-full max-w-[280px] aspect-[4/5] rounded-2xl overflow-hidden border border-border bg-muted">
                  <Image
                    src="/eliezer-author.jpg"
                    alt="Eliezer Vargas - Fundador e Autor do CuriosoTech"
                    width={500}
                    height={625}
                    priority
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <p className="text-sm font-bold">Eliezer Vargas</p>
                    <p className="text-[11px] text-white/80">Criador & Editor</p>
                  </div>
                </div>

                {/* Texto sobre Eliezer Vargas */}
                <div className="flex flex-col justify-between space-y-5">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-secondary/10 text-secondary text-xs font-semibold rounded-md mb-3">
                      <User className="w-3.5 h-3.5" />
                      <span>Autor & Fundador</span>
                    </div>
                    <h3 className="text-2xl font-bold text-foreground mb-3">
                      Eliezer Vargas
                    </h3>
                    <div className="space-y-3 text-base text-foreground/80 leading-relaxed">
                      <p>
                        Olá! Me chamo <strong>Eliezer Vargas</strong>, criador e editor do <strong>CuriosoTech</strong>. Sou apaixonado por tecnologia, inteligência artificial, programação e análises dos movimentos políticos e econômicos globais.
                      </p>
                      <p>
                        Criei este portal com um propósito simples: transformar assuntos complexos sobre tecnologia e geopolítica em artigos fascinantes, acessíveis e direto ao ponto — sem jargões corporativos e sem filtro de assessoria.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-secondary/20 bg-secondary/5 border-l-4 border-l-secondary">
                    <p className="text-sm text-foreground/90 italic">
                      "Se você gosta de entender o que está acontecendo por trás das telas e dos acordos internacionais — você está no lugar certo."
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>
      </main>

      <Footer lang={lang} t={t} />
    </div>
  );
}
