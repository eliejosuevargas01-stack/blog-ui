export type Language = "pt" | "en" | "es";

export const languages = ["pt", "en", "es"] as const;
export const defaultLang: Language = "pt";

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
}

export interface ToolCard {
  title: string;
  description: string;
  status: string;
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
    notFound: {
      title: string;
      description: string;
    };
  };
  nav: {
    home: string;
    topics: string;
    tools: string;
    newsletter: string;
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
    cards: CategoryCopy[];
  };
  newsletter: {
    title: string;
    subtitle: string;
    placeholder: string;
    button: string;
    note: string;
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
    errors: {
      metaTags: string;
    };
  };
  post: {
    loading: string;
    notFoundTitle: string;
    notFoundDescription: string;
    backToHome: string;
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
        title: "seommerce.shop | Blog de Tecnologia, IA e Marketing",
        description:
          "Insights diários sobre tecnologia, IA, negócios e marketing digital para líderes e equipes de crescimento.",
      },
      tools: {
        title: "Ferramentas Seommerce | Hub de crescimento digital",
        description:
          "Acesse a biblioteca de ferramentas seommerce para SEO, conteúdo e automação.",
      },
      articles: {
        title: "Todos os artigos | seommerce.shop",
        description:
          "Explore todas as publicações do seommerce.shop sobre tecnologia, IA, negócios e marketing.",
      },
      latest: {
        title: "Últimos artigos | seommerce.shop",
        description:
          "Acompanhe as publicações mais recentes do seommerce.shop.",
      },
      auth: {
        title: "Acesso | seommerce.shop",
        description:
          "Entre ou crie sua conta para acessar ferramentas e publicar conteúdos.",
      },
      admin: {
        title: "Administração do Blog | seommerce.shop",
        description:
          "Gerencie posts, edite conteúdos e organize categorias do blog.",
      },
      notFound: {
        title: "Página não encontrada | seommerce.shop",
        description: "A página que você procura não existe ou foi movida.",
      },
    },
    nav: {
      home: "Início",
      topics: "Tópicos",
      tools: "Ferramentas",
      newsletter: "Newsletter",
      login: "Entrar",
      signup: "Criar conta",
    },
    labels: {
      language: "Idioma",
    },
    hero: {
      badge: "Insights diários para líderes digitais",
      title: "seommerce.shop",
      description: {
        lead: "Sua fonte diária para as últimas novidades e insights sobre ",
        and: ", e ",
      },
      highlights: {
        technology: "tecnologia",
        ai: "IA",
        business: "negócios",
        marketing: "marketing digital",
      },
      ctaPrimary: "Assinar agora",
      ctaSecondary: "Últimos artigos",
      stat: "Junte-se a 10.000+ profissionais que se mantêm informados",
    },
    featured: {
      title: "Artigos em destaque",
      subtitle: "Descubra nossos conteúdos mais populares desta semana",
      viewAll: "Ver todos os artigos",
    },
    articles: {
      title: "Todos os artigos",
      subtitle:
        "Reunimos todos os conteúdos publicados para você explorar.",
    },
    posts: {
      loading: "Carregando posts...",
      emptyTitle: "Sem posts por enquanto",
      emptyDescription:
        "Assim que publicarmos novos conteúdos, eles aparecerão aqui.",
      errorTitle: "Não foi possível carregar os posts",
      errorDescription: "Tente novamente em alguns instantes.",
    },
    categories: {
      title: "Explore tópicos",
      subtitle: "Aprofunde-se nas categorias mais populares",
      cards: [
        {
          title: "Inteligência Artificial",
          description: "Últimas novidades em IA e aprendizado de máquina",
          count: "156 artigos",
        },
        {
          title: "Tecnologia",
          description: "Notícias de tecnologia e tendências de software",
          count: "243 artigos",
        },
        {
          title: "Negócios",
          description: "Empreendedorismo, startups e estratégia",
          count: "189 artigos",
        },
        {
          title: "Marketing & SEO",
          description: "Estratégias de marketing digital e otimização de busca",
          count: "201 artigos",
        },
      ],
    },
    newsletter: {
      title: "Fique atualizado diariamente",
      subtitle:
        "Receba os artigos mais recentes direto no seu email. Sem spam, só conteúdo de qualidade.",
      placeholder: "seu@email.com",
      button: "Assinar",
      note: "Respeitamos sua privacidade. Cancele quando quiser.",
    },
    latest: {
      title: "Últimos do blog",
      subtitle: "Conteúdo fresco publicado diariamente",
    },
    footer: {
      tagline:
        "Insights diários sobre tecnologia, IA, negócios e marketing digital.",
      sectionsTitle: "Seções",
      resourcesTitle: "Recursos",
      followTitle: "Siga a gente",
      bottomLine:
        "Feito com paixão | Insights diários sobre tech, IA, negócios e marketing",
      copyright: "© {year} seommerce.shop. Todos os direitos reservados.",
    },
    tools: {
      heroTitle: "Ferramentas Seommerce",
      heroSubtitle:
        "Um hub para todas as ferramentas que criamos para acelerar seu crescimento digital.",
      badge: "Em breve",
      gridTitle: "Biblioteca de ferramentas",
      gridSubtitle:
        "Coleção crescente de soluções para SEO, conteúdo e automação.",
      ctaTitle: "Acesso antecipado",
      ctaSubtitle:
        "Crie sua conta para ser avisado quando lançarmos novas ferramentas.",
      ctaButton: "Quero acesso",
      cards: [
        {
          title: "Auditoria SEO Express",
          description: "Diagnóstico rápido de páginas e oportunidades de otimização.",
          status: "Em breve",
        },
        {
          title: "Gerador de Briefs",
          description: "Crie briefings prontos para produção de conteúdo.",
          status: "Em breve",
        },
        {
          title: "Monitor de SERP",
          description: "Acompanhe posições e mudanças nas buscas em tempo real.",
          status: "Em breve",
        },
      ],
    },
    auth: {
      title: "Acesso",
      subtitle: "Entre ou crie sua conta para publicar e gerenciar posts.",
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
        "Alterações feitas aqui são locais e não são enviadas ao servidor.",
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
        category: "Use: ia, tech, marketing/seo ou business.",
        tags: "Separe por vírgula.",
        images: "Separe por vírgula.",
        metaTags: 'Exemplo: [{"name":"description","content":"..."}]',
      },
      errors: {
        metaTags: "JSON inválido para meta tags.",
      },
    },
    post: {
      loading: "Carregando post...",
      notFoundTitle: "Post não encontrado",
      notFoundDescription:
        "Este conteúdo pode ter sido movido ou ainda não está disponível.",
      backToHome: "Voltar ao blog",
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
        title: "seommerce.shop | Blog on Tech, AI, and Marketing",
        description:
          "Daily insights on technology, AI, business, and digital marketing for growth teams and leaders.",
      },
      tools: {
        title: "Seommerce Tools | Digital growth hub",
        description:
          "Explore the seommerce tools library for SEO, content, and automation.",
      },
      articles: {
        title: "All articles | seommerce.shop",
        description:
          "Browse every seommerce.shop article on tech, AI, business, and marketing.",
      },
      latest: {
        title: "Latest articles | seommerce.shop",
        description: "See the newest stories published on seommerce.shop.",
      },
      auth: {
        title: "Access | seommerce.shop",
        description:
          "Sign in or create your account to access tools and publish content.",
      },
      admin: {
        title: "Blog Admin | seommerce.shop",
        description:
          "Manage posts, edit content, and organize blog categories.",
      },
      notFound: {
        title: "Page not found | seommerce.shop",
        description: "The page you are looking for does not exist or was moved.",
      },
    },
    nav: {
      home: "Home",
      topics: "Topics",
      tools: "Tools",
      newsletter: "Newsletter",
      login: "Sign in",
      signup: "Create account",
    },
    labels: {
      language: "Language",
    },
    hero: {
      badge: "Daily insights for digital leaders",
      title: "seommerce.shop",
      description: {
        lead: "Your daily source for the latest news and insights on ",
        and: ", and ",
      },
      highlights: {
        technology: "technology",
        ai: "AI",
        business: "business",
        marketing: "digital marketing",
      },
      ctaPrimary: "Subscribe now",
      ctaSecondary: "Latest articles",
      stat: "Join 10,000+ professionals who stay informed",
    },
    featured: {
      title: "Featured articles",
      subtitle: "Discover our most popular stories this week",
      viewAll: "View all articles",
    },
    articles: {
      title: "All articles",
      subtitle: "Everything we have published, curated in one place.",
    },
    posts: {
      loading: "Loading posts...",
      emptyTitle: "No posts yet",
      emptyDescription:
        "As soon as we publish new content, it will appear here.",
      errorTitle: "Unable to load posts",
      errorDescription: "Please try again in a moment.",
    },
    categories: {
      title: "Explore topics",
      subtitle: "Dive into our most popular categories",
      cards: [
        {
          title: "Artificial Intelligence",
          description: "Latest AI breakthroughs and machine learning insights",
          count: "156 articles",
        },
        {
          title: "Technology",
          description: "Tech news and software development trends",
          count: "243 articles",
        },
        {
          title: "Business",
          description: "Entrepreneurship, startups, and strategy",
          count: "189 articles",
        },
        {
          title: "Marketing & SEO",
          description: "Digital marketing strategies and search optimization",
          count: "201 articles",
        },
      ],
    },
    newsletter: {
      title: "Stay updated daily",
      subtitle:
        "Get the latest articles delivered to your inbox. No spam, just quality content.",
      placeholder: "your@email.com",
      button: "Subscribe",
      note: "We respect your privacy. Unsubscribe anytime.",
    },
    latest: {
      title: "Latest from the blog",
      subtitle: "Fresh content published daily",
    },
    footer: {
      tagline: "Daily insights on technology, AI, business, and digital marketing.",
      sectionsTitle: "Sections",
      resourcesTitle: "Resources",
      followTitle: "Follow us",
      bottomLine:
        "Crafted with passion | Daily insights on tech, AI, business, and marketing",
      copyright: "© {year} seommerce.shop. All rights reserved.",
    },
    tools: {
      heroTitle: "Seommerce Tools",
      heroSubtitle:
        "A hub for all the tools we build to accelerate your digital growth.",
      badge: "Coming soon",
      gridTitle: "Tools library",
      gridSubtitle: "A growing collection of SEO, content, and automation solutions.",
      ctaTitle: "Early access",
      ctaSubtitle:
        "Create your account to be notified when we launch new tools.",
      ctaButton: "Get early access",
      cards: [
        {
          title: "SEO Express Audit",
          description: "Quick diagnostics for pages and optimization opportunities.",
          status: "Coming soon",
        },
        {
          title: "Brief Generator",
          description: "Create ready-to-go content briefs for your team.",
          status: "Coming soon",
        },
        {
          title: "SERP Monitor",
          description: "Track rankings and search changes in real time.",
          status: "Coming soon",
        },
      ],
    },
    auth: {
      title: "Access",
      subtitle: "Sign in or create your account to publish and manage posts.",
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
      notice: "Changes here are local and are not sent to the server.",
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
        category: "Use: ia, tech, marketing/seo, or business.",
        tags: "Comma-separated.",
        images: "Comma-separated.",
        metaTags: 'Example: [{"name":"description","content":"..."}]',
      },
      errors: {
        metaTags: "Invalid JSON for meta tags.",
      },
    },
    post: {
      loading: "Loading post...",
      notFoundTitle: "Post not found",
      notFoundDescription:
        "This content may have been moved or is not available yet.",
      backToHome: "Back to the blog",
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
        title: "seommerce.shop | Blog de Tecnología, IA y Marketing",
        description:
          "Insights diarios sobre tecnología, IA, negocios y marketing digital para líderes y equipos de crecimiento.",
      },
      tools: {
        title: "Herramientas Seommerce | Hub de crecimiento digital",
        description:
          "Explora la biblioteca de herramientas Seommerce para SEO, contenido y automatización.",
      },
      articles: {
        title: "Todos los artículos | seommerce.shop",
        description:
          "Explora todos los artículos sobre tecnología, IA, negocios y marketing.",
      },
      latest: {
        title: "Últimos artículos | seommerce.shop",
        description: "Descubre las publicaciones más recientes del blog.",
      },
      auth: {
        title: "Acceso | seommerce.shop",
        description:
          "Inicia sesión o crea tu cuenta para acceder a herramientas y publicar contenidos.",
      },
      admin: {
        title: "Administración del Blog | seommerce.shop",
        description:
          "Gestiona posts, edita contenidos y organiza categorías del blog.",
      },
      notFound: {
        title: "Página no encontrada | seommerce.shop",
        description: "La página que buscas no existe o fue movida.",
      },
    },
    nav: {
      home: "Inicio",
      topics: "Temas",
      tools: "Herramientas",
      newsletter: "Newsletter",
      login: "Iniciar sesión",
      signup: "Crear cuenta",
    },
    labels: {
      language: "Idioma",
    },
    hero: {
      badge: "Insights diarios para líderes digitales",
      title: "seommerce.shop",
      description: {
        lead: "Tu fuente diaria de noticias e insights sobre ",
        and: ", y ",
      },
      highlights: {
        technology: "tecnología",
        ai: "IA",
        business: "negocios",
        marketing: "marketing digital",
      },
      ctaPrimary: "Suscribirme",
      ctaSecondary: "Últimos artículos",
      stat: "Únete a más de 10.000 profesionales que se mantienen informados",
    },
    featured: {
      title: "Artículos destacados",
      subtitle: "Descubre nuestros contenidos más populares de la semana",
      viewAll: "Ver todos los artículos",
    },
    articles: {
      title: "Todos los artículos",
      subtitle: "Todo lo publicado para que explores sin límites.",
    },
    posts: {
      loading: "Cargando publicaciones...",
      emptyTitle: "Aún no hay publicaciones",
      emptyDescription:
        "Cuando publiquemos contenido nuevo, aparecerá aquí.",
      errorTitle: "No se pudieron cargar las publicaciones",
      errorDescription: "Intenta nuevamente en unos momentos.",
    },
    categories: {
      title: "Explora temas",
      subtitle: "Profundiza en nuestras categorías más populares",
      cards: [
        {
          title: "Inteligencia Artificial",
          description: "Últimos avances de IA y aprendizaje automático",
          count: "156 artículos",
        },
        {
          title: "Tecnología",
          description: "Noticias de tecnología y tendencias de desarrollo",
          count: "243 artículos",
        },
        {
          title: "Negocios",
          description: "Emprendimiento, startups y estrategia corporativa",
          count: "189 artículos",
        },
        {
          title: "Marketing y SEO",
          description: "Estrategias de marketing digital y optimización de búsqueda",
          count: "201 artículos",
        },
      ],
    },
    newsletter: {
      title: "Mantente al día",
      subtitle:
        "Recibe los artículos más recientes en tu correo. Sin spam, solo contenido de calidad.",
      placeholder: "tu@email.com",
      button: "Suscribirme",
      note: "Respetamos tu privacidad. Cancela cuando quieras.",
    },
    latest: {
      title: "Lo último del blog",
      subtitle: "Contenido fresco publicado a diario",
    },
    footer: {
      tagline:
        "Insights diarios sobre tecnología, IA, negocios y marketing digital.",
      sectionsTitle: "Secciones",
      resourcesTitle: "Recursos",
      followTitle: "Síguenos",
      bottomLine:
        "Hecho con pasión | Insights diarios sobre tech, IA, negocios y marketing",
      copyright: "© {year} seommerce.shop. Todos los derechos reservados.",
    },
    tools: {
      heroTitle: "Herramientas Seommerce",
      heroSubtitle:
        "Un hub con todas las herramientas que creamos para acelerar tu crecimiento digital.",
      badge: "Próximamente",
      gridTitle: "Biblioteca de herramientas",
      gridSubtitle:
        "Colección creciente de soluciones para SEO, contenido y automatización.",
      ctaTitle: "Acceso anticipado",
      ctaSubtitle:
        "Crea tu cuenta para ser avisado cuando lancemos nuevas herramientas.",
      ctaButton: "Quiero acceso",
      cards: [
        {
          title: "Auditoría SEO Express",
          description: "Diagnóstico rápido de páginas y oportunidades de optimización.",
          status: "Próximamente",
        },
        {
          title: "Generador de briefs",
          description: "Crea briefings listos para producción de contenido.",
          status: "Próximamente",
        },
        {
          title: "Monitor de SERP",
          description: "Sigue posiciones y cambios en búsquedas en tiempo real.",
          status: "Próximamente",
        },
      ],
    },
    auth: {
      title: "Acceso",
      subtitle: "Inicia sesión o crea tu cuenta para publicar y gestionar posts.",
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
      notice: "Los cambios aquí son locales y no se envían al servidor.",
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
        category: "Usa: ia, tech, marketing/seo o business.",
        tags: "Separadas por coma.",
        images: "Separadas por coma.",
        metaTags: 'Ejemplo: [{"name":"description","content":"..."}]',
      },
      errors: {
        metaTags: "JSON inválido para meta tags.",
      },
    },
    post: {
      loading: "Cargando publicación...",
      notFoundTitle: "Publicación no encontrada",
      notFoundDescription:
        "Este contenido pudo haberse movido o aún no está disponible.",
      backToHome: "Volver al blog",
    },
    notFound: {
      title: "Página no encontrada",
      description: "No encontramos la página que buscas.",
      cta: "Volver al inicio",
    },
  },
};
