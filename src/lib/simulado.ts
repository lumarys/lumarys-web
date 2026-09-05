/**
 * Placar do simulado oral, separado da tela porque duas rotas chegam nele: o
 * fim natural das perguntas e o botão "Encerrar" no meio.
 *
 * A regra que existe aqui e não existia antes: **o máximo só conta pergunta
 * avaliada**. Somar a nota máxima de perguntas que o aluno nem viu transforma
 * "parei na terceira de oito" num placar de 12/40, que pune quem parou e não
 * diz nada sobre o que ele sabe.
 */

export const NOTA_MAXIMA = 5;

export type PerguntaAvaliavel = {
  id: string;
  moduloSlug: string;
  moduloTitulo: string;
};

export type ModuloDoResultado = {
  slug: string;
  titulo: string;
  nota: number;
  maximo: number;
};

export type ResultadoSimulado = {
  porModulo: ModuloDoResultado[];
  nota: number;
  maximo: number;
  avaliadas: number;
  puladas: number;
};

export function calcularResultado(
  perguntas: PerguntaAvaliavel[],
  notas: Record<string, number>,
): ResultadoSimulado {
  const porModulo = new Map<string, ModuloDoResultado>();
  let avaliadas = 0;

  for (const pergunta of perguntas) {
    const nota = notas[pergunta.id];
    // `undefined` é pergunta pulada; zero é uma nota que o aluno deu.
    if (nota === undefined) continue;
    avaliadas++;

    const modulo = porModulo.get(pergunta.moduloSlug) ?? {
      slug: pergunta.moduloSlug,
      titulo: pergunta.moduloTitulo,
      nota: 0,
      maximo: 0,
    };
    modulo.nota += nota;
    modulo.maximo += NOTA_MAXIMA;
    porModulo.set(pergunta.moduloSlug, modulo);
  }

  const modulos = [...porModulo.values()];
  return {
    porModulo: modulos,
    nota: modulos.reduce((soma, m) => soma + m.nota, 0),
    maximo: modulos.reduce((soma, m) => soma + m.maximo, 0),
    avaliadas,
    puladas: perguntas.length - avaliadas,
  };
}

/** Formato que o progresso guarda: slug do módulo para nota e máximo. */
export function paraProgresso(
  resultado: ResultadoSimulado,
): Record<string, { nota: number; maximo: number }> {
  return Object.fromEntries(
    resultado.porModulo.map((m) => [m.slug, { nota: m.nota, maximo: m.maximo }]),
  );
}
