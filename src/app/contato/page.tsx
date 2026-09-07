import type { Metadata } from "next";

import { AppShell } from "@/components/layout/AppShell";
import { Card, Rotulo } from "@/components/ui/Card";
import { ContatoLink } from "@/components/layout/ContatoLink";
import { EMPRESA } from "@/lib/company";
import { alternativas, JsonLd, jsonLdBreadcrumb, SITE } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Contato",
  description: "Como falar com a equipe responsável pela Lumarys.",
  alternates: alternativas("/contato/"),
};

export default function PaginaContato() {
  return (
    <AppShell>
      <JsonLd
        dados={jsonLdBreadcrumb([
          { nome: "Início", url: "/" },
          { nome: "Contato", url: "/contato/" },
        ])}
      />
      <JsonLd
        dados={{
          "@context": "https://schema.org",
          "@type": "ContactPage",
          name: "Fale com a Lumarys",
          url: `${SITE.url}/contato/`,
          // O endereço não entra aqui de propósito: a página inteira existe
          // para não expor o e-mail em texto colhível por robô.
          about: { "@type": "Organization", name: EMPRESA.controladora, taxID: EMPRESA.cnpj },
        }}
      />
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
          <ContatoLink comEndereco rotulo="Abrir e-mail" className="mt-3.5 w-full" />
          <p className="mt-2.5 text-xs text-[var(--muted)]">
            O botão monta o endereço no clique; o texto acima serve para copiar quando o navegador
            não tem cliente de e-mail.
          </p>
        </Card>
      </div>
    </AppShell>
  );
}
