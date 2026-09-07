import { expect, test, type Page } from "@playwright/test";

/**
 * O tema claro existia pela metade: bg, texto e borda trocavam, mas verde,
 * vermelho e azul continuavam nos tons do escuro, com cerca de 2:1 sobre
 * papel branco — ou seja, o aviso de erro era o texto menos legível da tela.
 * E não havia como escolher: quem tem o sistema no claro por horário perdia o
 * tema escuro às 6h da manhã.
 */

/** Luminância relativa (WCAG) a partir de um "rgb(r, g, b)". */
function luminancia(cor: string): number {
  const m = /rgba?\((\d+), ?(\d+), ?(\d+)/.exec(cor);
  if (!m) throw new Error(`cor inesperada: ${cor}`);
  const canais = [m[1], m[2], m[3]].map((c) => {
    const v = Number(c) / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return 0.2126 * canais[0] + 0.7152 * canais[1] + 0.0722 * canais[2];
}

function contraste(frente: string, fundo: string): number {
  const a = luminancia(frente);
  const b = luminancia(fundo);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

async function corDoToken(page: Page, token: string): Promise<string> {
  return page.evaluate((nome) => {
    const sonda = document.createElement("span");
    sonda.style.color = `var(${nome})`;
    document.body.appendChild(sonda);
    const cor = getComputedStyle(sonda).color;
    sonda.remove();
    return cor;
  }, token);
}

test("no tema claro, sucesso, erro e informação continuam legíveis", async ({ page }) => {
  await page.goto("/conta/");
  await page.getByRole("radio", { name: "Claro" }).click();

  const fundo = await corDoToken(page, "--surface");
  for (const token of ["--color-success", "--color-danger", "--color-info"]) {
    const cor = await corDoToken(page, token);
    expect(contraste(cor, fundo), `${token} (${cor}) sobre ${fundo}`).toBeGreaterThanOrEqual(4.5);
  }
});

test("a escolha de tema sobrevive à navegação e ao recarregamento", async ({ page }) => {
  await page.goto("/conta/");
  await page.getByRole("radio", { name: "Claro" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-tema", "claro");

  // O atributo tem de estar posto antes da hidratação: se só o React o
  // escrevesse, a página abriria escura e piscaria.
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-tema", "claro");

  await page.goto("/conta/");
  await page.getByRole("radio", { name: "Escuro" }).click();
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-tema", "escuro");

  // "Automático" devolve a decisão ao sistema, e por isso apaga o atributo.
  await page.getByRole("radio", { name: "Automático" }).click();
  await expect(page.locator("html")).not.toHaveAttribute("data-tema", /.*/);
});

test("com o sistema no claro, o tema escuro escolhido prevalece", async ({ browser }) => {
  const contexto = await browser.newContext({ colorScheme: "light" });
  const page = await contexto.newPage();
  await page.goto("/conta/");
  await page.getByRole("radio", { name: "Escuro" }).click();

  const fundo = await corDoToken(page, "--bg");
  expect(luminancia(fundo)).toBeLessThan(0.1);
  await contexto.close();
});
