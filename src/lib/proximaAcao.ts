/**
 * A única decisão da tela Hoje: o que fazer agora.
 *
 * Existe como função pura porque a home também precisa dela para trocar o hero
 * de quem já estuda, e porque a ordem é uma regra de método — não um detalhe
 * de renderização. A ordem é deliberada:
 *
 * 1. **Continuar** o tema deixado pela metade. É o único laço aberto, e o
 *    `ultimoTema` já era gravado há semanas sem nenhuma tela ler.
 * 2. **Revisar** quando a dívida de revisão passa do limiar. Card atrasado
 *    perde valor rápido; conteúdo novo espera.
 * 3. **Estudar** o próximo tema da sequência.
 * 4. **Simular**, quando não há mais tema para estudar.
 */

export type TemaRef = {
  slug: string;
  titulo: string;
  modulo: string;
  minutos: number;
};

export type Acao =
  | { tipo: "continuar"; tema: TemaRef }
  | { tipo: "revisar"; vencidos: number }
  | { tipo: "estudar"; tema: TemaRef }
  | { tipo: "simular" };

/** A partir de quantos cards atrasados a revisão ganha do conteúdo novo. */
export const LIMIAR_REVISAO = 8;

export function proximaAcao(entrada: {
  /** Temas da trilha, na ordem do cronograma. */
  temas: TemaRef[];
  concluidos: Record<string, number>;
  /** Último tema aberto, mesmo que não concluído. */
  ultimoTema?: string;
  /** Cards realmente atrasados, já filtrados pela trilha. */
  vencidos: number;
  limiarRevisao?: number;
}): Acao {
  const { temas, concluidos, ultimoTema, vencidos } = entrada;
  const limiar = entrada.limiarRevisao ?? LIMIAR_REVISAO;

  const emAberto = ultimoTema ? temas.find((t) => t.slug === ultimoTema) : undefined;
  if (emAberto && !concluidos[emAberto.slug]) {
    return { tipo: "continuar", tema: emAberto };
  }

  if (vencidos >= limiar) return { tipo: "revisar", vencidos };

  const proximo = temas.find((t) => !concluidos[t.slug]);
  if (proximo) return { tipo: "estudar", tema: proximo };

  return { tipo: "simular" };
}
