import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const POSTS_DATA = [
  {
    slug: "fazer-250-solid-grey-2026-6-meses",
    tag: "Review",
    category: "Reviews",
    title: "Fazer 250 Solid Grey 2026: 6 meses de uso real",
    excerpt: "Peguei a chave em janeiro e desde então rodei mais de 8.000 km. Aqui vai tudo que aprendi — o que é ótimo, o que incomoda e por que ainda não me arrependo.",
    date: new Date("2025-06-12"),
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

Sim. Para quem quer uma naked polivalente — cidade, estrada, curvas — sem gastar R$ 35 mil, a FZ25 Solid Grey é a escolha mais honesta do mercado em 2026.`
  },
  {
    slug: "troca-oleo-fz25-passo-a-passo",
    tag: "Manutenção",
    category: "Manutenção",
    title: "Troca de óleo na FZ25: passo a passo sem enrolação",
    excerpt: "Óleos recomendados, torque do dreno e dicas pra não sujar a escapamento. Custo total: R$ 87.",
    date: new Date("2025-05-28"),
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

Coloque um pano enrolado na escapamento antes de começar. O óleo que escorre pela lateral inevitavelmente chega lá e queima — cheiro horrível por dias.`
  },
  {
    slug: "serra-da-canastra-de-moto",
    tag: "Rotas",
    category: "Rotas",
    title: "Serra da Canastra de moto: a rota que todo piloto tem que fazer",
    excerpt: "Saí de BH num sábado às 6h. Estradas perfeitas, frio na cara e 620 km de pura satisfação.",
    date: new Date("2025-05-15"),
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

Totalmente. Moto leve, consumo baixo, bagageiro traseiro comporta uma mochila de 30 litros tranquilo.`
  },
  {
    slug: "hjc-rpha-11-pro-review-1-ano",
    tag: "Equipamentos",
    category: "Equipamentos",
    title: "HJC RPHA 11 Pro depois de 1 ano: vale os R$ 1.400?",
    excerpt: "Review honesto sem jabá. Ventilação, peso, visibilidade e o que mudou depois de muita chuva.",
    date: new Date("2025-05-03"),
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

Se você roda mais de 5.000 km por ano, sim. Se você usa moto só no fim de semana, um capacete de R$ 600 cumpre o mesmo papel.`
  },
  {
    slug: "michelin-pilot-street-2-fazer",
    tag: "Review",
    category: "Reviews",
    title: "Michelin Pilot Street 2 na Fazer: diferença real ou papo de vendedor?",
    excerpt: "Troquei os originais com 12.000 km. A diferença em frenagem na chuva foi imediata.",
    date: new Date("2025-04-20"),
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

Sim, especialmente se você roda em cidades com asfalto irregular e muita chuva. A segurança adicional na molhado já justifica o custo.`
  },
  {
    slug: "kit-relampago-manutencao-preventiva",
    tag: "Manutenção",
    category: "Manutenção",
    title: "Kit relâmpago: manutenção preventiva de 30 minutos todo mês",
    excerpt: "O que verificar, apertar e lubrificar antes que vire problema. Salvou minha corrente duas vezes.",
    date: new Date("2025-04-08"),
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

Farol, lanterna, setas e freio. Verificação rápida que salva de multa e acidente.`
  }
];

function parseContentToBlocks(content: string): any[] {
  const paragraphs = content.split("\n\n").filter(Boolean);
  const blocks: any[] = [];
  
  // Converter markdown simples para tags HTML puras (sem classes em linha)
  const htmlParagraphs = paragraphs.map((p) => {
    if (p.startsWith("**") && p.endsWith("**")) {
      const clean = p.replace(/\*\*/g, "");
      return `<h2>${clean}</h2>`;
    }
    
    // Listagem simples
    if (p.includes("\n- ") || p.startsWith("- ")) {
      const items = p.split(/\n?- /).filter(Boolean);
      const listItems = items.map(item => `<li>${item.trim()}</li>`).join("");
      return `<ul>${listItems}</ul>`;
    }

    if (p.match(/^\d+\./)) {
      const items = p.split(/\n?\d+\.\s+/).filter(Boolean);
      const listItems = items.map(item => `<li>${item.trim()}</li>`).join("");
      return `<ol>${listItems}</ol>`;
    }

    // Negrito inline
    const boldFormatted = p.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    return `<p>${boldFormatted}</p>`;
  });

  // Dividir igualmente os parágrafos em 3 blocos
  const total = htmlParagraphs.length;
  const size = Math.ceil(total / 3);
  
  for (let i = 0; i < 3; i++) {
    const chunk = htmlParagraphs.slice(i * size, (i + 1) * size);
    blocks.push({
      text: chunk.join("\n"),
      image: "",
      focalPoint: "center"
    });
  }

  return blocks;
}

