import { CAIXA_PRONTO, estaNovo, type EstadoCard } from "./srs";
import type { Progresso } from "./storage";

/**
 * O que a tela da Conta pode afirmar sem mentir. A pergunta que a pessoa faz
 * ali é "se eu limpar este navegador, o que eu perco?", e a resposta tem de
 * ser em unidades que ela reconhece: temas, sequência, cards, a data da prova.
 */
export type ResumoAparelho = {
  temas: number;
  sequencia: number;
  /** Cards já estudados ao menos uma vez, nas caixas 1 a CAIXA_PRONTO. */
  emRevisao: number;
  /** Cards semeados por abrir um tema e ainda não respondidos (caixa 0). */
  novos: number;
  /** Cards que já passaram da última caixa; contados à parte de "em revisão". */
  memorizados: number;
  /** Data da prova mais próxima, em DD/MM, ou null sem plano. */
  planoAte: string | null;
  vazio: boolean;
};

export function resumoDoAparelho(progresso: Progresso): ResumoAparelho {
  const trilhas = Object.values(progresso.trilhas);

  const temas = trilhas.reduce((acc, t) => acc + Object.keys(t.temasConcluidos).length, 0);

  const cards = Object.values(progresso.cards);
  const novos = cards.filter(estaNovo).length;
  const emRevisao = cards.filter((c: EstadoCard) => c.caixa >= 1 && c.caixa <= CAIXA_PRONTO).length;
  const memorizados = cards.filter((c: EstadoCard) => c.caixa > CAIXA_PRONTO).length;

  // A prova que importa é a próxima, não a última cadastrada.
  const datas = trilhas.map((t) => t.dataProva).filter((d): d is string => Boolean(d));
  datas.sort();
  const proxima = datas[0];

  return {
    temas,
    sequencia: progresso.streak.atual,
    emRevisao,
    novos,
    memorizados,
    planoAte: proxima ? formatarDiaMes(proxima) : null,
    vazio: temas === 0 && cards.length === 0 && progresso.streak.atual === 0,
  };
}

/** "2026-09-18" -> "18/09". Sem `new Date`: a data é um dia, não um instante. */
function formatarDiaMes(iso: string): string {
  const [, mes, dia] = iso.split("-");
  return mes && dia ? `${dia}/${mes}` : iso;
}

/**
 * "há 3 min". O agora entra como argumento para o teste não depender do
 * relógio da máquina (ver CONTRIBUTING, regra 5).
 */
export function desdeEntao(quando: number, agora: number = Date.now()): string {
  const minutos = Math.floor((agora - quando) / 60_000);
  if (minutos < 1) return "agora mesmo";
  if (minutos < 60) return `há ${minutos} min`;

  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `há ${horas} h`;

  const dias = Math.floor(horas / 24);
  return dias === 1 ? "ontem" : `há ${dias} dias`;
}
