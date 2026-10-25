/**
 * CONFIGURAÇÃO CENTRAL DO SITE
 * Altere textos, preços, imagens, links e VSL aqui — sem mexer nos componentes.
 * Campos com `null` ou vazios ocultam o elemento correspondente.
 */
import heroAsset from "@/assets/hero-deveu.webp.asset.json";
import logoAsset from "@/assets/logo-crop.png.asset.json";
import mkAmazon from "@/assets/mk-amazon.svg.asset.json";
import mkMeli from "@/assets/mk-mercadolivre.svg.asset.json";
import mkShopee from "@/assets/mk-shopee.svg.asset.json";
import mkAli from "@/assets/mk-aliexpress.svg.asset.json";
import seloVerificado from "@/assets/selo-verificado.png.asset.json";
import samsungProducts from "@/assets/samsung-products.png.asset.json";
import xiaomiProducts from "@/assets/xiaomi-products.png.asset.json";
import cliente1 from "@/assets/premiados-cliente-1.png.asset.json";
import cliente2 from "@/assets/premiados-cliente-2.png.asset.json";
import cliente3 from "@/assets/premiados-cliente-3.png.asset.json";
import cliente4 from "@/assets/premiados-cliente-4.png.asset.json";
import cliente5 from "@/assets/premiados-cliente-5.png.asset.json";
import cliente6 from "@/assets/premiados-cliente-6.png.asset.json";
import cliente7 from "@/assets/premiados-cliente-7.png.asset.json";
import cliente8 from "@/assets/premiados-cliente-8.png.asset.json";
import lojaFisica from "@/assets/loja-fisica.png.asset.json";
import iguatemi from "@/assets/iguatemi.jpg.asset.json";
import appleProducts from "@/assets/apple-products.png.asset.json";
import jblStanleyProducts from "@/assets/jbl-stanley-products.png.asset.json";
import caixaBronze from "@/assets/caixa-bronze.webp.asset.json";
import caixaPrata from "@/assets/caixa-prata-products.png.asset.json";
import caixaOuro from "@/assets/caixa-ouro-products.png.asset.json";
const heroImg = heroAsset.url;

// ---- Links de checkout (deixe "" até ter os links reais) ----
export const checkoutBronze = "";
export const checkoutPrata = "";
export const checkoutOuro = "";

