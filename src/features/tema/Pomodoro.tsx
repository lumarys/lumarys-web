"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { IconeRelogio } from "@/components/ui/icons";
import { cx } from "@/lib/utils";

const FOCO = 25 * 60;
const PAUSA = 5 * 60;
const CHAVE = "lumarys.pomodoro.v1";

type Guardado = { fim: number; modo: "foco" | "pausa"; focoAcumulado: number };

/**
 * Pomodoro de 25/5, no topo do tema porque foco é decisão de começo de sessão.
 *
 * Sobrevive à navegação: o estado mora em sessionStorage, não em memória de
 * componente. Sair do tema para ver um card e voltar apagava o cronômetro, o
 * que na prática significava nunca terminar um ciclo. E ao zerar ele avisa —
 * título da aba, vibração e um toque curto gerado no próprio navegador — em
 * vez de terminar em silêncio e a pessoa descobrir dez minutos depois.
 */
export function Pomodoro({
  aoCompletarFoco,
}: { aoCompletarFoco?: (minutos: number) => void } = {}) {
  const [restante, setRestante] = useState(FOCO);
  const [rodando, setRodando] = useState(false);
  const [modo, setModo] = useState<"foco" | "pausa">("foco");
  const tituloOriginal = useRef<string | null>(null);

  const ler = useCallback((): Guardado | null => {
    try {
      const cru = window.sessionStorage.getItem(CHAVE);
      return cru ? (JSON.parse(cru) as Guardado) : null;
    } catch {
      return null;
    }
  }, []);

  const gravar = useCallback((dado: Guardado | null) => {
    try {
      if (dado) window.sessionStorage.setItem(CHAVE, JSON.stringify(dado));
      else window.sessionStorage.removeItem(CHAVE);
    } catch {
      /* sem sessionStorage o cronômetro ainda funciona, só não sobrevive */
    }
  }, []);

  const aoCompletar = useRef(aoCompletarFoco);
  useEffect(() => {
    aoCompletar.current = aoCompletarFoco;
  }, [aoCompletarFoco]);

  /** Título da aba, vibração e um toque curto: terminar em silêncio não avisa. */
  function avisar(qualModo: "foco" | "pausa") {
    tituloOriginal.current ??= document.title;
    document.title = qualModo === "foco" ? "Tempo! Faça a pausa" : "Tempo! De volta ao foco";
    window.setTimeout(() => {
      if (tituloOriginal.current) document.title = tituloOriginal.current;
    }, 20_000);

    navigator.vibrate?.([120, 60, 120]);

    try {
      const Contexto =
        window.AudioContext ??
        (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Contexto) return;
      const ctx = new Contexto();
      const osc = ctx.createOscillator();
      const ganho = ctx.createGain();
      osc.frequency.value = 660;
      ganho.gain.setValueAtTime(0.001, ctx.currentTime);
      ganho.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.02);
      ganho.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
      osc.connect(ganho).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch {
      /* som é conveniência: o título e a vibração já avisaram */
    }
  }

  /**
   * Um relógio só, sempre ligado. É ele que retoma o ciclo guardado quando a
   * página monta: ler o sessionStorage direto no corpo do componente quebraria
   * a hidratação, e ler num efeito síncrono dispararia renderização em cascata.
   * O preço é um quarto de segundo até o cronômetro reaparecer, imperceptível.
   */
  useEffect(() => {
    const id = window.setInterval(() => {
      const guardado = ler();
      if (!guardado) return;

      const falta = Math.round((guardado.fim - Date.now()) / 1000);
      if (falta > 0) {
        setModo(guardado.modo);
        setRestante(falta);
        setRodando(true);
        return;
      }

      gravar(null);
      avisar(guardado.modo);
      if (guardado.modo === "foco") aoCompletar.current?.(FOCO / 60);
      setRodando(false);
      setModo(guardado.modo === "foco" ? "pausa" : "foco");
      setRestante(guardado.modo === "foco" ? PAUSA : FOCO);
    }, 250);

    return () => window.clearInterval(id);
  }, [ler, gravar]);

  function alternar() {
    if (rodando) {
      setRodando(false);
      gravar(null);
      return;
    }
    gravar({ fim: Date.now() + restante * 1000, modo, focoAcumulado: 0 });
    setRodando(true);
  }

  const minutos = String(Math.floor(restante / 60)).padStart(2, "0");
  const segundos = String(restante % 60).padStart(2, "0");

  return (
    <button
      type="button"
      onClick={alternar}
      aria-label={`${minutos}:${segundos}, ${rodando ? "pausar" : "iniciar"} o cronômetro de foco`}
      className={cx(
        "inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full border px-3",
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
