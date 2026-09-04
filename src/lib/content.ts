import "server-only";

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";

import { temaFrontmatterSchema, type Tema } from "@content/types";
import { trilhas, trilhasPorSlug } from "@content/trilhas";
import type { Modulo, Trilha } from "@content/types";

const TEMAS_DIR = join(process.cwd(), "content", "temas");

let cache: Map<string, Tema> | null = null;

/**
 * Lê e valida todos os temas em content/temas. O schema roda em build: um tema
 * sem pré-teste, com menos de 8 flashcards ou sem vídeo derruba o build com
 * mensagem apontando o arquivo — é o content-lint mais barato que existe.
 */
export function carregarTemas(): Map<string, Tema> {
  if (cache) return cache;

  const mapa = new Map<string, Tema>();
  if (!existsSync(TEMAS_DIR)) {
    cache = mapa;
    return mapa;
  }

  for (const arquivo of readdirSync(TEMAS_DIR).filter((f) => f.endsWith(".mdx")).sort()) {
    const cru = readFileSync(join(TEMAS_DIR, arquivo), "utf8");
    const { data, content } = matter(cru);
    const resultado = temaFrontmatterSchema.safeParse(data);

    if (!resultado.success) {
      const problemas = resultado.error.issues
        .map((i) => `  · ${i.path.join(".") || "(raiz)"}: ${i.message}`)
        .join("\n");
      throw new Error(`Frontmatter inválido em content/temas/${arquivo}:\n${problemas}`);
    }

    const esperado = `${resultado.data.slug}.mdx`;
    if (arquivo !== esperado) {
      throw new Error(`content/temas/${arquivo}: o slug do frontmatter exige o nome ${esperado}.`);
    }

    mapa.set(resultado.data.slug, { ...resultado.data, corpo: content.trim() });
  }

  cache = mapa;
  return mapa;
}

export function obterTema(slug: string): Tema | undefined {
  return carregarTemas().get(slug);
}

export function obterTrilha(slug: string): Trilha | undefined {
  return trilhasPorSlug.get(slug);
}

export function listarTrilhas(): Trilha[] {
  return trilhas;
}

/** Só os temas que existem em disco, na ordem declarada pelo módulo. */
export function temasDoModulo(modulo: Modulo): Tema[] {
  const temas = carregarTemas();
  return modulo.temas.map((s) => temas.get(s)).filter((t): t is Tema => Boolean(t));
}

export function temasDaTrilha(trilha: Trilha): Tema[] {
  return trilha.modulos.flatMap((m) => temasDoModulo(m));
}

export type LocalizacaoTema = { trilha: Trilha; modulo: Modulo; tema: Tema };

/** Onde um tema mora dentro de uma trilha — usado para breadcrumb e rotas. */
export function localizarTema(trilhaSlug: string, temaSlug: string): LocalizacaoTema | undefined {
  const trilha = obterTrilha(trilhaSlug);
  if (!trilha) return undefined;
  const tema = obterTema(temaSlug);
  if (!tema) return undefined;
  const modulo = trilha.modulos.find((m) => m.temas.includes(temaSlug));
  if (!modulo) return undefined;
  return { trilha, modulo, tema };
}

/** Sequência linear da trilha, para "próximo tema" e para o plano. */
export function sequenciaDaTrilha(trilha: Trilha): { modulo: Modulo; tema: Tema }[] {
  return trilha.modulos.flatMap((modulo) =>
    temasDoModulo(modulo).map((tema) => ({ modulo, tema })),
  );
}

export function vizinhosDoTema(
  trilha: Trilha,
  temaSlug: string,
): { anterior?: Tema; proximo?: Tema } {
  const seq = sequenciaDaTrilha(trilha);
  const i = seq.findIndex((x) => x.tema.slug === temaSlug);
  if (i === -1) return {};
  return { anterior: seq[i - 1]?.tema, proximo: seq[i + 1]?.tema };
}

/** Todos os pares (trilha, tema) para generateStaticParams. */
export function todasAsRotasDeTema(): { trilha: string; modulo: string; tema: string }[] {
  return trilhas.flatMap((trilha) =>
    trilha.modulos.flatMap((modulo) =>
      temasDoModulo(modulo).map((tema) => ({
        trilha: trilha.slug,
        modulo: modulo.slug,
        tema: tema.slug,
      })),
    ),
  );
}

export function contarTemas(trilha: Trilha): number {
  return temasDaTrilha(trilha).length;
}

export function minutosDaTrilha(trilha: Trilha): number {
  return temasDaTrilha(trilha).reduce((acc, t) => acc + t.minutos, 0);
}

export type EstatisticasTrilha = {
  temas: number;
  minutos: number;
  flashcards: number;
  perguntasOrais: number;
  videos: number;
  modulos: number;
};

/** Números reais do conteúdo publicado, contados no build. Nada estimado. */
export function estatisticasDaTrilha(trilha: Trilha): EstatisticasTrilha {
  const temas = temasDaTrilha(trilha);
  return {
    temas: temas.length,
    minutos: temas.reduce((a, t) => a + t.minutos, 0),
    flashcards: temas.reduce((a, t) => a + t.flashcards.length, 0),
    perguntasOrais: temas.reduce(
      (a, t) => a + t.perguntas.filter((p) => p.tipo === "oral").length,
      0,
    ),
    videos: temas.reduce((a, t) => a + t.videos.length, 0),
    modulos: trilha.modulos.filter((m) => temasDoModulo(m).length > 0).length,
  };
}
