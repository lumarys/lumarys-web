import { readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "@playwright/test";

/**
 * Cada tema abre sem erro de console, com vídeo, pré-teste, cards e as
 * perguntas de sabatina no lugar. É o "revisar a trilha inteira" em forma
 * executável.
 *
 * As rotas vêm do sitemap gerado no build: uma URL canônica por tema. Antes
 * havia um mapa escrito à mão de slug para módulo, que envelhecia a cada tema
 * novo e não sabia de tema compartilhado entre trilhas.
 */
const mapa = readFileSync(join(process.cwd(), "out", "sitemap.xml"), "utf8");
const rotas = [
  ...mapa.matchAll(/<loc>https:\/\/lumarys\.com\.br(\/trilhas\/[^<]+\/[^<]+\/[^<]+\/)<\/loc>/g),
]
  .map((m) => m[1]!)
  // Só página de tema: trilha/módulo/tema. Plano, glossário, resumo e
  // checkpoint têm outra forma.
  .filter((r) => r.split("/").filter(Boolean).length === 4)
  .filter((r) => !/\/(plano|glossario|resumo|checkpoint)\/$/.test(r))
  .sort();

test("existem 55 temas", () => {
  expect(rotas).toHaveLength(55);
});

for (const rota of rotas) {
  const slug = rota.split("/").filter(Boolean).at(-1)!;
  test(`tema ${slug} abre íntegro`, async ({ page }) => {
    const erros: string[] = [];
    page.on("console", (m) => m.type() === "error" && erros.push(m.text()));
    page.on("pageerror", (e) => erros.push(e.message));

    const resposta = await page.goto(rota);
    expect(resposta?.status()).toBe(200);
    await page.waitForLoadState("networkidle");

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByText("Por que cai")).toBeVisible();
    await expect(page.getByText(/^Pré-teste · 1 de/)).toBeVisible();
    await expect(page.getByRole("button", { name: /^assistir:/i }).first()).toBeVisible();
    await expect(page.getByText(/^Card 1 de \d+/)).toBeVisible();
    // Tema de carreira tem perguntas orais; tema de certificação (formato:
    // prova) tem só cenários objetivos. Os dois têm o quiz.
    await expect(page.locator("#quiz")).toBeVisible();
    await expect(page.getByRole("button", { name: /concluir tema/i })).toBeVisible();

    const relevantes = erros.filter((e) => !/favicon/i.test(e));
    expect(relevantes, relevantes.join("\n")).toHaveLength(0);
  });
}
