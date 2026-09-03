"use client";

import { useEffect, useRef, useState } from "react";

import { IconeRelogio } from "@/components/ui/icons";
import { cx } from "@/lib/utils";

const FOCO = 25 * 60;
const PAUSA = 5 * 60;

/**
 * Pomodoro de 25/5. Fica no topo do tema porque foco é decisão de começo de
 * sessão, não de meio. Não toca som: quem estuda no transporte não quer alarme.
 */
export function Pomodoro() {
  const [restante, setRestante] = useState(FOCO);
  const [rodando, setRodando] = useState(false);
  const [modo, setModo] = useState<"foco" | "pausa">("foco");
  const alvo = useRef<number | null>(null);

  useEffect(() => {
    if (!rodando) return;
    alvo.current = Date.now() + restante * 1000;

    const id = window.setInterval(() => {
      const falta = Math.max(0, Math.round(((alvo.current ?? 0) - Date.now()) / 1000));
      setRestante(falta);
      if (falta === 0) {
        setRodando(false);
        setModo((m) => (m === "foco" ? "pausa" : "foco"));
        setRestante(modo === "foco" ? PAUSA : FOCO);
      }
    }, 250);

    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rodando, modo]);

  const minutos = String(Math.floor(restante / 60)).padStart(2, "0");
  const segundos = String(restante % 60).padStart(2, "0");

  return (
    <button
      type="button"
      onClick={() => setRodando((r) => !r)}
      aria-label={rodando ? "Pausar o cronômetro" : "Iniciar o cronômetro de foco"}
      className={cx(
        "inline-flex min-h-11 items-center gap-1.5 rounded-full border px-3",
        rodando
          ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
          : "border-[var(--border)] bg-[var(--surface)] text-[var(--text-2)]",
      )}
    >
      <IconeRelogio size={15} />
      <span className="font-display text-[13px] font-semibold tabular-nums">
        {minutos}:{segundos}
      </span>
      {modo === "pausa" ? <span className="text-[11px]">pausa</span> : null}
    </button>
  );
}
