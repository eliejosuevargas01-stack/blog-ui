export type Language = "pt" | "en" | "es";

export const languages = ["pt", "en", "es"] as const;
export const defaultLang: Language = "pt";
export const siteName = "Curioso";
export const editorialIdentity =
  "Curioso é um portal editorial sobre tecnologia e inteligência artificial que revela como sistemas invisíveis já influenciam decisões, comportamentos e o dia a dia das pessoas, mesmo quando elas não percebem.";
export const allowedCategories = [
  "IA & Vida Real",
  "Tecnologia Invisível",
  "Curiosidades Tecnológicas",
  "Automação & Negócios",
  "Futuro Próximo",
  "Guias Fundamentais",
] as const;

const categoryIntros = {
  iaVidaReal:
    "IA & Vida Real é o espaço onde a inteligência artificial sai do laboratório e entra na rotina das pessoas. Aqui, algoritmos deixam de ser abstrações e passam a decidir quais ofertas você vê, quais oportunidades chegam primeiro e até quais caminhos profissionais parecem mais promissores. Esse impacto costuma ser silencioso, porque a IA aparece como conveniência, rapidez ou automação, e não como uma escolha explícita.\n\nNesta categoria, investigamos como modelos de recomendação influenciam consumo, como sistemas de triagem afetam contratações e como a automação muda o ritmo do trabalho. Também acompanhamos o uso de IA em bancos, seguradoras, saúde e educação, onde a tecnologia promete eficiência, mas pode carregar vieses, erros e zonas cinzentas. O foco não é a tecnologia pela tecnologia: é a consequência humana, social e econômica de cada decisão automatizada.\n\nFalamos de produtividade, mas também de ansiedade, de competição e de novas formas de avaliação. Falamos de personalização, mas também de opacidade, de dados usados sem consentimento e de pessoas que não sabem por que receberam um \"sim\" ou um \"não\". A IA no dia a dia tem efeitos reais sobre renda, tempo e autonomia, e é isso que queremos tornar visível.\n\nTambém discutimos responsabilidade e transparência: quem responde quando um modelo erra, quais dados alimentam as previsões e como exigir explicações em serviços que dependem de IA. Observamos práticas de auditoria, leis emergentes e movimentos que defendem direitos digitais. A intenção é ajudar você a reconhecer quando a IA amplia escolhas e quando ela limita possibilidades, para que decisões automatizadas não se tornem decisões inevitáveis.\n\nOs textos de IA & Vida Real explicam conceitos essenciais com exemplos concretos, conectam casos atuais a tendências maiores e mostram onde a tecnologia já está operando sem alarde. Se você quer entender por que certas decisões parecem inevitáveis, como são treinados os modelos que regulam a sua experiência e o que dá para questionar ou exigir, este é o seu ponto de partida.",
  tecnologiaInvisivel:
    "Tecnologia Invisível é a categoria dedicada a tudo o que funciona quando ninguém está olhando. São protocolos, sensores, softwares e camadas de infraestrutura que sustentam a vida digital e física, mas raramente aparecem nas manchetes. Quando você aproxima o celular de uma catraca, quando a cidade ajusta semáforos em tempo real ou quando um aplicativo prevê sua próxima ação, existe um conjunto de sistemas silenciosos trabalhando no fundo.\n\nAqui exploramos como esses sistemas são construídos, quem decide suas regras e quais efeitos eles causam. Falamos de geolocalização, rastreamento, scoring, reconhecimento de padrões e redes que conectam máquinas a pessoas. Também mostramos como tecnologias invisíveis impactam segurança, mobilidade, consumo de energia e até relações sociais, criando benefícios práticos, mas também novas formas de controle e desigualdade.\n\nO objetivo é revelar o que está por trás do conforto. Muitas vezes, o invisível é o que define o limite entre liberdade e vigilância, entre eficiência e exclusão. Entender essas camadas ajuda a perceber por que certas soluções parecem mágicas e por que outras geram desconforto, mesmo quando não sabemos explicar.\n\nAlém do funcionamento técnico, analisamos o custo de manter essas engrenagens: energia, manutenção, dependência de fornecedores e impactos ambientais. Tecnologias invisíveis podem reforçar desigualdades quando não são distribuídas de forma justa ou quando operam apenas para quem já tem acesso. Entender essa camada de infraestrutura ajuda a questionar promessas fáceis e a enxergar quem fica de fora.\n\nNesta categoria, cada curiosidade vem com contexto: de onde surgiu, como funciona, quem ganha com ela e quais consequências reais ela produz. A tecnologia invisível já molda decisões, comportamentos e oportunidades. Ao iluminar esses bastidores, o Curioso oferece instrumentos para que você reconheça o que estava escondido e participe de forma mais consciente do futuro que já está em andamento.",
  curiosidadesTecnologicas:
    "Curiosidades Tecnológicas é o lugar onde o inesperado encontra impacto real. Não tratamos trivia vazia, e sim histórias, descobertas e fatos pouco conhecidos que mudam a maneira como percebemos o mundo conectado. São curiosidades que revelam um detalhe técnico, um comportamento coletivo ou uma escolha de design que altera vidas, mercados e rotinas.\n\nAqui você vai entender por que uma pequena mudança em um algoritmo pode modificar o que milhões de pessoas leem, por que um sensor aparentemente simples pode revolucionar uma cadeia logística e como uma decisão de engenharia acaba virando regra social. O curioso, neste caso, é o ponto de entrada para compreender consequências que não aparecem no título principal.\n\nA tecnologia é cheia de atalhos criativos, falhas inesperadas e soluções brilhantes que raramente são explicadas com calma. Nós fazemos essa ponte: explicamos o que aconteceu, por que aconteceu e o que isso significa na prática. Muitas vezes, a curiosidade revela também limites, riscos e dilemas que precisam de atenção.\n\nSelecionamos curiosidades que sirvam de lente para temas maiores. Investigamos a origem, comparamos versões, apontamos limites e explicamos por que aquela história importa agora. Em vez de tratar a tecnologia como espetáculo, usamos o fator surpresa para revelar mecanismos que passam despercebidos e para estimular perguntas melhores sobre o que estamos adotando. Também explicamos como essas descobertas se conectam a debates atuais sobre ética, sustentabilidade e poder, para que a curiosidade vire consciência.\n\nEsta categoria é para quem gosta de se surpreender, mas não quer ficar só na superfície. Cada post traz contexto, exemplos e consequências, mostrando que a história por trás do \"uau\" tem efeitos mensuráveis. Curiosidade, aqui, é ferramenta de compreensão e não apenas entretenimento.",
  automacaoNegocios:
    "Automação & Negócios acompanha a transformação silenciosa que acontece dentro das empresas. Processos que antes dependiam de pessoas agora são executados por sistemas, robôs de software e modelos preditivos. Isso muda custos, velocidade, emprego, estratégia e cultura. Nesta categoria, investigamos como a automação redefine o que é produtividade e quais são os novos gargalos que surgem quando tudo fica mais rápido.\n\nFalamos de fluxos de trabalho automatizados, atendimento com IA, decisões baseadas em dados e cadeias de suprimentos inteligentes. Mostramos como pequenas mudanças operacionais podem gerar efeitos enormes no resultado financeiro, mas também como a automação pode criar dependências perigosas e reduzir a capacidade de adaptação quando o ambiente muda.\n\nO impacto não é só econômico. A automação altera funções, redistribui responsabilidades e modifica a relação entre pessoas e ferramentas. Existem ganhos claros, mas também riscos de concentração, perda de transparência e mudanças abruptas no mercado de trabalho. O nosso foco é ajudar a enxergar esses efeitos antes que eles se tornem irreversíveis.\n\nTambém observamos governança e ética da automação. Quem define as regras do sistema, quais indicadores são priorizados e como preservar espaço para julgamento humano? Sem esses cuidados, a automação pode otimizar o curto prazo e enfraquecer a confiança. Nosso compromisso é oferecer uma visão equilibrada, com exemplos reais, para que inovação não seja sinônimo de cegueira operacional.\n\nEm Automação & Negócios, cada texto conecta tecnologia a estratégia. O objetivo é explicar o que está sendo automatizado, quem se beneficia, quais métricas importam e o que fica invisível no processo. Para líderes, profissionais e curiosos, esta é a categoria que traduz a linguagem técnica para decisões reais.",
  futuroProximo:
    "Futuro Próximo é a categoria que olha para o amanhã sem recorrer à ficção. Não falamos de um futuro distante e abstrato, e sim de mudanças que já estão em marcha e devem se tornar parte do cotidiano em pouco tempo. Aqui, analisamos sinais, protótipos e tendências que apontam para o que é provável, possível e urgente.\n\nO futuro próximo é feito de escolhas que acontecem agora: regulações, investimentos, padrões de consumo e decisões de design. Por isso, nossos textos mostram o que está emergindo em áreas como energia, mobilidade, trabalho, educação e saúde, sempre com foco no impacto real e invisível das tecnologias envolvidas.\n\nEsta categoria ajuda a diferenciar hype de transformação concreta. Explicamos por que certas ideias ganham tração, quais interesses as sustentam e o que pode dar errado no caminho. Também mostramos oportunidades: novos modelos de negócio, novas profissões e novas formas de organizar a vida em rede.\n\nMapeamos cenários com base em evidências, não em promessas. Isso inclui estudos acadêmicos, pilotos corporativos, políticas públicas e movimentos culturais que sinalizam a direção da mudança. O resultado é um olhar prático: o que vale acompanhar, o que vale aprender agora e o que pode ser adiado. Futuro Próximo é, acima de tudo, uma ferramenta de preparação. Esse olhar evita alarmismo e também evita complacência, porque mudanças graduais podem acumular efeitos enormes quando ninguém está prestando atenção.\n\nSe você quer se preparar para mudanças que não são mais teoria, o Futuro Próximo oferece contexto, comparação e clareza. A intenção é tornar o futuro legível, para que as pessoas possam participar dele com mais consciência e menos surpresa.",
  guiasFundamentais:
    "Guias Fundamentais reúne o conteúdo evergreen do Curioso: explicações completas, organizadas e acessíveis para entender os conceitos que sustentam a tecnologia contemporânea. São textos para consulta, revisão e aprofundamento, pensados para durar e servir como referência sempre que surgir uma dúvida.\n\nCada guia parte do básico, mas não para no óbvio. Explicamos o que é um algoritmo, como funcionam os dados, por que a IA precisa de treinamento e quais são as diferenças entre automação simples e sistemas inteligentes. Também abordamos temas como privacidade, ética, transparência e os limites das decisões automatizadas, sempre com exemplos concretos.\n\nO objetivo é criar um repertório sólido. Sem ele, é difícil interpretar notícias, avaliar promessas de empresas e tomar decisões informadas sobre tecnologia. Com ele, é possível enxergar padrões, reconhecer riscos e entender o impacto invisível que sistemas digitais exercem no dia a dia.\n\nOs guias também funcionam como mapas de navegação. Eles conectam conceitos entre si, sugerem leituras relacionadas e indicam como aplicar o conhecimento em situações reais. Se você chegou ao Curioso por uma dúvida específica, é aqui que encontra a base para entender o restante do portal. A ideia é construir autonomia intelectual e reduzir a dependência de respostas rápidas. Eles são atualizados quando novas tecnologias mudam o cenário, mantendo o material relevante para quem estuda, trabalha ou simplesmente quer entender.\n\nOs Guias Fundamentais não são artigos rápidos. São peças longas, estruturadas com H2 e H3, com links para aprofundamento e conexões com outros conteúdos do portal. Eles são o alicerce editorial do Curioso e permanecem em destaque na home para que você sempre saiba por onde começar.",
} as const;

