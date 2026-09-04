import type { Metadata } from "next";

import { AppShell } from "@/components/layout/AppShell";
import { Card, Rotulo } from "@/components/ui/Card";
import { ContatoLink } from "@/components/layout/ContatoLink";
import { EMPRESA } from "@/lib/company";
import { alternativas } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Contato",
  description: "Como falar com a equipe responsável pela Lumarys.",
  alternates: alternativas("/contato/"),
};

export default function PaginaContato() {
  return (
    <AppShell comCabecalho>
      <div className="px-5 pb-8 pt-5">
        <Rotulo>Contato</Rotulo>
        <h1 className="font-display mt-1.5 text-[26px] font-bold">Fale com a gente</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-[var(--text-2)]">
          A Lumarys é uma marca da {EMPRESA.controladora} e não tem caixa de e-mail própria. Todo
          contato, de dúvida sobre conteúdo a proposta comercial, vai para o e-mail da{" "}
          {EMPRESA.controladora}.
        </p>

        <Card className="mt-5">
          <h2 className="font-display text-lg font-semibold">{EMPRESA.controladora}</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-[var(--text-2)]">
            {EMPRESA.endereco}
            <br />
            CNPJ {EMPRESA.cnpj}
          </p>
          <ContatoLink
            rotulo="Abrir e-mail"
            className="mt-3.5 flex min-h-12 w-full items-center justify-center rounded-xl bg-[var(--accent)] text-[15px] font-semibold text-[var(--accent-ink)]"
          />
          <p className="mt-2.5 text-xs text-[var(--muted)]">
            O endereço é montado no clique, para não ser colhido por robôs de spam.
          </p>
        </Card>
      </div>
    </AppShell>
  );
}
