import { expect, test, type Page } from "@playwright/test";

/**
 * O checkpoint foi prometido dentro do MVP e era o único item daquele escopo
 * inteiramente ausente: nada verificava se um módulo tinha sido aprendido
 * antes de seguir. O quiz do tema pergunta logo depois de ler, quando a
 * resposta ainda está na ponta da língua; este pergunta dias depois,
 * misturando temas.
 */
const CHAVE = "lumarys.progresso.v1";
const ROTA = "/trilhas/engenharia-de-dados/fundamentos/checkpoint/";

function progresso(extra: Record<string, unknown> = {}) {
  return {
    versao: 1,
    trilhas: {
      "engenharia-de-dados": {
        iniciadaEm: 1,
        temasConcluidos: {},
        quizzes: {},
        preTestes: {},
        simulados: [],
        atualizadoEm: 1,
        ...extra,
      },
    },
    cards: {},
    streak: { atual: 0, recorde: 0, ultimoDia: null },
    minutosPorDia: {},
    atualizadoEm: 1,
  };
}

async function semear(page: Page, extra: Record<string, unknown> = {}) {
  await page.addInitScript(
    ([chave, dados]) => window.localStorage.setItem(chave as string, JSON.stringify(dados)),
    [CHAVE, progresso(extra)] as const,
  );
}

/** Alternativas da pergunta atual: os botões dentro do cartão. */
function alternativas(page: Page) {
  return page.locator("#conteudo button").filter({ hasText: /.{15,}/ });
}

test("a rota existe e explica o que é antes de começar", async ({ page }) => {
  await semear(page);
  await page.goto(ROTA);

  await expect(page.getByRole("heading", { name: "Checkpoint" })).toBeVisible();
  // O número vem do conteúdo do módulo, e não é sempre 10: Fundamentos tem
  // menos perguntas objetivas que o teto.
  await expect(page.getByText(/\d+ perguntas dos temas deste módulo/i)).toBeVisible();
  // Sem nada concluído, deixa tentar assim mesmo: não checa presença.
  await expect(page.getByText(/não checa presença/i)).toBeVisible();
  await expect(page.getByRole("button", { name: /começar o checkpoint/i })).toBeVisible();
});

test("as perguntas vêm de temas diferentes e dizem de qual tema saíram", async ({ page }) => {
  await semear(page);
  await page.goto(ROTA);
  await page.getByRole("button", { name: /começar o checkpoint/i }).click();

  await expect(page.getByText(/checkpoint · 1 de \d+/i)).toBeVisible();

  // Fora do contexto da página do tema, a pessoa precisa saber de onde a
  // pergunta veio para poder voltar lá.
  const temas = new Set<string>();
  for (let i = 0; i < 3; i++) {
    const rodape = page.locator("#origem-da-pergunta");
    temas.add(((await rodape.textContent()) ?? "").trim());
    await alternativas(page).first().click();
    await page.getByRole("button", { name: "Conferir" }).click();
    await page.getByRole("button", { name: /próxima|ver resultado/i }).click();
  }
  expect(temas.size).toBeGreaterThan(1);
});

test("o resultado é gravado e a tela diz onde voltar", async ({ page }) => {
  await semear(page);
  await page.goto(ROTA);
  await page.getByRole("button", { name: /começar o checkpoint/i }).click();

  const total = Number(
    /de (\d+)/.exec((await page.getByText(/checkpoint · 1 de \d+/i).textContent()) ?? "")?.[1],
  );
  expect(total).toBeGreaterThan(0);

  for (let i = 0; i < total; i++) {
    await alternativas(page).first().click();
    await page.getByRole("button", { name: "Conferir" }).click();
    await page.getByRole("button", { name: /próxima|ver resultado/i }).click();
  }

  await expect(page.getByText(/módulo fechado|ainda não/i).first()).toBeVisible();

  const gravado = await page.evaluate((chave) => {
    const p = JSON.parse(window.localStorage.getItem(chave)!);
    return p.trilhas["engenharia-de-dados"].checkpoints?.fundamentos;
  }, CHAVE);
  expect(gravado.total).toBe(total);
  expect(Array.isArray(gravado.temasParaRevisar)).toBe(true);
  // Errando, a tela lista os temas a revisar; acertando tudo, não lista nada.
  const onde = page.getByText("Onde voltar", { exact: true }).first();
  expect(await onde.isVisible()).toBe(gravado.temasParaRevisar.length > 0);
});

test("a lista de módulos mostra o checkpoint e o selo de aprovado", async ({ page }) => {
  await semear(page, {
    checkpoints: {
      fundamentos: {
        acertos: 9,
        total: 10,
        atualizadoEm: 1,
        temasParaRevisar: ["olap-oltp-etl"],
      },
    },
  });
  await page.goto("/trilhas/engenharia-de-dados/");

  const modulo = page.locator("li#fundamentos");
  await expect(modulo).toBeVisible();
  const resumo = modulo.locator("summary");
  if (!(await modulo.locator("details[open]").count())) await resumo.click();

  const link = modulo.getByRole("link", { name: /checkpoint do módulo/i });
  await expect(link).toBeVisible();
  await expect(link).toContainText("9/10 · fechado");
  // O selo âmbar de "provei que sei", diferente do verde de "li tudo".
  await expect(modulo.getByLabel("Checkpoint aprovado")).toBeVisible();
});