export const languageLabels: Record<Language, string> = {
  pt: "Português",
  en: "English",
  es: "Español",
};

export const pageSlugs = {
  home: {
    pt: "",
    en: "",
    es: "",
  },
  articles: {
    pt: "artigos",
    en: "articles",
    es: "articulos",
  },
  latest: {
    pt: "ultimos-artigos",
    en: "latest",
    es: "ultimos-articulos",
  },
  tools: {
    pt: "ferramentas",
    en: "tools",
    es: "herramientas",
  },
  about: {
    pt: "sobre",
    en: "about",
    es: "sobre",
  },
  contact: {
    pt: "contato",
    en: "contact",
    es: "contacto",
  },
  privacy: {
    pt: "privacidade",
    en: "privacy",
    es: "privacidad",
  },
  auth: {
    pt: "acesso",
    en: "access",
    es: "acceso",
  },
  admin: {
    pt: "admin",
    en: "admin",
    es: "admin",
  },
} as const;

export type PageKey = keyof typeof pageSlugs;

export function buildPath(lang: Language, page: PageKey): string {
  const slug = pageSlugs[page][lang];
  if (!slug) {
    return `/${lang}`;
  }
  return `/${lang}/${slug}`;
}

export function buildAlternatePaths(page: PageKey): Record<Language, string> {
  return {
    pt: buildPath("pt", page),
    en: buildPath("en", page),
    es: buildPath("es", page),
  };
}

export const postRouteSegment: Record<Language, string> = {
  pt: "post",
  en: "post",
  es: "post",
};

const normalizePostSlug = (slug: string): string => {
  const trimmed = slug.trim().replace(/^\/+|\/+$/g, "");
  if (!trimmed) {
    return "";
  }
  try {
    return encodeURIComponent(decodeURIComponent(trimmed));
  } catch {
    return encodeURIComponent(trimmed);
  }
};

export function buildPostPath(lang: Language, slug: string): string {
  return `/${lang}/${postRouteSegment[lang]}/${normalizePostSlug(slug)}`;
}

export function getLanguageFromPath(pathname: string): Language | null {
  const segment = pathname.split("/").filter(Boolean)[0];
  if (segment === "pt" || segment === "en" || segment === "es") {
    return segment;
  }
  return null;
}

export interface CategoryCopy {
  title: string;
  description: string;
  count: string;
  intro: string;
}

export interface ToolCard {
  title: string;
  description: string;
  status: string;
}

export interface ContactDetailItem {
  label: string;
  value: string;
}

export interface PrivacySection {
  title: string;
  body: string;
}