async function main() {
  console.log("Iniciando semeadura do banco de dados...");

  // 1. Limpar banco existente (Post.deleteMany removido para proteger os posts do usuário)
  // await prisma.post.deleteMany({});
  await prisma.page.deleteMany({});

  // 2. Semear Posts
  for (const post of POSTS_DATA) {
    const blocks = parseContentToBlocks(post.content);
    await prisma.post.create({
      data: {
        slug: post.slug,
        tag: post.tag,
        category: post.category,
        title: post.title,
        excerpt: post.excerpt,
        date: post.date,
        readTime: post.readTime,
        img: post.img,
        imgFocalPoint: "center",
        blocks: blocks,
        seoTitle: post.title,
        seoDescription: post.excerpt,
        seoKeywords: `${post.tag}, Fazer250, Moto, BH`
      }
    });
    console.log(`Post semeado: ${post.title}`);
  }

  // 3. Semear Página Home
  await prisma.page.create({
    data: {
      slug: "home",
      title: "Página Inicial",
      isStatic: true,
      content: {
        heroTitle: "Fazer 250 Solid Grey 2026: 6 meses de uso real",
        heroSubtitle: "Peguei a chave em janeiro e desde então rodei mais de 8.000 km. Aqui vai tudo que aprendi — o que é ótimo, o que incomoda e por que ainda não me arrependo.",
        heroImage: "https://images.unsplash.com/photo-1571646036117-8015cc02547c?w=1400&h=780&fit=crop&auto=format",
        heroFocalPoint: "center",
        breakingText: "Michelin Pilot Street 2 na Fazer — diferença real ou papo de vendedor?",
        breakingSlug: "michelin-pilot-street-2-fazer",
        bannerTitle: "Yamaha FZ25 · Solid Grey 2026",
        bannerSubtitle: "8.400 km rodados · Motor 249cc · Minha companheira diária",
        bannerImage: "https://images.unsplash.com/photo-1571646059462-99317ec8d1bf?w=1400&h=500&fit=crop&auto=format",
        bannerFocalPoint: "center"
      },
      seoTitle: "Moto na Prática - Blog de Motos, Dicas e Reviews",
      seoDescription: "Blog de motociclista sobre a Yamaha Fazer 250 Solid Grey 2026. Reviews honestas de equipamentos, dicas de manutenção e relatos de rotas reais."
    }
  });
  console.log("Página Home semeada.");

  // 4. Semear Página Sobre
  await prisma.page.create({
    data: {
      slug: "sobre",
      title: "Sobre o Blog",
      isStatic: true,
      content: {
        heroTitle: "O blog e o motociclista",
        heroDescription: "Sem patrocínio, sem jabá. Só experiência real de quem usa moto todo dia.",
        heroImage: "https://images.unsplash.com/photo-1625812184391-0359bf2344b9?w=1400&h=500&fit=crop&auto=format",
        heroFocalPoint: "center",
        stats: [
          { value: "8.400 km", label: "Rodados na FZ25", iconName: "Gauge" },
          { value: "Jan 2025", label: "Início com a moto", iconName: "Calendar" },
          { value: "Belo Horizonte", label: "Base de operações", iconName: "MapPin" },
          { value: "5", label: "Manutenções feitas em casa", iconName: "Wrench" }
        ],
        bioTitle: "Quem escreve aqui",
        bioContentHtml: `<p class="mb-4">Me chamo Lucas, tenho 29 anos e moro em Belo Horizonte. Comecei a andar de moto em 2019 com uma CG 150 de entrega emprestada do meu tio — a partir daí não parei mais.</p>
<p class="mb-4">Em janeiro de 2025 dei o salto para a Fazer 250 Solid Grey, a versão nova. Foi a maior compra que já fiz relacionada a moto e, com ela, veio a vontade de registrar tudo — as dúvidas, os erros, as descobertas.</p>
<p class="mb-4">O <span class="text-foreground font-semibold">Moto na Prática</span> nasceu disso. Não sou mecânico, não sou piloto profissional, não tenho patrocínio. Sou apenas alguém que usa moto todo dia e quer compartilhar o que aprende.</p>
<p class="mb-4">Aqui você vai encontrar reviews de coisas que comprei com o meu dinheiro, manutenções que fiz na garagem, rotas que percorri e dicas que aprendi na raça. Nada de conteúdo pago ou postagem encomendada.</p>`,
        bioQuote: "Se você está pensando em comprar uma moto, já tem uma ou só curte o assunto — esse blog é pra você.",
        riderImage: "https://images.unsplash.com/photo-1542351387-dde430deaaa7?w=800&h=900&fit=crop&auto=format",
        riderFocalPoint: "center",
        motoTitle: "Minha moto",
        motoSpecsTitle: "Yamaha FZ25 Solid Grey 2026",
        motoImage: "https://images.unsplash.com/photo-1571646059462-99317ec8d1bf?w=1200&h=700&fit=crop&auto=format",
        motoFocalPoint: "center",
        motoSpecs: [
          { name: "Motor", value: "249cc, monocilíndrico, SOHC" },
          { name: "Potência", value: "20,9 cv @ 8.000 rpm" },
          { name: "Torque", value: "2,1 kgf.m @ 6.500 rpm" },
          { name: "Tanque", value: "13 litros" },
          { name: "Peso", value: "154 kg (abastecida)" },
          { name: "Cor", value: "Solid Grey (exclusiva 2026)" }
        ]
      },
      seoTitle: "Sobre o Lucas e a Fazer 250 - Moto na Prática",
      seoDescription: "Conheça o Lucas, criador do Moto na Prática, e veja a ficha técnica detalhada da Yamaha FZ25 Solid Grey 2026 do blog."
    }
  });
  console.log("Página Sobre semeada.");

  // 5. Semear Páginas de Categoria
  const CATEGORIES_SEEDS = [
    {
      slug: "reviews",
      title: "Reviews",
      content: {
        description: "Reviews honestos de peças, acessórios e motos feitos por quem usa no dia a dia, sem patrocínio.",
        heroImg: "https://images.unsplash.com/photo-1571646036117-8015cc02547c?w=1200&h=680&fit=crop&auto=format",
        iconName: "Star"
      },
      seoTitle: "Reviews de Motos e Equipamentos - Moto na Prática",
      seoDescription: "Opiniões sinceras e testes reais de longa duração com motos, pneus, peças e vestuário motociclístico."
    },
    {
      slug: "manutencao",
      title: "Manutenção",
      content: {
        description: "Dicas passo a passo de manutenção preventiva, troca de componentes e cuidados essenciais com a moto.",
        heroImg: "https://images.unsplash.com/photo-1625811508773-db54e54ac0d3?w=1200&h=680&fit=crop&auto=format",
        iconName: "Wrench"
      },
      seoTitle: "Dicas de Manutenção de Motocicleta - Moto na Prática",
      seoDescription: "Guia completo de como cuidar e fazer a manutenção preventiva na sua moto em casa e gastando pouco."
    },
    {
      slug: "rotas",
      title: "Rotas",
      content: {
        description: "Relatos de viagens, rotas para motociclistas, condições de estrada e pontos turísticos imperdíveis.",
        heroImg: "https://images.unsplash.com/photo-1761000989410-3fa81f1b94cb?w=1200&h=680&fit=crop&auto=format",
        iconName: "Navigation"
      },
      seoTitle: "Rotas de Moto e Viagens - Moto na Prática",
      seoDescription: "As melhores estradas para rodar de moto, roteiros turísticos, motoviagem e relatos de rotas pelo Brasil."
    },
    {
      slug: "equipamentos",
      title: "Equipamentos",
      content: {
        description: "Avaliações detalhadas de jaquetas, capacetes, luvas e tudo que você precisa para rodar com segurança.",
        heroImg: "https://images.unsplash.com/photo-1625812184391-0359bf2344b9?w=1200&h=680&fit=crop&auto=format",
        iconName: "ShieldCheck"
      },
      seoTitle: "Equipamentos de Segurança para Motociclista - Moto na Prática",
      seoDescription: "Reviews sinceros de capacetes, jaquetas, luvas, botas e proteção para o piloto no dia a dia ou viagens."
    }
  ];

  for (const catPage of CATEGORIES_SEEDS) {
    await prisma.page.create({
      data: {
        slug: catPage.slug,
        title: catPage.title,
        isStatic: true,
        content: catPage.content,
        seoTitle: catPage.seoTitle,
        seoDescription: catPage.seoDescription
      }
    });
    console.log(`Página de Categoria semeada: ${catPage.title}`);
  }

  // 6. Semear Calendário de Eventos MotoGP 2026
  await prisma.resultadosEtapas.deleteMany({});
  await prisma.calendarioEventos.deleteMany({});
  await prisma.rankingPilotos.deleteMany({});

  const EVENTS_2026 = [
    {
      externalId: "f3fd8ba7-2966-46bd-8687-b92047f5e733",
      championship: "MotoGP",
      seasonYear: 2026,
      eventName: "GRAND PRIX OF THAILAND",
      circuitName: "Chang International Circuit",
      countryCode: "TH",
      dateStart: new Date("2026-02-27T00:00:00Z"),
      dateEnd: new Date("2026-03-01T00:00:00Z"),
      status: "FINISHED"
    },
    {
      externalId: "motogp-2026-tha",
      championship: "MotoGP",
      seasonYear: 2026,
      eventName: "GRAND PRIX OF THAILAND (ALt)",
      circuitName: "Chang International Circuit",
      countryCode: "TH",
      dateStart: new Date("2026-02-27T00:00:00Z"),
      dateEnd: new Date("2026-03-01T00:00:00Z"),
      status: "FINISHED"
    },
    {
      externalId: "738a8b22-f744-4c75-847b-a2565dce17de",
      championship: "MotoGP",
      seasonYear: 2026,
      eventName: "GRAND PRIX OF BRAZIL",
      circuitName: "Autódromo Internacional de Goiânia - Ayrton Senna",
      countryCode: "BR",
      dateStart: new Date("2026-03-20T00:00:00Z"),
      dateEnd: new Date("2026-03-22T00:00:00Z"),
      status: "FINISHED"
    },
    {
      externalId: "782c929d-faaf-44e2-9d6f-0fde033855be",
      championship: "MotoGP",
      seasonYear: 2026,
      eventName: "GRAND PRIX OF THE UNITED STATES",
      circuitName: "Circuit Of The Americas",
      countryCode: "US",
      dateStart: new Date("2026-03-27T00:00:00Z"),
      dateEnd: new Date("2026-03-29T00:00:00Z"),
      status: "FINISHED"
    },
    {
      externalId: "506917f4-179d-4e1d-b750-805c15bab8d7",
      championship: "MotoGP",
      seasonYear: 2026,
      eventName: "GRAND PRIX OF SPAIN",
      circuitName: "Circuito de Jerez - Ángel Nieto",
      countryCode: "ES",
      dateStart: new Date("2026-04-24T00:00:00Z"),
      dateEnd: new Date("2026-04-26T00:00:00Z"),
      status: "FINISHED"
    },
    {
      externalId: "edcfdba3-7a1f-44f3-8fe8-1f8a6609770c",
      championship: "MotoGP",
      seasonYear: 2026,
      eventName: "GRAND PRIX DE FRANCE",
      circuitName: "Le Mans",
      countryCode: "FR",
      dateStart: new Date("2026-05-08T00:00:00Z"),
      dateEnd: new Date("2026-05-10T00:00:00Z"),
      status: "FINISHED"
    },
    {
      externalId: "a0251657-afe5-4d90-a66f-d4779babd571",
      championship: "MotoGP",
      seasonYear: 2026,
      eventName: "GRAND PRIX OF CATALONIA",
      circuitName: "Circuit de Barcelona-Catalunya",
      countryCode: "ES",
      dateStart: new Date("2026-05-15T00:00:00Z"),
      dateEnd: new Date("2026-05-17T00:00:00Z"),
      status: "FINISHED"
    },
    {
      externalId: "dd266adb-3930-4099-a3d1-a9807362f048",
      championship: "MotoGP",
      seasonYear: 2026,
      eventName: "GRAND PRIX OF ITALY",
      circuitName: "Autodromo Internazionale del Mugello",
      countryCode: "IT",
      dateStart: new Date("2026-05-29T00:00:00Z"),
      dateEnd: new Date("2026-05-31T00:00:00Z"),
      status: "FINISHED"
    },
    {
      externalId: "4bd780c9-9da4-48c6-a69f-ebfd6bf8a425",
      championship: "MotoGP",
      seasonYear: 2026,
      eventName: "GRAND PRIX OF HUNGARY",
      circuitName: "Balaton Park Circuit",
      countryCode: "HU",
      dateStart: new Date("2026-06-05T00:00:00Z"),
      dateEnd: new Date("2026-06-07T00:00:00Z"),
      status: "FINISHED"
    },
    {
      externalId: "f9d2e80c-431b-485f-afcf-671950648ad7",
      championship: "MotoGP",
      seasonYear: 2026,
      eventName: "GRAND PRIX OF CZECHIA",
      circuitName: "CREDITAS Autodrom Brno",
      countryCode: "CZ",
      dateStart: new Date("2026-06-19T00:00:00Z"),
      dateEnd: new Date("2026-06-21T00:00:00Z"),
      status: "FINISHED"
    },
    {
      externalId: "83804cb1-a417-4213-b727-37f84b26d36e",
      championship: "MotoGP",
      seasonYear: 2026,
      eventName: "GRAND PRIX OF THE NETHERLANDS",
      circuitName: "TT Circuit Assen",
      countryCode: "NL",
      dateStart: new Date("2026-06-26T00:00:00Z"),
      dateEnd: new Date("2026-06-28T00:00:00Z"),
      status: "FINISHED"
    },
    {
      externalId: "b26a84f7-2d9b-4cc5-a3e5-3d1abe916d8c",
      championship: "MotoGP",
      seasonYear: 2026,
      eventName: "GRAND PRIX OF GERMANY",
      circuitName: "Sachsenring",
      countryCode: "DE",
      dateStart: new Date("2026-07-10T00:00:00Z"),
      dateEnd: new Date("2026-07-12T00:00:00Z"),
      status: "FINISHED"
    },
    {
      externalId: "6a16e0cb-ef4b-44b1-92e5-2e958cca0815",
      championship: "MotoGP",
      seasonYear: 2026,
      eventName: "GRAND PRIX OF GREAT BRITAIN",
      circuitName: "Silverstone Circuit",
      countryCode: "GB",
      dateStart: new Date("2026-08-07T00:00:00Z"),
      dateEnd: new Date("2026-08-09T00:00:00Z"),
      status: "UPCOMING"
    },
    {
      externalId: "23b7a561-17e4-4aa6-9be3-2529a5b69938",
      championship: "MotoGP",
      seasonYear: 2026,
      eventName: "GRAND PRIX OF ARAGON",
      circuitName: "MotorLand Aragón",
      countryCode: "ES",
      dateStart: new Date("2026-08-28T00:00:00Z"),
      dateEnd: new Date("2026-08-30T00:00:00Z"),
      status: "UPCOMING"
    },
    {
      externalId: "a5881826-ec88-4a41-8e4c-ba58709d4591",
      championship: "MotoGP",
      seasonYear: 2026,
      eventName: "GRAND PRIX OF SAN MARINO",
      circuitName: "Misano World Circuit Marco Simoncelli",
      countryCode: "SM",
      dateStart: new Date("2026-09-11T00:00:00Z"),
      dateEnd: new Date("2026-09-13T00:00:00Z"),
      status: "UPCOMING"
    },
    {
      externalId: "e191f3f6-218b-4a1c-bbd2-3ed8b5135683",
      championship: "MotoGP",
      seasonYear: 2026,
      eventName: "GRAND PRIX OF AUSTRIA",
      circuitName: "Red Bull Ring - Spielberg",
      countryCode: "AT",
      dateStart: new Date("2026-09-18T00:00:00Z"),
      dateEnd: new Date("2026-09-20T00:00:00Z"),
      status: "UPCOMING"
    },
    {
      externalId: "5a671255-63ca-46e2-bd60-34134bb063b4",
      championship: "MotoGP",
      seasonYear: 2026,
      eventName: "GRAND PRIX OF JAPAN",
      circuitName: "Mobility Resort Motegi",
      countryCode: "JP",
      dateStart: new Date("2026-10-02T00:00:00Z"),
      dateEnd: new Date("2026-10-04T00:00:00Z"),
      status: "UPCOMING"
    },
    {
      externalId: "275ca55d-45d3-440f-ad59-17d6b3e6b2d3",
      championship: "MotoGP",
      seasonYear: 2026,
      eventName: "GRAND PRIX OF INDONESIA",
      circuitName: "Pertamina Mandalika Circuit",
      countryCode: "ID",
      dateStart: new Date("2026-10-09T00:00:00Z"),
      dateEnd: new Date("2026-10-11T00:00:00Z"),
      status: "UPCOMING"
    },
    {
      externalId: "c1dea7a7-e35e-4363-9e28-7997e3bc6fbf",
      championship: "MotoGP",
      seasonYear: 2026,
      eventName: "GRAND PRIX OF AUSTRALIA",
      circuitName: "Phillip Island",
      countryCode: "AU",
      dateStart: new Date("2026-10-23T00:00:00Z"),
      dateEnd: new Date("2026-10-25T00:00:00Z"),
      status: "UPCOMING"
    },
    {
      externalId: "ea2ba334-b943-462f-aedb-084ac38408d1",
      championship: "MotoGP",
      seasonYear: 2026,
      eventName: "GRAND PRIX OF MALAYSIA",
      circuitName: "Petronas Sepang International Circuit",
      countryCode: "MY",
      dateStart: new Date("2026-10-30T00:00:00Z"),
      dateEnd: new Date("2026-11-01T00:00:00Z"),
      status: "UPCOMING"
    },
    {
      externalId: "5a880aba-62c4-413c-bb2d-b721683dd064",
      championship: "MotoGP",
      seasonYear: 2026,
      eventName: "GRAND PRIX OF QATAR",
      circuitName: "Lusail International Circuit",
      countryCode: "QA",
      dateStart: new Date("2026-11-06T00:00:00Z"),
      dateEnd: new Date("2026-11-08T00:00:00Z"),
      status: "UPCOMING"
    },
    {
      externalId: "4b3882a8-24b2-4321-aa12-d1847c989438",
      championship: "MotoGP",
      seasonYear: 2026,
      eventName: "GRAND PRIX OF PORTUGAL",
      circuitName: "Autódromo Internacional do Algarve",
      countryCode: "PT",
      dateStart: new Date("2026-11-20T00:00:00Z"),
      dateEnd: new Date("2026-11-22T00:00:00Z"),
      status: "UPCOMING"
    },
    {
      externalId: "723031d1-27bd-4467-b59c-4cb8f7e081ab",
      championship: "MotoGP",
      seasonYear: 2026,
      eventName: "GRAND PRIX OF VALENCIA",
      circuitName: "Circuit Ricardo Tormo",
      countryCode: "ES",
      dateStart: new Date("2026-11-27T00:00:00Z"),
      dateEnd: new Date("2026-11-29T00:00:00Z"),
      status: "UPCOMING"
    }
  ];

  for (const evt of EVENTS_2026) {
    await prisma.calendarioEventos.create({
      data: evt
    });
  }
  console.log("Calendário de Eventos semeado com sucesso!");

  // 7. Semear Resultados do GP da Tailândia
  const THAILAND_RESULTS = [
    { position: 1, riderName: "Marco Bezzecchi", riderNumber: 72, teamName: "Aprilia Racing", constructorName: "Aprilia", timeResult: "39:36.270", timeGap: "0.000", pointsEarned: 25, totalLaps: 26, status: "INSTND" },
    { position: 2, riderName: "Pedro Acosta", riderNumber: 37, teamName: "Red Bull KTM Factory Racing", constructorName: "KTM", timeResult: "39:41.813", timeGap: "5.543", pointsEarned: 20, totalLaps: 26, status: "INSTND" },
    { position: 3, riderName: "Raul Fernandez", riderNumber: 25, teamName: "Trackhouse MotoGP Team", constructorName: "Aprilia", timeResult: "39:45.529", timeGap: "9.259", pointsEarned: 16, totalLaps: 26, status: "INSTND" },
    { position: 4, riderName: "Jorge Martin", riderNumber: 89, teamName: "Aprilia Racing", constructorName: "Aprilia", timeResult: "39:48.452", timeGap: "12.182", pointsEarned: 13, totalLaps: 26, status: "INSTND" },
    { position: 5, riderName: "Ai Ogura", riderNumber: 79, teamName: "Trackhouse MotoGP Team", constructorName: "Aprilia", timeResult: "39:48.681", timeGap: "12.411", pointsEarned: 11, totalLaps: 26, status: "INSTND" },
    { position: 6, riderName: "Fabio Di Giannantonio", riderNumber: 49, teamName: "Pertamina Enduro VR46 Racing Team", constructorName: "Ducati", timeResult: "39:53.115", timeGap: "16.845", pointsEarned: 10, totalLaps: 26, status: "INSTND" },
    { position: 7, riderName: "Brad Binder", riderNumber: 33, teamName: "Red Bull KTM Factory Racing", constructorName: "KTM", timeResult: "39:53.633", timeGap: "17.363", pointsEarned: 9, totalLaps: 26, status: "INSTND" },
    { position: 8, riderName: "Franco Morbidelli", riderNumber: 21, teamName: "Pertamina Enduro VR46 Racing Team", constructorName: "Ducati", timeResult: "39:54.497", timeGap: "18.227", pointsEarned: 8, totalLaps: 26, status: "INSTND" },
    { position: 9, riderName: "Francesco Bagnaia", riderNumber: 63, teamName: "Ducati Lenovo Team", constructorName: "Ducati", timeResult: "39:54.610", timeGap: "18.340", pointsEarned: 7, totalLaps: 26, status: "INSTND" },
    { position: 10, riderName: "Luca Marini", riderNumber: 10, teamName: "Honda HRC Castrol", constructorName: "Honda", timeResult: "39:55.371", timeGap: "19.101", pointsEarned: 6, totalLaps: 26, status: "INSTND" },
    { position: 11, riderName: "Johann Zarco", riderNumber: 5, teamName: "Castrol Honda LCR", constructorName: "Honda", timeResult: "39:56.173", timeGap: "19.903", pointsEarned: 5, totalLaps: 26, status: "INSTND" },
    { position: 12, riderName: "Enea Bastianini", riderNumber: 23, teamName: "Red Bull KTM Tech3", constructorName: "KTM", timeResult: "39:59.656", timeGap: "23.386", pointsEarned: 4, totalLaps: 26, status: "INSTND" },
    { position: 13, riderName: "Diogo Moreira", riderNumber: 11, teamName: "Pro Honda LCR", constructorName: "Honda", timeResult: "40:00.956", timeGap: "24.686", pointsEarned: 3, totalLaps: 26, status: "INSTND" },
    { position: 14, riderName: "Fabio Quartararo", riderNumber: 20, teamName: "Monster Energy Yamaha MotoGP Team", constructorName: "Yamaha", timeResult: "40:07.093", timeGap: "30.823", pointsEarned: 2, totalLaps: 26, status: "INSTND" },
    { position: 15, riderName: "Alex Rins", riderNumber: 42, teamName: "Monster Energy Yamaha MotoGP Team", constructorName: "Yamaha", timeResult: "40:09.225", timeGap: "32.955", pointsEarned: 1, totalLaps: 26, status: "INSTND" },
    { position: 16, riderName: "Maverick Viñales", riderNumber: 12, teamName: "Red Bull KTM Tech3", constructorName: "KTM", timeResult: "40:12.815", timeGap: "36.545", pointsEarned: 0, totalLaps: 26, status: "INSTND" },
    { position: 17, riderName: "Toprak Razgatlioglu", riderNumber: 7, teamName: "Prima Pramac Yamaha MotoGP", constructorName: "Yamaha", timeResult: "40:15.464", timeGap: "39.194", pointsEarned: 0, totalLaps: 26, status: "INSTND" },
    { position: 18, riderName: "Jack Miller", riderNumber: 43, teamName: "Prima Pramac Yamaha MotoGP", constructorName: "Yamaha", timeResult: "40:24.118", timeGap: "47.848", pointsEarned: 0, totalLaps: 26, status: "INSTND" },
    { position: 19, riderName: "Michele Pirro", riderNumber: 51, teamName: "BK8 Gresini Racing MotoGP", constructorName: "Ducati", timeResult: "40:39.868", timeGap: "63.598", pointsEarned: 0, totalLaps: 26, status: "INSTND" },
    { position: null, riderName: "Joan Mir", riderNumber: 36, teamName: "Honda HRC Castrol", constructorName: "Honda", timeResult: "36:04.638", timeGap: "0.000", pointsEarned: 0, totalLaps: 23, status: "OUTSTND" },
    { position: null, riderName: "Alex Marquez", riderNumber: 73, teamName: "BK8 Gresini Racing MotoGP", constructorName: "Ducati", timeResult: "32:07.163", timeGap: "0.000", pointsEarned: 0, totalLaps: 21, status: "OUTSTND" },
    { position: null, riderName: "Marc Marquez", riderNumber: 93, teamName: "Ducati Lenovo Team", constructorName: "Ducati", timeResult: "30:25.913", timeGap: "0.000", pointsEarned: 0, totalLaps: 20, status: "OUTSTND" }
  ];

  for (const res of THAILAND_RESULTS) {
    await prisma.resultadosEtapas.create({
      data: {
        eventExternalId: "motogp-2026-tha",
        sessionType: "RAC",
        ...res
      }
    });
    // Também insere com a UUID oficial do evento
    await prisma.resultadosEtapas.create({
      data: {
        eventExternalId: "f3fd8ba7-2966-46bd-8687-b92047f5e733",
        sessionType: "RAC",
        ...res
      }
    });
  }
  console.log("Resultados da Etapa semeados!");

  // 8. Semear Ranking de Pilotos MotoGP 2026
  const RANKING_2026 = [
    { position: 1, riderName: "Marco Bezzecchi", teamName: "Aprilia Racing", constructor: "Aprilia", points: 185 },
    { position: 2, riderName: "Pedro Acosta", teamName: "Red Bull KTM Factory Racing", constructor: "KTM", points: 162 },
    { position: 3, riderName: "Jorge Martin", teamName: "Aprilia Racing", constructor: "Aprilia", points: 155 },
    { position: 4, riderName: "Marc Marquez", teamName: "Ducati Lenovo Team", constructor: "Ducati", points: 148 },
    { position: 5, riderName: "Francesco Bagnaia", teamName: "Ducati Lenovo Team", constructor: "Ducati", points: 140 },
    { position: 6, riderName: "Fabio Di Giannantonio", teamName: "Pertamina Enduro VR46 Racing Team", constructor: "Ducati", points: 112 },
    { position: 7, riderName: "Enea Bastianini", teamName: "Red Bull KTM Tech3", constructor: "KTM", points: 98 },
    { position: 8, riderName: "Brad Binder", teamName: "Red Bull KTM Factory Racing", constructor: "KTM", points: 89 },
    { position: 9, riderName: "Franco Morbidelli", teamName: "Pertamina Enduro VR46 Racing Team", constructor: "Ducati", points: 81 },
    { position: 10, riderName: "Raul Fernandez", teamName: "Trackhouse MotoGP Team", constructor: "Aprilia", points: 76 }
  ];

  for (const rk of RANKING_2026) {
    await prisma.rankingPilotos.create({
      data: {
        championship: "MotoGP",
        seasonYear: 2026,
        ...rk
      }
    });
  }
  console.log("Ranking de Pilotos semeado!");

  console.log("Semeadura concluída com sucesso!");
}

main()
  .catch((e) => {
    console.error("Erro durante semeadura:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

