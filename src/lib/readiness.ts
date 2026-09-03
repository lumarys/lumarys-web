import { CAIXA_MAXIMA, type EstadoCard } from "./srs";
import type { Progresso, ProgressoTrilha } from "./storage";

/**
 * Prontidão: quanto do módulo você provou que sabe, não quanto você leu.
 *
 * Quatro sinais, porque cada um sozinho mente. Cobertura sozinha vira teatro
 * (dar "concluído" em tudo). Quiz sozinho premia acerto no calor do tema, sem
 * retenção. Card sozinho mede memória, não raciocínio. Simulado sozinho é
 * pouco frequente. O peso maior fica no simulado oral porque é o formato real
 * da sabatina.
 */
export const PESOS = { cobertura: 0.2, quiz: 0.25, cards: 0.2, simulado: 0.35 } as const;

export type ProntidaoModulo = {
  moduloSlug: string;
  /** 0 a 100 */
  score: number;
  cobertura: number;
  quiz: number;
  cards: number;
  simulado: number;
  temasTotal: number;
  temasConcluidos: number;
};

type EntradaModulo = { slug: string; temas: string[] };

export function prontidaoDoModulo(
  modulo: EntradaModulo,
  progresso: Progresso,
  trilha: ProgressoTrilha | undefined,
): ProntidaoModulo {
  const total = modulo.temas.length;
  const vazio: ProntidaoModulo = {
    moduloSlug: modulo.slug,
    score: 0,
    cobertura: 0,
    quiz: 0,
    cards: 0,
    simulado: 0,
    temasTotal: total,
    temasConcluidos: 0,
  };
  if (total === 0 || !trilha) return vazio;

  const concluidos = modulo.temas.filter((t) => trilha.temasConcluidos[t]).length;
  const cobertura = concluidos / total;

  const quizzes = modulo.temas.map((t) => trilha.quizzes[t]).filter(Boolean);
  const quiz =
    quizzes.length === 0
      ? 0
      : (quizzes.reduce((acc, q) => acc + q!.acertos / Math.max(q!.total, 1), 0) / quizzes.length) *
        (quizzes.length / total);

  const cardsDoModulo = Object.values(progresso.cards).filter((c: EstadoCard) =>
    modulo.temas.includes(c.temaSlug),
  );
  const cards =
    cardsDoModulo.length === 0
      ? 0
      : cardsDoModulo.reduce((acc, c) => acc + Math.min(c.caixa, CAIXA_MAXIMA) / CAIXA_MAXIMA, 0) /
        cardsDoModulo.length;

  const ultimo = trilha.simulados.at(-1)?.porModulo[modulo.slug];
  const simulado = ultimo && ultimo.maximo > 0 ? ultimo.nota / ultimo.maximo : 0;

  const score =
    (cobertura * PESOS.cobertura +
      quiz * PESOS.quiz +
      cards * PESOS.cards +
      simulado * PESOS.simulado) *
    100;

  return {
    moduloSlug: modulo.slug,
    score: Math.round(score),
    cobertura: Math.round(cobertura * 100),
    quiz: Math.round(quiz * 100),
    cards: Math.round(cards * 100),
    simulado: Math.round(simulado * 100),
    temasTotal: total,
    temasConcluidos: concluidos,
  };
}

export function prontidaoDaTrilha(
  modulos: EntradaModulo[],
  progresso: Progresso,
  trilhaSlug: string,
): { geral: number; porModulo: ProntidaoModulo[]; pontoFraco?: ProntidaoModulo } {
  const trilha = progresso.trilhas[trilhaSlug];
  const porModulo = modulos.map((m) => prontidaoDoModulo(m, progresso, trilha));
  const comTemas = porModulo.filter((p) => p.temasTotal > 0);

  // Média ponderada pelo tamanho do módulo: um módulo de 12 temas pesa mais
  // que um de 1 na prontidão geral.
  const pesoTotal = comTemas.reduce((acc, p) => acc + p.temasTotal, 0);
  const geral =
    pesoTotal === 0
      ? 0
      : Math.round(comTemas.reduce((acc, p) => acc + p.score * p.temasTotal, 0) / pesoTotal);

  // Ponto fraco: o módulo mais fraco entre os que você já começou. Antes de
  // começar qualquer coisa, tudo é zero e apontar "ponto fraco" não ajuda.
  const iniciados = comTemas.filter((p) => p.temasConcluidos > 0 || p.cards > 0);
  const pontoFraco = iniciados.slice().sort((a, b) => a.score - b.score)[0];

  return { geral, porModulo, pontoFraco };
}

export function rotuloProntidao(score: number): string {
  if (score >= 80) return "pronto";
  if (score >= 60) return "quase lá";
  if (score >= 35) return "em construção";
  if (score > 0) return "começando";
  return "sem dados";
}
