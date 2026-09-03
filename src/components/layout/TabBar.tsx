"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { IconeCards, IconeHoje, IconeSimulado, IconeTrilha } from "@/components/ui/icons";
import { cx } from "@/lib/utils";

type Aba = {
  href: string;
  rotulo: string;
  Icone: (p: { size?: number }) => React.ReactElement;
  prefixo?: string;
};

const ABAS: Aba[] = [
  { href: "/hoje/", rotulo: "Hoje", Icone: IconeHoje },
  { href: "/trilhas/", rotulo: "Trilha", Icone: IconeTrilha, prefixo: "/trilhas" },
  { href: "/cards/", rotulo: "Cards", Icone: IconeCards },
  { href: "/simulado/", rotulo: "Simulado", Icone: IconeSimulado },
];

export function TabBar() {
  const caminho = usePathname() ?? "/";

  return (
    <nav
      aria-label="Navegação principal"
      className="sticky bottom-0 z-20 grid grid-cols-4 border-t border-[var(--border)] bg-[var(--bg)]/95 px-2 pb-4 pt-2 backdrop-blur"
    >
      {ABAS.map(({ href, rotulo, Icone, prefixo }) => {
        const base = prefixo ?? href;
        const ativa = caminho === href || caminho.startsWith(base);
        return (
          <Link
            key={href}
            href={href}
            aria-current={ativa ? "page" : undefined}
            className={cx(
              "flex min-h-11 flex-col items-center justify-center gap-1 rounded-lg no-underline",
              ativa ? "text-[var(--accent)]" : "text-[var(--muted)]",
            )}
          >
            <Icone size={22} />
            <span className={cx("text-[11px]", ativa ? "font-semibold" : "font-medium")}>
              {rotulo}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
