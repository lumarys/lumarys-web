"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { Card, Rotulo, RotuloAcento } from "@/components/ui/Card";
import { useProgresso } from "@/features/progresso/useProgresso";
import { contarFila, filaDoDia, previsao, revisar, type EstadoCard } from "@/lib/srs";
import { salvarCard } from "@/lib/storage";
import { cx } from "@/lib/utils";

export type CardConteudo = {
  id: string;
  temaSlug: string;
  temaTitulo: string;
  frente: string;
  verso: string;
  href: string;
};

/** O suficiente para desfazer a última avaliação: o card como estava antes. */
type Desfazivel = { card: EstadoCard; acertou: boolean };

/**
 * Fila do dia: só o que venceu, intercalado entre temas. Sem "estudar mais",
 * sem cards adiantados — a repetição espaçada só funciona se o intervalo for
 * respeitado.
 */
export function FilaCards({ conteudo }: { conteudo: Record<string, CardConteudo> }) {
  const { progresso, pronto } = useProgresso();
  const [posicao, setPosicao] = useState(0);
  const [virado, setVirado] = useState(false);
  const [placar, setPlacar] = useState({ acertos: 0, erros: 0 });
  const [ultima, setUltima] = useState<Desfazivel | null>(null);

  // Estreia de card só de tema concluído, em qualquer trilha. Depende das
  // trilhas e não só de `pronto`: concluir um tema em outra aba, ou uma
  // sincronização que chegue agora, muda quem é elegível.
  const concluidos = useMemo(
    () => Object.values(progresso.trilhas).flatMap((t) => Object.keys(t.temasConcluidos)),
    [progresso.trilhas],
  );

  const fila = useMemo(
    () =>
      pronto
        ? filaDoDia(Object.values(progresso.cards), new Date(), 40, {
            temasElegiveis: concluidos,
          }).filter((c) => conteudo[c.id])
        : [],
    // A fila é congelada na abertura de propósito: recalcular a cada revisão
    // faria o card recém-avaliado sumir do meio da sessão.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pronto],
  );

  // A previsão, ao contrário da fila, acompanha: cada card avaliado agora
  // muda a barra de algum dos próximos dias, e ver isso acontecer é metade da
  // razão de a pessoa estar ali.
  const proximosDias = useMemo(
    () => (pronto ? previsao(Object.values(progresso.cards), 7) : []),
    [pronto, progresso.cards],
  );

  if (!pronto) {
    return <div className="mx-5 h-48 animate-pulse rounded-2xl border border-[var(--border)]" />;
  }

  const total = Object.keys(progresso.cards).length;
  const aguardandoTema = total > 0 && concluidos.length === 0;

  if (total === 0 || aguardandoTema) {
    return (
      <div className="px-5">
        <Card>
          <RotuloAcento>{aguardandoTema ? "Ainda não é hora" : "Nenhum card ainda"}</RotuloAcento>
          <p className="mt-2 text-[15px] leading-relaxed">
            {aguardandoTema
              ? "Seus cards entram na revisão quando você conclui o tema deles. Termine um tema e eles aparecem aqui."
              : "Os cards nascem quando você abre um tema. Comece por um e volte aqui amanhã."}
          </p>
          <Link
            href="/hoje/"
            className="mt-3 flex min-h-12 items-center justify-center rounded-xl bg-[var(--accent)] text-[15px] font-semibold text-[var(--accent-ink)] no-underline"
          >
            Ver o que estudar hoje
          </Link>
        </Card>
      </div>
    );
  }

  const contagem = contarFila(fila);
  const estado = fila[posicao];
  const card = estado ? conteudo[estado.id] : undefined;
  const revisados = placar.acertos + placar.erros;

  function avaliar(acertou: boolean) {
    if (!estado) return;
    setUltima({ card: estado, acertou });
    salvarCard(revisar(estado, acertou));
    setPlacar((p) => ({
      acertos: p.acertos + (acertou ? 1 : 0),
      erros: p.erros + (acertou ? 0 : 1),
    }));
    setPosicao((i) => i + 1);
    setVirado(false);
  }

  /**
   * Errar o botão custava um card empurrado para daqui a doze dias, sem volta.
   * Desfazer regrava o estado anterior — o card volta à caixa e ao vencimento
   * que tinha — e devolve a posição e o placar.
   */
  function desfazer() {
    if (!ultima) return;
    salvarCard(ultima.card);
    setPlacar((p) => ({
      acertos: p.acertos - (ultima.acertou ? 1 : 0),
      erros: p.erros - (ultima.acertou ? 0 : 1),
    }));
    setPosicao((i) => Math.max(0, i - 1));
    setVirado(false);
    setUltima(null);
  }

  return (
    <div className="flex flex-col gap-3 px-5">
      <div className="flex items-baseline justify-between gap-3">
        <RotuloAcento>
          {estado
            ? `${posicao + 1} de ${contagem.total}`
            : `${contagem.total} card${contagem.total === 1 ? "" : "s"} hoje`}
        </RotuloAcento>
        {revisados > 0 ? (
          <p className="text-xs text-[var(--text-2)]">
            {placar.acertos} certo{placar.acertos === 1 ? "" : "s"} · {placar.erros} para rever
          </p>
        ) : (
          <p className="text-xs text-[var(--muted)]">
            {contagem.vencidos} para revisar
            {contagem.novos > 0
              ? ` · ${contagem.novos} estreia${contagem.novos === 1 ? "" : "s"}`
              : ""}
          </p>
        )}
      </div>

      {estado && card ? (
        <>
          <div className="flex items-baseline justify-end">
            <Link href={card.href} className="text-xs text-[var(--muted)] no-underline">
              {card.temaTitulo}
            </Link>
          </div>

          <button
            type="button"
            id="card"
            onClick={() => setVirado((v) => !v)}
            aria-expanded={virado}
            // flex-col e não o padrão do botão: um <button> centraliza o
            // conteúdo na vertical, e com a altura mínima que segura a
            // resposta a pergunta ficava boiando no meio de um vazio.
            className="flex min-h-56 flex-col items-start rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 text-left"
          >
            <p className="text-[17px] font-medium leading-snug">{card.frente}</p>
            {virado ? (
              <p className="mt-4 border-t border-[var(--border)] pt-4 text-[15px] leading-relaxed text-[var(--text-2)]">
                {card.verso}
              </p>
            ) : (
              <p className="mt-4 text-sm text-[var(--muted)]">Responda de cabeça, depois toque.</p>
            )}
          </button>

          {/* A linha existe sempre, virado ou não: antes ela nascia junto com
              a resposta e empurrava a página uns 60px a cada card. */}
          <div className="flex min-h-13 gap-2">
            {virado ? (
              <>
                <button
                  type="button"
                  onClick={() => avaliar(false)}
                  className={cx(
                    "min-h-13 flex-1 rounded-xl border text-sm font-semibold",
                    "border-[var(--color-danger)]/40 bg-[var(--color-danger)]/10 text-[var(--color-danger)]",
                  )}
                >
                  Não sabia
                </button>
                <button
                  type="button"
                  onClick={() => avaliar(true)}
                  className="min-h-13 flex-1 rounded-xl border border-[var(--color-success)]/40 bg-[var(--color-success)]/10 text-sm font-semibold text-[var(--color-success)]"
                >
                  Sabia
                </button>
              </>
            ) : (
              <p className="flex flex-1 items-center justify-center text-sm text-[var(--muted)]">
                Toque no card para ver a resposta.
              </p>
            )}
          </div>
        </>
      ) : (
        <Card>
          <RotuloAcento>Fila em dia</RotuloAcento>
          <p className="mt-2 text-[15px] leading-relaxed">
            {revisados > 0
              ? `Você revisou ${revisados} cards agora: ${placar.acertos} certos e ${placar.erros} para rever.`
              : "Nenhum card vence hoje. Voltar antes da hora não ajuda a fixar."}
          </p>
        </Card>
      )}

      {ultima ? (
        <button
          type="button"
          onClick={desfazer}
          className="min-h-11 self-start text-sm font-semibold text-[var(--text-2)] underline"
        >
          Desfazer a última
        </button>
      ) : null}

      {/* Antes só aparecia com a fila vazia, e é a informação mais motivadora
          da tela: mostra o trabalho de hoje virando revisão marcada. */}
      <Card>
        <Rotulo className="mb-2">Próximos 7 dias</Rotulo>
        <div className="flex items-end gap-1.5">
          {proximosDias.map((d) => {
            const maximo = Math.max(...proximosDias.map((x) => x.total), 1);
            return (
              <div key={d.data} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className="w-full rounded-t bg-[var(--accent)] transition-[height]"
                  style={{
                    height: `${Math.max(4, (d.total / maximo) * 56)}px`,
                    opacity: d.total ? 1 : 0.25,
                  }}
                />
                <span className="text-[10px] text-[var(--muted)]">{d.data.slice(8)}</span>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
