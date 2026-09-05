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

/**
 * Card semeado e nunca revisado. Abrir a página de um tema já cria o baralho
 * inteiro, então "nunca revisado" não pode significar "atrasado": antes desta
 * regra, abrir dois temas sem estudar nada enchia a tela Hoje de "12 cards
 * vencidos" de conteúdo que a pessoa nem tinha lido.
 */
export function estaNovo(card: EstadoCard): boolean {
  return card.caixa === 0;
}

export function estaVencido(card: EstadoCard, agora: Date = new Date()): boolean {
  return !estaNovo(card) && card.vencimento <= hojeISO(agora);
}

/** Quantos cards nunca revisados podem estrear num mesmo dia. */
export const NOVOS_POR_DIA = 10;

/**
 * Intercala os cards entre temas, do mais frágil para o mais firme. Misturar
 * assuntos rende mais que estudar em blocos, e é o princípio de intercalação
 * do Ultraaprendizado aplicado à revisão.
 */
function intercalar(cards: EstadoCard[], limite: number): EstadoCard[] {
  const porTema = new Map<string, EstadoCard[]>();
  for (const card of cards) {
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

/**
 * Fila do dia: primeiro a revisão atrasada, depois algumas estreias.
 *
 * Card novo só entra se o tema dele já foi concluído, e no máximo
 * `novosPorDia`. Sem `temasElegiveis` nenhuma estreia acontece — é explícito
 * de propósito, para que esquecer o argumento nunca ressuscite a fila falsa
 * de cards de temas que ninguém abriu.
 */
export function filaDoDia(
  cards: EstadoCard[],
  agora: Date = new Date(),
  limite = 40,
  opcoes: { temasElegiveis?: Iterable<string>; novosPorDia?: number } = {},
): EstadoCard[] {
  const elegiveis = new Set(opcoes.temasElegiveis ?? []);
  const fila = intercalar(
    cards.filter((c) => estaVencido(c, agora)),
    limite,
  );

  const espaco = Math.min(opcoes.novosPorDia ?? NOVOS_POR_DIA, limite - fila.length);
  if (espaco > 0 && elegiveis.size > 0) {
    fila.push(
      ...intercalar(
        cards.filter((c) => estaNovo(c) && elegiveis.has(c.temaSlug)),
        espaco,
      ),
    );
  }
  return fila;
}

/** Quantos cards vencem em cada um dos próximos dias, para o gráfico do plano. */
export function previsao(cards: EstadoCard[], dias = 14, agora: Date = new Date()) {
  const base = hojeISO(agora);
  return Array.from({ length: dias }, (_, i) => {
    const data = somarDias(base, i);
    // Card novo não tem revisão marcada: a data dele é só o dia em que nasceu.
    return { data, total: cards.filter((c) => !estaNovo(c) && c.vencimento === data).length };
  });
}
