import { expect, test } from "@playwright/test";

/** Páginas que qualquer visitante alcança. */
const PAGINAS = [
  "/",
  "/trilhas/",
  "/trilhas/engenharia-de-dados/",
  "/trilhas/engenharia-de-dados/spark/spark-introducao/",
  "/metodo/",
  "/privacidade/",
  "/hoje/",
  "/conta/",
];

for (const caminho of PAGINAS) {
  test(`sem rolagem horizontal em ${caminho}`, async ({ page }) => {
    await page.goto(caminho);
    await page.waitForLoadState("networkidle");

    const medida = await page.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      cliente: document.documentElement.clientWidth,
      culpados: [...document.querySelectorAll<HTMLElement>("body *")]
        .filter((el) => el.getBoundingClientRect().right > document.documentElement.clientWidth + 1)
        .slice(0, 5)
        .map((el) => `${el.tagName.toLowerCase()}.${(el.className || "").toString().slice(0, 60)}`),
    }));

    expect(
      medida.scroll,
      `elementos passando da tela: ${medida.culpados.join(" | ") || "nenhum identificado"}`,
    ).toBeLessThanOrEqual(medida.cliente + 1);
  });
}

test("o botão principal do hero tem contraste legível", async ({ page }) => {
  await page.goto("/");
  const botao = page.getByRole("link", { name: /ver a trilha/i }).first();
  await expect(botao).toBeVisible();

  const cores = await botao.evaluate((el) => {
    const s = getComputedStyle(el);
    return { texto: s.color, fundo: s.backgroundColor };
  });

  // Vale nos dois temas: o âmbar é claro em ambos, então a tinta é escura.

  // O texto precisa ser escuro sobre o âmbar; se a regra de link vencer a
  // utility, ele volta a ficar âmbar sobre âmbar (foi um bug real).
  const escuro = /rgb\((\d+), (\d+), (\d+)\)/.exec(cores.texto);
  expect(escuro, `cor do texto: ${cores.texto}`).not.toBeNull();
  const soma = escuro ? Number(escuro[1]) + Number(escuro[2]) + Number(escuro[3]) : 999;
  expect(soma, `texto ${cores.texto} sobre fundo ${cores.fundo}`).toBeLessThan(200);
});

test("alvos de toque têm ao menos 44px", async ({ page }) => {
  await page.goto("/trilhas/engenharia-de-dados/");
  // Link dentro de frase corrida e o atalho "pular para o conteúdo" não são
  // alvos de toque; a regra vale para o que a pessoa realmente pressiona.
  const alvos = page.locator(
    "a:not(p a):not(.sr-only):not([href='#conteudo']), button:not(p button)",
  );
  const total = await alvos.count();

  const pequenos: string[] = [];
  for (let i = 0; i < total; i++) {
    const alvo = alvos.nth(i);
    if (!(await alvo.isVisible())) continue;
    const caixa = await alvo.boundingBox();
    if (caixa && caixa.height < 44) {
      pequenos.push(`${(await alvo.textContent())?.trim().slice(0, 30)} (${Math.round(caixa.height)}px)`);
    }
  }

  expect(pequenos, `alvos menores que 44px: ${pequenos.join(", ")}`).toHaveLength(0);
});
