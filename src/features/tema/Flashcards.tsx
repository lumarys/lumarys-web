"use client";

import { useEffect, useState } from "react";

import { Card, RotuloAcento } from "@/components/ui/Card";
import { revisar } from "@/lib/srs";
import { ler, salvarCard, semearCards } from "@/lib/storage";
import { cardNovo } from "@/lib/srs";
import type { Flashcard } from "@content/types";

/**
 * Baralho do tema. Virar o card exige uma tentativa mental antes; por isso o
 * verso só aparece no toque e a autoavaliação é binária: ou você sabia, ou não.
 */
export function Flashcards({ cards, temaSlug }: { cards: Flashcard[]; temaSlug: string }) {
  const [indice, setIndice] = useState(0);
  const [virado, setVirado] = useState(false);
  const [placar, setPlacar] = useState({ acertos: 0, erros: 0 });
  const [terminou, setTerminou] = useState(false);

  useEffect(() => {
    semearCards(temaSlug, cards.length);
  }, [temaSlug, cards.length]);

  const card = cards[indice];
  if (!card) return null;

  function avaliar(acertou: boolean) {
    const estado = ler().cards[`${temaSlug}#${indice}`] ?? cardNovo(temaSlug, indice);
    salvarCard(revisar(estado, acertou));
    setPlacar((p) => ({
      acertos: p.acertos + (acertou ? 1 : 0),
      erros: p.erros + (acertou ? 0 : 1),
    }));

    if (indice + 1 >= cards.length) {
      setTerminou(true);
      return;
    }
    setIndice((i) => i + 1);
    setVirado(false);
  }

  if (terminou) {
    return (
      <Card>
        <RotuloAcento>Baralho concluído</RotuloAcento>
        <p className="mt-2 text-[15px] leading-relaxed">
          {placar.acertos} de {cards.length}. Os que você errou voltam amanhã; os que acertou, em
          três dias.
        </p>
        <button
          type="button"
          onClick={() => {
            setIndice(0);
            setVirado(false);
            setPlacar({ acertos: 0, erros: 0 });
            setTerminou(false);
          }}
          className="mt-3 min-h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--elevated)] text-sm font-semibold"
        >
          Rever o baralho
        </button>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <RotuloAcento>
          Card {indice + 1} de {cards.length}
        </RotuloAcento>
        <span className="text-xs text-[var(--muted)]">
          {placar.acertos} certo{placar.acertos === 1 ? "" : "s"} · {placar.erros} a rever
        </span>
      </div>

      <button
        type="button"
        onClick={() => setVirado((v) => !v)}
        aria-expanded={virado}
        className="min-h-40 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 text-left"
      >
        <p className="text-[17px] font-medium leading-snug">{card.frente}</p>
        {virado ? (
          <p className="mt-4 border-t border-[var(--border)] pt-4 text-[15px] leading-relaxed text-[var(--text-2)]">
            {card.verso}
          </p>
        ) : (
          <p className="mt-4 text-sm text-[var(--muted)]">
            Responda de cabeça, depois toque para virar.
          </p>
        )}
      </button>

      {virado ? (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => avaliar(false)}
            className="min-h-12 flex-1 rounded-xl border border-[var(--color-danger)]/40 bg-[var(--color-danger)]/10 text-sm font-semibold text-[var(--color-danger)]"
          >
            Não sabia
          </button>
          <button
            type="button"
            onClick={() => avaliar(true)}
            className="min-h-12 flex-1 rounded-xl border border-[var(--color-success)]/40 bg-[var(--color-success)]/10 text-sm font-semibold text-[var(--color-success)]"
          >
            Sabia
          </button>
        </div>
      ) : null}
    </div>
  );
}
