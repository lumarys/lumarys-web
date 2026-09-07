import { expect, test } from "@playwright/test";

/**
 * O público estuda no deslocamento, que é exatamente onde a conexão falha. O
 * manifesto e os ícones existiam desde o começo, mas sem service worker o app
 * simplesmente não abria sem rede.
 *
 * O contexto é próprio em cada teste: `context.setOffline` afeta o contexto
 * inteiro, e o service worker precisa de um estado limpo para instalar.
 */
test("o service worker é gerado com casca e versão", async ({ request }) => {
  const r = await request.get("/sw.js");
  expect(r.status()).toBe(200);
  const corpo = await r.text();
  expect(corpo).toContain('const VERSAO = "');
  expect(corpo).toContain('"/hoje/"');
  expect(corpo).toContain('"/offline/"');
  // Nada de API no cache: guardar resposta de progresso aqui criaria uma
  // segunda fonte de verdade.
  expect(corpo).not.toContain("api.lumarys.com.br");
});

test("um tema visitado continua abrindo sem rede", async ({ browser, browserName }) => {
  // O WebKit do Playwright estoura um erro interno ao navegar com o contexto
  // offline e um service worker no controle. É limitação do navegador de
  // teste, não do produto: o Safari real tem service worker desde 2018.
  test.skip(browserName === "webkit", "offline + service worker instável no WebKit de teste");
  const contexto = await browser.newContext();
  const page = await contexto.newPage();
  const tema = "/trilhas/engenharia-de-dados/fundamentos/big-data/";

  await page.goto(tema);
  await page.evaluate(() => navigator.serviceWorker.ready);
  // Uma segunda visita com o worker no controle: é ela que enche o cache.
  await page.reload();
  await page.waitForLoadState("networkidle");

  await contexto.setOffline(true);
  await page.reload();
  await expect(page.getByRole("heading", { name: /big data/i }).first()).toBeVisible();

  await contexto.close();
});

test("sem rede, a casca avisa em vez de deixar a pessoa no escuro", async ({ browser }) => {
  const contexto = await browser.newContext();
  const page = await contexto.newPage();

  await page.goto("/hoje/");
  await page.evaluate(() => navigator.serviceWorker.ready);
  await contexto.setOffline(true);
  // O evento "offline" é o que a faixa escuta.
  await page.evaluate(() => window.dispatchEvent(new Event("offline")));

  await expect(page.getByText(/você está/i)).toBeVisible();
  await expect(page.getByText(/sem rede/i)).toBeVisible();

  await contexto.setOffline(false);
  await page.evaluate(() => window.dispatchEvent(new Event("online")));
  await expect(page.getByText(/sem rede/i)).toHaveCount(0);

  await contexto.close();
});

test("página nunca aberta cai na tela de offline, não no erro do navegador", async ({
  browser,
  browserName,
}) => {
  test.skip(browserName === "webkit", "offline + service worker instável no WebKit de teste");
  const contexto = await browser.newContext();
  const page = await contexto.newPage();

  await page.goto("/hoje/");
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await page.waitForLoadState("networkidle");

  await contexto.setOffline(true);
  await page.goto("/trilhas/engenharia-de-dados/spark/spark-avancado/");
  await expect(page.getByText(/esta página ainda não estava no aparelho/i)).toBeVisible();

  await contexto.close();
});
