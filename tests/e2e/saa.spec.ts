import { expect, test, type Page } from "@playwright/test";

/**
 * A primeira trilha de certificação. O que muda em relação a uma trilha de
 * carreira: a ementa é um exame com versão, domínios com peso e nota de
 * corte, e o simulado é uma prova objetiva e cronometrada, não uma sabatina
 * oral.
 */
const SAA = "/trilhas/aws-solutions-architect-associate/";
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
  await page.goto(SAA);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Solutions Architect");
  await expect(page.getByText("65 questões · 130 min")).toBeVisible();
  await expect(page.getByText("Corte 720/1000")).toBeVisible();
  // A versão importa: a AWS aposenta exames com data marcada.
  await expect(page.getByRole("link", { name: "SAA-C03" })).toHaveAttribute(
    "href",
    /docs\.aws\.amazon\.com/,
  );
  await expect(page.getByText("30% da prova")).toBeVisible();
  await expect(page.getByText("26% da prova")).toBeVisible();
  // Dois domínios publicados; desempenho e custo seguem em breve.
  await expect(page.getByText("em breve", { exact: true })).toHaveCount(2);
  await expect(page.getByRole("link", { name: "Prova simulada" })).toBeVisible();
});

test("a prova simulada é objetiva, cronometrada e sem gabarito até o fim", async ({ page }) => {
  await page.goto("/simulado/?trilha=aws-solutions-architect-associate");
  await expect(page.getByText(/prova simulada · SAA-C03/i)).toBeVisible();
  // O banco de hoje é menor que 65: a tela diz isso em vez de repetir questão.
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
  // Com dois domínios publicados, o resultado precisa separar os dois: é o
  // sorteio por peso chegando até a tela de resultado.
  await expect(page.getByText("Arquiteturas seguras").first()).toBeVisible();
  await expect(page.getByText("Arquiteturas resilientes").first()).toBeVisible();

  // O resultado entra no mesmo histórico da trilha, por domínio.
  const gravado = await page.evaluate((chave) => {
    const p = JSON.parse(window.localStorage.getItem(chave)!);
    return p.trilhas["aws-solutions-architect-associate"]?.simulados?.[0]?.porModulo ?? null;
  }, CHAVE);
  expect(gravado).not.toBeNull();
  expect(Object.keys(gravado)).toContain("seguras");
});

test("a prova entrega sozinha quando o tempo acaba", async ({ page }) => {
  await page.clock.install();
  await page.goto("/simulado/?trilha=aws-solutions-architect-associate");
  await page.getByRole("button", { name: /começar a prova/i }).click();
  await expect(page.getByText(/questão 1 de/i)).toBeVisible();

  // Mais tempo do que a prova tem: o banco pequeno dá menos de 130 minutos.
  await page.clock.fastForward("02:15:00");
  await expect(page.getByText(/\/1000/)).toBeVisible();
  await expect(page.getByText(/abaixo do corte/i)).toBeVisible();
});

test("tema de prova traz cenários no estilo do exame, com o porquê de cada alternativa", async ({
  page,
}) => {
  await page.goto(`${SAA}seguras/iam-avancado/`);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("IAM");
  // O quiz do tema usa as mesmas questões de cenário; conferir uma revela a
  // explicação de todas as alternativas.
  const quiz = page.locator("#quiz");
  await quiz
    .getByRole("button")
    .filter({ hasText: /.{15,}/ })
    .first()
    .click();
  await quiz.getByRole("button", { name: "Conferir" }).click();
  await expect(quiz.getByText(/explicit|explícit|negação|role|SCP/i).first()).toBeVisible();
});

test("a home e o catálogo passam a listar a trilha, e ela sai do 'em breve'", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: /solutions architect associate/i })).toBeVisible();
  await page.goto("/trilhas/");
  await expect(page.locator("details", { hasText: "Solutions Architect" })).toHaveCount(0);
});
