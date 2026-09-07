"use client";

import { useSyncExternalStore } from "react";

import { assinarTema, definirTema, lerTema, ROTULOS, TEMAS, temaDoServidor } from "@/lib/tema";
import { cx } from "@/lib/utils";

/**
 * Três estados e não um interruptor: "automático" segue o sistema, que é o que
 * a maioria quer, e os outros dois existem para quem lê no escuro num quarto
 * claro. Um interruptor de dois estados não sabe dizer qual dos dois é o
 * padrão, e por isso não sabe voltar para ele.
 */
export function AlternadorTema({ className }: { className?: string }) {
  const tema = useSyncExternalStore(assinarTema, lerTema, temaDoServidor);

  return (
    <div className={className}>
      <p className="mb-1.5 text-[13px] font-semibold text-[var(--text-2)]">Tema</p>
      <div
        role="radiogroup"
        aria-label="Tema"
        className="flex gap-1 rounded-xl border border-[var(--border)] bg-[var(--bg)] p-1"
      >
        {TEMAS.map((opcao) => {
          const ativo = tema === opcao;
          return (
            <button
              key={opcao}
              type="button"
              role="radio"
              aria-checked={ativo}
              onClick={() => definirTema(opcao)}
              className={cx(
                "min-h-11 flex-1 rounded-lg text-[13px] font-semibold transition-colors",
                ativo
                  ? "bg-[var(--accent)] text-[var(--accent-ink)]"
                  : "text-[var(--text-2)] hover:text-[var(--text)]",
              )}
            >
              {ROTULOS[opcao]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
