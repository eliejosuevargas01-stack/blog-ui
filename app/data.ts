export const TEKO: React.CSSProperties = { fontFamily: "var(--font-teko), 'Teko', sans-serif" };
export const BODY: React.CSSProperties = { fontFamily: "var(--font-barlow), 'Barlow', sans-serif" };

export const NAV_LINKS = [
  { label: "Home", path: "/" },
  { label: "Reviews", path: "/reviews" },
  { label: "Manutenção", path: "/manutencao" },
  { label: "Rotas", path: "/rotas" },
  { label: "Equipamentos", path: "/equipamentos" },
  { label: "Sobre", path: "/sobre" },
];

export const TAG_COLORS: Record<string, string> = {
  Review: "bg-[#FF6A00] text-neutral-950 font-bold",
  Manutenção: "bg-[#2A2A2A] text-[#AAAAAA]",
  Rotas: "bg-[#1A3A2A] text-[#6EC49A]",
  Equipamentos: "bg-[#1A2A3A] text-[#6EAAC4]",
  Dicas: "bg-[#252525] text-[#AAAAAA]",
};

export interface Post {
  id: number;
  slug: string;
  tag: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  img: string;
  content?: string;
}

export const POSTS: Post[] = [
  {
    id: 1,
    slug: "fazer-250-solid-grey-2026-6-meses",
    tag: "Review",
    title: "Fazer 250 Solid Grey 2026: 6 meses de uso real",
    excerpt: "Peguei a chave em janeiro e desde então rodei mais de 8.000 km. Aqui vai tudo que aprendi — o que é ótimo, o que incomoda e por que ainda não me arrependo.",
    date: "12 Jun 2025",
    readTime: "8 min",
    img: "https://images.unsplash.com/photo-1571646036117-8015cc02547c?w=1200&h=680&fit=crop&auto=format",
    content: `A Fazer 250 Solid Grey chegou na minha garagem no começo de janeiro. Cor nova, motor atualizado e um visual que me convenceu antes mesmo de ligar o motor. Seis meses depois, vou te contar o que a Yamaha acertou, o que ainda incomoda e se eu compraria de novo.

**Motor e desempenho**

O propulsor de 249cc mono segue sendo o mais refinado da categoria. Resposta suave no início da rotação, entrega mais intensa acima de 6.000 rpm. Para o trânsito diário de BH — semáforo, curva fechada, eventual contra-mão — ele cumpre tudo sem reclamar. Na estrada, cruza confortável entre 100 e 120 km/h.

**Consumo real**

Na cidade: 28 km/l. Estrada: 33 km/l. Tanque de 13 litros. Autonomia urbana em torno de 360 km antes do reserva acender — não é o número que a Yamaha divulga, mas é o que eu vivo.

**Ergonomia**

Ponto alto. Selim bem almofadado, pegada do guidão natural, pé bem posicionado. Consigo fazer 300 km sem parar sem sentir as costas.

**O que incomoda**

Espelho retrovisor vibra acima de 9.000 rpm. Cavalhete lateral um pouco curto para terreno levemente inclinado. O painel analógico ficou para trás — qualquer moto do segmento tem display digital hoje.

**Vale comprar?**

Sim. Para quem quer uma naked polivalente — cidade, estrada, curvas — sem gastar R$ 35 mil, a FZ25 Solid Grey é a escolha mais honesta do mercado em 2026.`,
  },
  {
    id: 2,
    slug: "troca-oleo-fz25-passo-a-passo",
    tag: "Manutenção",
    title: "Troca de óleo na FZ25: passo a passo sem enrolação",
    excerpt: "Óleos recomendados, torque do dreno e dicas pra não sujar a escapamento. Custo total: R$ 87.",
    date: "28 Mai 2025",
    readTime: "5 min",
    img: "https://images.unsplash.com/photo-1625811508773-db54e54ac0d3?w=1200&h=680&fit=crop&auto=format",
    content: `Trocar o óleo da FZ25 em casa é simples, barato e você aprende muito sobre a sua moto no processo. Custo total da minha última troca: R$ 87.

**O que você vai precisar**

- 1,1 litro de óleo Yamalube 10W-40 (ou Motul 5100 10W-40)
- Chave 17mm para o dreno
- Panela ou recipiente de pelo menos 1,5 litro
- Filtro de óleo novo (a cada 2 trocas)
- Pano velho

**Passo a passo**

1. Aqueça o motor por 3 minutos — óleo quente drena melhor.
2. Posicione o recipiente abaixo do dreno (lado direito, baixo do motor).
3. Remova o dreno com a chave 17mm. Cuidado — o óleo sai quente.
4. Aguarde drenar completamente (~5 minutos).
5. Recoloque o dreno. Torque: **20 Nm** — firme, mas não exagere.
6. Despeje 1,0 litro de óleo novo pelo visor lateral.
7. Ligue o motor por 1 minuto, desligue e verifique o nível pelo visor.
8. Complete se necessário até o MAX.

**Dica importante**

Coloque um pano enrolado na escapamento antes de começar. O óleo que escorre pela lateral inevitavelmente chega lá e queima — cheiro horrível por dias.`,
  },
  {
    id: 3,
    slug: "serra-da-canastra-de-moto",
    tag: "Rotas",
    title: "Serra da Canastra de moto: a rota que todo piloto tem que fazer",
    excerpt: "Saí de BH num sábado às 6h. Estradas perfeitas, frio na cara e 620 km de pura satisfação.",
    date: "15 Mai 2025",
    readTime: "6 min",
    img: "https://images.unsplash.com/photo-1761000989410-3fa81f1b94cb?w=1200&h=680&fit=crop&auto=format",
    content: `620 km de ida e volta. Saída às 6h de BH, retorno às 19h. A Serra da Canastra é uma daquelas rotas que você faz uma vez e já está planejando a próxima.

**O roteiro**

BH → Divinópolis (BR-262) → Formiga → São Roque de Minas → Parque Nacional da Serra da Canastra → retorno pela MG-050.

**Estrada**

A MG-050 entre Divinópolis e Formiga está em excelente estado. Curvas de raio médio, ótimas para a geometria da Fazer. A partir de São Roque, o asfalto piora um pouco — nada que preocupe, mas reduza a velocidade nas entradas de curva.

**O Parque**

Entrada de moto: R$ 25. O acesso à Cachoeira Casca D'Anta é 12 km de terra — firme e seca no mês de maio, fiz sem susto na Fazer calçada com o pneu de origem.

**Equipamentos que fiz questão de levar**

Balaclava, luvas de frio e jaqueta com proteção. A temperatura na Serra baixa de forma brutal entre 9h e 11h — mesmo com sol, o vento na descida bate pesado.

**Vale para a Fazer 250?**

Totalmente. Moto leve, consumo baixo, bagageiro traseiro comporta uma mochila de 30 litros tranquilo.`,
  },
  {
    id: 4,
    slug: "hjc-rpha-11-pro-review-1-ano",
    tag: "Equipamentos",
    title: "HJC RPHA 11 Pro depois de 1 ano: vale os R$ 1.400?",
    excerpt: "Review honesto sem jabá. Ventilação, peso, visibilidade e o que mudou depois de muita chuva.",
    date: "3 Mai 2025",
    readTime: "7 min",
    img: "https://images.unsplash.com/photo-1625812184391-0359bf2344b9?w=1200&h=680&fit=crop&auto=format",
    content: `Comprei o HJC RPHA 11 Pro sem patrocínio, sem teste de imprensa. Paguei R$ 1.390 no cartão e usei durante 12 meses, em todos os tipos de dia — sol, chuva, frio, calor. Aqui vai o que aprendi.

**Primeiras impressões**

Pesado na mão, leve na cabeça. O RPHA 11 tem fibra de carbono na calota e isso muda tudo em uso prolongado. Acabamento premium — fivela de rolamento, vedação da viseira precisa, ventilação que realmente abre e fecha.

**Ventilação**

Funciona. Diferente de muitos capacetes com entrada de ar decorativa, o RPHA 11 tem canal interno que circula ar real. Em dias acima de 30°C, a diferença é perceptível nos primeiros 20 minutos.

**Chuva**

O kit de vedação original aguenta chuva moderada bem. Em temporal, a água infiltra pela lateral da viseira após ~15 minutos. Solução: Pinlock Max Vision (incluso na caixa) — elimina completamente o embaçamento.

**O que piorou com o tempo**

O espuma interna amoleceu após 8 meses — normal. A viseira arranhada por dentro (limpeza com pano seco descuidada no começo). O forro removível é de fácil lavagem e ajuda muito na higiene.

**Vale R$ 1.400?**

Se você roda mais de 5.000 km por ano, sim. Se você usa moto só no fim de semana, um capacete de R$ 600 cumpre o mesmo papel.`,
  },
  {
    id: 5,
    slug: "michelin-pilot-street-2-fazer",
    tag: "Review",
    title: "Michelin Pilot Street 2 na Fazer: diferença real ou papo de vendedor?",
    excerpt: "Troquei os originais com 12.000 km. A diferença em frenagem na chuva foi imediata.",
    date: "20 Abr 2025",
    readTime: "4 min",
    img: "https://images.unsplash.com/photo-1571646059462-99317ec8d1bf?w=1200&h=680&fit=crop&auto=format",
    content: `Com 12.000 km no relógio, o pneu dianteiro original estava no limite. Aproveitei para testar o Michelin Pilot Street 2 — referência na categoria 250cc há anos. A diferença foi mais real do que esperava.

**Instalação**

Par dianteiro + traseiro: R$ 340 instalado no borracheiro que trabalha com Michelin aqui em BH. O traseiro vinha com desgaste assimétrico pelo meu costume de curvar sempre pelo mesmo lado — erro meu.

**Diferença na chuva**

Esse foi o ponto mais impressionante. O original escorregava levemente no freio em faixas de pedestre molhadas. O Pilot Street 2 eliminou completamente esse comportamento. Não é sensação — é frenagem visivelmente mais curta.

**Seco**

No seco a diferença é menor, mas o feeling de comunicação de pista melhorou. O pneu informa mais sobre o que está acontecendo no asfalto — importantes para dosagem de freio nas curvas.

**Durabilidade esperada**

O original durou 12.000 km no traseiro (estilo de pilotagem moderado). O Pilot Street 2 promete 15% a mais segundo a Michelin. Vou atualizar o post quando chegar no desgaste.

**Vale a troca?**

Sim, especialmente se você roda em cidades com asfalto irregular e muita chuva. A segurança adicional na molhado já justifica o custo.`,
  },
  {
    id: 6,
    slug: "kit-relampago-manutencao-preventiva",
    tag: "Manutenção",
    title: "Kit relâmpago: manutenção preventiva de 30 minutos todo mês",
    excerpt: "O que verificar, apertar e lubrificar antes que vire problema. Salvou minha corrente duas vezes.",
    date: "8 Abr 2025",
    readTime: "4 min",
    img: "https://images.unsplash.com/photo-1542351387-dde430deaaa7?w=1200&h=680&fit=crop&auto=format",
    content: `30 minutos por mês salvam horas de oficina e centenas de reais em manutenção corretiva. Aqui está minha checklist mensal.

**Corrente (10 min)**

Afrouxamento: empurre a corrente para cima no ponto médio entre as coroas. Folga ideal: 20-30mm na Fazer. Lubrificação: spray de corrente a cada 500 km ou sempre depois de chuva. Verificação de elos: gire a roda traseira lentamente e observe se algum elo trava.

**Pneus (5 min)**

Calibre dianteiro: 29 PSI frio. Traseiro: 33 PSI frio. Verifique a profundidade dos sulcos — indicador de desgaste fica na lateral do pneu. Observe cortes ou bolhas na lateral.

**Freios (5 min)**

Nível do fluido dianteiro: acima do mínimo. Espessura da pastilha: mínimo 2mm. Teste a firmeza da alavanca — se afundar progressivamente, há ar no circuito.

**Fluidos (5 min)**

Nível do óleo: visor lateral com moto na vertical. Nível do líquido de arrefecimento: entre MIN e MAX no reservatório translúcido.

**Elétrica (5 min)**

Farol, lanterna, setas e freio. Verificação rápida que salva de multa e acidente.`,
  },
];

