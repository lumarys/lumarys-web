import type { Metadata } from "next";
import Link from "next/link";

import { AppShell } from "@/components/layout/AppShell";
import { ContatoLink } from "@/components/layout/ContatoLink";
import { classesDeBotao } from "@/components/ui/Botao";
import { Card, Rotulo } from "@/components/ui/Card";
import { Recolhivel } from "@/components/ui/Recolhivel";
import { contarTemas, listarTrilhas, minutosDaTrilha } from "@/lib/content";
import { formatarMinutos } from "@/lib/utils";
import { trilhasEmBreve } from "@content/trilhas";
import { alternativas, JsonLd, jsonLdBreadcrumb, SITE } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Trilhas",
  description:
    "Todas as trilhas da Lumarys: carreiras e certificações, cada uma montada a partir da ementa oficial.",
  alternates: alternativas("/trilhas/"),
};

export default function PaginaTrilhas() {
  const trilhas = listarTrilhas();

  return (
    <AppShell>
      <JsonLd
        dados={jsonLdBreadcrumb([
          { nome: "Início", url: "/" },
          { nome: "Trilhas", url: "/trilhas/" },
        ])}
      />
      <JsonLd
        dados={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Trilhas da Lumarys",
          itemListElement: trilhas.map((trilha, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: trilha.titulo,
            description: trilha.resumo,
            url: `${SITE.url}/trilhas/${trilha.slug}/`,
          })),
        }}
      />
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
        {/* Eram três cartões apagados que não faziam nada. Um cartão em 70% de
            opacidade não é um estado: não diz o que falta nem o que a pessoa
            pode fazer. Agora cada um abre, admite que não há data e oferece o
            único caminho honesto — pedir, e ser avisado. */}
        <ul className="flex list-none flex-col gap-2 p-0">
          {trilhasEmBreve.map((t) => (
            <li key={t.slug}>
              <Recolhivel titulo={t.titulo} nota="Em breve">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
                  {t.origem}
                </p>
                <p className="mt-1.5 text-[13px] leading-relaxed text-[var(--text-2)]">
                  {t.resumo}
                </p>
                <p className="mt-2 text-[13px] leading-relaxed text-[var(--text-2)]">
                  Ainda não há conteúdo publicado, e não há data marcada. Escrever ajuda a decidir
                  qual sai primeiro, e eu aviso quando esta abrir.
                </p>
                <ContatoLink
                  rotulo="Quero esta trilha"
                  assunto={`Quero a trilha ${t.titulo}`}
                  className={classesDeBotao("secundario", "mt-3 w-full")}
                />
              </Recolhivel>
            </li>
          ))}
        </ul>
      </div>
    </AppShell>
  );
}
