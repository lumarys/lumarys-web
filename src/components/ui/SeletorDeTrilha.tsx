import Link from "next/link";

import { cx } from "@/lib/utils";

/**
 * Chips para trocar de trilha nas telas de estudo. Só existe com duas ou
 * mais: com uma, a pergunta "qual trilha?" não se coloca e o seletor seria
 * um botão que não faz nada.
 *
 * A escolha vai pela URL (`?trilha=`), não por estado: assim o link do Hoje
 * para o simulado carrega a trilha certa, e recarregar a página não perde a
 * escolha.
 */
export function SeletorDeTrilha({
  base,
  trilhas,
  ativa,
  className,
}: {
  base: string;
  trilhas: { slug: string; titulo: string }[];
  ativa: string;
  className?: string;
}) {
  if (trilhas.length < 2) return null;

  return (
    <nav aria-label="Trilha" className={cx("flex flex-wrap gap-2", className)}>
      {trilhas.map((t) => {
        const atual = t.slug === ativa;
        return (
          <Link
            key={t.slug}
            href={`${base}?trilha=${t.slug}`}
            aria-current={atual ? "page" : undefined}
            className={cx(
              "inline-flex min-h-11 items-center rounded-full border px-3.5 text-[13px] font-semibold no-underline",
              atual
                ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--text)]"
                : "border-[var(--border)] text-[var(--text-2)]",
            )}
          >
            {t.titulo}
          </Link>
        );
      })}
    </nav>
  );
}
