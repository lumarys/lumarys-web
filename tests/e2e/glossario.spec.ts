import { expect, test } from "@playwright/test";

/**
 * O componente `Termo` existia no MDX desde o começo e não alimentava página
 * nenhuma: 23 temas definiam vocabulário que só aparecia no meio do parágrafo
 * onde tinha sido escrito. Glossário e folha de véspera servem a dois públicos
 * que não se encontram — quem revisa na noite anterior e quem chega de busca.
 */
const TRILHA = "/trilhas/engenharia-de-dados";

test("o glossário lista os termos em ordem e liga cada um ao tema", async ({ page }) => {
  await page.goto(`${TRILHA}/glossario/`);

  await expect(page.getByRole("heading", { name: "Glossário", level: 1 })).toBeVisible();
  const verbetes = page.locator("dt");
  const quantos = await verbetes.count();
  expect(quantos).toBeGreaterThan(20);

  // Ordem alfabética de português, com acento no lugar certo.
  const nomes = await verbetes.allTextContents();
  const ordenados = [...nomes].sort((a, b) => a.localeCompare(b, "pt-BR"));
  expect(nomes).toEqual(ordenados);

  // Cada verbete tem definição e destino.
  const primeiro = page.locator("dl > div").first();
  await expect(primeiro.locator("dd").first()).not.toBeEmpty();
  await expect(primeiro.getByRole("link")).toBeVisible();
});

test("o glossário declara o conjunto de termos para buscador e agente", async ({ page }) => {
  await page.goto(`${TRILHA}/glossario/`);
  const blocos = await page.locator('script[type="application/ld+json"]').allTextContents();
  const conjunto = blocos
    .map((t) => JSON.parse(t) as Record<string, unknown>)
    .find((d) => d["@type"] === "DefinedTermSet");

  expect(conjunto).toBeTruthy();
  const termos = conjunto!.hasDefinedTerm as { name: string; description: string; url: string }[];
  expect(termos.length).toBeGreaterThan(20);
  expect(termos[0]!.url).toContain("/trilhas/engenharia-de-dados/");
});

test("a folha de revisão traz o que a véspera pede, sem interação", async ({ page }) => {
  await page.goto(`${TRILHA}/fundamentos/resumo/`);

  await expect(page.getByText(/folha de revisão · \d+ temas/i)).toBeVisible();
  await expect(page.getByText("Erros comuns").first()).toBeVisible();
  await expect(page.getByText(/^Como cai:/).first()).toBeVisible();

  // Nada para clicar além dos links: é uma folha, não uma tela.
  await expect(page.locator("#conteudo button")).toHaveCount(0);
});

test("impresso, sai sem a casca do app", async ({ page }) => {
  await page.goto(`${TRILHA}/fundamentos/resumo/`);
  await page.emulateMedia({ media: "print" });

  await expect(page.getByRole("banner")).toBeHidden();
  await expect(page.getByRole("navigation", { name: "Estudo", exact: true })).toBeHidden();
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

test("as rotas novas estão no sitemap", async ({ request }) => {
  const mapa = await (await request.get("/sitemap.xml")).text();
  expect(mapa).toContain("/trilhas/engenharia-de-dados/glossario/");
  expect(mapa).toContain("/trilhas/engenharia-de-dados/fundamentos/resumo/");
});
