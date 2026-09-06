"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

import {
  assinarEscala,
  definirEscala,
  escalaDoServidor,
  lerEscala,
  proximaEscala,
} from "@/lib/preferencias";
import { cx } from "@/lib/utils";

/**
 * Controles de leitura do tema: tamanho da letra, ouvir a explicação e um modo
 * sem distração. O público estuda no deslocamento, e o plano previa os três
 * desde o começo — nenhum existia.
 *
 * Ficam atrás de um botão só ("Aa") porque a barra do tema já disputa espaço
 * com o sumário e o cronômetro em 390 px.
 */
export function ConfortoLeitura() {
  const [aberto, setAberto] = useState(false);
  const [lendo, setLendo] = useState(false);
  const [foco, setFoco] = useState(false);
  const escala = useSyncExternalStore(assinarEscala, lerEscala, escalaDoServidor);

  useEffect(() => {
    document.documentElement.style.setProperty("--escala-leitura", String(escala));
  }, [escala]);

  useEffect(() => {
    document.documentElement.dataset.foco = foco ? "1" : "";
  }, [foco]);

  // Falar é caro de manter vivo entre páginas: ao sair, cala.
  useEffect(() => {
    return () => window.speechSynthesis?.cancel();
  }, []);

  function mudarEscala(passo: number) {
    definirEscala(proximaEscala(escala, passo));
  }

  function ouvir() {
    const sintese = window.speechSynthesis;
    if (!sintese) return;
    if (lendo) {
      sintese.cancel();
      setLendo(false);
      return;
    }
    const texto = document.getElementById("ler")?.innerText?.trim();
    if (!texto) return;

    const fala = new SpeechSynthesisUtterance(texto);
    fala.lang = "pt-BR";
    fala.rate = 1.05;
    fala.onend = () => setLendo(false);
    fala.onerror = () => setLendo(false);
    sintese.cancel();
    sintese.speak(fala);
    setLendo(true);
  }

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={() => setAberto((a) => !a)}
        aria-expanded={aberto}
        aria-label="Conforto de leitura"
        className={cx(
          "inline-flex min-h-11 items-center rounded-full border px-3 text-[13px] font-semibold",
          aberto
            ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
            : "border-[var(--border)] bg-[var(--surface)] text-[var(--text-2)]",
        )}
      >
        Aa
      </button>

      {aberto ? (
        <div className="absolute right-0 top-12 z-30 w-60 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3 shadow-lg">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-[var(--text-2)]">Tamanho da letra</span>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => mudarEscala(-1)}
                aria-label="Diminuir a letra"
                className="min-h-9 min-w-9 rounded-lg bg-[var(--elevated)] text-sm font-bold"
              >
                A−
              </button>
              <button
                type="button"
                onClick={() => mudarEscala(1)}
                aria-label="Aumentar a letra"
                className="min-h-9 min-w-9 rounded-lg bg-[var(--elevated)] text-base font-bold"
              >
                A+
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={ouvir}
            className="mt-2 flex min-h-11 w-full items-center justify-between rounded-lg bg-[var(--elevated)] px-3 text-xs font-semibold"
          >
            {lendo ? "Parar a leitura" : "Ouvir a explicação"}
          </button>

          <button
            type="button"
            onClick={() => setFoco((f) => !f)}
            className="mt-2 flex min-h-11 w-full items-center justify-between rounded-lg bg-[var(--elevated)] px-3 text-xs font-semibold"
          >
            {foco ? "Sair do modo foco" : "Modo sem distração"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
