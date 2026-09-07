import type { ResultadoSimulado } from "./storage";

/**
 * Leitura do histórico de simulados. `registrarSimulado` guarda os últimos 20
 * desde o início e nenhuma tela mostrava um: para quem ensaia uma sabatina,
 * ver a curva é metade do valor — a nota de hoje sozinha não diz se ela subiu.
 *
 * A prontidão continua usando só o último (decisão do dono); o que está aqui
 * é exibição.
 */

export type Registro = {
  em: number;
  nota: number;
  maximo: number;
  /** 0 a 100, arredondado. */
  percentual: number;
  /** Diferença em pontos percentuais para o simulado anterior; null no primeiro. */
  variacao: number | null;
  porModulo: { slug: string; nota: number; maximo: number; percentual: number }[];
};

export function percentual(nota: number, maximo: number): number {
  return maximo > 0 ? Math.round((nota / maximo) * 100) : 0;
}

/** Do mais recente para o mais antigo, que é a ordem em que se olha. */
export function historico(simulados: ResultadoSimulado[]): Registro[] {
  const emOrdem = [...simulados].sort((a, b) => a.em - b.em);

  const registros = emOrdem.map((s, i) => {
    const modulos = Object.entries(s.porModulo).map(([slug, m]) => ({
      slug,
      nota: m.nota,
      maximo: m.maximo,
      percentual: percentual(m.nota, m.maximo),
    }));
    const nota = modulos.reduce((soma, m) => soma + m.nota, 0);
    const maximo = modulos.reduce((soma, m) => soma + m.maximo, 0);
    const atual = percentual(nota, maximo);

    const anterior = emOrdem[i - 1];
    const variacao = anterior === undefined ? null : atual - percentualDe(anterior);

    return { em: s.em, nota, maximo, percentual: atual, variacao, porModulo: modulos };
  });

  return registros.reverse();
}

function percentualDe(s: ResultadoSimulado): number {
  const modulos = Object.values(s.porModulo);
  return percentual(
    modulos.reduce((soma, m) => soma + m.nota, 0),
    modulos.reduce((soma, m) => soma + m.maximo, 0),
  );
}

export type Tendencia = "subindo" | "descendo" | "estavel";

/**
 * Tendência dos últimos `janela` simulados: compara o primeiro e o último da
 * janela, não cada par. Com menos de dois não há tendência nenhuma, e dizer
 * "estável" com um simulado só seria inventar uma linha a partir de um ponto.
 *
 * A faixa morta de 3 pontos existe porque uma nota que é a média de oito
 * autoavaliações de 0 a 5 oscila sozinha; sem ela toda variação viraria seta.
 */
export function tendencia(registros: Registro[], janela = 3): Tendencia | null {
  const recentes = registros.slice(0, janela);
  if (recentes.length < 2) return null;

  const novo = recentes[0];
  const velho = recentes[recentes.length - 1];
  if (!novo || !velho) return null;

  const delta = novo.percentual - velho.percentual;
  if (delta > 3) return "subindo";
  if (delta < -3) return "descendo";
  return "estavel";
}

/**
 * Onde está o recorde de cada módulo: o percentual e o simulado em que ele
 * foi feito. Guardar o `em` é o que permite marcar uma linha só — marcar
 * todas as que empatam no topo enche a lista de "melhor" e não diz nada.
 *
 * Módulo cuja nota nunca variou não tem recorde: fica de fora.
 */
export function melhorPorModulo(
  registros: Registro[],
): Record<string, { percentual: number; em: number }> {
  const melhor: Record<string, { percentual: number; em: number }> = {};
  const distintos: Record<string, Set<number>> = {};

  // Do mais antigo para o mais recente, para que um empate no topo fique
  // marcado na tentativa mais recente.
  for (const registro of [...registros].reverse()) {
    for (const m of registro.porModulo) {
      (distintos[m.slug] ??= new Set()).add(m.percentual);
      const atual = melhor[m.slug];
      if (!atual || m.percentual >= atual.percentual) {
        melhor[m.slug] = { percentual: m.percentual, em: registro.em };
      }
    }
  }

  for (const slug of Object.keys(melhor)) {
    if ((distintos[slug]?.size ?? 0) < 2) delete melhor[slug];
  }
  return melhor;
}
