import type { Tema } from "@content/types";

/**
 * Glossário montado do próprio conteúdo.
 *
 * O componente `Termo` existia no MDX e não alimentava nenhuma página: 23
 * temas definiam vocabulário que só aparecia no meio do texto onde tinha sido
 * escrito. Um glossário serve a dois públicos que não se encontram — quem
 * revisa na véspera e quem chega de busca perguntando "o que é particionamento
 * de dados".
 */

export type TermoDoGlossario = {
  nome: string;
  definicao: string;
  temaSlug: string;
  temaTitulo: string;
  moduloSlug: string;
};

// `[\s\S]` em vez da flag `s`: a definição costuma quebrar linha no MDX.
const PADRAO = /<Termo\s+nome="([^"]+)"\s*>([\s\S]*?)<\/Termo>/g;

/**
 * Extrai os termos de um corpo MDX. A definição vem como texto: marcação
 * inline (negrito, código) é removida, porque o glossário é uma lista, não uma
 * segunda cópia do tema.
 */
export function extrairTermos(corpo: string): { nome: string; definicao: string }[] {
  const termos: { nome: string; definicao: string }[] = [];
  for (const [, nome, bruto] of corpo.matchAll(PADRAO)) {
    if (!nome || !bruto) continue;
    const definicao = limpar(bruto);
    if (definicao) termos.push({ nome: nome.trim(), definicao });
  }
  return termos;
}

function limpar(texto: string): string {
  return texto
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

/** Os temas de um módulo, como o glossário precisa vê-los. */
export type TemaComCorpo = Pick<Tema, "slug" | "titulo" | "corpo">;

/**
 * Termos de uma sequência de módulos, em ordem alfabética de português.
 *
 * Recebe os temas em vez de buscá-los: `lib/content` é server-only, e a regra
 * de montagem do glossário merece teste sem depender do sistema de arquivos.
 *
 * Termo repetido em dois temas fica com a primeira ocorrência na ordem da
 * trilha — quem define primeiro é quem introduz o conceito, e é para lá que a
 * pessoa deve ir.
 */
export function montarGlossario(
  modulos: { slug: string; temas: TemaComCorpo[] }[],
): TermoDoGlossario[] {
  const vistos = new Map<string, TermoDoGlossario>();

  for (const modulo of modulos) {
    for (const tema of modulo.temas) {
      for (const termo of extrairTermos(tema.corpo)) {
        const chave = termo.nome.toLocaleLowerCase("pt-BR");
        if (vistos.has(chave)) continue;
        vistos.set(chave, {
          ...termo,
          temaSlug: tema.slug,
          temaTitulo: tema.titulo,
          moduloSlug: modulo.slug,
        });
      }
    }
  }

  return [...vistos.values()].sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
}

/** O que cabe numa folha de revisão de véspera, por tema. */
export type ResumoDeTema = Pick<Tema, "slug" | "titulo" | "porQue" | "comoCai" | "errosComuns">;
