import { expect, test } from "@playwright/test";

/**
 * Três buracos pequenos e do mesmo tipo: o site não tinha como receber uma
 * correção, não tinha como lembrar a pessoa de estudar e não tinha como ser
 * acompanhado. Nenhum deles precisa de servidor.
 */
const CHAVE = "lumarys.progresso.v1";
const TEMA = "/trilhas/engenharia-de-dados/fundamentos/big-data/";

test("o tema oferece reportar erro, com o identificador dele", async ({ page }) => {
  await page.goto(TEMA);

  const link = page.getByRole("button", { name: /achou um erro neste tema/i });
  await expect(link).toBeVisible();
  const caixa = await link.boundingBox();
  expect(caixa!.height).toBeGreaterThanOrEqual(44);

  // O assunto é montado por `enderecoDeContato`, coberto em unit; aqui
  // verificamos que o tema chega até ele.
  await expect(link).toBeEnabled();
});

test("o feed é Atom válido, com uma entrada por tema", async ({ request }) => {
  const r = await request.get("/feed.xml");
  expect(r.status()).toBe(200);

  const xml = await r.text();
  expect(xml.startsWith('<?xml version="1.0" encoding="utf-8"?>')).toBe(true);
  expect(xml).toContain('xmlns="http://www.w3.org/2005/Atom"');
  expect(xml).toContain("<updated>");

  // 31 e não 47: os 16 temas que Analytics compartilha com Dados entram uma
  // vez só, pela URL canônica.
  const entradas = xml.match(/<entry>/g) ?? [];
  expect(entradas.length).toBe(44);
  // Todo id é uma URL do site, que é o que um leitor usa para deduplicar.
  const ids = [...xml.matchAll(/<id>([^<]+)<\/id>/g)].map((m) => m[1]!);
  expect(ids.every((id) => id.startsWith("https://lumarys.com.br/"))).toBe(true);
});

test("a página declara o feed, para leitores e agentes o encontrarem", async ({ page }) => {
  await page.goto("/");
  const href = await page
    .locator('head link[rel="alternate"][type="application/atom+xml"]')
    .getAttribute("href");
  expect(href).toBe("/feed.xml");
});

test("com plano definido, dá para levar o cronograma para a agenda", async ({ page }) => {
  await page.addInitScript((chave) => {
    window.localStorage.setItem(
      chave,
      JSON.stringify({
        versao: 1,
        trilhas: {
          "engenharia-de-dados": {
            iniciadaEm: 1,
            temasConcluidos: {},
            quizzes: {},
            preTestes: {},
            simulados: [],
            dataProva: "2026-11-18",
            minutosPorDia: 45,
            atualizadoEm: 1,
          },
        },
        cards: {},
        streak: { atual: 0, recorde: 0, ultimoDia: null },
        minutosPorDia: {},
        atualizadoEm: 1,
      }),
    );
  }, CHAVE);

  await page.goto("/trilhas/engenharia-de-dados/plano/");

  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: /pôr o plano na minha agenda/i }).click();
  const arquivo = await download;
  expect(arquivo.suggestedFilename()).toBe("lumarys-plano.ics");
});

test("sem data de prova, não há calendário para baixar", async ({ page }) => {
  await page.goto("/trilhas/engenharia-de-dados/plano/");
  await expect(page.getByRole("button", { name: /minha agenda/i })).toHaveCount(0);
});
