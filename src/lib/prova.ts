import { embaralhar } from "./utils";

/**
 * Prova simulada de certificação: objetiva, cronometrada, sorteada pelo peso
 * de cada domínio. É o formato real do exame, e o oposto do simulado oral das
 * trilhas de carreira — aqui não há rubrica, há gabarito.
 */

export type QuestaoDeProva = {
  id: string;
  /** slug do módulo (domínio do exame) de onde a questão vem */
  moduloSlug: string;
  moduloTitulo: string;
  temaSlug: string;
  temaTitulo: string;
  href: string;
  tipo: "unica" | "multipla";
  enunciado: string;
  alternativas: { texto: string; correta: boolean; explicacao: string }[];
};

export type DominioDaProva = {
  slug: string;
  titulo: string;
  /** Peso no exame, em porcentagem inteira. */
  peso: number;
};

/**
 * Quantas questões cada domínio recebe numa prova de `total`, respeitando o
 * peso. O arredondamento sobra ou falta uma ou duas; a diferença vai para os
 * domínios de maior peso, um a um, até fechar a conta.
 */
export function cotasPorDominio(dominios: DominioDaProva[], total: number): Record<string, number> {
  const somaPesos = dominios.reduce((a, d) => a + d.peso, 0);
  if (somaPesos <= 0 || total <= 0) return Object.fromEntries(dominios.map((d) => [d.slug, 0]));

  const cotas: Record<string, number> = {};
  let atribuidas = 0;
  for (const d of dominios) {
    cotas[d.slug] = Math.floor((total * d.peso) / somaPesos);
    atribuidas += cotas[d.slug] ?? 0;
  }

  const porPeso = [...dominios].sort((a, b) => b.peso - a.peso);
  let i = 0;
  while (atribuidas < total && porPeso.length > 0) {
    const d = porPeso[i % porPeso.length]!;
    cotas[d.slug] = (cotas[d.slug] ?? 0) + 1;
    atribuidas++;
    i++;
  }
  return cotas;
}

/**
 * Monta a prova. Sorteia dentro de cada domínio e intercala na ordem em que a
 * AWS apresenta os domínios — a prova real não agrupa por domínio, mas
 * embaralhar tudo perderia a leitura por bloco no resultado.
 *
 * Quando um domínio tem menos questões que a cota (a trilha ainda está sendo
 * escrita), a prova sai menor e diz isso, em vez de repetir questão.
 */
export function montarProva(
  banco: QuestaoDeProva[],
  dominios: DominioDaProva[],
  total: number,
  semente: number,
): QuestaoDeProva[] {
  const cotas = cotasPorDominio(dominios, total);
  const prova: QuestaoDeProva[] = [];
  for (const d of dominios) {
    const doDominio = banco.filter((q) => q.moduloSlug === d.slug);
    prova.push(...embaralhar(doDominio, semente + d.peso).slice(0, cotas[d.slug] ?? 0));
  }
  return embaralhar(prova, semente);
}

export type RespostasDaProva = Record<string, number[]>;

export type ResultadoDaProva = {
  acertos: number;
  total: number;
  respondidas: number;
  /** Escala 100 a 1000, como a AWS reporta. */
  pontuacao: number;
  aprovado: boolean;
  porDominio: { slug: string; titulo: string; acertos: number; total: number }[];
  erradas: string[];
};

/**
 * Corrige. Múltipla resposta só conta se o conjunto marcado for exatamente o
 * conjunto correto — é assim que a AWS corrige, sem crédito parcial. Questão
 * em branco conta errada, sem penalidade além dessa.
 *
 * A pontuação em escala é uma aproximação linear: a AWS usa equalização entre
 * versões da prova que não publica. O corte de 720 fica em torno de 69% de
 * acertos, que é o que a experiência de quem faz a prova relata.
 */
export function corrigirProva(
  prova: QuestaoDeProva[],
  respostas: RespostasDaProva,
  dominios: DominioDaProva[],
  notaCorte: number,
): ResultadoDaProva {
  const porDominio = dominios.map((d) => ({
    slug: d.slug,
    titulo: d.titulo,
    acertos: 0,
    total: 0,
  }));
  const erradas: string[] = [];
  let acertos = 0;
  let respondidas = 0;

  for (const q of prova) {
    const corretas = q.alternativas.map((a, i) => (a.correta ? i : -1)).filter((i) => i >= 0);
    const marcadas = [...(respostas[q.id] ?? [])].sort((a, b) => a - b);
    if (marcadas.length > 0) respondidas++;
    const certo =
      marcadas.length === corretas.length && corretas.every((i) => marcadas.includes(i));

    const dominio = porDominio.find((d) => d.slug === q.moduloSlug);
    if (dominio) dominio.total++;
    if (certo) {
      acertos++;
      if (dominio) dominio.acertos++;
    } else {
      erradas.push(q.id);
    }
  }

  const total = prova.length;
  const pontuacao = total === 0 ? 100 : Math.round(100 + (900 * acertos) / total);
  return {
    acertos,
    total,
    respondidas,
    pontuacao,
    aprovado: total > 0 && pontuacao >= notaCorte,
    porDominio,
    erradas,
  };
}

/** Segundos de prova para `total` questões, no ritmo do exame real: 130 min para 65. */
export function segundosDeProva(
  total: number,
  minutosDoExame: number,
  questoesDoExame: number,
): number {
  if (questoesDoExame <= 0) return 0;
  return Math.round((minutosDoExame * 60 * total) / questoesDoExame);
}
