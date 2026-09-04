import { expect, test, type Page } from "@playwright/test";

/**
 * O que buscador e agente de IA leem em cada página: imagem de
 * compartilhamento que existe de verdade, canônica com hreflang, versão
 * Markdown declarada, breadcrumbs visíveis e JSON-LD que valida.
 */
const TEMA = "/trilhas/engenharia-de-dados/spark/spark-introducao/";
const TRILHA = "/trilhas/engenharia-de-dados/";

async function meta(page: Page, seletor: string, atributo = "content") {
  return page.locator(`head ${seletor}`).first().getAttribute(atributo);
}

async function jsonLd(page: Page): Promise<Record<string, unknown>[]> {
  const textos = await page.locator('script[type="application/ld+json"]').allTextContents();
  return textos.map((t) => JSON.parse(t) as Record<string, unknown>);
}

for (const caminho of ["/", TRILHA, TEMA]) {
  test(`a imagem de compartilhamento de ${caminho} existe e é PNG`, async ({ page, request }) => {
    await page.goto(caminho);
    const og = await meta(page, 'meta[property="og:image"]');
    expect(og, "og:image ausente").toBeTruthy();
    const twitter = await meta(page, 'meta[name="twitter:image"]');
    expect(twitter, "twitter:image ausente").toBeTruthy();

    // A URL é absoluta (lumarys.com.br); o teste busca o mesmo caminho no
    // servidor local. A extensão importa: sem ela a borda trataria a imagem
    // como página e o S3 não saberia o tipo (scripts/og-extensao.mjs).
    const url = new URL(og!);
    expect(url.pathname.endsWith("/opengraph-image.png")).toBe(true);
    const resposta = await request.get(`${url.pathname}${url.search}`);
    expect(resposta.status()).toBe(200);
    expect(resposta.headers()["content-type"]).toContain("image/png");
    const corpo = await resposta.body();
    expect(corpo.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
  });
}

test("tema: canônica, hreflang pt-BR e link para a versão Markdown", async ({ page, request }) => {
  await page.goto(TEMA);

  expect(await meta(page, 'link[rel="canonical"]', "href")).toBe(`https://lumarys.com.br${TEMA}`);
  expect(await meta(page, 'link[rel="alternate"][hreflang="pt-BR"]', "href")).toBe(
    `https://lumarys.com.br${TEMA}`,
  );

  const markdown = await meta(page, 'link[rel="alternate"][type="text/markdown"]', "href");
  expect(markdown).toBe(`https://lumarys.com.br${TEMA}index.md`);
  const local = await request.get(`${TEMA}index.md`);
  expect(local.status()).toBe(200);
  expect(await local.text()).toContain("# Spark: introdução");

  await expect(page).toHaveTitle("Spark: introdução | Engenharia de Dados · Lumarys");
});

test("tema: breadcrumbs visíveis levam à trilha", async ({ page }) => {
  await page.goto(TEMA);
  const nav = page.getByRole("navigation", { name: "Você está em" });
  await expect(nav).toBeVisible();
  await expect(nav.getByRole("link", { name: "Trilhas" })).toBeVisible();
  await nav.getByRole("link", { name: "Engenharia de Dados" }).click();
  await expect(page).toHaveURL(new RegExp(`${TRILHA}$`));
});

test("tema: JSON-LD com breadcrumb, recurso de aprendizagem, vídeos datados e FAQ", async ({
  page,
}) => {
  await page.goto(TEMA);
  const dados = await jsonLd(page);
  const tipos = dados.map((d) => d["@type"]);
  expect(tipos).toEqual(expect.arrayContaining(["BreadcrumbList", "LearningResource", "FAQPage"]));

  const migalhas = dados.find((d) => d["@type"] === "BreadcrumbList") as {
    itemListElement: { name: string; item: string }[];
  };
  expect(migalhas.itemListElement.map((i) => i.name)).toEqual([
    "Início",
    "Trilhas",
    "Engenharia de Dados",
    "Spark",
    "Spark: introdução",
  ]);

  const recurso = dados.find((d) => d["@type"] === "LearningResource") as {
    video: { "@type": string; name: string; thumbnailUrl: string; uploadDate?: string }[];
  };
  expect(recurso.video.length).toBeGreaterThan(0);
  for (const v of recurso.video) {
    expect(v["@type"]).toBe("VideoObject");
    expect(v.name).toBeTruthy();
    expect(v.thumbnailUrl).toContain("i.ytimg.com");
    // Campo obrigatório do Google: sem ele o Rich Results Test aponta erro.
    expect(v.uploadDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  }

  const faq = dados.find((d) => d["@type"] === "FAQPage") as {
    mainEntity: { name: string; acceptedAnswer: { text: string } }[];
  };
  expect(faq.mainEntity.length).toBeGreaterThan(0);
  expect(faq.mainEntity[0]?.acceptedAnswer.text).toBeTruthy();
});

test("robots.txt libera os crawlers de IA e aponta o sitemap", async ({ request }) => {
  const texto = await (await request.get("/robots.txt")).text();
  for (const agente of [
    "GPTBot",
    "ClaudeBot",
    "Claude-SearchBot",
    "PerplexityBot",
    "Bingbot",
    "Applebot",
  ]) {
    expect(texto, `falta ${agente}`).toContain(`User-Agent: ${agente}`);
  }
  expect(texto).toContain("Sitemap: https://lumarys.com.br/sitemap.xml");
});

test("manifesto, favicon e ícones de app existem", async ({ page, request }) => {
  await page.goto("/");
  const manifesto = await meta(page, 'link[rel="manifest"]', "href");
  expect(manifesto).toBeTruthy();
  const resposta = await request.get(manifesto!);
  expect(resposta.status()).toBe(200);
  const dados = (await resposta.json()) as { icons: { src: string; purpose?: string }[] };
  expect(dados.icons.some((i) => i.purpose === "maskable")).toBe(true);
  for (const icone of dados.icons) {
    expect((await request.get(icone.src)).status(), icone.src).toBe(200);
  }
  expect((await request.get("/favicon.ico")).status()).toBe(200);
  const apple = await meta(page, 'link[rel="apple-touch-icon"]', "href");
  expect(apple).toBeTruthy();
  expect((await request.get(apple!)).status()).toBe(200);
});