export const CATEGORIES = [
  { label: "Reviews", count: 12, path: "/reviews" },
  { label: "Manutenção", count: 9, path: "/manutencao" },
  { label: "Rotas", count: 7, path: "/rotas" },
  { label: "Equipamentos", count: 11, path: "/equipamentos" },
  { label: "Dicas", count: 6, path: "/" },
  { label: "Customização", count: 4, path: "/" },
];

export function optimizeUnsplashUrl(url: string, width: number, height?: number): string {
  if (!url || !url.includes("images.unsplash.com")) return url;
  try {
    const urlObj = new URL(url);
    urlObj.searchParams.set("w", width.toString());
    if (height) {
      urlObj.searchParams.set("h", height.toString());
      urlObj.searchParams.set("fit", "crop");
    }
    urlObj.searchParams.set("auto", "format");
    urlObj.searchParams.set("q", "75");
    return urlObj.toString();
  } catch (e) {
    return url;
  }
}

export function optimizeImageUrl(url: string, width: number, height?: number): string {
  if (!url) return "";
  if (url.includes("images.unsplash.com")) {
    return optimizeUnsplashUrl(url, width, height);
  }
  if (url.includes("/uploads/")) {
    const cleanUrl = url.split("?")[0];
    return `${cleanUrl}?w=${width}`;
  }
  return url;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/<[^>]*>/g, "") // strip HTML tags
    .replace(/[^a-z0-9\u00C0-\u00FF]+/gi, "-") // preserve accented characters but replace spaces/symbols
    .replace(/^-+|-+$/g, "");
}

export function formatPostUrl(slug: string, lang?: string | null): string {
  if (!slug) return "/";
  let clean = slug.trim().replace(/^https?:\/\/[^\/]+/i, "");
  while (/^\/?(posts|post|reviews|resenas|avaliacoes)\//i.test(clean) || clean.startsWith("/")) {
    clean = clean.replace(/^\/?(posts|post|reviews|resenas|avaliacoes)\//i, "").replace(/^\/+/, "");
  }
  if (lang === "en") return `/en/post/${clean}`;
  if (lang === "es") return `/es/post/${clean}`;
  return `/post/${clean}`;
}
