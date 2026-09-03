import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AppShell } from "@/components/layout/AppShell";
import { Rotulo } from "@/components/ui/Card";
import { Plano, type DiaVisual } from "@/features/plano/Plano";
import { listarTrilhas, obterTema, obterTrilha } from "@/lib/content";

type Params = { trilha: string };

export function generateStaticParams(): Params[] {
  return listarTrilhas().map((t) => ({ trilha: t.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { trilha: slug } = await params;
  const trilha = obterTrilha(slug);
  if (!trilha) return {};
  return {
    title: `Plano de ${trilha.prazoSugeridoDias} dias | ${trilha.titulo}`,
    description: `Cronograma dia a dia para estudar ${trilha.titulo} com repetição espaçada.`,
    alternates: { canonical: `/trilhas/${slug}/plano/` },
  };
}

export default async function PaginaPlano({ params }: { params: Promise<Params> }) {
  const { trilha: slug } = await params;
  const trilha = obterTrilha(slug);
  if (!trilha) notFound();

  const dias: DiaVisual[] = trilha.cronograma.map((dia) => ({
    dia: dia.dia,
    titulo: dia.titulo,
    nota: dia.nota,
    revisao: (dia.revisao ?? []).map(
      (m) => trilha.modulos.find((x) => x.slug === m)?.titulo ?? m,
    ),
    temas: dia.temas.flatMap((temaSlug) => {
      const tema = obterTema(temaSlug);
      if (!tema) return [];
      const modulo = trilha.modulos.find((m) => m.temas.includes(temaSlug));
      if (!modulo) return [];
      return [
        {
          slug: tema.slug,
          titulo: tema.titulo,
          minutos: tema.minutos,
          href: `/trilhas/${trilha.slug}/${modulo.slug}/${tema.slug}/`,
        },
      ];
    }),
  }));

  return (
    <AppShell>
      <header className="px-5 pb-4 pt-5">
        <Rotulo>{trilha.titulo}</Rotulo>
        <h1 className="font-display mt-1 text-[22px] font-semibold">
          Plano de {trilha.prazoSugeridoDias} dias
        </h1>
      </header>
      <Plano trilhaSlug={trilha.slug} prazoSugerido={trilha.prazoSugeridoDias} dias={dias} />
    </AppShell>
  );
}
