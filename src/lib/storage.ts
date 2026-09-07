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
  /**
   * Índices das perguntas erradas, para o resultado poder dizer o que revisar
   * em vez de só mostrar a nota. Opcional: resultados gravados antes disto não
   * têm o campo.
   */
  erradas?: number[];
  /**
   * Só no pré-teste: quantas vezes a pessoa marcou confiança alta e errou. É o
   * sinal mais valioso do método — onde ela não sabe que não sabe — e era
   * calculado, mostrado uma vez e jogado fora.
   */
  enganos?: number;
};

/**
 * Checkpoint de um módulo. Guarda os temas errados, e não os índices das
 * perguntas: índice depende do sorteio daquele dia e não significa nada
 * depois; o tema é o que a fila de revisão precisa saber.
 */
export type ResultadoCheckpoint = {
  acertos: number;
  total: number;
  atualizadoEm: number;
  temasParaRevisar: string[];
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
  /** slug do tema -> último drill conferido */
  drills?: Record<string, ResultadoQuiz>;
  /** slug do módulo -> último checkpoint. Campo aditivo: pode não existir. */
  checkpoints?: Record<string, ResultadoCheckpoint>;
  /** slug do tema -> explicação que o aluno escreveu com as próprias palavras */
  feynman?: Record<string, string>;
  simulados: ResultadoSimulado[];
  ultimoTema?: string;
  /** YYYY-MM-DD da prova, definido no onboarding. */
  dataProva?: string;
  /**
   * "prova" é o padrão. "manutencao" é depois da prova: o objetivo deixa de
   * ser cobrir a trilha e passa a ser não esquecer o que já foi estudado.
   */
  modo?: "prova" | "manutencao";
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

/**
 * Falso quando o navegador recusou guardar o progresso: janela privada, cota
 * cheia, armazenamento bloqueado. Antes isso era engolido em silêncio, e a
 * pessoa concluía temas a tarde inteira achando que estava tudo salvo.
 */
let gravacaoBloqueada = false;
let sondagem: boolean | null = null;

/**
 * Descobrir isto só quando a primeira gravação falha é tarde: quem abre a
 * Conta em janela privada merece saber antes de estudar, não depois. A sonda
 * escreve e apaga uma chave própria, e o resultado fica em cache — uma
 * gravação de verdade sobrepõe a sonda nos dois sentidos.
 */
export function armazenamentoDisponivel(): boolean {
  if (gravacaoBloqueada) return false;
  if (sondagem === null) sondagem = sondar();
  return sondagem;
}

function sondar(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const chave = `${CHAVE}.sonda`;
    window.localStorage.setItem(chave, "1");
    window.localStorage.removeItem(chave);
    return true;
  } catch {
    return false;
  }
}

export function gravar(p: Progresso): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CHAVE, JSON.stringify({ ...p, atualizadoEm: Date.now() }));
    gravacaoBloqueada = false;
    sondagem = true;
  } catch {
    gravacaoBloqueada = true;
    sondagem = false;
  }
  // O evento sai nos dois casos: quem ouve precisa saber tanto do progresso
  // novo quanto de que ele não pôde ser guardado.
  window.dispatchEvent(new CustomEvent("lumarys:progresso"));
}

export function atualizar(fn: (p: Progresso) => Progresso): Progresso {
  const novo = fn(ler());
  gravar(novo);
  return novo;
}

/* ------------------------------- leitura --------------------------------- */

/**
 * A trilha conta como iniciada assim que há qualquer resposta gravada. Antes,
 * só tema concluído contava, e quem respondia pré-testes e voltava à trilha
 * lia "você ainda não começou" — foi o que aconteceu no primeiro uso real.
 */
export function trilhaIniciada(t: ProgressoTrilha | undefined): boolean {
  if (!t) return false;
  return (
    Object.keys(t.temasConcluidos).length > 0 ||
    Object.keys(t.preTestes).length > 0 ||
    Object.keys(t.quizzes).length > 0 ||
    Object.keys(t.drills ?? {}).length > 0 ||
    t.simulados.length > 0 ||
    Boolean(t.dataProva)
  );
}

export function contarRespostas(t: ProgressoTrilha | undefined): {
  preTestes: number;
  quizzes: number;
  simulados: number;
  drills: number;
} {
  return {
    preTestes: Object.keys(t?.preTestes ?? {}).length,
    quizzes: Object.keys(t?.quizzes ?? {}).length,
    simulados: t?.simulados.length ?? 0,
    drills: Object.keys(t?.drills ?? {}).length,
  };
}

