import { expect, test } from "@playwright/test";

/**
 * As trilhas futuras eram três cartões em 70% de opacidade. Isso não é um
 * estado: não diz o que falta, não diz quando, e não dá nada para a pessoa
 * fazer. Quem chega interessado numa delas saía sem deixar rastro.
 */
test("cada trilha futura abre, admite que não tem data e aceita um pedido", async ({ page }) => {
  await page.goto("/trilhas/");

  const cartao = page.locator("details", { hasText: "AWS Cloud Practitioner" });
  await expect(cartao).toBeVisible();
  await expect(cartao.getByText(/não há data marcada/i)).toBeHidden();

  await cartao.locator("summary").click();
  await expect(cartao.getByText(/não há data marcada/i)).toBeVisible();

  const pedido = cartao.getByRole("button", { name: /quero esta trilha/i });
  await expect(pedido).toBeVisible();
  const caixa = await pedido.boundingBox();
  expect(caixa!.height).toBeGreaterThanOrEqual(44);
});

test("o pedido nomeia a trilha, para chegar classificado", async ({ page }) => {
  await page.goto("/trilhas/");
  const cartao = page.locator("details", { hasText: "AWS Cloud Practitioner" });
  await cartao.locator("summary").click();

  // O destino é um mailto: — o navegador de teste não navega para ele e
  // location.href não é redefinível no Chromium. O que dá para verificar aqui
  // é que o botão existe e é dessa trilha; o assunto em si é montado por
  // `enderecoDeContato`, coberto em tests/unit/company.test.ts.
  await expect(cartao.getByRole("button", { name: /quero esta trilha/i })).toBeVisible();
  // A outra existe fechada: o pedido é por trilha, não um só no fim da lista,
  // para o assunto do e-mail dizer qual delas. (Eram três; Analytics saiu do
  // "em breve" e virou trilha.)
  await expect(page.locator("details button", { hasText: "Quero esta trilha" })).toHaveCount(1);
});
