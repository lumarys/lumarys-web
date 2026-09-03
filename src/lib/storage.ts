"use client";

import { cardNovo, hojeISO, type EstadoCard } from "./srs";

/** Preenchido por sync.ts quando a conta está ligada; sem conta, é um no-op. */
let aoGravarTrilha: ((trilhaSlug: string) => void) | null = null;

export function registrarSincronizador(fn: (trilhaSlug: string) => void): void {
  aoGravarTrilha = fn;
}

function sincronizar(trilhaSlug: string): void {
  aoGravarTrilha?.(trilhaSlug);
}

/**
 * Progresso do aluno. Nasce em localStorage (modo convidado) e é mesclado na
 * conta quando ele entra com o código por e-mail. Cada item carrega
 * `atualizadoEm` porque a mesclagem é por item, nunca por documento inteiro:
 * estudar no celular e no computador no mesmo dia não pode perder nada.
 */

export const CHAVE = "lumarys.progresso.v1";
export const VERSAO = 1 as const;

export type ResultadoQuiz = {
  acertos: number;
  total: number;
  atualizadoEm: number;
};

export type ResultadoSimulado = {
  em: number;
  /** slug do módulo -> nota somada e máximo possível */
  porModulo: Record<string, { nota: number; maximo: number }>;
};

export type ProgressoTrilha = {
  iniciadaEm: number;
  /** slug do tema -> quando concluiu */
  temasConcluidos: Record<string, number>;
  /** slug do tema -> último quiz */
  quizzes: Record<string, ResultadoQuiz>;
  /** slug do tema -> último pré-teste (acertos antes de estudar) */
  preTestes: Record<string, ResultadoQuiz>;
  simulados: ResultadoSimulado[];
  ultimoTema?: string;
  /** YYYY-MM-DD da prova, definido no onboarding. */
  dataProva?: string;
  minutosPorDia?: number;
  atualizadoEm: number;
};

export type Progresso = {
  versao: typeof VERSAO;
  trilhas: Record<string, ProgressoTrilha>;
  cards: Record<string, EstadoCard>;
  streak: { atual: number; recorde: number; ultimoDia: string | null };
  /** minutos estudados por dia, YYYY-MM-DD -> minutos */
  minutosPorDia: Record<string, number>;
  atualizadoEm: number;
};

export function progressoVazio(): Progresso {
  return {
    versao: VERSAO,
    trilhas: {},
    cards: {},
    streak: { atual: 0, recorde: 0, ultimoDia: null },
    minutosPorDia: {},
    atualizadoEm: 0,
  };
}

export function trilhaVazia(agora = Date.now()): ProgressoTrilha {
  return {
    iniciadaEm: agora,
    temasConcluidos: {},
    quizzes: {},
    preTestes: {},
    simulados: [],
    atualizadoEm: agora,
  };
}

export function ler(): Progresso {
  if (typeof window === "undefined") return progressoVazio();
  try {
    const cru = window.localStorage.getItem(CHAVE);
    if (!cru) return progressoVazio();
    const dado = JSON.parse(cru) as Progresso;
    if (dado?.versao !== VERSAO) return progressoVazio();
    return { ...progressoVazio(), ...dado };
  } catch {
    // Modo privado, cota estourada ou JSON corrompido: começar limpo é melhor
    // que quebrar a página de estudo.
    return progressoVazio();
  }
}

export function gravar(p: Progresso): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CHAVE, JSON.stringify({ ...p, atualizadoEm: Date.now() }));
    window.dispatchEvent(new CustomEvent("lumarys:progresso"));
  } catch {
    /* sem persistência neste navegador; a sessão continua funcionando */
  }
}

export function atualizar(fn: (p: Progresso) => Progresso): Progresso {
  const novo = fn(ler());
  gravar(novo);
  return novo;
}

/* ------------------------------- operações ------------------------------- */

export function garantirTrilha(p: Progresso, trilha: string): ProgressoTrilha {
  return p.trilhas[trilha] ?? trilhaVazia();
}

export function concluirTema(trilha: string, tema: string, minutos: number): Progresso {
  sincronizar(trilha);
  return atualizar((p) => {
    const agora = Date.now();
    const t = garantirTrilha(p, trilha);
    const hoje = hojeISO();
    return {
      ...p,
      trilhas: {
        ...p.trilhas,
        [trilha]: {
          ...t,
          temasConcluidos: { ...t.temasConcluidos, [tema]: agora },
          ultimoTema: tema,
          atualizadoEm: agora,
        },
      },
      minutosPorDia: { ...p.minutosPorDia, [hoje]: (p.minutosPorDia[hoje] ?? 0) + minutos },
      streak: aplicarStreak(p.streak, hoje),
    };
  });
}

export function registrarQuiz(
  trilha: string,
  tema: string,
  acertos: number,
  total: number,
  tipo: "quiz" | "preTeste" = "quiz",
): Progresso {
  sincronizar(trilha);
  return atualizar((p) => {
    const agora = Date.now();
    const t = garantirTrilha(p, trilha);
    const chave = tipo === "quiz" ? "quizzes" : "preTestes";
    return {
      ...p,
      trilhas: {
        ...p.trilhas,
        [trilha]: {
          ...t,
          [chave]: { ...t[chave], [tema]: { acertos, total, atualizadoEm: agora } },
          atualizadoEm: agora,
        },
      },
    };
  });
}

