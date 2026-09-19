import { expect, test } from "@playwright/test";

/**
 * As trilhas futuras eram três cartões em 70% de opacidade. Isso não é um
 * estado: não diz o que falta, não diz quando, e não dá nada para a pessoa
 * fazer. Viraram um acordeão por trilha, que admite não ter data e aceita um
 * pedido nominal.
 *
 * Com a AWS Cloud Practitioner publicada, a lista de `trilhasEmBreve` ficou
 * vazia, e este arquivo mudou de alvo: em vez de conferir o cartão da CLF,
 * confere que a seção inteira some das duas páginas que a renderizavam. Um
 * rótulo "Em breve" seguido de nada, ou um "Próximas trilhas" sem nomes, é
 * pior que silêncio: promete uma lista e entrega um rótulo órfão.
 *
 * Quando a próxima certificação entrar em `trilhasEmBreve`, estes testes
 * falham de propósito, e voltam a ser o que eram: conferir o cartão, o pedido
 * e a altura do alvo de toque.
 */
test("o catálogo não mostra rótulo de 'em breve' com a lista vazia", async ({ page }) => {
  await page.goto("/trilhas/");

  await expect(page.getByText("Em breve", { exact: true })).toHaveCount(0);
  // O pedido por trilha morava dentro de cada acordeão da lista.
  await expect(page.getByRole("button", { name: /quero esta trilha/i })).toHaveCount(0);
  await expect(page.getByText(/não há data marcada/i)).toHaveCount(0);
});

test("a home não anuncia próximas trilhas quando não há nenhuma anunciada", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: /próximas trilhas/i })).toHaveCount(0);
  await expect(page.getByText(/mesma estrutura, outras ementas/i)).toHaveCount(0);
  // A seção seguinte continua no lugar: o que sumiu foi só o bloco vazio.
  await expect(page.getByRole("heading", { name: /perguntas que todo mundo faz/i })).toBeVisible();
});

test("toda trilha do catálogo é uma trilha de verdade, com página própria", async ({ page }) => {
  await page.goto("/trilhas/");

  // Os acordeões da página eram exatamente os cartões de "em breve": sem
  // lista, não sobra nenhum. O que resta é catálogo navegável.
  await expect(page.locator("details")).toHaveCount(0);
  await expect(page.getByRole("link", { name: /cloud practitioner/i }).first()).toBeVisible();
});
