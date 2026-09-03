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
