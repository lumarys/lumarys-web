import { expect, test, type Page } from "@playwright/test";

/**
 * Concluir a trilha passava em branco, e é o único canal de aquisição
 * orgânica previsto além da busca. O cartão é desenhado no próprio aparelho:
 * nada é enviado a lugar nenhum.
 */
const CHAVE = "lumarys.progresso.v1";
const TRILHA = "/trilhas/engenharia-de-dados/";

/** Os 30 temas da trilha, para poder simular a conclusão inteira. */
async function semear(page: Page, quantos: number, notaSimulado: number | null) {
  await page.addInitScript(
    ([chave, n, nota]) => {
      const slugs = Array.from({ length: n as number }, (_, i) => `tema-${i}`);
      window.localStorage.setItem(
        chave as string,
        JSON.stringify({
          versao: 1,
          trilhas: {
            "engenharia-de-dados": {
              iniciadaEm: 1,
              temasConcluidos: Object.fromEntries(slugs.map((s) => [s, 1])),
              quizzes: {},
              preTestes: {},
              simulados:
                nota === null
                  ? []
                  : [
                      {
                        em: 1,
                        porModulo: { fundamentos: { nota: nota as number, maximo: 100 } },
                      },
                    ],
              atualizadoEm: 1,
            },
          },
          cards: {},
          streak: { atual: 5, recorde: 9, ultimoDia: "2026-09-06" },
          minutosPorDia: {},
          atualizadoEm: 1,
        }),
      );
    },
    [CHAVE, quantos, notaSimulado] as const,
  );
}

test("sem nenhum tema concluído, não há o que comemorar", async ({ page }) => {
  await page.goto(TRILHA);
  await expect(page.getByText("Seu progresso")).toHaveCount(0);
});

test("com progresso, o cartão é desenhado e diz o que falta para o certificado", async ({
  page,
}) => {
  await semear(page, 3, null);
  await page.goto(TRILHA);

  const cartao = page.getByLabel(/cartão com 3 de 30 temas/i);
  await expect(cartao).toBeVisible();

  // Desenhado de verdade: o canvas tem pixels não transparentes.
  const pintado = await cartao.evaluate((el) => {
    const c = el as HTMLCanvasElement;
    const dados = c.getContext("2d")!.getImageData(0, 0, c.width, c.height).data;
    let opacos = 0;
    for (let i = 3; i < dados.length; i += 4) if (dados[i]! > 0) opacos++;
    return opacos;
  });
  expect(pintado).toBeGreaterThan(1000);

  await expect(page.getByText(/falta 27 temas e um simulado/i)).toBeVisible();
  await expect(page.getByRole("button", { name: "Certificado" })).toHaveCount(0);
});

test("trilha inteira com simulado fraco ainda não dá certificado", async ({ page }) => {
  await semear(page, 30, 50);
  await page.goto(TRILHA);

  await expect(page.getByText(/o último deu 50%/i)).toBeVisible();
  await expect(page.getByRole("button", { name: "Certificado" })).toHaveCount(0);
});

test("com os dois critérios cumpridos, o certificado aparece", async ({ page }) => {
  await semear(page, 30, 80);
  await page.goto(TRILHA);

  const alternar = page.getByRole("button", { name: "Certificado" });
  await expect(alternar).toBeVisible();
  await alternar.click();

  await expect(page.getByText("Seu certificado")).toBeVisible();
  // Cumprido, a tela para de dizer o que falta.
  await expect(page.getByText(/^Certificado:/)).toHaveCount(0);
});

test("compartilhar entrega um PNG, sem enviar nada para fora", async ({ page, browserName }) => {
  test.skip(browserName === "webkit", "download programático instável no WebKit de teste");
  await semear(page, 5, null);
  await page.goto(TRILHA);

  const pedidos: string[] = [];
  page.on("request", (r) => {
    if (r.method() === "POST") pedidos.push(r.url());
  });

  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Compartilhar" }).click();
  const arquivo = await download;
  expect(arquivo.suggestedFilename()).toBe("lumarys-progresso.png");
  expect(pedidos).toEqual([]);
});