export const site = {
  tracking: {
    pixelId: "6adbbd31478ccebe7379ce7a",
    pixelScript: "https://cdn.utmify.com.br/scripts/pixel/pixel.js",
    utmScript: "https://cdn.utmify.com.br/scripts/utms/latest.js",
  },
  brand: {
    name: "Deveu Perdeu", // nome exibido no cabeçalho e rodapé
    logo: logoAsset.url as string | null, // URL/import do logo; null = logotipo em texto
    email: "sac@deveuperdeuoficial.com",
    legalName: "", // razão social (opcional)
    cnpj: "", // CNPJ (opcional)
  },

  topBar: "🔥 **Frete grátis** para todo o Brasil · Envio em até 24h",
  headerBadge: "Site oficial · 100% seguro",
  headerBadgeIcon: seloVerificado.url as string | null, // selo ao lado do badge (null = ícone de cadeado)
  headerCta: "Escolher minha caixa",

  hero: {
    badge: "+30.000 caixas entregues no Brasil",
    titleStart: "Os melhores produtos em",
    titleHighlight: "caixas surpresa",
    subtitle:
      "Podem vir **iPhone, JBL, Stanley, smartwatch** e muito mais. Produtos de devoluções e excesso de estoque — totalmente aleatórios.",
    cta: "Quero minha caixa",
    ctaNote: "A partir de R$ 49,70",
    image: heroImg,
    // Logos flutuantes nas laterais do hero (envie as imagens e coloque em `logo`)
    marketplaces: [
      { name: "Amazon", logo: mkAmazon.url as string, side: "left", top: "18%", rotate: -12 },
      { name: "Mercado Livre", logo: mkMeli.url as string, side: "left", top: "62%", rotate: 10 },
      { name: "Shopee", logo: mkShopee.url as string, side: "right", top: "12%", rotate: 14 },
      { name: "AliExpress", logo: mkAli.url as string, side: "right", top: "60%", rotate: -14 },
    ],
    // Informações curtas abaixo do CTA (use apenas dados confirmados)
    stats: [
      { value: "+10 anos", label: "no mercado" },
      { value: "até 10x", label: "o valor pago" },
      { value: "30 dias", label: "de garantia" },
    ],
  },

  trustBar: [
    { icon: "shield", title: "Site oficial", text: "Ambiente seguro" },
    { icon: "lock", title: "Compra segura", text: "Dados protegidos" },
    { icon: "zap", title: "Envio rápido", text: "Em até 24h" },
  ],

  vsl: {
    eyebrow: "Depoimento real",
    titleStart: "Nossos clientes ganharam um",
    titleHighlight: "Smart Watch e um AirPods Max",
    titleEnd: "da Apple",
    description:
      "Veja a reação de quem abriu a caixa. Cada pedido é montado com produtos lacrados vindos de lotes arrematados.",
    benefits: [
      "Produtos novos, lacrados e com garantia",
      "Cada produto pode valer até 10x o preço da caixa",
      "Código de rastreio enviado em até 24h",
    ],
    // Tipo do vídeo: "mp4" | "youtube" | "embed" | "vturb" | null (placeholder)
    type: "vturb" as null | "mp4" | "youtube" | "embed" | "vturb",
    src: "https://scripts.converteai.net/a5e18b5b-cadf-493a-90ca-c64211c2a5d5/players/6adbab264b8512e83db63ac1/v4/player.js", // URL do MP4, ID/URL do YouTube, URL do iframe ou script do VTurb
    playerId: "6adbab264b8512e83db63ac1", // só para vturb
    poster: "" as string, // imagem de capa (opcional)
    aspect: "9/16", // proporção do vídeo: "9/16" vertical ou "16/9"
  },

  howItWorks: {
    eyebrow: "Como funciona",
    titleA: "Você escolhe o",
    hlA: "peso",
    titleB: "A gente surpreende no",
    hlB: "valor",
    image: lojaFisica.url, // foto da loja/estoque (proporção 16/9)
    boxTitle: "Direto dos lotes para a sua caixa",
    boxText:
      "Os produtos vão diretamente dos lotes arrematados para o **interior das caixas de forma aleatória até atingir o peso correto.**",
    weights: [
      { kg: "1 kg", name: "Bronze" },
      { kg: "3 kg", name: "Prata" },
      { kg: "5 kg", name: "Ouro" },
    ],
    originTitle: "De onde vêm os produtos?",
    originText:
      "Produtos provenientes de devoluções e excedentes de estoque de grandes marketplaces e operações logísticas, como **Amazon, Mercado Livre, AliExpress, Shopee e Correios**.",
    originText2: "Cada caixa é vendida **por quilo** e garantimos que você pode receber produtos que valem até **3x mais do que pagou**.",
  },

  brands: [
    { rank: "Nº 1", name: "Apple", image: appleProducts.url },
    { rank: "Nº 2", name: "Samsung", image: samsungProducts.url },
    { rank: "Nº 3", name: "Xiaomi", image: xiaomiProducts.url },
    { rank: "Nº 4", name: "JBL e Stanley", image: jblStanleyProducts.url },
  ],

  testimonials: {
    eyebrow: "Clientes premiados",
    titleStart: "Nossos clientes saem",
    titleHighlight: "sempre ganhando",
    text: "A cada **3 caixas**, existe a possibilidade real de sair um celular! Uma surpresa que pode transformar o seu pedido **num achado incrível**.",
    // Imagens verticais (proporção 3/4). Vazio = placeholder.
    images: [
      cliente1.url,
      cliente2.url,
      cliente3.url,
      cliente4.url,
      cliente5.url,
      cliente6.url,
      cliente7.url,
      cliente8.url,
    ] as string[],
  },

  store: {
    image: iguatemi.url, // foto da fachada (proporção ~3/2)
    tag: "Shopping Iguatemi · Ribeirão Preto",
    title: "Compre online e retire na loja",
    text: "A Deveu Perdeu está localizada em **Ribeirão Preto, no Shopping Iguatemi.** Caso prefira, você pode retirar seu pedido diretamente no local.",
    text2: "Não é da região? Sem problema: **enviamos para todo o Brasil** com praticidade, segurança e rapidez.",
  },

  pricing: {
    eyebrow: "Oferta de hoje",
    titleStart: "Escolha sua caixa e",
    titleHighlight: "se surpreenda",
    subtitle: "Até **67% de desconto** e frete grátis para todo o Brasil.",
    // Promoção real: ative e informe o prazo para exibir preço "de/por" e contador
    promoActive: true,
    // "daily-midnight" = zera todo dia à meia-noite; ou uma data fixa: "2026-12-31T23:59:59-03:00"
    promoEndsAt: "daily-midnight" as string | null,
    guarantees: [
      { icon: "shield", text: "Pagamento seguro via Pix" },
      { icon: "rotate", text: "Devolução conforme o CDC" },
      { icon: "truck", text: "Rastreio em até 24h" },
    ],
  },

  plans: [
    {
      id: "bronze",
      name: "Caixa Bronze",
      tagline: "Para quem quer experimentar",
      weight: "1 kg",
      image: caixaBronze.url,
      benefits: ["1 kg de produtos surpresa", "Cada produto vale até 3x o preço", "Garantia de 30 dias"],
      oldPrice: 129.9,
      price: 49.7,
      featured: false,
      cta: "Quero a Bronze",
      checkout: checkoutBronze,
    },
    {
      id: "prata",
      name: "Caixa Prata",
      tagline: "A escolha da maioria dos clientes",
      weight: "3 kg",
      image: caixaPrata.url,
      benefits: [
        "3 kg de produtos surpresa",
        "Cada produto vale até 5x o preço",
        "Mais chances de eletrônicos",
        "Garantia de 30 dias",
      ],
      oldPrice: 199.0,
      price: 79.9,
      featured: true,
      featuredLabel: "Mais vendida",
      cta: "Quero a Prata",
      checkout: checkoutPrata,
    },
    {
      id: "ouro",
      name: "Caixa Ouro",
      tagline: "Para quem quer muitos produtos",
      weight: "5 kg",
      image: caixaOuro.url,
      benefits: ["5 kg de produtos surpresa", "Cada produto vale até 10x o preço", "Garantia de 30 dias"],
      oldPrice: 299.0,
      price: 99.9,
      featured: false,
      cta: "Quero a Ouro",
      checkout: checkoutOuro,
    },
  ],

  faq: [
    { q: "O que pode vir dentro da caixa?", a: "Eletrônicos, acessórios, gadgets, itens de tecnologia e muito mais! O conteúdo é sempre surpresa e o valor dos produtos é superior ao que você paga." },
    { q: "Posso escolher o que vem?", a: "Não! Essa é a graça da caixa surpresa. Você não sabe o que vai receber, mas garantimos que vai adorar!" },
    { q: "Tem chance de vir celular?", a: "Sim! Algumas caixas podem conter celulares e outros eletrônicos de alto valor. Quanto maior a caixa, maiores as chances!" },
    { q: "Quanto tempo demora pra chegar?", a: "O prazo de entrega varia de 2 a 7 dias úteis, dependendo da sua região. Você recebe o código de rastreio assim que o pedido é enviado, tudo em menos de 24 horas." },
    { q: "Posso comprar mais de uma caixa?", a: "Claro! Você pode comprar quantas caixas quiser. Cada uma terá itens diferentes!" },
    { q: "Como funciona o pagamento?", a: "Aceitamos PIX, cartão de crédito. O pagamento é 100% seguro." },
    { q: "Eu descubro o que ganhei na hora?", a: "Não, a surpresa só é revelada quando você abre a caixa! Faz parte da experiência." },
    { q: "Os produtos são novos?", a: "Sim, todos os produtos são novos, lacrados e com garantia." },
    { q: "Posso devolver se não gostar?", a: "Sim! Você tem até 30 dias para solicitar a devolução caso não fique satisfeito. Basta entrar em contato com nosso suporte e iniciaremos o processo de troca ou reembolso. Sua satisfação é nossa prioridade!" },
    { q: "Qual a garantia dos produtos?", a: "Todos os produtos possuem garantia de até 30 dias. Se houver qualquer defeito ou problema, entre em contato conosco e resolveremos rapidamente para você." },
    { q: "O frete é grátis?", a: "Sim! O frete é 100% grátis para todo o Brasil. Não importa onde você esteja, sua caixa surpresa chega até você sem nenhum custo adicional de envio." },
    { q: "Sobre nós", a: "A Deveu Perdeu é a maior empresa de caixas surpresas do Brasil, atuando há mais de 10 anos no mercado. Nossos produtos vêm de leilões dos Correios, arrematados bem abaixo do valor por meio de produtos taxados e não pagos, além de liquidações de grandes marcas como Amazon, Mercado Livre, AliExpress e Shopee. Todos os produtos são novos e lacrados. Já entregamos mais de 30 mil encomendas em todo o país, levando surpresa e satisfação para milhares de clientes!" },
    { q: "Como entrar em contato?", a: "Você pode falar com a gente pelo e-mail sac@deveuperdeuoficial.com. Nossa equipe está pronta para te ajudar com qualquer dúvida, troca ou suporte. Respondemos em até 24 horas!" },
  ],

  footerCard: {
    title: "Loja oficial verificada",
    text: "Mais de **30.000 encomendas** entregues em todo o Brasil com satisfação garantida.",
    items: ["Produtos originais", "Compra segura", "Frete grátis"],
  },

  // ---- CHECKOUT (/checkout?plano=bronze|prata|ouro) ----
  checkout: {
    notice: "Preencha as informações corretamente para envio do código de rastreio.",
    secureLabel: "Pagamento 100% seguro",
    // icon: "gift" | "truck" | "pin" | "zap"; enabled: false oculta a opção
    shipping: [
      { id: "gratis", icon: "gift", name: "Frete Grátis", detail: "4 a 7 dias úteis", price: 0, highlight: false, enabled: true },
      { id: "jadlog", icon: "truck", name: "JadLog", detail: "3 a 5 dias úteis", price: 9.9, highlight: false, enabled: true },
      { id: "retirada", icon: "pin", name: "Retirada no Shopping Iguatemi", detail: "Ribeirão Preto · retire no mesmo dia", price: 0, highlight: false, enabled: true },
      { id: "full", icon: "zap", name: "Full 24hrs", detail: "Entrega em 24 horas", price: 19.9, highlight: true, enabled: true },
    ],
    // enabled: false mostra a opção como indisponível
    upgrades: [
      { id: "premium", name: "Upgrade Premium", detail: "Produto premium garantido na caixa", price: 19.9, enabled: true },
      { id: "dobro", name: "Caixa em Dobro", detail: "Recebe o dobro de produtos na caixa", price: 25.9, enabled: true },
      { id: "iphone", name: "Um iPhone Garantido", detail: "Um iPhone garantido dentro da sua caixa", price: 79.0, enabled: true },
    ],
    // Roleta de bônus ao finalizar. kind: "shipping" (frete 24h grátis), "upgrade" (premium grátis),
    // "discount" (valor em R$ off), "gift" (brinde extra). weight = chance relativa de sair.
    roulette: {
      prizes: [
        { id: "frete", label: "Frete 24h grátis", title: "Frete 24h grátis", text: "Entrega Full 24hrs sem custo.", kind: "shipping", value: 0, weight: 1 },
        { id: "premium", label: "Upgrade Premium", title: "Upgrade Premium grátis", text: "Produto premium garantido na sua caixa, sem custo.", kind: "upgrade", value: 0, weight: 1 },
        { id: "desconto", label: "R$ 10 off", title: "R$ 10 de desconto", text: "Desconto aplicado no total do pedido.", kind: "discount", value: 10, weight: 1 },
        { id: "brinde", label: "Brinde extra", title: "Brinde extra", text: "Um brinde a mais dentro da sua caixa.", kind: "gift", value: 0, weight: 1 },
      ],
      teaser: [
        { name: "iPhone", image: appleProducts.url },
        { name: "JBL", image: jblStanleyProducts.url },
        { name: "Samsung", image: samsungProducts.url },
        { name: "Xiaomi", image: xiaomiProducts.url },
      ],
    },
    pixTitle: "PIX — Aprovação imediata",
    pixText: "Pague com PIX e receba a confirmação após a aprovação do pagamento.",
    // Página para onde o cliente é levado automaticamente após o PIX ser confirmado
    paidRedirectUrl: "https://devsperdeobrigado.vercel.app/",
    trust: [
      { icon: "shield", title: "Compra Segura", text: "Pagamento protegido" },
      { icon: "zap", title: "Envio rápido", text: "Pedidos enviados em até 24h" },
      { icon: "lock", title: "Site oficial", text: "Ambiente 100% seguro" },
    ],
  },
};

export type Plan = (typeof site.plans)[number] & { featuredLabel?: string };