/* ------------------------------- operações ------------------------------- */

export function garantirTrilha(p: Progresso, trilha: string): ProgressoTrilha {
  return p.trilhas[trilha] ?? trilhaVazia();
}

/**
 * Registra que o aluno abriu este tema. É o que permite "continuar de onde
 * parou": antes, `ultimoTema` só era gravado ao **concluir**, então o tema
 * aberto e abandonado no meio — justamente o que a pessoa quer retomar —
 * nunca era lembrado.
 */
/**
 * Os escritores de progresso por tema aceitam uma trilha ou uma lista. A
 * primeira é a principal — a que a pessoa está navegando; as demais são as
 * outras trilhas que contêm o mesmo tema. Um tema compartilhado (Big Data
 * está em Dados e em Analytics) é um estudo só: concluir, responder o quiz
 * ou escrever a explicação conta nas duas. O que NÃO se espelha é o
 * "onde parei" (`ultimoTema`), que é navegação de cada trilha, e os minutos
 * e a sequência, que são globais e contariam duas vezes.
 *
 * É espelhamento, não modelo único: o progresso continua guardado por trilha
 * porque a API e a mesclagem trabalham por trilha. Mover o progresso de tema
 * para fora das trilhas seria a solução de raiz, e uma migração de dados.
 */
function lista(trilha: string | readonly string[]): string[] {
  return Array.isArray(trilha) ? [...trilha] : [trilha as string];
}

function emCadaTrilha(
  p: Progresso,
  trilhas: string[],
  mudar: (t: ProgressoTrilha, principal: boolean) => ProgressoTrilha,
): Progresso["trilhas"] {
  const saida = { ...p.trilhas };
  trilhas.forEach((slug, i) => {
    saida[slug] = mudar(garantirTrilha({ ...p, trilhas: saida }, slug), i === 0);
  });
  return saida;
}

export function marcarVisita(trilha: string, tema: string): void {
  const atual = ler().trilhas[trilha];
  if (atual?.ultimoTema === tema) return; // nada mudou: não gravar nem sincronizar

  sincronizar(trilha);
  atualizar((p) => {
    const t = garantirTrilha(p, trilha);
    return {
      ...p,
      trilhas: { ...p.trilhas, [trilha]: { ...t, ultimoTema: tema, atualizadoEm: Date.now() } },
    };
  });
}

export function concluirTema(
  trilha: string | readonly string[],
  tema: string,
  minutos: number,
): Progresso {
  const trilhas = lista(trilha);
  trilhas.forEach(sincronizar);
  return atualizar((p) => {
    const agora = Date.now();
    const hoje = hojeISO();
    return {
      ...p,
      trilhas: emCadaTrilha(p, trilhas, (t, principal) => ({
        ...t,
        temasConcluidos: { ...t.temasConcluidos, [tema]: agora },
        ...(principal ? { ultimoTema: tema } : {}),
        atualizadoEm: agora,
      })),
      minutosPorDia: { ...p.minutosPorDia, [hoje]: (p.minutosPorDia[hoje] ?? 0) + minutos },
      streak: aplicarStreak(p.streak, hoje),
    };
  });
}

export function registrarQuiz(
  trilha: string | readonly string[],
  tema: string,
  acertos: number,
  total: number,
  tipo: "quiz" | "preTeste" | "drill" = "quiz",
  extra: { erradas?: number[]; enganos?: number } = {},
): Progresso {
  const trilhas = lista(trilha);
  trilhas.forEach(sincronizar);
  return atualizar((p) => {
    const agora = Date.now();
    const chave = tipo === "quiz" ? "quizzes" : tipo === "preTeste" ? "preTestes" : "drills";
    return {
      ...p,
      trilhas: emCadaTrilha(p, trilhas, (t) => ({
        ...t,
        [chave]: { ...t[chave], [tema]: { acertos, total, atualizadoEm: agora, ...extra } },
        atualizadoEm: agora,
      })),
    };
  });
}

/**
 * Grava o checkpoint de um módulo. Ao contrário do quiz do tema, aqui o que
 * interessa guardar é quais temas caíram — é deles que sai a revisão.
 */
