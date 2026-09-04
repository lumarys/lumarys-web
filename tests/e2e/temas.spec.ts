import { readdirSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "@playwright/test";

/**
 * Cada um dos 30 temas abre sem erro de console, com vídeo, pré-teste, cards e
 * as perguntas de sabatina no lugar. É o "revisar a trilha inteira" em forma
 * executável.
 */
const dir = join(process.cwd(), "content", "temas");
const slugs = readdirSync(dir)
  .filter((f) => f.endsWith(".mdx"))
  .map((f) => f.replace(/\.mdx$/, ""))
  .sort();

const MODULOS: Record<string, string[]> = {
  fundamentos: ["big-data", "olap-oltp-etl", "data-centric-data-driven"],
  hadoop: ["hadoop-arquitetura", "mapreduce"],
  processamento: ["batch-vs-stream", "etl-vs-elt", "particionamento-de-dados"],
  spark: ["spark-introducao", "spark-rdd"],
  "camada-de-dados": ["zonas-data-lake"],
  databricks: ["lakehouse-delta-lake", "databricks-plataforma"],
  "tipos-de-dados": ["classificacao-tipos-dados", "xml", "json"],
  qualidade: ["governanca-de-dados", "data-quality"],
};

function moduloDe(slug: string): string {
  for (const [m, temas] of Object.entries(MODULOS)) if (temas.includes(slug)) return m;
  return "alem-da-ementa";
}

test("existem 30 temas", () => {
  expect(slugs).toHaveLength(30);
});

for (const slug of slugs) {
  test(`tema ${slug} abre íntegro`, async ({ page }) => {
    const erros: string[] = [];
    page.on("console", (m) => m.type() === "error" && erros.push(m.text()));
    page.on("pageerror", (e) => erros.push(e.message));

    const resposta = await page.goto(`/trilhas/engenharia-de-dados/${moduloDe(slug)}/${slug}/`);
    expect(resposta?.status()).toBe(200);
    await page.waitForLoadState("networkidle");

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByText("Por que cai")).toBeVisible();
    await expect(page.getByText(/^Pré-teste · 1 de/)).toBeVisible();
    await expect(page.getByRole("button", { name: /^assistir:/i }).first()).toBeVisible();
    await expect(page.getByText(/^Card 1 de \d+/)).toBeVisible();
    await expect(page.getByText("Perguntas de sabatina deste tema")).toBeVisible();
    await expect(page.getByRole("button", { name: /concluir tema/i })).toBeVisible();

    const relevantes = erros.filter((e) => !/favicon/i.test(e));
    expect(relevantes, relevantes.join("\n")).toHaveLength(0);
  });
}
