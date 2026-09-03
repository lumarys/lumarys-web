/**
 * Repetição espaçada, sistema de Leitner com intervalos de 1, 3, 7 e 12 dias.
 * Os intervalos são curtos de propósito: a trilha de Engenharia de Dados tem
 * prazo de 14 dias, então um card revisado no dia 1 precisa reaparecer três
 * vezes antes da prova.
 */

export const INTERVALOS_DIAS = [1, 3, 7, 12] as const;
export const CAIXA_MAXIMA = INTERVALOS_DIAS.length;

export type EstadoCard = {
  /** `${temaSlug}#${indice}` */
  id: string;
  temaSlug: string;
  /** 0 = nunca revisado; 1 a 4 = caixa de Leitner. */
  caixa: number;
  /** Data (YYYY-MM-DD) da próxima revisão. */
  vencimento: string;
  acertos: number;
  erros: number;
  atualizadoEm: number;
};

export function hojeISO(agora: Date = new Date()): string {
  const iso = new Date(agora.getTime() - agora.getTimezoneOffset() * 60_000).toISOString();
  return iso.slice(0, 10);
}

export function somarDias(dataISO: string, dias: number): string {
  const d = new Date(`${dataISO}T00:00:00`);
  d.setDate(d.getDate() + dias);
  return hojeISO(d);
}

export function cardNovo(temaSlug: string, indice: number, agora: Date = new Date()): EstadoCard {
  return {
    id: `${temaSlug}#${indice}`,
    temaSlug,
    caixa: 0,
    vencimento: hojeISO(agora),
    acertos: 0,
    erros: 0,
    atualizadoEm: agora.getTime(),
  };
}

/**
 * Acerto sobe uma caixa; erro volta para a primeira. Voltar à primeira (e não
 * uma caixa atrás) é deliberado: um card que você errou não está "quase lá".
 */
export function revisar(card: EstadoCard, acertou: boolean, agora: Date = new Date()): EstadoCard {
  const caixa = acertou ? Math.min(card.caixa + 1, CAIXA_MAXIMA) : 1;
  const intervalo = INTERVALOS_DIAS[caixa - 1] ?? INTERVALOS_DIAS[0];
  return {
    ...card,
    caixa,
    vencimento: somarDias(hojeISO(agora), intervalo),
    acertos: card.acertos + (acertou ? 1 : 0),
    erros: card.erros + (acertou ? 0 : 1),
    atualizadoEm: agora.getTime(),
  };
}

export function estaVencido(card: EstadoCard, agora: Date = new Date()): boolean {
  return card.vencimento <= hojeISO(agora);
}

/**
 * Fila do dia com intercalação: em vez de todos os cards de Spark seguidos,
 * alterna entre temas. Misturar assuntos rende mais que blocos, e é o
 * princípio de intercalação do Ultraaprendizado aplicado à revisão.
 */
export function filaDoDia(
  cards: EstadoCard[],
  agora: Date = new Date(),
  limite = 40,
): EstadoCard[] {
  const vencidos = cards.filter((c) => estaVencido(c, agora));

  const porTema = new Map<string, EstadoCard[]>();
  for (const card of vencidos) {
    const lista = porTema.get(card.temaSlug) ?? [];
    lista.push(card);
    porTema.set(card.temaSlug, lista);
  }
  for (const lista of porTema.values()) {
    lista.sort((a, b) => a.caixa - b.caixa || a.vencimento.localeCompare(b.vencimento));
  }

  const fila: EstadoCard[] = [];
  const grupos = [...porTema.values()];
  let restam = true;
  while (restam && fila.length < limite) {
    restam = false;
    for (const grupo of grupos) {
      const card = grupo.shift();
      if (card) {
        fila.push(card);
        restam = true;
        if (fila.length >= limite) break;
      }
    }
  }
  return fila;
}

/** Quantos cards vencem em cada um dos próximos dias, para o gráfico do plano. */
export function previsao(cards: EstadoCard[], dias = 14, agora: Date = new Date()) {
  const base = hojeISO(agora);
  return Array.from({ length: dias }, (_, i) => {
    const data = somarDias(base, i);
    return { data, total: cards.filter((c) => c.vencimento === data).length };
  });
}
