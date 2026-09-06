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

  await expect(page.getByText(/dia 1 de 14/i)).toBeVisible();
  await expect(page.getByText(/você fez 0 de 45/i)).toBeVisible();
  await expect(page.getByRole("link", { name: /ir para o dia de hoje/i })).toBeVisible();
  // 14 dias no cronograma, o primeiro aberto.
  await expect(page.locator("details")).toHaveCount(14);
  await expect(page.locator("details[open]").first()).toContainText(/Fundamentos/);
});

test("3. abrir temas sem estudar não inventa cards vencidos", async () => {
  // O baralho nasce ao abrir a página do tema. Antes desta regra, abrir dois
  // temas sem responder nada já anunciava "12 cards vencidos" na tela Hoje e
  // roubava a próxima ação para revisar conteúdo que ninguém tinha lido.
  for (const rota of ["fundamentos/olap-oltp-etl", "hadoop/mapreduce"]) {
    await page.goto(`${TRILHA}${rota}/`);
    // Esperar o baralho aparecer garante que a semeadura rodou: é justamente
    // ela que criava os cards falsamente vencidos.
    await expect(page.getByText(/^Card 1 de \d+/)).toBeVisible();
  }

  await page.goto("/hoje/");
  await expect(page.getByText(/cards vencidos/i)).toHaveCount(0);
  await expect(page.getByRole("link", { name: /começar/i })).toBeVisible();

  await page.goto("/cards/");
  await expect(page.getByText(/ainda não é hora/i)).toBeVisible();

  // Abrir e sair no meio é o caso que "continuar de onde parou" atende.
  await page.goto("/hoje/");
  await expect(page.getByText(/continuar de onde parou/i)).toBeVisible();
  await expect(page.getByText("MapReduce", { exact: false }).first()).toBeVisible();
});

test("4. Hoje leva de volta ao tema deixado pela metade", async () => {
  await page.goto("/hoje/");
  await expect(page.getByText(/dia \d+\/14 · faltam \d+/i)).toBeVisible();
  await page.getByRole("link", { name: /começar/i }).click();
  await expect(page).toHaveURL(new RegExp("hadoop/mapreduce/$"));

  // A trilha aponta para o mesmo lugar que a tela Hoje: uma decisão só, em lib.
  await page.goto(TRILHA);
  await expect(page.getByRole("link", { name: /^continuar: mapreduce$/i })).toBeVisible();
});

