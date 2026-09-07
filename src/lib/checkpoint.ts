import type { Pergunta, Tema } from "@content/types";

import { embaralhar } from "./utils";

/**
 * Checkpoint de módulo: a única verificação que pergunta "você aprendeu este
 * módulo?" em vez de "você acertou este tema agora?".
 *
 * O banco sai dos próprios quizzes dos temas. Não há conteúdo novo a escrever,
 * e há uma razão para isso ser melhor: a pergunta reaparece dias depois do
 * tema, fora do contexto que a tornava fácil, que é exatamente o que a prova
 * faz.
 */

export const TAMANHO = 10;

/** Acerto mínimo para o módulo contar como fechado. */
export const APROVACAO = 0.7;

export type Objetiva = Extract<Pergunta, { tipo: "unica" | "multipla" }>;

export type PerguntaDeCheckpoint = Objetiva & {
  temaSlug: string;
  temaTitulo: string;
};

export function aprovado(acertos: number, total: number): boolean {
  return total > 0 && acertos / total >= APROVACAO;
}

/**
 * Até `TAMANHO` perguntas, sem repetir, distribuídas entre os temas do módulo.
 *
 * Intercalar importa aqui: dez perguntas seguidas do mesmo tema medem se a
 * pessoa lembra daquela página, não se ela sabe separar um conceito do
 * vizinho. A semente vem de fora para o checkpoint ser estável entre
 * renderizações e reprodutível no teste.
 */
export function montarCheckpoint(
  temas: Pick<Tema, "slug" | "titulo" | "perguntas">[],
  semente: number,
  tamanho: number = TAMANHO,
): PerguntaDeCheckpoint[] {
  const porTema = temas.map((tema) => {
    const objetivas = tema.perguntas.filter(
      (p): p is Objetiva => p.tipo === "unica" || p.tipo === "multipla",
    );
    return embaralhar(objetivas, semente + sementeDoTema(tema.slug)).map((p) => ({
      ...p,
      temaSlug: tema.slug,
      temaTitulo: tema.titulo,
    }));
  });

  const escolhidas: PerguntaDeCheckpoint[] = [];
  let restam = true;
  while (restam && escolhidas.length < tamanho) {
    restam = false;
    for (const fila of porTema) {
      const pergunta = fila.shift();
      if (!pergunta) continue;
      escolhidas.push(pergunta);
      restam = true;
      if (escolhidas.length >= tamanho) break;
    }
  }
  return escolhidas;
}

/** Desloca a semente por tema, para dois temas não sortearem a mesma ordem. */
function sementeDoTema(slug: string): number {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) % 100_000;
  return h;
}

/**
 * Os temas que a pessoa errou, sem repetição e na ordem em que apareceram. É o
 * que alimenta a fila de drills: errar duas perguntas do mesmo tema não faz o
 * tema aparecer duas vezes na lista de revisão.
 */
export function temasParaRevisar(
  perguntas: PerguntaDeCheckpoint[],
  erradas: number[],
): string[] {
  const vistos = new Set<string>();
  for (const i of erradas) {
    const slug = perguntas[i]?.temaSlug;
    if (slug) vistos.add(slug);
  }
  return [...vistos];
}
