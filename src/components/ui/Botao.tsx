import Link from "next/link";
import type { ReactNode } from "react";

import { cx } from "@/lib/utils";

export type VarianteBotao = "primario" | "secundario" | "fantasma";

/**
 * Um único lugar decide como um botão se parece. Antes cada página repetia as
 * classes, e um deles saiu com texto ilegível sobre o âmbar.
 */
export function classesDeBotao(variante: VarianteBotao, className?: string): string {
  return cx(
    "inline-flex min-h-13 items-center justify-center gap-2 rounded-xl px-5 text-[15px] font-semibold no-underline transition-all disabled:opacity-50",
    variante === "primario" &&
      "bg-[var(--accent)] text-[var(--accent-ink)] shadow-[0_1px_0_rgba(255,255,255,0.25)_inset,0_8px_24px_-12px_var(--sombra-acento)] hover:brightness-105 active:brightness-95",
    variante === "secundario" &&
      "border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] hover:border-[var(--muted)] hover:bg-[var(--elevated)]",
    variante === "fantasma" && "text-[var(--text-2)] hover:text-[var(--text)]",
    className,
  );
}

/** Botão de ação. Use `BotaoLink` quando o destino for uma rota. */
export function Botao({
  children,
  onClick,
  variante = "primario",
  className,
  disabled = false,
  type = "button",
  "aria-label": rotulo,
}: {
  children: ReactNode;
  onClick?: () => void;
  variante?: VarianteBotao;
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit";
  "aria-label"?: string;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={rotulo}
      className={classesDeBotao(variante, className)}
    >
      {children}
    </button>
  );
}

export function BotaoLink({
  href,
  children,
  variante = "primario",
  className,
  externo = false,
}: {
  href: string;
  children: ReactNode;
  variante?: VarianteBotao;
  className?: string;
  externo?: boolean;
}) {
  const classes = classesDeBotao(variante, className);

  if (externo) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  );
}