export interface Translation {
  meta: {
    home: {
      title: string;
      description: string;
    };
    tools: {
      title: string;
      description: string;
    };
    articles: {
      title: string;
      description: string;
    };
    latest: {
      title: string;
      description: string;
    };
    auth: {
      title: string;
      description: string;
    };
    admin: {
      title: string;
      description: string;
    };
    about: {
      title: string;
      description: string;
    };
    contact: {
      title: string;
      description: string;
    };
    privacy: {
      title: string;
      description: string;
    };
    notFound: {
      title: string;
      description: string;
    };
  };
  nav: {
    home: string;
    about: string;
    topics: string;
    tools: string;
    newsletter: string;
    contact: string;
    privacy: string;
    login: string;
    signup: string;
  };
  labels: {
    language: string;
  };
  hero: {
    badge: string;
    title: string;
    description: {
      lead: string;
      and: string;
    };
    highlights: {
      technology: string;
      ai: string;
      business: string;
      marketing: string;
    };
    ctaPrimary: string;
    ctaSecondary: string;
    stat: string;
    institutional: string;
  };
  home: {
    highlight: {
      title: string;
      subtitle: string;
      cta: string;
    };
    affectsYou: {
      title: string;
      subtitle: string;
      empty: string;
      topics: {
        work: string;
        money: string;
        consumption: string;
        privacy: string;
      };
    };
    ai: {
      title: string;
      subtitle: string;
    };
    curiosities: {
      title: string;
      subtitle: string;
    };
    latest: {
      title: string;
      subtitle: string;
      cta: string;
    };
    guides: {
      title: string;
      subtitle: string;
      empty: string;
      cta: string;
    };
  };
  featured: {
    title: string;
    subtitle: string;
    viewAll: string;
  };
  articles: {
    title: string;
    subtitle: string;
  };
  posts: {
    loading: string;
    emptyTitle: string;
    emptyDescription: string;
    errorTitle: string;
    errorDescription: string;
  };
  categories: {
    title: string;
    subtitle: string;
    viewMore: string;
    viewLess: string;
    cards: CategoryCopy[];
  };
  newsletter: {
    title: string;
    subtitle: string;
    placeholder: string;
    button: string;
    note: string;
    successTitle: string;
    successDescription: string;
    errorTitle: string;
    errorDescription: string;
  };
  latest: {
    title: string;
    subtitle: string;
  };
  footer: {
    tagline: string;
    sectionsTitle: string;
    resourcesTitle: string;
    followTitle: string;
    bottomLine: string;
    copyright: string;
  };
  tools: {
    heroTitle: string;
    heroSubtitle: string;
    badge: string;
    gridTitle: string;
    gridSubtitle: string;
    ctaTitle: string;
    ctaSubtitle: string;
    ctaButton: string;
    cards: ToolCard[];
  };
  about: {
    title: string;
    subtitle: string;
    identityTitle: string;
    identityText: string;
    focusTitle: string;
    focusItems: string[];
  };
  contact: {
    title: string;
    subtitle: string;
    intro: string;
    email: string;
    form: {
      nameLabel: string;
      emailLabel: string;
      subjectLabel: string;
      messageLabel: string;
      submitLabel: string;
      defaultSubject: string;
      note: string;
    };
    details: {
      title: string;
      items: ContactDetailItem[];
    };
  };
  privacy: {
    title: string;
    subtitle: string;
    updatedLabel: string;
    updatedAt: string;
    sections: PrivacySection[];
  };
  auth: {
    title: string;
    subtitle: string;
    loginTab: string;
    signupTab: string;
    emailLabel: string;
    passwordLabel: string;
    nameLabel: string;
    loginButton: string;
    signupButton: string;
    loginHint: string;
    signupHint: string;
    loginSuccessTitle: string;
    loginSuccessDescription: string;
    signupSuccessTitle: string;
    signupSuccessDescription: string;
    errorTitle: string;
    errorDescription: string;
  };
  admin: {
    title: string;
    subtitle: string;
    notice: string;
    loginTitle: string;
    loginSubtitle: string;
    logout: string;
    listTitle: string;
    listSubtitle: string;
    searchPlaceholder: string;
    emptyTitle: string;
    emptyDescription: string;
    confirmDelete: string;
    sectionBasics: string;
    sectionContent: string;
    sectionMedia: string;
    sectionSeo: string;
    contentStrategy: {
      title: string;
      subtitle: string;
      countLabel: string;
      missing: string;
      types: {
        search: {
          title: string;
          description: string;
        };
        editorial: {
          title: string;
          description: string;
        };
        evergreen: {
          title: string;
          description: string;
        };
      };
    };
    generated: {
      title: string;
      subtitle: string;
      refresh: string;
      updatedLabel: string;
      generatedLabel: string;
      generatedSubtitle: string;
      sitemapLabel: string;
      sitemapSubtitle: string;
      emptyGenerated: string;
      emptySitemap: string;
      missingInSitemapLabel: string;
      missingInGeneratedLabel: string;
      noneMissing: string;
    };
    backend: {
      title: string;
      subtitle: string;
      rebuildLabel: string;
      rebuildSuccessTitle: string;
      rebuildSuccessDescription: string;
      rebuildErrorTitle: string;
      htmlTitle: string;
      htmlSubtitle: string;
      htmlEmpty: string;
      tipsTitle: string;
      tipsSubtitle: string;
      tipRebuild: string;
      tipLinks: string;
    };
    actions: {
      edit: string;
      close: string;
      save: string;
      cancel: string;
      delete: string;
    };
    fields: {
      id: string;
      title: string;
      slug: string;
      category: string;
      featured: string;
      excerpt: string;
      description: string;
      content: string;
      contentHtml: string;
      image: string;
      imageAlt: string;
      imageThumb: string;
      images: string;
      tags: string;
      date: string;
      author: string;
      readTime: string;
      metaTitle: string;
      metaDescription: string;
      metaTags: string;
    };
    hints: {
      category: string;
      tags: string;
      images: string;
      metaTags: string;
    };
    toast: {
      saveSuccess: string;
      saveError: string;
      deleteSuccess: string;
      deleteError: string;
    };
    errors: {
      metaTags: string;
      notAuthorized: string;
      categoryRequired: string;
      categoryInvalid: string;
    };
  };
  topic: {
    title: string;
    subtitle: string;
    emptyTitle: string;
    emptyDescription: string;
    minimumTitle: string;
    minimumDescription: string;
    metaTitle: string;
    metaDescription: string;
  };
  post: {
    loading: string;
    notFoundTitle: string;
    notFoundDescription: string;
    backToHome: string;
    publishedLabel: string;
    updatedLabel: string;
    guideTitle: string;
    relatedTitle: string;
  };
  notFound: {
    title: string;
    description: string;
    cta: string;
  };
}

