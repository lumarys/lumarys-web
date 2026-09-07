import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AppShell } from "@/components/layout/AppShell";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { listarTrilhas, obterTrilha, temasDoModulo } from "@/lib/content";
import { montarGlossario } from "@/lib/glossario";
import { JsonLd, SITE, alternativas } from "@/lib/seo";

type Params = { trilha: string };

export function generateStaticParams(): Params[] {
  return listarTrilhas().map((t) => ({ trilha: t.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { trilha: slug } = await params;
  const trilha = obterTrilha(slug);
  if (!trilha) return {};

  return {
    title: `Glossário · ${trilha.titulo}`,
    description: `Os termos que aparecem na trilha de ${trilha.titulo}, definidos em uma linha cada, com o tema onde cada um é explicado.`,
    alternates: alternativas(`/trilhas/${slug}/glossario/`),
  };
}

/**
 * O vocabulário da trilha numa página só.
 *
 * Serve a dois públicos que não se encontram: quem revisa na véspera e quer
 * varrer os termos, e quem chega de busca perguntando "o que é particionamento
 * de dados". Cada verbete leva ao tema onde o conceito é de fato explicado —
 * a definição de uma linha é porta de entrada, não substituto.
 */
export default async function PaginaGlossario({ params }: { params: Promise<Params> }) {
  const { trilha: slug } = await params;
  const trilha = obterTrilha(slug);
  if (!trilha) notFound();

  const termos = montarGlossario(
    trilha.modulos.map((modulo) => ({
      slug: modulo.slug,
      temas: temasDoModulo(modulo).map((t) => ({
        slug: t.slug,
        titulo: t.titulo,
        corpo: t.corpo,
      })),
    })),
  );

  return (
    <AppShell>
      <JsonLd
        dados={{
          "@context": "https://schema.org",
          "@type": "DefinedTermSet",
          name: `Glossário de ${trilha.titulo}`,
          url: `${SITE.url}/trilhas/${trilha.slug}/glossario/`,
          hasDefinedTerm: termos.map((termo) => ({
            "@type": "DefinedTerm",
            name: termo.nome,
            description: termo.definicao,
            url: `${SITE.url}/trilhas/${trilha.slug}/${termo.moduloSlug}/${termo.temaSlug}/`,
          })),
        }}
      />

      <div className="px-5 pb-8 pt-5">
        <Breadcrumbs
          itens={[
            { nome: "Trilhas", url: "/trilhas/" },
            { nome: trilha.titulo, url: `/trilhas/${trilha.slug}/` },
            { nome: "Glossário", url: `/trilhas/${trilha.slug}/glossario/` },
          ]}
        />
        <h1 className="font-display mt-2 text-[26px] font-bold">Glossário</h1>
        <p className="mt-2 text-sm leading-relaxed text-[var(--text-2)]">
          {termos.length} termos da trilha de {trilha.titulo}, cada um com o tema onde ele é
          explicado por inteiro.
        </p>

        <dl className="mt-6 flex flex-col gap-4">
          {termos.map((termo) => (
            <div
              key={termo.nome}
              id={termo.nome.toLocaleLowerCase("pt-BR").replace(/\s+/g, "-")}
              className="scroll-mt-20 border-t border-[var(--border)] pt-4"
            >
              <dt className="font-display text-[17px] font-semibold text-[var(--accent)]">
                {termo.nome}
              </dt>
              <dd className="mt-1 text-[15px] leading-relaxed">{termo.definicao}</dd>
              <dd className="mt-1.5">
                <Link
                  href={`/trilhas/${trilha.slug}/${termo.moduloSlug}/${termo.temaSlug}/`}
                  className="text-[13px] no-underline"
                >
                  {termo.temaTitulo}
                </Link>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </AppShell>
  );
}
