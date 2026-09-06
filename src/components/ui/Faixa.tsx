import type { ReactNode } from "react";

import { cx } from "@/lib/utils";

/**
 * Aviso de largura total, no topo do conteúdo. Para o que a pessoa precisa
 * saber agora e que não cabe num campo: o progresso não está sendo salvo, a
 * conta não sincronizou, o navegador recusou alguma coisa.
 */
export function Faixa({
  tom = "aviso",
  children,
  className,
}: {
  tom?: "aviso" | "erro";
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      role="status"
      className={cx(
        "flex items-start gap-2 border-b px-5 py-2.5 text-[13px] leading-relaxed",
        tom === "erro"
          ? "border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 text-[var(--text)]"
          : "border-[var(--accent)]/30 bg-[var(--accent)]/10 text-[var(--text)]",
        className,
      )}
    >
      {children}
    </div>
  );
}