test("5. pré-teste: responde as duas perguntas e libera o conteúdo", async () => {
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

test("6. o vídeo é uma fachada até o toque", async () => {
  await expect(page.getByRole("button", { name: /^assistir:/i }).first()).toBeVisible();
  await expect(page.locator("iframe")).toHaveCount(0);
});

test("7. flashcards: vira e avalia o baralho inteiro", async () => {
  const card = page.locator("button[aria-expanded]").first();
  for (let i = 0; i < 14; i++) {
    if (
      await page
        .getByText("Baralho concluído")
        .isVisible()
        .catch(() => false)
    )
      break;
    await card.click();
    await page.getByRole("button", { name: /^sabia$/i }).click();
  }
  await expect(page.getByText("Baralho concluído")).toBeVisible();
});

test("8. drill: classifica os cenários e confere", async () => {
  const opcoes = page.getByRole("button", { name: "Distribuído" });
  const total = await opcoes.count();
  expect(total).toBeGreaterThanOrEqual(3);
  for (let i = 0; i < total; i++) await opcoes.nth(i).click();
  await page
    .getByRole("button", { name: /^conferir$/i })
    .first()
    .click();
  await expect(page.getByRole("button", { name: /refazer/i })).toBeVisible();
});

test("9. quiz: responde até o resultado", async () => {
  await page.getByText(/^Quiz · 1 de/).waitFor();
  for (let i = 0; i < 6; i++) {
    if (
      await page
        .getByText("Quiz concluído")
        .isVisible()
        .catch(() => false)
    )
      break;
    const quiz = page.locator("section", { has: page.getByText(/^Quiz · \d de/) });
    await quiz.getByRole("button").first().click();
    await quiz.getByRole("button", { name: /conferir/i }).click();
    await quiz.getByRole("button", { name: /próxima|ver resultado/i }).click();
  }
  await expect(page.getByText("Quiz concluído")).toBeVisible();
});

test("9b. drill e quiz deixam rastro no progresso", async () => {
  const gravado = await page.evaluate(() => {
    const p = JSON.parse(window.localStorage.getItem("lumarys.progresso.v1")!);
    const t = p.trilhas["engenharia-de-dados"];
    return { drills: Object.keys(t.drills ?? {}), temQuiz: Boolean(t.quizzes["big-data"]) };
  });

  expect(gravado.drills).toContain("big-data");
  expect(gravado.temQuiz).toBe(true);
});

test("10. concluir o tema mostra o que mudou e oferece o próximo", async () => {
  await page.getByRole("button", { name: /concluir tema/i }).click();
  await expect(page.getByText("Tema concluído")).toBeVisible();

  // O recibo: o esforço vira número em vez de um selo verde mudo.
  await expect(page.getByText("O que isso mudou")).toBeVisible();
  await expect(page.getByText(/da sua meta/)).toBeVisible();
  await expect(page.getByText(/dia seguido|dias seguidos/)).toBeVisible();
  await expect(page.getByText(/prontidão/i).first()).toBeVisible();
  await expect(page.locator("#concluir").getByRole("link", { name: /próximo/i })).toContainText(
    /OLAP/i,
  );
});

test("11. o progresso reflete em Hoje e na trilha", async () => {
  await page.goto("/hoje/");
  await expect(page.getByText("O que é Big Data")).toHaveCount(0);
  // A prontidão passa a explicar de onde veio o número.
  await page
    .getByRole("group")
    .filter({ hasText: /como chegamos a/i })
    .click();
  await expect(page.getByText(/^Simulado \(35%\)$/)).toBeVisible();
  await expect(page.getByText(/o que mais sobe agora é/i)).toBeVisible();
  await expect(page.getByText(/OLAP/i).first()).toBeVisible();
  // A métrica renderiza "1" colado ao sufixo: <p>1<span>dia</span></p>.
  await expect(page.getByText("Sequência").locator("xpath=following-sibling::p")).toContainText(
    /^1\s*dia$/,
  );

  await page.goto(TRILHA);
  await expect(page.getByText("1/30")).toBeVisible();
  await expect(page.getByText(/prontidão \d+%/i)).toBeVisible();
  await expect(page.getByText("1/3").first()).toBeVisible(); // Fundamentos
  // O próximo tema vira botão, em vez de só abrir um acordeão sozinho.
  await expect(page.getByRole("link", { name: /^(continuar|próximo):/i })).toBeVisible();
  await expect(page.getByText(/dia \d+ de 14/i)).toBeVisible();
});

test("12. cards: todos avaliados hoje, fila em dia com previsão", async () => {
  await page.goto("/cards/");
  await expect(page.getByText(/fila em dia/i)).toBeVisible();
  await expect(page.getByText(/próximos 7 dias/i)).toBeVisible();
});

test("13. simulado oral do módulo até o placar", async () => {
  await page.goto("/simulado/?modulo=fundamentos");
  await expect(page.getByRole("button", { name: "Fundamentos" })).toBeVisible();
  await page.getByRole("button", { name: /começar simulado/i }).click();

  for (let i = 0; i < 10; i++) {
    if (
      await page
        .getByText("Resultado", { exact: true })
        .isVisible()
        .catch(() => false)
    )
      break;
    await expect(page.getByText(/entrevistador · fundamentos/i)).toBeVisible();
    await page.getByRole("button", { name: /já respondi/i }).click();
    await expect(page.getByText("Resposta-modelo")).toBeVisible();
    await page.getByRole("button", { name: "4", exact: true }).click();
  }

  await expect(page.getByText("Resultado", { exact: true })).toBeVisible();
  await expect(page.getByText(/^\d+\/\d+$/).first()).toBeVisible();
  await expect(page.getByText("Por módulo")).toBeVisible();
});

test("14. a prontidão sobe depois do simulado", async () => {
  await page.goto("/hoje/");
  const geral = page.locator("text=/^\\d+%$/").first();
  await expect(geral).toBeVisible();
  const valor = Number((await geral.textContent())?.replace("%", ""));
  expect(valor).toBeGreaterThan(0);
});

test("15. conta em modo convidado resume o aparelho e exporta os dados", async () => {
  await page.goto("/conta/");
  await expect(page.getByText(/1 tema concluído/)).toBeVisible();

  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: /exportar meus dados/i }).click();
  const arquivo = await download;
  expect(arquivo.suggestedFilename()).toBe("lumarys-meus-dados.json");
});

test("16. o plano pode ser editado e a data vencida tem saída", async () => {
  await page.goto(`${TRILHA}plano/`);
  await page.getByRole("button", { name: /^editar$/i }).click();
  await page.getByRole("button", { name: "60" }).click();
  await page.getByRole("button", { name: /salvar plano/i }).click();

  await expect(page.getByText(/plano salvo/i)).toBeVisible();
  await expect(page.getByText("60 min", { exact: false }).first()).toBeVisible();

  // Data no passado deixava a tela sem nenhum caminho: nenhum dia marcado como
  // hoje, todos os acordeões fechados e nada para clicar.
  await page.getByRole("button", { name: /^editar$/i }).click();
  await page.evaluate(() => {
    const chave = "lumarys.progresso.v1";
    const p = JSON.parse(window.localStorage.getItem(chave)!);
    p.trilhas["engenharia-de-dados"].dataProva = "2026-01-10";
    window.localStorage.setItem(chave, JSON.stringify(p));
  });
  await page.reload();

  await expect(page.getByText(/a prova foi há/i)).toBeVisible();
  await page.getByRole("button", { name: /manter na memória/i }).click();
  await expect(page.getByText(/cuidando do que você já sabe/i)).toBeVisible();
  await expect(page.getByRole("link", { name: /ver a revisão de hoje/i })).toBeVisible();
});
