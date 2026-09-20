import { expect, test, type Page } from "@playwright/test";

/**
 * A trilha fundacional de AWS. O que muda em relação à SAA: a CLF ainda está
 * sendo escrita domínio a domínio, então a página da trilha mostra os quatro
 * pesos do exame mas só três módulos abrem, e a prova simulada sai menor que
 * as 65 questões oficiais, dizendo na tela para quantas o banco dá.
 *
 * Este arquivo nasceu de `saa.spec.ts`: o que é igual continua igual de
 * propósito, para uma regressão no cabeçalho do exame ou na prova objetiva
 * aparecer nas duas trilhas.
 */
const CLF = "/trilhas/aws-cloud-practitioner/";
const CHAVE = "lumarys.progresso.v1";

async function responderTudo(page: Page) {
  for (let i = 0; i < 80; i++) {
    const entregar = page.getByRole("button", { name: "Entregar", exact: true });
    // A primeira alternativa de cada questão; o objetivo aqui é o fluxo, não a nota.
    await page.getByRole("radio").or(page.getByRole("checkbox")).first().click();
    if (await entregar.isVisible()) {
      await entregar.click();
      break;
    }
    await page.getByRole("button", { name: "Próxima" }).click();
  }
}

test("a trilha mostra o exame: versão, formato, corte e o peso de cada domínio", async ({
  page,
}) => {
  await page.goto(CLF);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Cloud Practitioner");
  await expect(page.getByText("65 questões · 90 min")).toBeVisible();
  await expect(page.getByText("Corte 700/1000")).toBeVisible();
  // A versão importa: a AWS aposenta exames com data marcada.
  await expect(page.getByRole("link", { name: "CLF-C02" })).toHaveAttribute(
    "href",
    /docs\.aws\.amazon\.com/,
  );
  // Os quatro domínios aparecem com o peso desde o primeiro card, inclusive
  // os que ainda não têm tema: quem estuda precisa saber o mapa inteiro.
  await expect(page.getByText("24% da prova")).toBeVisible();
  await expect(page.getByText("30% da prova")).toBeVisible();
  await expect(page.getByText("34% da prova")).toBeVisible();
  await expect(page.getByText("12% da prova")).toBeVisible();
  await expect(page.getByRole("link", { name: "Prova simulada" })).toBeVisible();
});

test("os domínios ainda não escritos aparecem como 'em breve', sem abrir", async ({ page }) => {
  await page.goto(CLF);
  // Um domínio em breve: cobrança. Tecnologia saiu do "em breve" no LUM-145,
  // com os cinco primeiros temas do Domínio 3. Quando cobrança for publicada no
  // LUM-147, esta contagem cai para zero e o teste falha de propósito.
  await expect(page.getByText("em breve", { exact: true })).toHaveCount(1);
  await expect(page.getByText("Conceitos de nuvem").first()).toBeVisible();
});

test("a prova simulada é objetiva, cronometrada e sem gabarito até o fim", async ({ page }) => {
  await page.goto("/simulado/?trilha=aws-cloud-practitioner");
  await expect(page.getByText(/prova simulada · CLF-C02/i)).toBeVisible();
  // Só o Domínio 1 tem questões, então o banco não fecha as 65: a tela diz
  // para quantas dá. Quando os quatro domínios estiverem publicados, passa a
  // valer a outra frase, e a asserção aceita as duas.
  // A frase das 65 questões é fixa no cartão; a do banco só aparece enquanto
  // faltam domínios. `first()` porque hoje as duas convivem na mesma tela.
  await expect(
    page
      .getByText(/o banco de hoje dá para \d+ questões/i)
      .or(page.getByText(/65 questões em 90 minutos/i))
      .first(),
  ).toBeVisible();
  await expect(page.getByText(/o banco de hoje dá para \d+ questões/i)).toBeVisible();

  await page.getByRole("button", { name: /começar a prova/i }).click();
  await expect(page.getByText(/questão 1 de \d+/i)).toBeVisible();
  await expect(page.getByLabel(/tempo restante/i)).toBeVisible();
  // Nada de "Conferir": a correção só vem no fim.
  await expect(page.getByRole("button", { name: "Conferir" })).toHaveCount(0);

  // Marcar para revisar é reversível e aparece no cabeçalho.
  await page.getByRole("button", { name: "Marcar", exact: true }).click();
  await expect(page.getByText(/· marcada/)).toBeVisible();

  await responderTudo(page);
  // Entregar pede confirmação e diz quantas ficaram em branco.
  await expect(page.getByRole("heading", { name: /entregar a prova\?/i })).toBeVisible();
  await page.getByRole("button", { name: "Entregar", exact: true }).last().click();

  await expect(page.getByText(/\/1000/)).toBeVisible();
  await expect(page.getByText("Por domínio")).toBeVisible();
  await expect(page.getByText("Conceitos de nuvem").first()).toBeVisible();

  // O resultado entra no mesmo histórico da trilha, por domínio.
  const gravado = await page.evaluate((chave) => {
    const p = JSON.parse(window.localStorage.getItem(chave)!);
    return p.trilhas["aws-cloud-practitioner"]?.simulados?.[0]?.porModulo ?? null;
  }, CHAVE);
  expect(gravado).not.toBeNull();
  expect(Object.keys(gravado)).toContain("conceitos");
});

test("a prova entrega sozinha quando o tempo acaba", async ({ page }) => {
  await page.clock.install();
  await page.goto("/simulado/?trilha=aws-cloud-practitioner");
  await page.getByRole("button", { name: /começar a prova/i }).click();
  await expect(page.getByText(/questão 1 de/i)).toBeVisible();

  // Mais tempo do que a prova tem: o banco pequeno dá menos de 90 minutos.
  await page.clock.fastForward("02:15:00");
  await expect(page.getByText(/\/1000/)).toBeVisible();
  await expect(page.getByText(/abaixo do corte/i)).toBeVisible();
});

test("tema de prova traz cenários curtos no estilo do exame, com o porquê de cada alternativa", async ({
  page,
}) => {
  await page.goto(`${CLF}conceitos/well-architected-os-seis-pilares/`);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Well-Architected");
  // O quiz do tema usa as mesmas questões de cenário; conferir uma revela a
  // explicação de todas as alternativas.
  const quiz = page.locator("#quiz");
  await quiz
    .getByRole("button")
    .filter({ hasText: /.{15,}/ })
    .first()
    .click();
  await quiz.getByRole("button", { name: "Conferir" }).click();
  await expect(
    quiz.getByText(/pilar|confiabilidade|custo|sustentabilidade/i).first(),
  ).toBeVisible();
});

test("a home e o catálogo listam a trilha, e ela sai do 'em breve'", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: /cloud practitioner/i }).first()).toBeVisible();
  await page.goto("/trilhas/");
  await expect(page.locator("details", { hasText: "Cloud Practitioner" })).toHaveCount(0);
});
