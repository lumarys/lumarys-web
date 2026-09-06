"use client";

import { useState } from "react";

import { Card, Rotulo, RotuloAcento } from "@/components/ui/Card";
import { cx } from "@/lib/utils";

/**
 * Prévia real acima da dobra. A home prometia vídeo verificado, flashcard e
 * simulado no formato da prova e não mostrava nenhum dos três: quem chegava de
 * uma busca com dez minutos tinha que acreditar. Aqui o visitante vira um card
 * de verdade e lê uma pergunta oral com a rubrica que o simulado usa.
 *
 * Nada disso grava progresso: é amostra, não estudo.
 */
export function Amostra({
  card,
  pergunta,
}: {
  card: { frente: string; verso: string; tema: string };
  pergunta: { enunciado: string; rubrica: string[]; tema: string };
}) {
  const [virado, setVirado] = useState(false);

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Card>
        <Rotulo className="mb-2">Um flashcard de verdade</Rotulo>
        <button
          type="button"
          onClick={() => setVirado((v) => !v)}
          aria-expanded={virado}
          className="flex min-h-32 w-full flex-col items-start justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg)] p-4 text-left"
        >
          <span className="text-[15px] font-semibold leading-snug">{card.frente}</span>
          <span
            className={cx(
              "text-[14px] leading-relaxed",
              virado ? "text-[var(--text-2)]" : "text-[var(--muted)]",
            )}
          >
            {virado ? card.verso : "Responda de cabeça, depois toque."}
          </span>
        </button>
        <p className="mt-2 text-[11px] text-[var(--muted)]">{card.tema}</p>
      </Card>

      <Card>
        <RotuloAcento>Uma pergunta da sabatina</RotuloAcento>
        <p className="mt-2 text-[15px] font-medium leading-snug">{pergunta.enunciado}</p>
        <p className="mt-2 text-[13px] text-[var(--muted)]">
          Você responde em voz alta e se avalia por esta rubrica:
        </p>
        <ol className="mt-2 flex list-none flex-col gap-1.5 p-0">
          {pergunta.rubrica.map((criterio, i) => (
            <li key={i} className="flex gap-2 text-[13px] leading-relaxed text-[var(--text-2)]">
              <span className="font-semibold text-[var(--accent)]">{i + 1}</span>
              {criterio}
            </li>
          ))}
        </ol>
      </Card>
    </div>
  );
}
