import Link from "next/link";

import { Marca } from "@/components/ui/icons";
import { EMPRESA } from "@/lib/company";

/**
 * Cabeçalho das páginas públicas. Existe para o site parecer um site: marca à
 * esquerda, navegação curta à direita, e um caminho claro para começar a
 * estudar. As telas de app usam a barra inferior, não este cabeçalho.
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-[var(--border)]/70 bg-[var(--bg)]/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5">
        <Link href="/" className="flex items-center gap-2.5 no-underline">
          <Marca size={26} />
          <span className="flex flex-col leading-none">
            <span className="font-display text-[17px] font-semibold text-[var(--text)]">
              Lumarys
            </span>
            <span className="mt-0.5 hidden text-[9px] uppercase tracking-[0.18em] text-[var(--muted)] sm:block">
              {EMPRESA.tagline}
            </span>
          </span>
        </Link>

        <nav className="flex items-center gap-1" aria-label="Principal">
          <Link
            href="/trilhas/"
            className="hidden min-h-11 items-center rounded-lg px-3 text-sm font-medium text-[var(--text-2)] no-underline transition-colors hover:text-[var(--text)] sm:inline-flex"
          >
            Trilhas
          </Link>
          <Link
            href="/metodo/"
            className="hidden min-h-11 items-center rounded-lg px-3 text-sm font-medium text-[var(--text-2)] no-underline transition-colors hover:text-[var(--text)] sm:inline-flex"
          >
            Método
          </Link>
          <Link
            href="/hoje/"
            className="inline-flex min-h-10 items-center rounded-lg bg-[var(--accent)] px-4 text-sm font-semibold text-[var(--accent-ink)] no-underline transition-opacity hover:opacity-90"
          >
            Estudar
          </Link>
        </nav>
      </div>
    </header>
  );
}
