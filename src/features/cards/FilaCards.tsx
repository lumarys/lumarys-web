"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { Card, Rotulo, RotuloAcento } from "@/components/ui/Card";
import { useProgresso } from "@/features/progresso/useProgresso";
import { filaDoDia, previsao, revisar } from "@/lib/srs";
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

  const fila = useMemo(
    () => (pronto ? filaDoDia(Object.values(progresso.cards)).filter((c) => conteudo[c.id]) : []),
    // A fila é congelada na abertura de propósito: recalcular a cada revisão
    // faria o card recém-avaliado sumir do meio da sessão.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pronto],
  );

  const proximosDias = useMemo(
    () => (pronto ? previsao(Object.values(progresso.cards), 7) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pronto],
  );

  if (!pronto) {
    return <div className="mx-5 h-48 animate-pulse rounded-2xl border border-[var(--border)]" />;
  }

  const total = Object.keys(progresso.cards).length;

  if (total === 0) {
    return (
      <div className="px-5">
        <Card>
          <RotuloAcento>Nenhum card ainda</RotuloAcento>
          <p className="mt-2 text-[15px] leading-relaxed">
            Os cards nascem quando você abre um tema. Comece por um e volte aqui amanhã.
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

  const estado = fila[posicao];
  const card = estado ? conteudo[estado.id] : undefined;

  if (!estado || !card) {
    return (
      <div className="flex flex-col gap-3 px-5">
        <Card>
          <RotuloAcento>Fila em dia</RotuloAcento>
          <p className="mt-2 text-[15px] leading-relaxed">
            {placar.acertos + placar.erros > 0
              ? `Você revisou ${placar.acertos + placar.erros} cards agora: ${placar.acertos} certos e ${placar.erros} para rever.`
              : "Nenhum card vence hoje. Voltar antes da hora não ajuda a fixar."}
          </p>
        </Card>
        <Card>
          <Rotulo className="mb-2">Próximos 7 dias</Rotulo>
          <div className="flex items-end gap-1.5">
            {proximosDias.map((d) => {
              const maximo = Math.max(...proximosDias.map((x) => x.total), 1);
              return (
                <div key={d.data} className="flex flex-1 flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t bg-[var(--accent)]"
                    style={{ height: `${Math.max(4, (d.total / maximo) * 56)}px`, opacity: d.total ? 1 : 0.25 }}
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

  function avaliar(acertou: boolean) {
    if (!estado) return;
    salvarCard(revisar(estado, acertou));
    setPlacar((p) => ({
      acertos: p.acertos + (acertou ? 1 : 0),
      erros: p.erros + (acertou ? 0 : 1),
    }));
    setPosicao((i) => i + 1);
    setVirado(false);
  }

  return (
    <div className="flex flex-col gap-3 px-5">
      <div className="flex items-baseline justify-between">
        <RotuloAcento>
          {posicao + 1} de {fila.length} vencidos
        </RotuloAcento>
        <Link href={card.href} className="text-xs text-[var(--muted)] no-underline">
          {card.temaTitulo}
        </Link>
      </div>

      <button
        type="button"
        onClick={() => setVirado((v) => !v)}
        aria-expanded={virado}
        className="min-h-48 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 text-left"
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

      {virado ? (
        <div className="flex gap-2">
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
        </div>
      ) : null}
    </div>
  );
}
