import { expect, test, type Page } from "@playwright/test";

/**
 * A jornada inteira de um aluno em modo convidado, do primeiro acesso ao
 * simulado. Roda numa única sessão de navegador porque o progresso vive no
 * localStorage: cada passo depende do anterior, como na vida real.
 */
test.describe.configure({ mode: "serial" });

const TRILHA = "/trilhas/engenharia-de-dados/";
const TEMA = `${TRILHA}fundamentos/big-data/`;

let page: Page;

test.beforeAll(async ({ browser }, info) => {
  const contexto = await browser.newContext({ ...info.project.use });
  page = await contexto.newPage();
});

test.afterAll(async () => {
  await page.context().close();
});

test("1. trilha sem progresso convida a montar o plano", async () => {
  await page.goto(TRILHA);
  await expect(page.getByRole("link", { name: /montar meu plano/i })).toBeVisible();
  await expect(page.getByText("30 temas", { exact: false }).first()).toBeVisible();
});

test("2. onboarding gera o plano de 14 dias", async () => {
  await page.goto(`${TRILHA}plano/`);
  await page.getByRole("button", { name: "45" }).click();
  await page.getByRole("button", { name: /gerar plano/i }).click();

  await expect(page.getByText(/faltam \d+ dias/i)).toBeVisible();
  await expect(page.getByText("45 min/dia")).toBeVisible();
  // 14 dias no cronograma, o primeiro aberto.
  await expect(page.locator("details")).toHaveCount(14);
  await expect(page.locator("details[open]").first()).toContainText(/Fundamentos/);
});

test("3. Hoje aponta o primeiro tema como próxima ação", async () => {
  await page.goto("/hoje/");
  await expect(page.getByText(/prova em/i)).toBeVisible();
  await expect(page.getByText("Próxima ação")).toBeVisible();
  await expect(page.getByText("O que é Big Data")).toBeVisible();
  await page.getByRole("link", { name: /começar/i }).click();
  await expect(page).toHaveURL(new RegExp("fundamentos/big-data/$"));
});

test("4. pré-teste: responde as duas perguntas e libera o conteúdo", async () => {
  await page.goto(TEMA);
  await page.getByRole("button", { name: /não necessariamente/i }).click();
  await page.getByRole("radio", { name: "média" }).click();
  await page.getByRole("button", { name: /^responder$/i }).click();
  await page.getByRole("button", { name: /próxima pergunta/i }).click();

  await page.getByRole("button", { name: /veracidade e valor/i }).click();
  await page.getByRole("radio", { name: "alta" }).click();
  await page.getByRole("button", { name: /^responder$/i }).click();
  await page.getByRole("button", { name: /ir para o conteúdo/i }).click();

  await expect(page.getByText("Pré-teste concluído")).toBeVisible();
  await expect(page.getByText(/2 de 2/)).toBeVisible();
});

test("5. o vídeo é uma fachada até o toque", async () => {
  await expect(page.getByRole("button", { name: /^assistir:/i }).first()).toBeVisible();
  await expect(page.locator("iframe")).toHaveCount(0);
});

test("6. flashcards: vira e avalia o baralho inteiro", async () => {
  const card = page.locator("button[aria-expanded]").first();
  for (let i = 0; i < 14; i++) {
    if (await page.getByText("Baralho concluído").isVisible().catch(() => false)) break;
    await card.click();
    await page.getByRole("button", { name: /^sabia$/i }).click();
  }
  await expect(page.getByText("Baralho concluído")).toBeVisible();
});

test("7. drill: classifica os cenários e confere", async () => {
  const opcoes = page.getByRole("button", { name: "Distribuído" });
  const total = await opcoes.count();
  expect(total).toBeGreaterThanOrEqual(3);
  for (let i = 0; i < total; i++) await opcoes.nth(i).click();
  await page.getByRole("button", { name: /^conferir$/i }).first().click();
  await expect(page.getByRole("button", { name: /refazer/i })).toBeVisible();
});

test("8. quiz: responde até o resultado", async () => {
  await page.getByText(/^Quiz · 1 de/).waitFor();
  for (let i = 0; i < 6; i++) {
    if (await page.getByText("Quiz concluído").isVisible().catch(() => false)) break;
    const quiz = page.locator("section", { has: page.getByText(/^Quiz · \d de/) });
    await quiz.getByRole("button").first().click();
    await quiz.getByRole("button", { name: /conferir/i }).click();
    await quiz.getByRole("button", { name: /próxima|ver resultado/i }).click();
  }
  await expect(page.getByText("Quiz concluído")).toBeVisible();
});

test("9. concluir o tema muda o botão e oferece o próximo", async () => {
  await page.getByRole("button", { name: /concluir tema/i }).click();
  await expect(page.getByText("Tema concluído")).toBeVisible();
  await expect(page.getByRole("link", { name: /próximo/i })).toContainText(/OLAP/i);
});

test("10. o progresso reflete em Hoje e na trilha", async () => {
  await page.goto("/hoje/");
  await expect(page.getByText("O que é Big Data")).toHaveCount(0);
  await expect(page.getByText(/OLAP/i).first()).toBeVisible();
  // A métrica renderiza "1" colado ao sufixo: <p>1<span>dia</span></p>.
  await expect(page.getByText("Sequência").locator("xpath=following-sibling::p")).toContainText(/^1\s*dia$/);

  await page.goto(TRILHA);
  await expect(page.getByText("1/30")).toBeVisible();
  await expect(page.getByText(/prontidão \d+%/i)).toBeVisible();
  await expect(page.getByText("1/3").first()).toBeVisible(); // Fundamentos
});

test("11. cards: todos avaliados hoje, fila em dia com previsão", async () => {
  await page.goto("/cards/");
  await expect(page.getByText(/fila em dia/i)).toBeVisible();
  await expect(page.getByText(/próximos 7 dias/i)).toBeVisible();
});

test("12. simulado oral do módulo até o placar", async () => {
  await page.goto("/simulado/?modulo=fundamentos");
  await expect(page.getByRole("button", { name: "Fundamentos" })).toBeVisible();
  await page.getByRole("button", { name: /começar simulado/i }).click();

  for (let i = 0; i < 10; i++) {
    if (await page.getByText("Resultado", { exact: true }).isVisible().catch(() => false)) break;
    await expect(page.getByText(/entrevistador · fundamentos/i)).toBeVisible();
    await page.getByRole("button", { name: /já respondi/i }).click();
    await expect(page.getByText("Resposta-modelo")).toBeVisible();
    await page.getByRole("button", { name: "4", exact: true }).click();
  }

  await expect(page.getByText("Resultado", { exact: true })).toBeVisible();
  await expect(page.getByText(/^\d+\/\d+$/).first()).toBeVisible();
  await expect(page.getByText("Por módulo")).toBeVisible();
});

test("13. a prontidão sobe depois do simulado", async () => {
  await page.goto("/hoje/");
  const geral = page.locator("text=/^\\d+%$/").first();
  await expect(geral).toBeVisible();
  const valor = Number((await geral.textContent())?.replace("%", ""));
  expect(valor).toBeGreaterThan(0);
});

test("14. conta em modo convidado resume o aparelho e exporta os dados", async () => {
  await page.goto("/conta/");
  await expect(page.getByText(/1 tema concluído/)).toBeVisible();

  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: /exportar meus dados/i }).click();
  const arquivo = await download;
  expect(arquivo.suggestedFilename()).toBe("lumarys-meus-dados.json");
});
