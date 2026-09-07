import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AppShell } from "@/components/layout/AppShell";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { listarTrilhas, obterTrilha, temasDoModulo } from "@/lib/content";
import { extrairTermos } from "@/lib/glossario";
import { alternativas } from "@/lib/seo";

type Params = { trilha: string; modulo: string };

export function generateStaticParams(): Params[] {
  return listarTrilhas().flatMap((trilha) =>
    trilha.modulos.map((modulo) => ({ trilha: trilha.slug, modulo: modulo.slug })),
  );
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { trilha: trilhaSlug, modulo: moduloSlug } = await params;
  const trilha = obterTrilha(trilhaSlug);
  const modulo = trilha?.modulos.find((m) => m.slug === moduloSlug);
  if (!trilha || !modulo) return {};

  return {
    title: `Resumo · ${modulo.titulo}`,
    description: `Folha de revisão do módulo ${modulo.titulo}: por que cada tema cai, como a banca pergunta, os erros mais comuns e o vocabulário.`,
    alternates: alternativas(`/trilhas/${trilhaSlug}/${moduloSlug}/resumo/`),
  };
}

/**
 * Folha de véspera de um módulo.
 *
 * Tudo que o frontmatter já sabia e a página do tema espalhava por milhares de
 * pixels: por que o tema cai, como a banca pergunta, os erros comuns e o
 * vocabulário. Uma página, sem interação, feita para ser lida de cima a baixo
 * ou impressa — as regras de `@media print` em globals.css tiram a casca.
 */
export default async function PaginaResumo({ params }: { params: Promise<Params> }) {
  const { trilha: trilhaSlug, modulo: moduloSlug } = await params;
  const trilha = obterTrilha(trilhaSlug);
  const modulo = trilha?.modulos.find((m) => m.slug === moduloSlug);
  if (!trilha || !modulo) notFound();

  const temas = temasDoModulo(modulo);

  return (
    <AppShell>
      <div className="px-5 pb-8 pt-5 print:px-0">
        <div className="print:hidden">
          <Breadcrumbs
            itens={[
              { nome: "Trilhas", url: "/trilhas/" },
              { nome: trilha.titulo, url: `/trilhas/${trilha.slug}/` },
              {
                nome: `Resumo · ${modulo.titulo}`,
                url: `/trilhas/${trilha.slug}/${modulo.slug}/resumo/`,
              },
            ]}
          />
        </div>

        <h1 className="font-display mt-2 text-[26px] font-bold">{modulo.titulo}</h1>
        <p className="mt-2 text-sm leading-relaxed text-[var(--text-2)]">
          Folha de revisão · {temas.length} temas · {trilha.titulo}
        </p>
        <p className="mt-1 text-[13px] text-[var(--muted)] print:hidden">
          Feita para a véspera. Imprimir esta página tira o menu e as abas.
        </p>

        <div className="mt-6 flex flex-col gap-8">
          {temas.map((tema) => {
            const termos = extrairTermos(tema.corpo);
            return (
              <section key={tema.slug} className="break-inside-avoid">
                <h2 className="font-display border-t border-[var(--border)] pt-4 text-lg font-semibold">
                  {tema.titulo}
                </h2>

                <p className="mt-2 text-[15px] leading-relaxed">{tema.porQue}</p>

                <p className="mt-2.5 text-[15px] italic leading-relaxed text-[var(--text-2)]">
                  Como cai: {tema.comoCai}
                </p>

                <h3 className="mt-3.5 text-[13px] font-semibold uppercase tracking-[0.1em] text-[var(--muted)]">
                  Erros comuns
                </h3>
                <ul className="mt-1.5 flex list-none flex-col gap-1.5 p-0">
                  {tema.errosComuns.map((erro, i) => (
                    <li key={i} className="flex gap-2 text-[14px] leading-relaxed">
                      <span aria-hidden="true" className="text-[var(--color-danger)]">
                        ×
                      </span>
                      <span>{erro}</span>
                    </li>
                  ))}
                </ul>

                {termos.length > 0 ? (
                  <>
                    <h3 className="mt-3.5 text-[13px] font-semibold uppercase tracking-[0.1em] text-[var(--muted)]">
                      Vocabulário
                    </h3>
                    <dl className="mt-1.5 flex flex-col gap-1">
                      {termos.map((termo) => (
                        <div key={termo.nome} className="text-[14px] leading-relaxed">
                          <dt className="inline font-semibold text-[var(--accent)]">
                            {termo.nome}
                          </dt>
                          <dd className="inline text-[var(--text-2)]"> — {termo.definicao}</dd>
                        </div>
                      ))}
                    </dl>
                  </>
                ) : null}
              </section>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