export function registrarSimulado(
  trilha: string,
  resultado: Omit<ResultadoSimulado, "em">,
): Progresso {
  sincronizar(trilha);
  // O carimbo de tempo nasce aqui: gerar `Date.now()` dentro do componente é
  // efeito colateral em corpo de render, e o compilador do React barra.
  const registro: ResultadoSimulado = { ...resultado, em: Date.now() };
  return atualizar((p) => {
    const t = garantirTrilha(p, trilha);
    return {
      ...p,
      trilhas: {
        ...p.trilhas,
        [trilha]: {
          ...t,
          simulados: [...t.simulados, registro].slice(-20),
          atualizadoEm: Date.now(),
        },
      },
    };
  });
}

export function definirPlano(trilha: string, dataProva: string, minutosPorDia: number): Progresso {
  sincronizar(trilha);
  return atualizar((p) => {
    const t = garantirTrilha(p, trilha);
    return {
      ...p,
      trilhas: {
        ...p.trilhas,
        [trilha]: { ...t, dataProva, minutosPorDia, atualizadoEm: Date.now() },
      },
    };
  });
}

export function salvarCard(card: EstadoCard): Progresso {
  // Cards viajam junto do documento da trilha; marcamos todas as conhecidas.
  for (const slug of Object.keys(ler().trilhas)) sincronizar(slug);
  return atualizar((p) => ({ ...p, cards: { ...p.cards, [card.id]: card } }));
}

export function semearCards(temaSlug: string, quantidade: number): Progresso {
  return atualizar((p) => {
    const cards = { ...p.cards };
    for (let i = 0; i < quantidade; i++) {
      const id = `${temaSlug}#${i}`;
      if (!cards[id]) cards[id] = cardNovo(temaSlug, i);
    }
    return { ...p, cards };
  });
}

function aplicarStreak(streak: Progresso["streak"], hoje: string): Progresso["streak"] {
  if (streak.ultimoDia === hoje) return streak;
  const ontem = new Date(`${hoje}T00:00:00`);
  ontem.setDate(ontem.getDate() - 1);
  const ontemISO = hojeISO(ontem);
  const atual = streak.ultimoDia === ontemISO ? streak.atual + 1 : 1;
  return { atual, recorde: Math.max(atual, streak.recorde), ultimoDia: hoje };
}

/**
 * Mesclagem convidado -> conta. Vence o mais recente por item, e o progresso
 * nunca regride: tema concluído continua concluído, score fica no melhor,
 * card fica na caixa mais avançada.
 */
export function mesclar(local: Progresso, remoto: Progresso): Progresso {
  const trilhas: Record<string, ProgressoTrilha> = { ...remoto.trilhas };
  for (const [slug, l] of Object.entries(local.trilhas)) {
    const r = remoto.trilhas[slug];
    trilhas[slug] = r ? mesclarTrilha(l, r) : l;
  }

  const cards: Record<string, EstadoCard> = { ...remoto.cards };
  for (const [id, l] of Object.entries(local.cards)) {
    const r = remoto.cards[id];
    cards[id] = !r || l.caixa > r.caixa || (l.caixa === r.caixa && l.atualizadoEm > r.atualizadoEm) ? l : r;
  }

  const minutos: Record<string, number> = { ...remoto.minutosPorDia };
  for (const [dia, m] of Object.entries(local.minutosPorDia)) {
    minutos[dia] = Math.max(m, minutos[dia] ?? 0);
  }

  const streak =
    local.streak.ultimoDia && remoto.streak.ultimoDia
      ? local.streak.ultimoDia >= remoto.streak.ultimoDia
        ? { ...local.streak, recorde: Math.max(local.streak.recorde, remoto.streak.recorde) }
        : { ...remoto.streak, recorde: Math.max(local.streak.recorde, remoto.streak.recorde) }
      : local.streak.ultimoDia
        ? local.streak
        : remoto.streak;

  return {
    versao: VERSAO,
    trilhas,
    cards,
    streak,
    minutosPorDia: minutos,
    atualizadoEm: Math.max(local.atualizadoEm, remoto.atualizadoEm),
  };
}

function mesclarTrilha(l: ProgressoTrilha, r: ProgressoTrilha): ProgressoTrilha {
  const melhorQuiz = (a?: ResultadoQuiz, b?: ResultadoQuiz) => {
    if (!a) return b;
    if (!b) return a;
    return a.acertos / Math.max(a.total, 1) >= b.acertos / Math.max(b.total, 1) ? a : b;
  };
  const juntarQuizzes = (x: Record<string, ResultadoQuiz>, y: Record<string, ResultadoQuiz>) => {
    const saida: Record<string, ResultadoQuiz> = { ...y };
    for (const [k, v] of Object.entries(x)) {
      const escolhido = melhorQuiz(v, y[k]);
      if (escolhido) saida[k] = escolhido;
    }
    return saida;
  };

  const simulados = [...r.simulados, ...l.simulados]
    .filter((s, i, arr) => arr.findIndex((o) => o.em === s.em) === i)
    .sort((a, b) => a.em - b.em)
    .slice(-20);

  return {
    iniciadaEm: Math.min(l.iniciadaEm, r.iniciadaEm),
    temasConcluidos: { ...r.temasConcluidos, ...l.temasConcluidos },
    quizzes: juntarQuizzes(l.quizzes, r.quizzes),
    preTestes: juntarQuizzes(l.preTestes, r.preTestes),
    simulados,
    ultimoTema: l.atualizadoEm >= r.atualizadoEm ? l.ultimoTema : r.ultimoTema,
    dataProva: l.dataProva ?? r.dataProva,
    minutosPorDia: l.minutosPorDia ?? r.minutosPorDia,
    atualizadoEm: Math.max(l.atualizadoEm, r.atualizadoEm),
  };
}
