import { expect, test, type Page } from "@playwright/test";

/**
 * `registrarSimulado` guardava os últimos vinte desde sempre e nenhuma tela
 * mostrava um. Quem ensaia uma sabatina termina, vê a nota e ela some — sem
 * saber se subiu desde a semana passada, que é metade do valor de ensaiar.
 */
const CHAVE = "lumarys.progresso.v1";
const TRILHA = "engenharia-de-dados";

async function semearSimulados(page: Page, notas: number[]) {
  await page.addInitScript(
    ([chave, trilha, lista]) => {
      const simulados = (lista as number[]).map((nota, i) => ({
        // Um por dia, do mais antigo para o mais novo.
        em: Date.parse("2026-09-01T12:00:00Z") + i * 86_400_000,
        porModulo: {
          fundamentos: { nota, maximo: 20 },
          hadoop: { nota: 10, maximo: 20 },
        },
      }));
      window.localStorage.setItem(
        chave as string,
        JSON.stringify({
          versao: 1,
          trilhas: {
            [trilha as string]: {
              iniciadaEm: 1,
              temasConcluidos: {},
              quizzes: {},
              preTestes: {},
              simulados,
              atualizadoEm: 1,
            },
          },
          cards: {},
          streak: { atual: 0, recorde: 0, ultimoDia: null },
          minutosPorDia: {},
          atualizadoEm: 1,
        }),
      );
    },
    [CHAVE, TRILHA, notas],
  );
}

test("com um simulado, a entrada mostra a nota e diz que ainda não há comparação", async ({
  page,
}) => {
  await semearSimulados(page, [10]);
  await page.goto("/simulado/");

  // Escopado ao cartão: a amostra pública, no fim da página, tem
  // resposta-modelo com palavras como "estável" no meio do texto.
  const cartao = page.getByText("Seus simulados").locator("../..");
  await expect(cartao).toBeVisible();
  // 10/20 + 10/20 = 50%.
  await expect(cartao.getByText("50%", { exact: false }).first()).toBeVisible();
  await expect(cartao.getByText(/primeiro simulado/i)).toBeVisible();
  await expect(cartao.getByText(/subindo|caindo|estável/i)).toHaveCount(0);
});

test("com três, aparece a tendência e a variação contra o anterior", async ({ page }) => {
  // 50%, 60% e 75%: a curva sobe.
  await semearSimulados(page, [10, 14, 20]);
  await page.goto("/simulado/");

  await expect(page.getByText("Subindo")).toBeVisible();
  await expect(page.getByText(/\+15 pontos em relação ao anterior/)).toBeVisible();

  const todos = page.locator("details", { hasText: "Todos os simulados" });
  await todos.locator("summary").click();
  // Um bloco por simulado, cada um com os dois módulos. Escopado ao
  // recolhível: "Fundamentos" também é um botão de escopo logo acima.
  await expect(todos.getByText("Fundamentos")).toHaveCount(3);
  // Só um "melhor": Fundamentos variou e tem recorde; Hadoop repetiu 50% nos
  // três e por isso não tem.
  await expect(todos.getByText("melhor")).toHaveCount(1);
});

test("a trilha mostra o último simulado com data e variação", async ({ page }) => {
  await semearSimulados(page, [10, 20]);
  await page.goto(`/trilhas/${TRILHA}/`);

  const linha = page.getByRole("link", { name: /último simulado/i });
  await expect(linha).toBeVisible();
  await expect(linha).toContainText("75%");
  await expect(linha).toContainText("+25");
});

test("sem simulado nenhum, nada é inventado", async ({ page }) => {
  await page.goto("/simulado/");
  await expect(page.getByText("Seus simulados")).toHaveCount(0);
  await page.goto(`/trilhas/${TRILHA}/`);
  await expect(page.getByText(/último simulado/i)).toHaveCount(0);
});