export const translations: Record<Language, Translation> = {
  pt: {
    meta: {
      home: {
        title: `${siteName} | Portal editorial de tecnologia e inteligência artificial`,
        description: editorialIdentity,
      },
      tools: {
        title: `Experimentos e ferramentas | ${siteName}`,
        description:
          "Explore experimentos, mini ferramentas e explicações curiosas sobre tecnologia, marketing e IA.",
      },
      articles: {
        title: `Todas as curiosidades | ${siteName}`,
        description:
          "Explore todas as curiosidades e histórias sobre tecnologia, marketing, IA e negócios.",
      },
      latest: {
        title: `Últimas curiosidades | ${siteName}`,
        description: `Acompanhe as curiosidades mais recentes do ${siteName}.`,
      },
      auth: {
        title: `Acesso | ${siteName}`,
        description:
          "Entre ou crie sua conta para acessar recursos e publicar curiosidades.",
      },
      admin: {
        title: `Administração do Blog | ${siteName}`,
        description:
          "Gerencie posts, edite conteúdos e organize as curiosidades do blog.",
      },
      about: {
        title: `Sobre o ${siteName}`,
        description: editorialIdentity,
      },
      contact: {
        title: `Contato | ${siteName}`,
        description:
          "Fale com a equipe do Curioso sobre pautas, dúvidas e parcerias.",
      },
      privacy: {
        title: `Política de Privacidade | ${siteName}`,
        description:
          "Entenda como o Curioso coleta, usa e protege informações.",
      },
      notFound: {
        title: `Página não encontrada | ${siteName}`,
        description: "A página que você procura não existe ou foi movida.",
      },
    },
    nav: {
      home: "Início",
      about: "Sobre",
      topics: "Curiosidades",
      tools: "Ferramentas",
      newsletter: "Guias",
      contact: "Contato",
      privacy: "Privacidade",
      login: "Entrar",
      signup: "Criar conta",
    },
    labels: {
      language: "Idioma",
    },
    hero: {
      badge: "Curiosidades diárias para mentes curiosas",
      title: siteName,
      description: {
        lead: "Curiosidades e explicações leves sobre ",
        and: " e ",
      },
      highlights: {
        technology: "tecnologia",
        ai: "IA",
        business: "negócios",
        marketing: "marketing",
      },
      ctaPrimary: "Receber newsletter",
      ctaSecondary: "Últimas curiosidades",
      stat: "Junte-se a 10.000+ curiosos que aprendem algo novo todo dia",
      institutional: editorialIdentity,
    },
    home: {
      highlight: {
        title: "Destaque Curioso",
        subtitle: "O impacto invisível da tecnologia que já molda o seu dia.",
        cta: "Ler destaque",
      },
      affectsYou: {
        title: "Isso afeta você",
        subtitle: "IA alterando trabalho, dinheiro, consumo e privacidade.",
        empty: "Em preparação",
        topics: {
          work: "IA no trabalho",
          money: "IA no dinheiro",
          consumption: "IA no consumo",
          privacy: "IA na privacidade",
        },
      },
      ai: {
        title: "Inteligência Artificial",
        subtitle: "Aplicações reais, decisões automatizadas e consequências.",
      },
      curiosities: {
        title: "Curiosidades Tecnológicas",
        subtitle: "Descobertas curiosas com efeito real.",
      },
      latest: {
        title: "Últimas publicações",
        subtitle: "Feed cronológico das publicações recentes.",
        cta: "Ver últimas publicações",
      },
      guides: {
        title: "Guias Fundamentais",
        subtitle: "Conteúdo evergreen para entender o essencial.",
        empty: "Guias fundamentais em preparação.",
        cta: "Ver todos os guias",
      },
    },
    featured: {
      title: "Curiosidades em destaque",
      subtitle: "Descubra as curiosidades mais populares da semana",
      viewAll: "Ver todas as curiosidades",
    },
    articles: {
      title: "Todas as curiosidades",
      subtitle:
        "Reunimos todas as curiosidades publicadas para você explorar.",
    },
    posts: {
      loading: "Carregando curiosidades...",
      emptyTitle: "Sem curiosidades por enquanto",
      emptyDescription:
        "Assim que publicarmos novas curiosidades, elas aparecerão aqui.",
      errorTitle: "Não foi possível carregar as curiosidades",
      errorDescription: "Tente novamente em alguns instantes.",
    },
    categories: {
      title: "Categorias editoriais",
      subtitle: "Navegue pelos eixos fixos do Curioso.",
      viewMore: "Ver todas as categorias",
      viewLess: "Ver menos categorias",
      cards: [
        {
          title: allowedCategories[0],
          description: "Como a IA interfere em trabalho, consumo e decisões diárias.",
          count: "0 posts",
          intro: categoryIntros.iaVidaReal,
        },
        {
          title: allowedCategories[1],
          description: "Infraestruturas e sistemas silenciosos que moldam a rotina.",
          count: "0 posts",
          intro: categoryIntros.tecnologiaInvisivel,
        },
        {
          title: allowedCategories[2],
          description: "Histórias curiosas com consequência prática.",
          count: "0 posts",
          intro: categoryIntros.curiosidadesTecnologicas,
        },
        {
          title: allowedCategories[3],
          description: "Automação aplicada a operações, mercados e estratégia.",
          count: "0 posts",
          intro: categoryIntros.automacaoNegocios,
        },
        {
          title: allowedCategories[4],
          description: "Mudanças que já estão chegando e vão redefinir o cotidiano.",
          count: "0 posts",
          intro: categoryIntros.futuroProximo,
        },
        {
          title: allowedCategories[5],
          description: "Explicações evergreen para dominar conceitos essenciais.",
          count: "0 posts",
          intro: categoryIntros.guiasFundamentais,
        },
      ],
    },
    newsletter: {
      title: "Receba a newsletter de curiosidades",
      subtitle:
        "Curiosidades fresquinhas sobre tecnologia, marketing, IA e negócios direto no seu email.",
      placeholder: "seu@email.com",
      button: "Receber newsletter",
      note: "Respeitamos sua privacidade. Cancele quando quiser.",
      successTitle: "Inscrição confirmada",
      successDescription: "Você receberá as próximas curiosidades por email.",
      errorTitle: "Não foi possível entrar na newsletter",
      errorDescription: "Confira o email e tente novamente.",
    },
    latest: {
      title: "Últimas curiosidades",
      subtitle: "Curiosidades fresquinhas publicadas diariamente",
    },
    footer: {
      tagline: editorialIdentity,
      sectionsTitle: "Seções",
      resourcesTitle: "Recursos",
      followTitle: "Siga a gente",
      bottomLine: "Portal editorial de tecnologia e inteligência artificial.",
      copyright: `© {year} ${siteName}. Todos os direitos reservados.`,
    },
    tools: {
      heroTitle: "Laboratório Seommerce",
      heroSubtitle:
        "Experimentos, mini ferramentas e testes rápidos para explorar tecnologia, marketing, IA e negócios.",
      badge: "Em breve",
      gridTitle: "Experimentos para explorar",
      gridSubtitle: "Uma coleção de ferramentas leves para aprender brincando.",
      ctaTitle: "Quer receber os próximos experimentos?",
      ctaSubtitle:
        "Entre na newsletter e saiba quando publicarmos novidades.",
      ctaButton: "Quero a newsletter",
      cards: [
        {
          title: "Radar de tendências",
          description:
            "Sinais fracos e novidades que estão surgindo no mundo tech.",
          status: "Em breve",
        },
        {
          title: "Laboratório de IA",
          description:
            "Testes rápidos com prompts, modelos e comparações.",
          status: "Em breve",
        },
        {
          title: "Decodificador de métricas",
          description: "Entenda números de marketing e negócios sem jargão.",
          status: "Em breve",
        },
      ],
    },
    about: {
      title: `Sobre o ${siteName}`,
      subtitle: "Tecnologia e IA com impacto real no cotidiano.",
      identityTitle: "Identidade editorial",
      identityText: editorialIdentity,
      focusTitle: "O que cobrimos",
      focusItems: [
        "Tecnologia invisível no dia a dia e seus efeitos reais.",
        "Inteligência artificial aplicada ao trabalho, consumo e decisões.",
        "Curiosidades tecnológicas que sempre têm consequência prática.",
        "Sistemas que moldam hábitos, escolhas e comportamentos.",
      ],
    },
    contact: {
      title: "Contato",
      subtitle: "Fale com a equipe do Curioso.",
      intro:
        "Tem uma pauta, dúvida ou parceria? Use o formulário e envie sua mensagem.",
      email: "contato@curioso.com",
      form: {
        nameLabel: "Nome",
        emailLabel: "Email",
        subjectLabel: "Assunto",
        messageLabel: "Mensagem",
        submitLabel: "Enviar mensagem",
        defaultSubject: "Contato via Curioso",
        note: "Se o seu cliente de email não abrir, envie direto para {email}.",
      },
      details: {
        title: "Contato direto",
        items: [
          { label: "Email", value: "contato@curioso.com" },
          { label: "Tempo de resposta", value: "até 2 dias úteis" },
          {
            label: "Imprensa e parcerias",
            value: "Use o assunto \"Parceria\".",
          },
        ],
      },
    },
    privacy: {
      title: "Política de Privacidade",
      subtitle: "Como coletamos, usamos e protegemos informações.",
      updatedLabel: "Última atualização",
      updatedAt: "Março de 2024",
      sections: [
        {
          title: "Informações que coletamos",
          body:
            "Coletamos dados fornecidos por você em formulários (como email e nome) e dados técnicos básicos sobre acesso e navegação.",
        },
        {
          title: "Como usamos os dados",
          body:
            "Usamos as informações para responder mensagens, entregar newsletters e melhorar o conteúdo do portal.",
        },
        {
          title: "Cookies e métricas",
          body:
            "Podemos usar cookies e ferramentas de análise para entender desempenho, sem vender dados pessoais.",
        },
        {
          title: "Compartilhamento responsável",
          body:
            "Compartilhamos dados apenas com fornecedores essenciais para operar o portal e nunca comercializamos suas informações.",
        },
        {
          title: "Seus direitos e contato",
          body:
            "Você pode solicitar acesso, correção ou remoção de dados. Escreva para contato@curioso.com.",
        },
      ],
    },
    auth: {
      title: "Acesso",
      subtitle:
        "Entre ou crie sua conta para publicar e gerenciar curiosidades.",
      loginTab: "Entrar",
      signupTab: "Criar conta",
      emailLabel: "Email",
      passwordLabel: "Senha",
      nameLabel: "Nome completo",
      loginButton: "Entrar",
      signupButton: "Criar conta",
      loginHint: "Use seu email e senha para acessar.",
      signupHint: "Crie sua conta para começar a publicar.",
      loginSuccessTitle: "Login enviado",
      loginSuccessDescription:
        "Recebemos seus dados. Você receberá instruções em instantes.",
      signupSuccessTitle: "Cadastro enviado",
      signupSuccessDescription:
        "Conta enviada para análise. Em breve enviaremos os próximos passos.",
      errorTitle: "Não foi possível enviar",
      errorDescription: "Tente novamente em instantes.",
    },
    admin: {
      title: "Administração do Blog",
      subtitle:
        "Gerencie todos os posts, edite campos e organize as categorias.",
      notice:
        "Edições e exclusões feitas aqui são enviadas para o servidor.",
      loginTitle: "Acesso administrativo",
      loginSubtitle: "Entre com seu usuário admin para gerenciar os posts.",
      logout: "Sair",
      listTitle: "Posts cadastrados",
      listSubtitle: "Edite ou remova posts rapidamente.",
      searchPlaceholder: "Buscar por título, autor ou categoria...",
      emptyTitle: "Nenhum post encontrado",
      emptyDescription: "Assim que houver posts, eles aparecerão aqui.",
      confirmDelete: "Tem certeza que deseja excluir este post?",
      sectionBasics: "Dados principais",
      sectionContent: "Conteúdo",
      sectionMedia: "Mídia",
      sectionSeo: "SEO",
      contentStrategy: {
        title: "Estratégia de conteúdo",
        subtitle:
          "O Curioso precisa manter três formatos ativos: busca direta, editorial e evergreen.",
        countLabel: "posts válidos",
        missing: "Nenhum post válido neste tipo.",
        types: {
          search: {
            title: "Busca direta",
            description: "Responde dúvidas claras e pesquisas objetivas.",
          },
          editorial: {
            title: "Curioso/editorial",
            description: "Histórias e impactos invisíveis da tecnologia.",
          },
          evergreen: {
            title: "Evergreen (Guias Fundamentais)",
            description: "Referência longa e atualizável para consulta.",
          },
        },
      },
      generated: {
        title: "HTML gerado e sitemap",
        subtitle:
          "Veja o que já foi publicado no disco e o que está listado no sitemap.",
        refresh: "Atualizar",
        updatedLabel: "Atualizado em",
        generatedLabel: "Páginas geradas",
        generatedSubtitle: "HTMLs persistentes criados automaticamente.",
        sitemapLabel: "URLs no sitemap",
        sitemapSubtitle: "Entradas públicas visíveis para buscadores.",
        emptyGenerated: "Nenhuma página gerada ainda.",
        emptySitemap: "Nenhum sitemap disponível.",
        missingInSitemapLabel: "Geradas fora do sitemap",
        missingInGeneratedLabel: "Sitemap sem HTML gerado",
        noneMissing: "Tudo certo por aqui.",
      },
      backend: {
        title: "Tarefas do backend",
        subtitle:
          "Ações rápidas para manter os HTMLs e o sitemap sincronizados.",
        rebuildLabel: "Reconstruir sitemap",
        rebuildSuccessTitle: "Sitemap reconstruído",
        rebuildSuccessDescription:
          "O sitemap foi atualizado com o HTML gerado mais recente.",
        rebuildErrorTitle: "Falha ao reconstruir sitemap",
        htmlTitle: "HTMLs por idioma",
        htmlSubtitle: "Acesse as versões publicadas em cada idioma.",
        htmlEmpty: "Nenhum HTML disponível para exibir.",
        tipsTitle: "Dicas rápidas",
        tipsSubtitle: "Boas práticas para manter o blog sincronizado.",
        tipRebuild:
          "Reconstrua o sitemap após grandes lotes de publicação para garantir indexação.",
        tipLinks:
          "Use os links por idioma para validar traduções e conteúdos publicados.",
      },
      actions: {
        edit: "Editar",
        close: "Fechar",
        save: "Salvar",
        cancel: "Cancelar",
        delete: "Excluir",
      },
      fields: {
        id: "ID",
        title: "Título",
        slug: "Slug",
        category: "Categoria",
        featured: "Destaque",
        excerpt: "Resumo",
        description: "Descrição",
        content: "Conteúdo",
        contentHtml: "Conteúdo (HTML)",
        image: "Imagem principal",
        imageAlt: "Texto alternativo da imagem",
        imageThumb: "Miniatura",
        images: "Galeria de imagens",
        tags: "Tags",
        date: "Data",
        author: "Autor",
        readTime: "Tempo de leitura",
        metaTitle: "Meta title",
        metaDescription: "Meta description",
        metaTags: "Meta tags (JSON)",
      },
      hints: {
        category: "Use uma das categorias fixas do Curioso.",
        tags: "Separe por vírgula.",
        images: "Separe por vírgula.",
        metaTags: 'Exemplo: [{"name":"description","content":"..."}]',
      },
      toast: {
        saveSuccess: "Post atualizado com sucesso.",
        saveError: "Não foi possível salvar o post.",
        deleteSuccess: "Post removido com sucesso.",
        deleteError: "Não foi possível excluir o post.",
      },
      errors: {
        metaTags: "JSON inválido para meta tags.",
        notAuthorized: "Seu usuário não tem permissão de administrador.",
        categoryRequired: "Informe uma categoria obrigatória.",
        categoryInvalid: "Categoria inválida. Use uma das categorias fixas.",
      },
    },
    topic: {
      title: "Tópico",
      subtitle: "Curiosidades sobre {topic}",
      emptyTitle: "Nenhuma curiosidade em {topic}",
      emptyDescription:
        "Assim que publicarmos novas curiosidades, elas aparecerão aqui.",
      minimumTitle: "Categoria em preparação: {topic}",
      minimumDescription:
        "Precisamos de pelo menos 5 posts ativos para abrir este eixo editorial.",
      metaTitle: `{topic} | ${siteName}`,
      metaDescription: `Curiosidades sobre {topic} no ${siteName}.`,
    },
    post: {
      loading: "Carregando curiosidade...",
      notFoundTitle: "Curiosidade não encontrada",
      notFoundDescription:
        "Esta curiosidade pode ter sido movida ou ainda não está disponível.",
      backToHome: "Voltar ao blog",
      publishedLabel: "Publicado em",
      updatedLabel: "Atualizado em",
      guideTitle: "Guia fundamental",
      relatedTitle: "Posts relacionados",
    },
    notFound: {
      title: "Página não encontrada",
      description: "Não encontramos a página que você procura.",
      cta: "Voltar para o início",
    },
  },
  en: {
    meta: {
      home: {
        title: `${siteName} | Technology & AI editorial portal`,
        description: editorialIdentity,
      },
      tools: {
        title: `Experiments & tools | ${siteName}`,
        description:
          "Explore experiments, mini tools, and playful explainers on tech, marketing, and AI.",
      },
      articles: {
        title: `All curiosities | ${siteName}`,
        description:
          "Browse every curiosity and story on tech, marketing, AI, and business.",
      },
      latest: {
        title: `Latest curiosities | ${siteName}`,
        description: `Catch the newest curiosities from ${siteName}.`,
      },
      auth: {
        title: `Access | ${siteName}`,
        description:
          "Sign in or create your account to access resources and publish curiosities.",
      },
      admin: {
        title: `Blog Admin | ${siteName}`,
        description:
          "Manage posts, edit content, and organize blog curiosities.",
      },
      about: {
        title: `About ${siteName}`,
        description: editorialIdentity,
      },
      contact: {
        title: `Contact | ${siteName}`,
        description:
          "Reach the Curioso team with tips, questions, or partnerships.",
      },
      privacy: {
        title: `Privacy Policy | ${siteName}`,
        description:
          "Learn how Curioso collects, uses, and protects information.",
      },
      notFound: {
        title: `Page not found | ${siteName}`,
        description: "The page you are looking for does not exist or was moved.",
      },
    },
    nav: {
      home: "Home",
      about: "About",
      topics: "Curiosities",
      tools: "Tools",
      newsletter: "Guides",
      contact: "Contact",
      privacy: "Privacy",
      login: "Sign in",
      signup: "Create account",
    },
    labels: {
      language: "Language",
    },
    hero: {
      badge: "Daily curiosities for curious minds",
      title: siteName,
      description: {
        lead: "Curiosities and simple explanations on ",
        and: ", and ",
      },
      highlights: {
        technology: "technology",
        ai: "AI",
        business: "business",
        marketing: "marketing",
      },
      ctaPrimary: "Get the newsletter",
      ctaSecondary: "Latest curiosities",
      stat: "Join 10,000+ curious readers who learn something new every day",
      institutional: editorialIdentity,
    },
    home: {
      highlight: {
        title: "Curioso highlight",
        subtitle: "The invisible impact of technology already shaping your day.",
        cta: "Read highlight",
      },
      affectsYou: {
        title: "This affects you",
        subtitle: "AI reshaping work, money, consumption, and privacy.",
        empty: "In progress",
        topics: {
          work: "AI at work",
          money: "AI and money",
          consumption: "AI in consumption",
          privacy: "AI and privacy",
        },
      },
      ai: {
        title: "Artificial Intelligence",
        subtitle: "Real applications, automated decisions, and consequences.",
      },
      curiosities: {
        title: "Tech curiosities",
        subtitle: "Curious stories with real-world consequences.",
      },
      latest: {
        title: "Latest publications",
        subtitle: "A chronological feed of recent posts.",
        cta: "See latest posts",
      },
      guides: {
        title: "Fundamental guides",
        subtitle: "Evergreen guides to understand the essentials.",
        empty: "Fundamental guides in progress.",
        cta: "See all guides",
      },
    },
    featured: {
      title: "Featured curiosities",
      subtitle: "Discover the most popular curiosities this week",
      viewAll: "View all curiosities",
    },
    articles: {
      title: "All curiosities",
      subtitle: "Every curiosity we've published, ready to explore.",
    },
    posts: {
      loading: "Loading curiosities...",
      emptyTitle: "No curiosities yet",
      emptyDescription:
        "As soon as we publish new curiosities, they will appear here.",
      errorTitle: "Unable to load curiosities",
      errorDescription: "Please try again in a moment.",
    },
    categories: {
      title: "Editorial categories",
      subtitle: "Navigate the fixed pillars of Curioso.",
      viewMore: "View all categories",
      viewLess: "View fewer categories",
      cards: [
        {
          title: allowedCategories[0],
          description: "How AI shapes work, consumption, and everyday decisions.",
          count: "0 posts",
          intro: categoryIntros.iaVidaReal,
        },
        {
          title: allowedCategories[1],
          description: "Hidden infrastructures and silent systems shaping daily life.",
          count: "0 posts",
          intro: categoryIntros.tecnologiaInvisivel,
        },
        {
          title: allowedCategories[2],
          description: "Curious stories with practical consequences.",
          count: "0 posts",
          intro: categoryIntros.curiosidadesTecnologicas,
        },
        {
          title: allowedCategories[3],
          description: "Automation applied to operations, markets, and strategy.",
          count: "0 posts",
          intro: categoryIntros.automacaoNegocios,
        },
        {
          title: allowedCategories[4],
          description: "Near-term changes already reshaping everyday life.",
          count: "0 posts",
          intro: categoryIntros.futuroProximo,
        },
        {
          title: allowedCategories[5],
          description: "Evergreen explanations to master essential concepts.",
          count: "0 posts",
          intro: categoryIntros.guiasFundamentais,
        },
      ],
    },
    newsletter: {
      title: "Get the curiosity newsletter",
      subtitle:
        "Fresh curiosities on tech, marketing, AI, and business in your inbox.",
      placeholder: "your@email.com",
      button: "Get the newsletter",
      note: "We respect your privacy. Unsubscribe anytime.",
      successTitle: "Subscription confirmed",
      successDescription: "You'll receive the next curiosities by email.",
      errorTitle: "Unable to join the newsletter",
      errorDescription: "Please check the email and try again.",
    },
    latest: {
      title: "Latest curiosities",
      subtitle: "Fresh curiosities published daily",
    },
    footer: {
      tagline: editorialIdentity,
      sectionsTitle: "Sections",
      resourcesTitle: "Resources",
      followTitle: "Follow us",
      bottomLine: "Technology and AI editorial portal.",
      copyright: `© {year} ${siteName}. All rights reserved.`,
    },
    tools: {
      heroTitle: "Seommerce Lab",
      heroSubtitle:
        "Experiments, mini tools, and quick tests to explore tech, marketing, AI, and business.",
      badge: "Coming soon",
      gridTitle: "Experiments to explore",
      gridSubtitle: "A growing collection of playful tools to learn by doing.",
      ctaTitle: "Want the next experiments?",
      ctaSubtitle:
        "Join the newsletter and get updates when new ones drop.",
      ctaButton: "Get the newsletter",
      cards: [
        {
          title: "Trend Radar",
          description: "Spot weak signals and emerging ideas in tech.",
          status: "Coming soon",
        },
        {
          title: "AI Playground",
          description: "Quick tests with prompts, models, and comparisons.",
          status: "Coming soon",
        },
        {
          title: "Metrics Decoder",
          description: "Understand marketing and business numbers without the jargon.",
          status: "Coming soon",
        },
      ],
    },
    about: {
      title: `About ${siteName}`,
      subtitle: "Technology and AI with real-world impact.",
      identityTitle: "Editorial identity",
      identityText: editorialIdentity,
      focusTitle: "What we cover",
      focusItems: [
        "Invisible technology in daily life and its real effects.",
        "Artificial intelligence applied to work, consumption, and decisions.",
        "Tech curiosities that always have practical consequences.",
        "Systems shaping habits, choices, and behaviors.",
      ],
    },
    contact: {
      title: "Contact",
      subtitle: "Talk to the Curioso team.",
      intro:
        "Have a tip, question, or partnership idea? Use the form to send your message.",
      email: "contact@curioso.com",
      form: {
        nameLabel: "Name",
        emailLabel: "Email",
        subjectLabel: "Subject",
        messageLabel: "Message",
        submitLabel: "Send message",
        defaultSubject: "Message from Curioso",
        note: "If your email client does not open, write directly to {email}.",
      },
      details: {
        title: "Direct contact",
        items: [
          { label: "Email", value: "contact@curioso.com" },
          { label: "Response time", value: "within 2 business days" },
          {
            label: "Press & partnerships",
            value: "Use the subject line \"Partnership\".",
          },
        ],
      },
    },
    privacy: {
      title: "Privacy Policy",
      subtitle: "How we collect, use, and protect information.",
      updatedLabel: "Last updated",
      updatedAt: "March 2024",
      sections: [
        {
          title: "Information we collect",
          body:
            "We collect details you provide in forms (such as name and email) plus basic technical data about access and navigation.",
        },
        {
          title: "How we use data",
          body:
            "We use information to respond to messages, send newsletters, and improve the portal experience.",
        },
        {
          title: "Cookies and analytics",
          body:
            "We may use cookies and analytics tools to understand performance without selling personal data.",
        },
        {
          title: "Responsible sharing",
          body:
            "We only share data with essential providers to run the portal and never sell your information.",
        },
        {
          title: "Your rights and contact",
          body:
            "You can request access, correction, or removal of data. Email contact@curioso.com.",
        },
      ],
    },
    auth: {
      title: "Access",
      subtitle: "Sign in or create your account to publish and manage curiosities.",
      loginTab: "Sign in",
      signupTab: "Create account",
      emailLabel: "Email",
      passwordLabel: "Password",
      nameLabel: "Full name",
      loginButton: "Sign in",
      signupButton: "Create account",
      loginHint: "Use your email and password to access.",
      signupHint: "Create your account to start publishing.",
      loginSuccessTitle: "Login sent",
      loginSuccessDescription: "We received your details. Check your inbox soon.",
      signupSuccessTitle: "Signup sent",
      signupSuccessDescription:
        "Your account was sent for review. We will follow up shortly.",
      errorTitle: "Unable to send",
      errorDescription: "Please try again in a moment.",
    },
    admin: {
      title: "Blog Admin",
      subtitle: "Manage every post, edit fields, and organize categories.",
      notice: "Edits and deletions here are sent to the server.",
      loginTitle: "Admin access",
      loginSubtitle: "Sign in with your admin account to manage posts.",
      logout: "Sign out",
      listTitle: "All posts",
      listSubtitle: "Edit or remove posts quickly.",
      searchPlaceholder: "Search by title, author, or category...",
      emptyTitle: "No posts found",
      emptyDescription: "Posts will appear here once available.",
      confirmDelete: "Are you sure you want to delete this post?",
      sectionBasics: "Basics",
      sectionContent: "Content",
      sectionMedia: "Media",
      sectionSeo: "SEO",
      contentStrategy: {
        title: "Content strategy",
        subtitle:
          "Curioso must keep three formats active: direct search, editorial, and evergreen.",
        countLabel: "valid posts",
        missing: "No valid posts in this type yet.",
        types: {
          search: {
            title: "Direct search",
            description: "Answers clear questions and search intent.",
          },
          editorial: {
            title: "Curioso/editorial",
            description: "Invisible tech impacts told with context.",
          },
          evergreen: {
            title: "Evergreen (Fundamental Guides)",
            description: "Long-form reference that stays relevant.",
          },
        },
      },
      generated: {
        title: "Generated HTML and sitemap",
        subtitle:
          "Review what has been published on disk and what is listed in the sitemap.",
        refresh: "Refresh",
        updatedLabel: "Updated at",
        generatedLabel: "Generated pages",
        generatedSubtitle: "Persistent HTML files created automatically.",
        sitemapLabel: "Sitemap URLs",
        sitemapSubtitle: "Public entries visible to search engines.",
        emptyGenerated: "No generated pages yet.",
        emptySitemap: "No sitemap available.",
        missingInSitemapLabel: "Generated outside the sitemap",
        missingInGeneratedLabel: "Sitemap without generated HTML",
        noneMissing: "Everything is in sync.",
      },
      backend: {
        title: "Backend tasks",
        subtitle: "Quick actions to keep HTMLs and sitemap in sync.",
        rebuildLabel: "Rebuild sitemap",
        rebuildSuccessTitle: "Sitemap rebuilt",
        rebuildSuccessDescription:
          "The sitemap was updated with the latest generated HTML.",
        rebuildErrorTitle: "Failed to rebuild sitemap",
        htmlTitle: "HTMLs by language",
        htmlSubtitle: "Access the published versions per language.",
        htmlEmpty: "No HTML available to display.",
        tipsTitle: "Quick tips",
        tipsSubtitle: "Best practices to keep the blog aligned.",
        tipRebuild:
          "Rebuild the sitemap after large publish batches to ensure indexing.",
        tipLinks:
          "Use language links to validate translations and published content.",
      },
      actions: {
        edit: "Edit",
        close: "Close",
        save: "Save",
        cancel: "Cancel",
        delete: "Delete",
      },
      fields: {
        id: "ID",
        title: "Title",
        slug: "Slug",
        category: "Category",
        featured: "Featured",
        excerpt: "Excerpt",
        description: "Description",
        content: "Content",
        contentHtml: "Content (HTML)",
        image: "Main image",
        imageAlt: "Image alt text",
        imageThumb: "Thumbnail",
        images: "Image gallery",
        tags: "Tags",
        date: "Date",
        author: "Author",
        readTime: "Read time",
        metaTitle: "Meta title",
        metaDescription: "Meta description",
        metaTags: "Meta tags (JSON)",
      },
      hints: {
        category: "Use one of Curioso's fixed categories.",
        tags: "Comma-separated.",
        images: "Comma-separated.",
        metaTags: 'Example: [{"name":"description","content":"..."}]',
      },
      toast: {
        saveSuccess: "Post updated successfully.",
        saveError: "Unable to save the post.",
        deleteSuccess: "Post deleted successfully.",
        deleteError: "Unable to delete the post.",
      },
      errors: {
        metaTags: "Invalid JSON for meta tags.",
        notAuthorized: "Your account does not have admin access.",
        categoryRequired: "Category is required.",
        categoryInvalid: "Invalid category. Use one of the fixed categories.",
      },
    },
    topic: {
      title: "Topic",
      subtitle: "Curiosities about {topic}",
      emptyTitle: "No curiosities in {topic}",
      emptyDescription:
        "New curiosities will appear here as soon as they are published.",
      minimumTitle: "Category in preparation: {topic}",
      minimumDescription:
        "We need at least 5 active posts to open this editorial pillar.",
      metaTitle: `{topic} | ${siteName}`,
      metaDescription: `Curiosities about {topic} on ${siteName}.`,
    },
    post: {
      loading: "Loading curiosity...",
      notFoundTitle: "Curiosity not found",
      notFoundDescription:
        "This curiosity may have been moved or is not available yet.",
      backToHome: "Back to the blog",
      publishedLabel: "Published",
      updatedLabel: "Updated",
      guideTitle: "Fundamental guide",
      relatedTitle: "Related posts",
    },
    notFound: {
      title: "Page not found",
      description: "We could not find the page you are looking for.",
      cta: "Return to home",
    },
  },
  es: {
    meta: {
      home: {
        title: `${siteName} | Portal editorial de tecnología e inteligencia artificial`,
        description: editorialIdentity,
      },
      tools: {
        title: `Experimentos y herramientas | ${siteName}`,
        description:
          "Explora experimentos, mini herramientas y explicaciones curiosas sobre tecnología, marketing e IA.",
      },
      articles: {
        title: `Todas las curiosidades | ${siteName}`,
        description:
          "Explora todas las curiosidades e historias sobre tecnología, marketing, IA y negocios.",
      },
      latest: {
        title: `Últimas curiosidades | ${siteName}`,
        description: `Sigue las curiosidades más recientes de ${siteName}.`,
      },
      auth: {
        title: `Acceso | ${siteName}`,
        description:
          "Inicia sesión o crea tu cuenta para acceder a recursos y publicar curiosidades.",
      },
      admin: {
        title: `Administración del Blog | ${siteName}`,
        description:
          "Gestiona posts, edita contenidos y organiza las curiosidades del blog.",
      },
      about: {
        title: `Sobre ${siteName}`,
        description: editorialIdentity,
      },
      contact: {
        title: `Contacto | ${siteName}`,
        description:
          "Escribe al equipo de Curioso con dudas, ideas o colaboraciones.",
      },
      privacy: {
        title: `Política de Privacidad | ${siteName}`,
        description:
          "Conoce cómo Curioso recoge, usa y protege la información.",
      },
      notFound: {
        title: `Página no encontrada | ${siteName}`,
        description: "La página que buscas no existe o fue movida.",
      },
    },
    nav: {
      home: "Inicio",
      about: "Sobre",
      topics: "Curiosidades",
      tools: "Herramientas",
      newsletter: "Guías",
      contact: "Contacto",
      privacy: "Privacidad",
      login: "Iniciar sesión",
      signup: "Crear cuenta",
    },
    labels: {
      language: "Idioma",
    },
    hero: {
      badge: "Curiosidades diarias para mentes curiosas",
      title: siteName,
      description: {
        lead: "Curiosidades y explicaciones sencillas sobre ",
        and: " y ",
      },
      highlights: {
        technology: "tecnología",
        ai: "IA",
        business: "negocios",
        marketing: "marketing",
      },
      ctaPrimary: "Recibir newsletter",
      ctaSecondary: "Últimas curiosidades",
      stat: "Únete a más de 10.000 curiosos que aprenden algo nuevo cada día",
      institutional: editorialIdentity,
    },
    home: {
      highlight: {
        title: "Destacado Curioso",
        subtitle: "El impacto invisible de la tecnología que ya moldea tu día.",
        cta: "Leer destacado",
      },
      affectsYou: {
        title: "Esto te afecta",
        subtitle: "IA transformando trabajo, dinero, consumo y privacidad.",
        empty: "En preparación",
        topics: {
          work: "IA en el trabajo",
          money: "IA y dinero",
          consumption: "IA en el consumo",
          privacy: "IA y privacidad",
        },
      },
      ai: {
        title: "Inteligencia Artificial",
        subtitle: "Aplicaciones reales, decisiones automatizadas y consecuencias.",
      },
      curiosities: {
        title: "Curiosidades tecnológicas",
        subtitle: "Historias curiosas con consecuencias reales.",
      },
      latest: {
        title: "Últimas publicaciones",
        subtitle: "Un feed cronológico de publicaciones recientes.",
        cta: "Ver últimas publicaciones",
      },
      guides: {
        title: "Guías fundamentales",
        subtitle: "Guías evergreen para entender lo esencial.",
        empty: "Guías fundamentales en preparación.",
        cta: "Ver todas las guías",
      },
    },
    featured: {
      title: "Curiosidades destacadas",
      subtitle: "Descubre las curiosidades más populares de la semana",
      viewAll: "Ver todas las curiosidades",
    },
    articles: {
      title: "Todas las curiosidades",
      subtitle: "Reunimos todas las curiosidades publicadas para que explores.",
    },
    posts: {
      loading: "Cargando curiosidades...",
      emptyTitle: "Aún no hay curiosidades",
      emptyDescription:
        "Cuando publiquemos nuevas curiosidades, aparecerán aquí.",
      errorTitle: "No se pudieron cargar las curiosidades",
      errorDescription: "Intenta nuevamente en unos momentos.",
    },
    categories: {
      title: "Categorías editoriales",
      subtitle: "Navega por los pilares fijos de Curioso.",
      viewMore: "Ver todas las categorías",
      viewLess: "Ver menos categorías",
      cards: [
        {
          title: allowedCategories[0],
          description: "Cómo la IA afecta trabajo, consumo y decisiones diarias.",
          count: "0 posts",
          intro: categoryIntros.iaVidaReal,
        },
        {
          title: allowedCategories[1],
          description: "Infraestructuras y sistemas silenciosos que moldean la rutina.",
          count: "0 posts",
          intro: categoryIntros.tecnologiaInvisivel,
        },
        {
          title: allowedCategories[2],
          description: "Historias curiosas con consecuencias prácticas.",
          count: "0 posts",
          intro: categoryIntros.curiosidadesTecnologicas,
        },
        {
          title: allowedCategories[3],
          description: "Automatización aplicada a operaciones, mercados y estrategia.",
          count: "0 posts",
          intro: categoryIntros.automacaoNegocios,
        },
        {
          title: allowedCategories[4],
          description: "Cambios cercanos que ya están redefiniendo la vida cotidiana.",
          count: "0 posts",
          intro: categoryIntros.futuroProximo,
        },
        {
          title: allowedCategories[5],
          description: "Explicaciones evergreen para dominar conceptos esenciales.",
          count: "0 posts",
          intro: categoryIntros.guiasFundamentais,
        },
      ],
    },
    newsletter: {
      title: "Recibe la newsletter de curiosidades",
      subtitle:
        "Curiosidades frescas sobre tecnología, marketing, IA y negocios en tu correo.",
      placeholder: "tu@email.com",
      button: "Recibir newsletter",
      note: "Respetamos tu privacidad. Cancela cuando quieras.",
      successTitle: "Suscripción confirmada",
      successDescription: "Recibirás las próximas curiosidades por email.",
      errorTitle: "No se pudo unir a la newsletter",
      errorDescription: "Revisa el email e inténtalo de nuevo.",
    },
    latest: {
      title: "Últimas curiosidades",
      subtitle: "Curiosidades frescas publicadas a diario",
    },
    footer: {
      tagline: editorialIdentity,
      sectionsTitle: "Secciones",
      resourcesTitle: "Recursos",
      followTitle: "Síguenos",
      bottomLine: "Portal editorial de tecnología e inteligencia artificial.",
      copyright: `© {year} ${siteName}. Todos los derechos reservados.`,
    },
    tools: {
      heroTitle: "Laboratorio Seommerce",
      heroSubtitle:
        "Experimentos, mini herramientas y pruebas rápidas para explorar tecnología, marketing, IA y negocios.",
      badge: "Próximamente",
      gridTitle: "Experimentos para explorar",
      gridSubtitle: "Una colección de herramientas ligeras para aprender jugando.",
      ctaTitle: "¿Quieres recibir los próximos experimentos?",
      ctaSubtitle:
        "Únete a la newsletter y entérate cuando publiquemos novedades.",
      ctaButton: "Recibir newsletter",
      cards: [
        {
          title: "Radar de tendencias",
          description:
            "Detecta señales débiles y novedades en el mundo tech.",
          status: "Próximamente",
        },
        {
          title: "Laboratorio de IA",
          description:
            "Pruebas rápidas con prompts, modelos y comparaciones.",
          status: "Próximamente",
        },
        {
          title: "Decodificador de métricas",
          description: "Entiende números de marketing y negocios sin jerga.",
          status: "Próximamente",
        },
      ],
    },
    about: {
      title: `Sobre ${siteName}`,
      subtitle: "Tecnología e IA con impacto real en la vida cotidiana.",
      identityTitle: "Identidad editorial",
      identityText: editorialIdentity,
      focusTitle: "Lo que cubrimos",
      focusItems: [
        "Tecnología invisible en el día a día y sus efectos reales.",
        "Inteligencia artificial aplicada al trabajo, consumo y decisiones.",
        "Curiosidades tecnológicas con consecuencias prácticas.",
        "Sistemas que moldean hábitos, elecciones y comportamientos.",
      ],
    },
    contact: {
      title: "Contacto",
      subtitle: "Habla con el equipo de Curioso.",
      intro:
        "¿Tienes una idea, duda o propuesta? Usa el formulario y envía tu mensaje.",
      email: "contacto@curioso.com",
      form: {
        nameLabel: "Nombre",
        emailLabel: "Email",
        subjectLabel: "Asunto",
        messageLabel: "Mensaje",
        submitLabel: "Enviar mensaje",
        defaultSubject: "Mensaje desde Curioso",
        note: "Si tu cliente de email no se abre, escribe a {email}.",
      },
      details: {
        title: "Contacto directo",
        items: [
          { label: "Email", value: "contacto@curioso.com" },
          { label: "Tiempo de respuesta", value: "hasta 2 días hábiles" },
          {
            label: "Prensa y alianzas",
            value: "Usa el asunto \"Alianza\".",
          },
        ],
      },
    },
    privacy: {
      title: "Política de Privacidad",
      subtitle: "Cómo recopilamos, usamos y protegemos la información.",
      updatedLabel: "Última actualización",
      updatedAt: "Marzo de 2024",
      sections: [
        {
          title: "Información que recopilamos",
          body:
            "Recopilamos datos que nos entregas en formularios (como nombre y email) y datos técnicos básicos sobre acceso y navegación.",
        },
        {
          title: "Cómo usamos los datos",
          body:
            "Usamos la información para responder mensajes, enviar newsletters y mejorar el portal.",
        },
        {
          title: "Cookies y analítica",
          body:
            "Podemos usar cookies y herramientas de analítica para entender el rendimiento sin vender datos personales.",
        },
        {
          title: "Compartición responsable",
          body:
            "Compartimos datos solo con proveedores esenciales para operar el portal y nunca vendemos tu información.",
        },
        {
          title: "Tus derechos y contacto",
          body:
            "Puedes solicitar acceso, corrección o eliminación de datos. Escribe a contacto@curioso.com.",
        },
      ],
    },
    auth: {
      title: "Acceso",
      subtitle:
        "Inicia sesión o crea tu cuenta para publicar y gestionar curiosidades.",
      loginTab: "Iniciar sesión",
      signupTab: "Crear cuenta",
      emailLabel: "Email",
      passwordLabel: "Contraseña",
      nameLabel: "Nombre completo",
      loginButton: "Iniciar sesión",
      signupButton: "Crear cuenta",
      loginHint: "Usa tu email y contraseña para acceder.",
      signupHint: "Crea tu cuenta para empezar a publicar.",
      loginSuccessTitle: "Inicio enviado",
      loginSuccessDescription: "Recibimos tus datos. Revisa tu correo pronto.",
      signupSuccessTitle: "Registro enviado",
      signupSuccessDescription:
        "Tu cuenta fue enviada para revisión. Te contactaremos pronto.",
      errorTitle: "No se pudo enviar",
      errorDescription: "Intenta nuevamente en unos momentos.",
    },
    admin: {
      title: "Administrador del Blog",
      subtitle: "Gestiona los posts, edita campos y organiza categorías.",
      notice: "Las ediciones y eliminaciones se envían al servidor.",
      loginTitle: "Acceso administrativo",
      loginSubtitle: "Inicia sesión con tu cuenta admin para gestionar posts.",
      logout: "Cerrar sesión",
      listTitle: "Posts registrados",
      listSubtitle: "Edita o elimina posts rápidamente.",
      searchPlaceholder: "Buscar por título, autor o categoría...",
      emptyTitle: "No hay posts",
      emptyDescription: "Cuando existan posts, aparecerán aquí.",
      confirmDelete: "¿Seguro que quieres eliminar este post?",
      sectionBasics: "Datos principales",
      sectionContent: "Contenido",
      sectionMedia: "Media",
      sectionSeo: "SEO",
      contentStrategy: {
        title: "Estrategia de contenido",
        subtitle:
          "Curioso debe mantener tres formatos activos: búsqueda directa, editorial y evergreen.",
        countLabel: "posts válidos",
        missing: "Aún no hay posts válidos en este tipo.",
        types: {
          search: {
            title: "Búsqueda directa",
            description: "Responde dudas claras e intención de búsqueda.",
          },
          editorial: {
            title: "Curioso/editorial",
            description: "Impactos invisibles contados con contexto.",
          },
          evergreen: {
            title: "Evergreen (Guías Fundamentales)",
            description: "Referencia extensa y vigente para consulta.",
          },
        },
      },
      generated: {
        title: "HTML generado y sitemap",
        subtitle:
          "Consulta lo publicado en disco y lo listado dentro del sitemap.",
        refresh: "Actualizar",
        updatedLabel: "Actualizado en",
        generatedLabel: "Páginas generadas",
        generatedSubtitle: "HTMLs persistentes creados automáticamente.",
        sitemapLabel: "URLs en el sitemap",
        sitemapSubtitle: "Entradas públicas visibles para buscadores.",
        emptyGenerated: "Aún no hay páginas generadas.",
        emptySitemap: "No hay sitemap disponible.",
        missingInSitemapLabel: "Generadas fuera del sitemap",
        missingInGeneratedLabel: "Sitemap sin HTML generado",
        noneMissing: "Todo está sincronizado.",
      },
      backend: {
        title: "Tareas del backend",
        subtitle:
          "Acciones rápidas para mantener los HTML y el sitemap sincronizados.",
        rebuildLabel: "Reconstruir sitemap",
        rebuildSuccessTitle: "Sitemap reconstruido",
        rebuildSuccessDescription:
          "El sitemap se actualizó con el HTML generado más reciente.",
        rebuildErrorTitle: "Fallo al reconstruir sitemap",
        htmlTitle: "HTML por idioma",
        htmlSubtitle: "Accede a las versiones publicadas en cada idioma.",
        htmlEmpty: "No hay HTML disponible para mostrar.",
        tipsTitle: "Consejos rápidos",
        tipsSubtitle: "Buenas prácticas para mantener el blog sincronizado.",
        tipRebuild:
          "Reconstruye el sitemap después de grandes lotes para garantizar indexación.",
        tipLinks:
          "Usa los enlaces por idioma para validar traducciones y contenidos publicados.",
      },
      actions: {
        edit: "Editar",
        close: "Cerrar",
        save: "Guardar",
        cancel: "Cancelar",
        delete: "Eliminar",
      },
      fields: {
        id: "ID",
        title: "Título",
        slug: "Slug",
        category: "Categoría",
        featured: "Destacado",
        excerpt: "Resumen",
        description: "Descripción",
        content: "Contenido",
        contentHtml: "Contenido (HTML)",
        image: "Imagen principal",
        imageAlt: "Texto alternativo de la imagen",
        imageThumb: "Miniatura",
        images: "Galería de imágenes",
        tags: "Etiquetas",
        date: "Fecha",
        author: "Autor",
        readTime: "Tiempo de lectura",
        metaTitle: "Meta title",
        metaDescription: "Meta description",
        metaTags: "Meta tags (JSON)",
      },
      hints: {
        category: "Usa una de las categorías fijas de Curioso.",
        tags: "Separadas por coma.",
        images: "Separadas por coma.",
        metaTags: 'Ejemplo: [{"name":"description","content":"..."}]',
      },
      toast: {
        saveSuccess: "Post actualizado correctamente.",
        saveError: "No se pudo guardar el post.",
        deleteSuccess: "Post eliminado correctamente.",
        deleteError: "No se pudo eliminar el post.",
      },
      errors: {
        metaTags: "JSON inválido para meta tags.",
        notAuthorized: "Tu cuenta no tiene permisos de administrador.",
        categoryRequired: "La categoría es obligatoria.",
        categoryInvalid: "Categoría inválida. Usa una de las categorías fijas.",
      },
    },
    topic: {
      title: "Tema",
      subtitle: "Curiosidades sobre {topic}",
      emptyTitle: "No hay curiosidades en {topic}",
      emptyDescription:
        "Cuando publiquemos nuevas curiosidades, aparecerán aquí.",
      minimumTitle: "Categoría en preparación: {topic}",
      minimumDescription:
        "Necesitamos al menos 5 posts activos para abrir este eje editorial.",
      metaTitle: `{topic} | ${siteName}`,
      metaDescription: `Curiosidades sobre {topic} en ${siteName}.`,
    },
    post: {
      loading: "Cargando curiosidad...",
      notFoundTitle: "Curiosidad no encontrada",
      notFoundDescription:
        "Esta curiosidad pudo haberse movido o aún no está disponible.",
      backToHome: "Volver al blog",
      publishedLabel: "Publicado",
      updatedLabel: "Actualizado",
      guideTitle: "Guía fundamental",
      relatedTitle: "Posts relacionados",
    },
    notFound: {
      title: "Página no encontrada",
      description: "No encontramos la página que buscas.",
      cta: "Volver al inicio",
    },
  },
};
