import Link from "next/link";

import { EMPRESA } from "@/lib/company";
import { ContatoLink } from "./ContatoLink";

/**
 * Rodapé no padrão das marcas da Cernyn (mesma assinatura de cernyn.com e
 * youco.io): identidade, CNPJ, endereço, selo do Ágora e contato anti-robô.
 */
export function SiteFooter() {
  const ano = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--border)] px-5 py-6">
      <div className="mx-auto flex max-w-3xl flex-col gap-4">
        <p className="text-[11px] leading-relaxed text-[var(--muted)]">
          {EMPRESA.marca} © {ano} by{" "}
          <a
            href={EMPRESA.controladoraUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-[var(--text-2)] no-underline"
          >
            {EMPRESA.controladora}
          </a>
          <br />
          <span className="font-semibold text-[var(--text-2)]">CNPJ:</span> {EMPRESA.cnpj}
          <br />
          {EMPRESA.endereco}
        </p>

        <div
          role="img"
          aria-label={`${EMPRESA.controladora} é ${EMPRESA.selo.toLowerCase()}`}
          className="inline-flex w-fit items-center gap-1.5 rounded-full border border-[var(--accent)]/20 bg-[var(--accent)]/10 px-2.5 py-1"
        >
          <span aria-hidden="true" className="size-1.5 rounded-full bg-[var(--accent)]" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent)]">
            {EMPRESA.selo}
          </span>
        </div>

        <nav aria-label="Rodapé" className="flex flex-wrap gap-x-1 text-[11px] text-[var(--text-2)]">
          <Link href="/metodo/" className="inline-flex min-h-11 items-center px-2 no-underline">
            Método
          </Link>
          <Link href="/sobre/" className="inline-flex min-h-11 items-center px-2 no-underline">
            Sobre
          </Link>
          <Link href="/privacidade/" className="inline-flex min-h-11 items-center px-2 no-underline">
            Privacidade
          </Link>
          <Link href="/termos/" className="inline-flex min-h-11 items-center px-2 no-underline">
            Termos
          </Link>
          <ContatoLink className="inline-flex min-h-11 items-center px-2 text-[var(--text-2)]" />
        </nav>
      </div>
    </footer>
  );
}
