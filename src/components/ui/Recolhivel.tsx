import type { ReactNode } from "react";

import { cx } from "@/lib/utils";

/**
 * Bloco secundário, fechado por padrão. Existe para a página do tema poder
 * oferecer material extra sem cobrar o preço de rolagem de quem só quer
 * estudar o essencial — vídeos alternativos, artigos e o banco de perguntas
 * somavam milhares de pixels que quase ninguém lia inteiros.
 */
export function Recolhivel({
  titulo,
  nota,
  children,
  className,
}: {
  titulo: string;
  /** Contagem ou tempo, à direita do título. */
  nota?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <details
      className={cx("rounded-2xl border border-[var(--border)] bg-[var(--surface)]", className)}
    >
      <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3">
        <span className="text-sm font-semibold">{titulo}</span>
        <span className="flex shrink-0 items-center gap-2 text-xs text-[var(--muted)]">
          {nota}
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </span>
      </summary>
      <div className="border-t border-[var(--border)] px-4 py-3">{children}</div>
    </details>
  );
}
