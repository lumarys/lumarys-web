import type { ProgressoTrilha } from "./storage";

/**
 * Fila de drills: prática deliberada em cima do que a pessoa já errou.
 *
 * O drill existia só dentro do corpo do tema, no meio de uma página de
 * milhares de pixels — ou seja, só acontecia por acaso, e quase nunca no tema
 * em que teria valido a pena. Aqui ele vira uma fila com endereço: os temas
 * cujo quiz ficou abaixo do corte, e os que o checkpoint do módulo apontou.
 */

/** Abaixo disto o tema entra na fila. Mesmo corte do quiz e do checkpoint. */
export const CORTE = 0.7;

export type MotivoDoDrill = "checkpoint" | "quiz";

export type ItemDaFila = {
  temaSlug: string;
  motivo: MotivoDoDrill;
  /** Quando surgiu a evidência do erro; a fila mostra o mais recente antes. */
  em: number;
};

/**
 * Temas que pedem drill, do mais recente para o mais antigo.
 *
 * O erro do checkpoint vem antes do erro do quiz porque é evidência mais
 * dura: o quiz foi respondido logo depois de ler, o checkpoint dias depois.
 *
 * Sai da fila quem já refez o drill **depois** do erro e foi bem. Refazer e ir
 * mal de novo mantém o tema ali, que é o ponto.
 */
export function filaDeDrills(
  trilha: ProgressoTrilha | undefined,
  temasComDrill: string[],
): ItemDaFila[] {
  if (!trilha) return [];
  const elegiveis = new Set(temasComDrill);
  const itens = new Map<string, ItemDaFila>();

  for (const checkpoint of Object.values(trilha.checkpoints ?? {})) {
    for (const temaSlug of checkpoint.temasParaRevisar) {
      if (!elegiveis.has(temaSlug)) continue;
      const atual = itens.get(temaSlug);
      if (!atual || checkpoint.atualizadoEm > atual.em) {
        itens.set(temaSlug, { temaSlug, motivo: "checkpoint", em: checkpoint.atualizadoEm });
      }
    }
  }

  for (const [temaSlug, quiz] of Object.entries(trilha.quizzes)) {
    if (!elegiveis.has(temaSlug)) continue;
    if (quiz.total === 0 || quiz.acertos / quiz.total >= CORTE) continue;
    // Um erro de checkpoint já registrado para o mesmo tema tem prioridade.
    if (itens.get(temaSlug)?.motivo === "checkpoint") continue;
    itens.set(temaSlug, { temaSlug, motivo: "quiz", em: quiz.atualizadoEm });
  }

  return [...itens.values()]
    .filter((item) => !jaResolvido(trilha, item))
    .sort((a, b) => ordem(a.motivo) - ordem(b.motivo) || b.em - a.em);
}

function ordem(motivo: MotivoDoDrill): number {
  return motivo === "checkpoint" ? 0 : 1;
}

function jaResolvido(trilha: ProgressoTrilha, item: ItemDaFila): boolean {
  const drill = trilha.drills?.[item.temaSlug];
  if (!drill || drill.total === 0) return false;
  return drill.atualizadoEm > item.em && drill.acertos / drill.total >= CORTE;
}

/**
 * Tempo estimado de um drill, por número de itens. Um minuto por item, com
 * piso de três: prometer "5 min" fixo para um drill de dez itens é mentira
 * pequena que corrói a confiança na estimativa seguinte.
 */
export function minutosDoDrill(itens: number): number {
  return Math.max(3, itens);
}
