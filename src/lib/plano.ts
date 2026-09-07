import { somarDias } from "./srs";
import { diasAte } from "./utils";

/**
 * Onde o aluno está dentro do cronograma da trilha.
 *
 * Isto morava dentro de `Plano.tsx` como duas linhas de conta, e por isso
 * nenhuma outra tela conseguia dizer "você está no dia 4 de 14". Aqui é função
 * pura porque três telas precisam do mesmo número e porque data é a classe de
 * bug que só aparece na virada do dia, no fuso errado, na véspera da prova.
 */

export type SituacaoPlano =
  | "sem-plano"
  /** A prova está longe: o cronograma ainda não começou a valer. */
  | "aguardando"
  | "em-curso"
  | "prova-hoje"
  /** A data ficou para trás. Não é erro: é o estado normal de quem já fez a prova. */
  | "vencido";

export type EstadoPlano = {
  situacao: SituacaoPlano;
  /** Dia atual no cronograma, de 1 a `total`. Zero quando ainda não começou. */
  dia: number;
  total: number;
  /** Dias até a prova. Negativo depois dela. */
  faltam: number;
  /** Quando o cronograma passa a valer, se a prova ainda está longe. */
  comecaEm?: string;
};

export function estadoDoPlano(
  dataProva: string | undefined,
  total: number,
  agora: Date = new Date(),
): EstadoPlano {
  if (!dataProva || total <= 0) {
    return { situacao: "sem-plano", dia: 0, total, faltam: 0 };
  }

  const faltam = diasAte(dataProva, agora);

  if (faltam < 0) return { situacao: "vencido", dia: total, total, faltam };
  if (faltam === 0) return { situacao: "prova-hoje", dia: total, total, faltam };

  // Prova distante: o plano é o trecho final, não o intervalo inteiro. Sem
  // isto, faltando 60 dias a tela dizia que hoje é o dia 1 de 14 e a pessoa
  // perdia a noção de folga.
  if (faltam > total) {
    return {
      situacao: "aguardando",
      dia: 0,
      total,
      faltam,
      comecaEm: somarDias(dataProva, -(total - 1)),
    };
  }

  return { situacao: "em-curso", dia: total - faltam + 1, total, faltam };
}

/**
 * A data de cada dia do cronograma, do dia 1 ao último.
 *
 * O plano é ancorado no fim, e não no começo: o último dia é a véspera da
 * prova. Foi assim que `estadoDoPlano` sempre contou, e é o que permite pôr o
 * plano na agenda sem inventar um começo.
 */
export function datasDoPlano(dataProva: string, total: number): string[] {
  if (total <= 0) return [];
  return Array.from({ length: total }, (_, i) => somarDias(dataProva, -(total - 1 - i)));
}

/**
 * Quantos temas o cronograma esperava a esta altura, e o tamanho do atraso.
 * Serve para a trilha dizer "no ritmo" ou "atrasado 3 temas" em vez de só
 * mostrar uma barra.
 */
export function ritmoDoPlano(
  estado: EstadoPlano,
  concluidos: number,
  totalTemas: number,
): { esperado: number; atraso: number } {
  if (estado.situacao !== "em-curso" || totalTemas === 0) {
    return { esperado: 0, atraso: 0 };
  }
  const esperado = Math.round((totalTemas * estado.dia) / estado.total);
  return { esperado, atraso: Math.max(0, esperado - concluidos) };
}
