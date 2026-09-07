import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AppShell } from "@/components/layout/AppShell";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Checkpoint, type TemaDoModulo } from "@/features/checkpoint/Checkpoint";
import { listarTrilhas, obterTrilha, temasDoModulo } from "@/lib/content";
import { alternativas } from "@/lib/seo";

type Params = { trilha: string; modulo: string };

export function generateStaticParams(): Params[] {
  return listarTrilhas().flatMap((trilha) =>
    // Módulo "em breve" não tem tema: sem checkpoint nem folha para gerar.
    trilha.modulos
      .filter((modulo) => modulo.status === "disponivel")
      .map((modulo) => ({ trilha: trilha.slug, modulo: modulo.slug })),
  );
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { trilha: trilhaSlug, modulo: moduloSlug } = await params;
  const trilha = obterTrilha(trilhaSlug);
  const modulo = trilha?.modulos.find((m) => m.slug === moduloSlug);
  if (!trilha || !modulo) return {};

  return {
    title: `Checkpoint · ${modulo.titulo}`,
    description: `Verificação do módulo ${modulo.titulo}, com perguntas dos temas misturadas.`,
    alternates: alternativas(`/trilhas/${trilhaSlug}/${moduloSlug}/checkpoint/`),
    // Conteúdo de estudo pessoal, e as perguntas já estão nas páginas dos
    // temas: indexar isto seria conteúdo duplicado sem ganho.
    robots: { index: false, follow: true },
  };
}

export default async function PaginaCheckpoint({ params }: { params: Promise<Params> }) {
  const { trilha: trilhaSlug, modulo: moduloSlug } = await params;
  const trilha = obterTrilha(trilhaSlug);
  const modulo = trilha?.modulos.find((m) => m.slug === moduloSlug);
  if (!trilha || !modulo) notFound();

  const temas: TemaDoModulo[] = temasDoModulo(modulo).map((tema) => ({
    slug: tema.slug,
    titulo: tema.titulo,
    perguntas: tema.perguntas,
    href: `/trilhas/${trilha.slug}/${modulo.slug}/${tema.slug}/`,
  }));

  return (
    <AppShell comRodape={false}>
      <div className="px-5 pb-8 pt-5">
        <Breadcrumbs
          itens={[
            { nome: "Trilhas", url: "/trilhas/" },
            { nome: trilha.titulo, url: `/trilhas/${trilha.slug}/` },
            {
              nome: `Checkpoint · ${modulo.titulo}`,
              url: `/trilhas/${trilha.slug}/${modulo.slug}/checkpoint/`,
            },
          ]}
        />
        <h1 className="font-display mt-2 text-[22px] font-semibold">Checkpoint</h1>
        <p className="mt-1.5 text-sm leading-relaxed text-[var(--text-2)]">{modulo.titulo}</p>

        <div className="mt-5">
          <Checkpoint
            trilhaSlug={trilha.slug}
            moduloSlug={modulo.slug}
            moduloTitulo={modulo.titulo}
            temas={temas}
            hrefDoModulo={`/trilhas/${trilha.slug}/`}
          />
        </div>
      </div>
    </AppShell>
  );
}
