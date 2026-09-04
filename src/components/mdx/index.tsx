import type { ComponentType, ReactNode } from "react";

import { cx } from "@/lib/utils";

/** Allowlist de componentes que um tema pode usar no MDX (ver content-lint). */

const ESTILOS_CALLOUT = {
  dica: { borda: "var(--info)", rotulo: "Dica" },
  atencao: { borda: "var(--accent)", rotulo: "Atenção" },
  erro: { borda: "var(--color-danger)", rotulo: "Cuidado" },
} as const;

export function Callout({
  tipo = "dica",
  titulo,
  children,
}: {
  tipo?: keyof typeof ESTILOS_CALLOUT;
  titulo?: string;
  children: ReactNode;
}) {
  const estilo = ESTILOS_CALLOUT[tipo] ?? ESTILOS_CALLOUT.dica;
  return (
    <aside
      className="my-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4"
      style={{ borderLeft: `3px solid ${estilo.borda}` }}
    >
      <p
        className="m-0 text-[11px] font-semibold uppercase tracking-[0.12em]"
        style={{ color: estilo.borda }}
      >
        {titulo ?? estilo.rotulo}
      </p>
      <div className="mt-1.5 text-[15px] leading-relaxed [&>p:first-child]:mt-0 [&>p:last-child]:mb-0">
        {children}
      </div>
    </aside>
  );
}

export function Comparativo({ colunas, linhas }: { colunas: string[]; linhas: string[][] }) {
  return (
    <div className="scroll-x my-5 rounded-2xl border border-[var(--border)]">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-[var(--elevated)] text-left">
            {colunas.map((coluna) => (
              <th
                key={coluna}
                scope="col"
                className="whitespace-nowrap px-3 py-2.5 text-xs font-semibold text-[var(--text-2)]"
              >
                {coluna}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {linhas.map((linha, i) => (
            <tr key={i} className="border-t border-[var(--border)] align-top">
              {linha.map((celula, j) => (
                <td
                  key={j}
                  className={cx(
                    "px-3 py-2.5 leading-relaxed",
                    j === 0 && "font-medium text-[var(--text-2)]",
                  )}
                >
                  {celula}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Passos({ itens }: { itens: string[] }) {
  return (
    <ol className="my-5 flex list-none flex-col gap-2.5 p-0">
      {itens.map((item, i) => (
        <li key={i} className="flex gap-3">
          <span className="font-display mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-[var(--elevated)] text-xs font-bold text-[var(--accent)]">
            {i + 1}
          </span>
          <span className="text-[15px] leading-relaxed">{item}</span>
        </li>
      ))}
    </ol>
  );
}

export function Termo({ nome, children }: { nome: string; children: ReactNode }) {
  return (
    <span className="inline-flex flex-wrap items-baseline gap-1">
      <dfn className="font-semibold not-italic text-[var(--accent)]">{nome}</dfn>
      <span className="text-[var(--text-2)]">— {children}</span>
    </span>
  );
}

/**
 * Allowlist do MDX. O tipo é frouxo de propósito: o MDX chama estes
 * componentes com props que só ele conhece, e o content-lint é quem garante
 * que nenhum outro componente entre num tema.
 */
export const componentesMdx = { Callout, Comparativo, Passos, Termo } as unknown as Record<
  string,
  ComponentType<Record<string, unknown>>
>;
