import { expect, test, type Page } from "@playwright/test";

/**
 * A segunda trilha. O que muda no site quando um tema vive em duas trilhas:
 * o progresso é um só, a URL canônica é uma só, e as telas de estudo
 * precisam saber de qual trilha são.
 */
const CHAVE = "lumarys.progresso.v1";
const AN = "/trilhas/engenharia-de-analytics/";
const ED = "/trilhas/engenharia-de-dados/";

async function semear(page: Page, trilhas: Record<string, Record<string, unknown>>) {
  await page.addInitScript(
    ([chave, dados]) => window.localStorage.setItem(chave as string, JSON.stringify(dados)),
    [
      CHAVE,
      {
        versao: 1,
        trilhas: Object.fromEntries(
          Object.entries(trilhas).map(([slug, extra]) => [
            slug,
            {
              iniciadaEm: 1,
              temasConcluidos: {},
              quizzes: {},
              preTestes: {},
              simulados: [],
              atualizadoEm: 1,
              ...extra,
            },
          ]),
        ),
        cards: {},
        streak: { atual: 0, recorde: 0, ultimoDia: null },
        minutosPorDia: {},
        atualizadoEm: 1,
      },
    ] as const,
  );
}

test("a trilha abre com Big Data, AWS e banco de dados, e o resto como 'em breve'", async ({
  page,
}) => {
  await page.goto(AN);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Engenharia de Analytics");
  await expect(page.getByText("32 temas", { exact: false }).first()).toBeVisible();

  // Cinco módulos que a ementa nomeia e ainda não têm tema. Aparecem, com o
  // resumo do que vão cobrir, mas não abrem nem oferecem checkpoint. AWS e
  // banco de dados já saíram de "em breve" e têm checkpoint próprio.
  await expect(page.getByText("em breve", { exact: true })).toHaveCount(2);
  // Seletor de DOM, e não papel: o link mora dentro do <details> do módulo, e
  // acordeão fechado fica fora da árvore de acessibilidade.
  await expect(page.locator('a[href$="/checkpoint/"]')).toHaveCount(6);
});

test("concluir um tema compartilhado em Dados conta em Analytics", async ({ page }) => {
  await page.goto(`${ED}fundamentos/big-data/`);
  await page.getByRole("button", { name: /concluir tema/i }).click();
  await expect(page.getByText("Tema concluído")).toBeVisible();

  await page.goto(AN);
  // Escopado ao módulo: o anel de progresso do topo mostra o mesmo "1/17".
  await expect(page.locator("#big-data").getByText("1/17")).toBeVisible();

  // E o contrário: quem estuda em Analytics também avança em Dados.
  const gravado = await page.evaluate((chave) => {
    const p = JSON.parse(window.localStorage.getItem(chave)!);
    return {
      ed: Boolean(p.trilhas["engenharia-de-dados"]?.temasConcluidos["big-data"]),
      an: Boolean(p.trilhas["engenharia-de-analytics"]?.temasConcluidos["big-data"]),
      ondeParei: p.trilhas["engenharia-de-analytics"]?.ultimoTema,
    };
  }, CHAVE);
  expect(gravado).toEqual({ ed: true, an: true, ondeParei: undefined });
});

test("o tema compartilhado em Analytics aponta a canônica para Dados", async ({ page }) => {
  await page.goto(`${AN}big-data/big-data/`);
  // A página existe e é a de Analytics (breadcrumb e vizinhos desta trilha)...
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Big Data");
  // ...mas o buscador é mandado para onde o tema nasceu.
  const canonica = await page.locator('head link[rel="canonical"]').getAttribute("href");
  expect(canonica).toBe(`https://lumarys.com.br${ED}fundamentos/big-data/`);
});

test("o tema novo é canônico em Analytics, que é a única trilha dele", async ({ page }) => {
  await page.goto(`${AN}big-data/source-of-record-vs-source-of-truth/`);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Source of Record");
  const canonica = await page.locator('head link[rel="canonical"]').getAttribute("href");
  expect(canonica).toBe(`https://lumarys.com.br${AN}big-data/source-of-record-vs-source-of-truth/`);
});

test("sitemap e feed não repetem o tema compartilhado", async ({ request }) => {
  const mapa = await (await request.get("/sitemap.xml")).text();
  const locs = [...mapa.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]!);
  expect(new Set(locs).size).toBe(locs.length);
  expect(locs.some((u) => u.endsWith(`${AN}big-data/big-data/`))).toBe(false);
  expect(locs.some((u) => u.endsWith(`${AN}big-data/source-of-record-vs-source-of-truth/`))).toBe(
    true,
  );

  const feed = await (await request.get("/feed.xml")).text();
  const ids = [...feed.matchAll(/<id>([^<]+)<\/id>/g)].map((m) => m[1]!);
  expect(new Set(ids).size).toBe(ids.length);
});

test("o Hoje é da trilha em que a pessoa mexeu por último", async ({ page }) => {
  // Só Analytics tem progresso: é ela que aparece, sem pedir.
  await semear(page, {
    "engenharia-de-analytics": { temasConcluidos: { "big-data": 1 }, atualizadoEm: 900 },
  });
  await page.goto("/hoje/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Engenharia de Analytics");

  // Com duas trilhas, dá para trocar; a pedida na URL vence o progresso.
  const seletor = page.getByRole("navigation", { name: "Trilha" });
  await expect(seletor.getByRole("link")).toHaveCount(3);
  await page.goto("/hoje/?trilha=engenharia-de-dados");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Engenharia de Dados");
});

test("sem progresso nenhum, o Hoje é da primeira trilha e o seletor existe", async ({ page }) => {
  await page.goto("/hoje/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Engenharia de Dados");
  await expect(page.getByRole("navigation", { name: "Trilha" })).toBeVisible();
});

test("o simulado respeita a trilha pedida e traz o prompt dela", async ({ page }) => {
  await page.goto("/simulado/?trilha=engenharia-de-analytics");
  await expect(page.getByRole("button", { name: "Big Data" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Fundamentos" })).toHaveCount(0);

  await page.getByText("Ver o texto").click();
  await expect(page.getByText(/engenharia de analytics/i).first()).toBeVisible();
});

test("a home mostra a segunda trilha e o catálogo não a lista mais como 'em breve'", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: /engenharia de analytics/i })).toBeVisible();

  await page.goto("/trilhas/");
  await expect(page.getByRole("link", { name: /engenharia de analytics/i })).toBeVisible();
  await expect(page.locator("details", { hasText: "Engenharia de Analytics" })).toHaveCount(0);
});
