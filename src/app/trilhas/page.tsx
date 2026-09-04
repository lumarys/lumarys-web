import type { Metadata } from "next";
import Link from "next/link";

import { AppShell } from "@/components/layout/AppShell";
import { Card, Rotulo } from "@/components/ui/Card";
import { contarTemas, listarTrilhas, minutosDaTrilha } from "@/lib/content";
import { formatarMinutos } from "@/lib/utils";
import { trilhasEmBreve } from "@content/trilhas";

export const metadata: Metadata = {
  title: "Trilhas",
  description:
    "Todas as trilhas da Lumarys: carreiras e certificações, cada uma montada a partir da ementa oficial.",
  alternates: { canonical: "/trilhas/" },
};

export default function PaginaTrilhas() {
  const trilhas = listarTrilhas();

  return (
    <AppShell comCabecalho>
      <div className="px-5 pb-8 pt-5">
        <h1 className="font-display text-[26px] font-bold">Trilhas</h1>
        <p className="mt-2 text-sm leading-relaxed text-[var(--text-2)]">
          Cada trilha parte de uma ementa oficial e vira estudo ativo.
        </p>

        <Rotulo className="mb-2 mt-6">Disponíveis</Rotulo>
        <ul className="flex list-none flex-col gap-3 p-0">
          {trilhas.map((trilha) => (
            <li key={trilha.slug}>
              <Link href={`/trilhas/${trilha.slug}/`} className="block no-underline">
                <Card destaque>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--accent)]">
                    {trilha.origem}
                  </p>
                  <p className="font-display mt-1 text-xl font-semibold text-[var(--text)]">
                    {trilha.titulo}
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-[var(--text-2)]">
                    {trilha.resumo}
                  </p>
                  <p className="mt-2 text-xs text-[var(--muted)]">
                    {contarTemas(trilha)} temas · {formatarMinutos(minutosDaTrilha(trilha))} ·{" "}
                    {trilha.formatoProva}
                  </p>
                </Card>
              </Link>
            </li>
          ))}
        </ul>

        <Rotulo className="mb-2 mt-6">Em breve</Rotulo>
        <ul className="flex list-none flex-col gap-2 p-0">
          {trilhasEmBreve.map((t) => (
            <li key={t.slug}>
              <Card className="opacity-70">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
                  {t.origem}
                </p>
                <p className="mt-1 text-[15px] font-semibold">{t.titulo}</p>
                <p className="mt-1 text-[13px] leading-relaxed text-[var(--text-2)]">{t.resumo}</p>
              </Card>
            </li>
          ))}
        </ul>
      </div>
    </AppShell>
  );
}
