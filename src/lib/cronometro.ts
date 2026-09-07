/**
 * Tempo do simulado. É sugestão, nunca corte: a sabatina real tem ritmo, mas
 * uma tela que interrompe a pessoa no meio da frase ensina a ter pressa, não
 * a responder melhor. O cronômetro só muda de cor.
 */

/** Quanto tempo uma resposta oral costuma pedir na banca. */
export const SEGUNDOS_SUGERIDOS = 120;

export type EstadoDoTempo = "dentro" | "perto" | "passou";

export function estadoDoTempo(
  segundos: number,
  sugerido: number = SEGUNDOS_SUGERIDOS,
): EstadoDoTempo {
  if (segundos >= sugerido) return "passou";
  // Os últimos 25% servem para a pessoa começar a concluir, e não para
  // descobrir o tempo estourado depois que já estourou.
  if (segundos >= sugerido * 0.75) return "perto";
  return "dentro";
}

/** "01:24". Aceita segundos negativos como zero, para não imprimir "-0:-5". */
export function formatarTempo(segundos: number): string {
  const total = Math.max(0, Math.floor(segundos));
  const mm = String(Math.floor(total / 60)).padStart(2, "0");
  const ss = String(total % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}
