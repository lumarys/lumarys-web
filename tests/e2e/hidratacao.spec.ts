import { expect, test } from "@playwright/test";

/**
 * Regressão do defeito mais caro do projeto até aqui: a produção ficou um dia
 * inteiro sem hidratação porque a CSP bloqueava os scripts inline do Next, e
 * nenhum teste local percebeu porque o servidor local não mandava a política.
 * Agora a política está na própria página, e este teste prova duas coisas:
 * nenhuma violação de CSP no console, e a página responde a clique.
 */
const PAGINAS = [
  "/",
  "/hoje/",
  "/trilhas/engenharia-de-dados/",
  "/trilhas/engenharia-de-dados/fundamentos/big-data/",
  "/simulado/",
  "/conta/",
];

for (const caminho of PAGINAS) {
  test(`sem violação de CSP nem erro de hidratação em ${caminho}`, async ({ page }) => {
    const erros: string[] = [];
    page.on("console", (m) => {
      if (m.type() === "error") erros.push(m.text());
    });
    page.on("pageerror", (e) => erros.push(`pageerror: ${e.message}`));

    await page.goto(caminho);
    await page.waitForLoadState("networkidle");

    const relevantes = erros.filter(
      (e) => /Content Security Policy|Minified React error|Hydration/i.test(e),
    );
    expect(relevantes, relevantes.join("\n")).toHaveLength(0);
  });
}

test("a página do tema está hidratada: o rádio de certeza muda de estado", async ({ page }) => {
  await page.goto("/trilhas/engenharia-de-dados/fundamentos/big-data/");
  const radio = page.getByRole("radio", { name: "alta" });
  await expect(radio).toHaveAttribute("aria-checked", "false");
  await radio.click();
  await expect(radio).toHaveAttribute("aria-checked", "true");
});
