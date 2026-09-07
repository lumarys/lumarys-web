"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { AlternadorTema } from "@/components/ui/AlternadorTema";
import { Dialogo } from "@/components/ui/Dialogo";
import { Marca } from "@/components/ui/icons";
import { EMPRESA } from "@/lib/company";
import { ehTelaDeEstado } from "@/lib/rotas";
import { cx } from "@/lib/utils";

const MENU = [
  { href: "/trilhas/", rotulo: "Trilhas" },
  { href: "/metodo/", rotulo: "Método" },
  { href: "/sobre/", rotulo: "Sobre" },
  { href: "/contato/", rotulo: "Contato" },
  { href: "/conta/", rotulo: "Minha conta" },
];

/**
 * Cabeçalho de todas as páginas. Existe para o site parecer um site em qualquer
 * rota: antes ele sumia justamente na página da trilha, que é onde o visitante
 * chega pelo clique principal da home.
 *
 * No celular a navegação inteira desaparecia — Trilhas e Método ficavam
 * escondidos acima de 640px e o único acesso a Sobre e Contato era rolar até o
 * rodapé. Agora há um menu, num produto que declara 390px como alvo primário.
 */
export function SiteHeader() {
  const [menuAberto, setMenuAberto] = useState(false);
  const caminho = usePathname() ?? "/";

  // Nas telas de estudo quem acompanha a rolagem é o sumário do tema e a barra
  // de abas; um terceiro elemento grudado no topo comeria a tela em 390px.
  const grudado = !ehTelaDeEstado(caminho);

  return (
    <header
      className={cx(
        "z-30 border-b border-[var(--border)]/70 bg-[var(--bg)]/80 backdrop-blur-md",
        grudado && "sticky top-0",
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5">
        <Link href="/" className="flex min-h-11 items-center gap-2.5 no-underline">
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
          {MENU.slice(0, 2).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="hidden min-h-11 items-center rounded-lg px-3 text-sm font-medium text-[var(--text-2)] no-underline transition-colors hover:text-[var(--text)] sm:inline-flex"
            >
              {item.rotulo}
            </Link>
          ))}

          <Link
            href="/hoje/"
            className="inline-flex min-h-11 items-center rounded-lg bg-[var(--accent)] px-4 text-sm font-semibold text-[var(--accent-ink)] no-underline transition-opacity hover:opacity-90"
          >
            Estudar
          </Link>

          <button
            type="button"
            onClick={() => setMenuAberto(true)}
            aria-label="Abrir o menu"
            aria-expanded={menuAberto}
            className="inline-flex size-11 items-center justify-center rounded-lg text-[var(--text-2)] sm:hidden"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
        </nav>
      </div>

      <Dialogo
        aberto={menuAberto}
        aoFechar={() => setMenuAberto(false)}
        titulo="Menu"
        posicao="baixo"
      >
        <ul className="flex list-none flex-col gap-1 p-0">
          {MENU.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={() => setMenuAberto(false)}
                className="flex min-h-12 items-center rounded-xl px-3 text-[15px] font-semibold no-underline"
              >
                {item.rotulo}
              </Link>
            </li>
          ))}
        </ul>
        <AlternadorTema className="mt-3" />
        <button
          type="button"
          onClick={() => setMenuAberto(false)}
          className="mt-2 min-h-12 w-full rounded-xl border border-[var(--border)] text-sm font-semibold"
        >
          Fechar
        </button>
      </Dialogo>
    </header>
  );
}
