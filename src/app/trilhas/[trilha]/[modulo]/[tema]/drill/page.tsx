import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AppShell } from "@/components/layout/AppShell";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { BotaoLink } from "@/components/ui/Botao";
import { Drill } from "@/features/tema/Drill";
import { localizarTema, todasAsRotasDeTema } from "@/lib/content";
import { minutosDoDrill } from "@/lib/drills";
import { alternativas } from "@/lib/seo";

type Params = { trilha: string; modulo: string; tema: string };

export function generateStaticParams(): Params[] {
  return todasAsRotasDeTema();
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { trilha, modulo, tema } = await params;
  const local = localizarTema(trilha, tema);
  if (!local) return {};

  return {
    title: `Drill · ${local.tema.titulo}`,
    description: `Prática deliberada do ponto fraco de ${local.tema.titulo}.`,
    alternates: alternativas(`/trilhas/${trilha}/${modulo}/${tema}/drill/`),
    // O drill já está na página do tema; indexar as duas seria conteúdo
    // duplicado. Esta rota existe para ser rápida, não para ser encontrada.
    robots: { index: false, follow: true },
  };
}

/**
 * O drill sozinho, fora da página do tema.
 *
 * A página do tema tem milhares de pixels; quem tem cinco minutos e um ponto
 * fraco identificado não deveria precisar rolar até o meio dela para praticar.
 */
export default async function PaginaDrill({ params }: { params: Promise<Params> }) {
  // O módulo vem do endereço mas não é usado: quem manda é `localizarTema`,
  // que devolve o módulo real do tema.
  const { trilha: trilhaSlug, tema: temaSlug } = await params;
  const local = localizarTema(trilhaSlug, temaSlug);
  if (!local) notFound();

  const { trilha, modulo, tema } = local;
  const drill = tema.drills[0];
  if (!drill) notFound();

  const hrefDoTema = `/trilhas/${trilha.slug}/${modulo.slug}/${tema.slug}/`;

  return (
    <AppShell comRodape={false}>
      <div className="flex flex-col gap-3.5 px-5 pb-8 pt-5">
        <Breadcrumbs
          itens={[
            { nome: "Trilhas", url: "/trilhas/" },
            { nome: trilha.titulo, url: `/trilhas/${trilha.slug}/` },
            { nome: `Drill · ${tema.titulo}`, url: `${hrefDoTema}drill/` },
          ]}
        />
        <div>
          <h1 className="font-display text-[22px] font-semibold">{tema.titulo}</h1>
          <p className="mt-1 text-sm text-[var(--text-2)]">
            Drill · cerca de {minutosDoDrill(drill.itens.length)} min
          </p>
        </div>

        <Drill drill={drill} trilhaSlug={trilha.slug} temaSlug={tema.slug} />

        <BotaoLink href={hrefDoTema} variante="secundario">
          Reler o tema
        </BotaoLink>
      </div>
    </AppShell>
  );
}