export function registrarCheckpoint(
  trilha: string,
  modulo: string,
  acertos: number,
  total: number,
  temasParaRevisar: string[],
): Progresso {
  sincronizar(trilha);
  return atualizar((p) => {
    const agora = Date.now();
    const t = garantirTrilha(p, trilha);
    return {
      ...p,
      trilhas: {
        ...p.trilhas,
        [trilha]: {
          ...t,
          checkpoints: {
            ...(t.checkpoints ?? {}),
            [modulo]: { acertos, total, atualizadoEm: agora, temasParaRevisar },
          },
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
        // Marcar uma data nova tira a trilha do modo manutenção: voltou a
        // existir uma prova para a qual se preparar.
        [trilha]: { ...t, dataProva, minutosPorDia, modo: "prova", atualizadoEm: Date.now() },
      },
    };
  });
}

/**
 * Guarda a explicação que o aluno escreveu para si mesmo. Fica no aparelho
 * como o resto do progresso: é rascunho de estudo, não conteúdo publicado.
 */
export function salvarFeynman(
  trilha: string | readonly string[],
  tema: string,
  texto: string,
): Progresso {
  const trilhas = lista(trilha);
  trilhas.forEach(sincronizar);
  return atualizar((p) => {
    const agora = Date.now();
    return {
      ...p,
      trilhas: emCadaTrilha(p, trilhas, (t) => ({
        ...t,
        feynman: { ...(t.feynman ?? {}), [tema]: texto },
        atualizadoEm: agora,
      })),
    };
  });
}

/** Depois da prova: o plano sai do cronograma e vira manutenção da memória. */
export function definirModo(trilha: string, modo: "prova" | "manutencao"): Progresso {
  sincronizar(trilha);
  return atualizar((p) => {
    const t = garantirTrilha(p, trilha);
    return {
      ...p,
      trilhas: { ...p.trilhas, [trilha]: { ...t, modo, atualizadoEm: Date.now() } },
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
    cards[id] =
      !r || l.caixa > r.caixa || (l.caixa === r.caixa && l.atualizadoEm > r.atualizadoEm) ? l : r;
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

  // Mesmo critério dos quizzes: fica o melhor resultado. Um checkpoint pior
  // feito depois não apaga um módulo já fechado.
  const juntarCheckpoints = (
    x: Record<string, ResultadoCheckpoint>,
    y: Record<string, ResultadoCheckpoint>,
  ) => {
    const saida: Record<string, ResultadoCheckpoint> = { ...y };
    for (const [k, v] of Object.entries(x)) {
      const outro = y[k];
      saida[k] =
        !outro || v.acertos / Math.max(v.total, 1) >= outro.acertos / Math.max(outro.total, 1)
          ? v
          : outro;
    }
    return saida;
  };

  const simulados = [...r.simulados, ...l.simulados]
    .filter((s, i, arr) => arr.findIndex((o) => o.em === s.em) === i)
    .sort((a, b) => a.em - b.em)
    .slice(-20);

  const recente = l.atualizadoEm >= r.atualizadoEm ? l : r;
  const antigo = recente === l ? r : l;

  return {
    iniciadaEm: Math.min(l.iniciadaEm, r.iniciadaEm),
    temasConcluidos: { ...r.temasConcluidos, ...l.temasConcluidos },
    quizzes: juntarQuizzes(l.quizzes, r.quizzes),
    preTestes: juntarQuizzes(l.preTestes, r.preTestes),
    drills: juntarQuizzes(l.drills ?? {}, r.drills ?? {}),
    checkpoints: juntarCheckpoints(l.checkpoints ?? {}, r.checkpoints ?? {}),
    // Texto escrito: vence o lado mais recente, campo a campo.
    feynman: { ...(antigo.feynman ?? {}), ...(recente.feynman ?? {}) },
    simulados,
    // Preferência do aluno (data da prova, meta diária, modo) segue o lado mais
    // recente: agora que dá para editar o plano, "o local sempre vence" faria a
    // edição feita no celular ser desfeita ao abrir o computador.
    ultimoTema: recente.ultimoTema ?? antigo.ultimoTema,
    dataProva: recente.dataProva ?? antigo.dataProva,
    minutosPorDia: recente.minutosPorDia ?? antigo.minutosPorDia,
    modo: recente.modo ?? antigo.modo,
    atualizadoEm: Math.max(l.atualizadoEm, r.atualizadoEm),
  };
}
