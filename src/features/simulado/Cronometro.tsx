"use client";

import { useEffect, useState } from "react";

import { estadoDoTempo, formatarTempo, SEGUNDOS_SUGERIDOS } from "@/lib/cronometro";
import { cx } from "@/lib/utils";

/**
 * Tempo desta pergunta e da sabatina inteira. Recebe instantes, não contadores:
 * assim uma aba que ficou em segundo plano não "perde" segundos, e o
 * componente pode ser remontado a cada pergunta sem zerar o total.
 */
export function Cronometro({
  desdePergunta,
  desdeSessao,
  sugerido = SEGUNDOS_SUGERIDOS,
}: {
  desdePergunta: number;
  desdeSessao: number;
  sugerido?: number;
}) {
  const [agora, setAgora] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setAgora(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const naPergunta = Math.floor((agora - desdePergunta) / 1000);
  const naSessao = Math.floor((agora - desdeSessao) / 1000);
  const estado = estadoDoTempo(naPergunta, sugerido);

  return (
    <p
      className="flex items-baseline gap-2 text-xs tabular-nums text-[var(--muted)]"
      aria-label={`Tempo nesta pergunta: ${formatarTempo(naPergunta)}. Total: ${formatarTempo(naSessao)}.`}
    >
      <span
        className={cx(
          "font-display text-sm font-semibold",
          estado === "passou"
            ? "text-[var(--accent)]"
            : estado === "perto"
              ? "text-[var(--text-2)]"
              : "text-[var(--text)]",
        )}
      >
        {formatarTempo(naPergunta)}
      </span>
      <span aria-hidden="true">total {formatarTempo(naSessao)}</span>
    </p>
  );
}
