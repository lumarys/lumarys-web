import { prontidaoDaTrilha } from "./readiness";
import type { Progresso } from "./storage";

/**
 * O que uma conquista da trilha pode afirmar.
 *
 * O momento de concluir passava em branco, e é o único canal de aquisição
 * orgânica previsto além da busca. A regra do certificado é dura de propósito:
 * um certificado que sai por ter clicado em "concluído" trinta vezes não vale
 * nada para quem recebe, e menos ainda para quem mostra.
 */

/** Nota mínima no último simulado para o certificado. */
export const NOTA_MINIMA = 0.7;

export type Conquista = {
  temasConcluidos: number;
  totalTemas: number;
  prontidao: number;
  sequencia: number;
  /** 0 a 100 do último simulado, ou null se nunca fez. */
  notaSimulado: number | null;
  trilhaCompleta: boolean;
  simuladoAprovado: boolean;
  /** Só com a trilha inteira concluída E o simulado acima do corte. */
  podeCertificado: boolean;
};

export function conquistaDaTrilha(
  progresso: Progresso,
  trilhaSlug: string,
  modulos: { slug: string; temas: string[] }[],
  totalTemas: number,
): Conquista {
  const trilha = progresso.trilhas[trilhaSlug];
  const temasConcluidos = Object.keys(trilha?.temasConcluidos ?? {}).length;
  const { geral } = prontidaoDaTrilha(modulos, progresso, trilhaSlug);

  const ultimo = trilha?.simulados.at(-1);
  const somas = Object.values(ultimo?.porModulo ?? {});
  const nota = somas.reduce((a, m) => a + m.nota, 0);
  const maximo = somas.reduce((a, m) => a + m.maximo, 0);
  const notaSimulado = maximo > 0 ? Math.round((nota / maximo) * 100) : null;

  const trilhaCompleta = totalTemas > 0 && temasConcluidos >= totalTemas;
  const simuladoAprovado = notaSimulado !== null && notaSimulado >= NOTA_MINIMA * 100;

  return {
    temasConcluidos,
    totalTemas,
    prontidao: geral,
    sequencia: progresso.streak.atual,
    notaSimulado,
    trilhaCompleta,
    simuladoAprovado,
    podeCertificado: trilhaCompleta && simuladoAprovado,
  };
}

/**
 * O que falta para o certificado, em uma frase. Vazio quando já dá.
 * Dizer "faltam 4 temas" é mais útil que esconder o botão sem explicação.
 */
export function faltaParaCertificado(c: Conquista): string {
  if (c.podeCertificado) return "";

  const partes: string[] = [];
  if (!c.trilhaCompleta) {
    const faltam = c.totalTemas - c.temasConcluidos;
    partes.push(`${faltam} tema${faltam === 1 ? "" : "s"}`);
  }
  if (!c.simuladoAprovado) {
    partes.push(
      c.notaSimulado === null
        ? "um simulado"
        : `um simulado acima de ${Math.round(NOTA_MINIMA * 100)}% (o último deu ${c.notaSimulado}%)`,
    );
  }
  return `Falta ${partes.join(" e ")}.`;
}
