import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";

export const DIR = join(process.cwd(), "content", "temas");

export function lerTemas() {
  if (!existsSync(DIR)) return [];
  return readdirSync(DIR)
    .filter((f) => f.endsWith(".mdx"))
    .sort()
    .map((arquivo) => {
      const { data, content } = matter(readFileSync(join(DIR, arquivo), "utf8"));
      return { arquivo, dados: data, corpo: content };
    });
}

export function sair(erros, avisos, oque) {
  for (const a of avisos) console.warn(`aviso  ${a}`);
  for (const e of erros) console.error(`ERRO   ${e}`);
  if (erros.length) {
    console.error(`\n${oque}: ${erros.length} problema(s).`);
    process.exit(1);
  }
  console.log(`ok: ${oque} sem problemas${avisos.length ? ` (${avisos.length} aviso(s))` : ""}.`);
}

const DIR_TRILHAS = join(process.cwd(), "content", "trilhas");

/**
 * As trilhas na ordem do catálogo (content/trilhas/index.ts), com módulos e
 * temas extraídos do texto dos arquivos TypeScript.
 *
 * A ordem importa: um tema compartilhado por duas trilhas é canônico na
 * primeira que o contém, e o feed lista uma URL só. Ler o diretório em ordem
 * alfabética daria "analytics" antes de "dados" e inverteria a canônica.
 */
export function lerTrilhasNaOrdem() {
  const indice = readFileSync(join(DIR_TRILHAS, "index.ts"), "utf8");
  const nomes = [
    ...(indice.match(/trilhas:\s*Trilha\[\]\s*=\s*\[([^\]]*)\]/)?.[1] ?? "").matchAll(/(\w+)/g),
  ].map((m) => m[1]);
  const arquivos = readdirSync(DIR_TRILHAS).filter((f) => f.endsWith(".ts") && f !== "index.ts");

  return nomes.flatMap((nome) => {
    const arquivo = arquivos.find((f) =>
      new RegExp(`export const ${nome}\\b`).test(readFileSync(join(DIR_TRILHAS, f), "utf8")),
    );
    if (!arquivo) return [];
    const fonte = readFileSync(join(DIR_TRILHAS, arquivo), "utf8");
    const slug =
      fonte.match(/slug:\s*"([a-z0-9-]+)",\s*\n\s*tipo:/)?.[1] ?? arquivo.replace(".ts", "");
    const titulo = fonte.match(/^\s{2}titulo:\s*"([^"]+)"/m)?.[1] ?? slug;
    const modulos = [
      ...fonte.matchAll(
        /\{\s*slug:\s*"([a-z0-9-]+)",\s*titulo:\s*"([^"]+)",[\s\S]*?temas:\s*\[([^\]]*)\]/g,
      ),
    ].map((b) => ({
      slug: b[1],
      titulo: b[2],
      temas: [...b[3].matchAll(/"([a-z0-9-]+)"/g)].map((m) => m[1]),
    }));
    return [{ arquivo, slug, titulo, modulos }];
  });
}
