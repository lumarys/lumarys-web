import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AppShell } from "@/components/layout/AppShell";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Card, Rotulo, RotuloAcento } from "@/components/ui/Card";
import { componentesMdx } from "@/components/mdx";
import { corpos } from "@content/temas/corpos.generated";
import { ConcluirTema } from "@/features/tema/ConcluirTema";
import { Drill } from "@/features/tema/Drill";
import { Flashcards } from "@/features/tema/Flashcards";
import { Pomodoro } from "@/features/tema/Pomodoro";
import { PreTeste } from "@/features/tema/PreTeste";
import { Quiz } from "@/features/tema/Quiz";
import { VideoEmbed } from "@/features/tema/VideoEmbed";
import {
  localizarTema,
  sequenciaDaTrilha,
  todasAsRotasDeTema,
  vizinhosDoTema,
} from "@/lib/content";
import { JsonLd, SITE, alternativas } from "@/lib/seo";
import { formatarMinutos } from "@/lib/utils";

type Params = { trilha: string; modulo: string; tema: string };

export function generateStaticParams(): Params[] {
  return todasAsRotasDeTema();
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { trilha, modulo, tema } = await params;
  const local = localizarTema(trilha, tema);
  if (!local) return {};

  const url = `/trilhas/${trilha}/${modulo}/${tema}/`;
  return {
    // Fora do template do site: o título do tema já carrega a trilha.
    title: { absolute: `${local.tema.titulo} | ${local.trilha.titulo} · ${SITE.nome}` },
    description: local.tema.resumo,
    alternates: alternativas(url, { markdown: true }),
    openGraph: {
      type: "article",
      url,
      title: `${local.tema.titulo} — ${local.trilha.titulo}`,
      description: local.tema.resumo,
    },
  };
}

export default async function PaginaTema({ params }: { params: Promise<Params> }) {
  const { trilha: trilhaSlug, modulo: moduloSlug, tema: temaSlug } = await params;
  const local = localizarTema(trilhaSlug, temaSlug);
  if (!local || local.modulo.slug !== moduloSlug) notFound();

  const { trilha, modulo, tema } = local;
  const { proximo } = vizinhosDoTema(trilha, temaSlug);
  const sequencia = sequenciaDaTrilha(trilha);
  const posicao = sequencia.findIndex((x) => x.tema.slug === temaSlug) + 1;

  const objetivas = tema.perguntas.filter(
    (p): p is Extract<typeof p, { tipo: "unica" | "multipla" }> => p.tipo !== "oral",
  );
  const orais = tema.perguntas.filter((p) => p.tipo === "oral");
  const proximoModulo = proximo
    ? trilha.modulos.find((m) => m.temas.includes(proximo.slug))?.slug
    : undefined;

  const [videoPrincipal, ...videosExtras] = tema.videos;

  return (
    <AppShell>
      <article className="px-5 pb-8 pt-4">
        <div className="flex items-center justify-between gap-3">
          <Breadcrumbs
            className="min-w-0"
            itens={[
              { nome: "Início", url: "/" },
              { nome: "Trilhas", url: "/trilhas/" },
              { nome: trilha.titulo, url: `/trilhas/${trilha.slug}/` },
              { nome: modulo.titulo, url: `/trilhas/${trilha.slug}/#${modulo.slug}` },
              { nome: tema.titulo, url: `/trilhas/${trilha.slug}/${modulo.slug}/${tema.slug}/` },
            ]}
          />
          <Pomodoro />
        </div>

        <header className="mt-3">
          <Rotulo>
            {modulo.titulo} · tema {posicao} de {sequencia.length}
          </Rotulo>
          <h1 className="font-display mt-1.5 text-[26px] font-bold leading-[1.15]">
            {tema.titulo}
          </h1>
          <p className="mt-2 text-[13px] text-[var(--text-2)]">
            {formatarMinutos(tema.minutos)} · {tema.videos.length} vídeo
            {tema.videos.length > 1 ? "s" : ""} · {tema.flashcards.length} cards ·{" "}
            {tema.drills.length} drill
          </p>
        </header>

        <Card destaque className="mt-5">
          <RotuloAcento>Por que cai</RotuloAcento>
          <p className="mt-1.5 text-[15px] leading-relaxed">{tema.porQue}</p>
        </Card>

        <PreTeste perguntas={tema.preTeste} trilhaSlug={trilha.slug} temaSlug={tema.slug} />

        {videoPrincipal ? (
          <section className="mt-6">
            <Rotulo className="mb-2">Vídeo · português · {videoPrincipal.duracao} min</Rotulo>
            <VideoEmbed video={videoPrincipal} />
          </section>
        ) : null}

        <section className="prose-lumarys mt-6">
          {/* Compilado no build pelo @next/mdx; nada de MDX em tempo de execução. */}
          <CorpoDoTema slug={tema.slug} />
        </section>

        {videosExtras.length > 0 ? (
          <section className="mt-6">
            <Rotulo className="mb-2">Se quiser outro ângulo</Rotulo>
            <div className="flex flex-col gap-4">
              {videosExtras.map((video) => (
                <VideoEmbed key={video.id} video={video} />
              ))}
            </div>
          </section>
        ) : null}

        <Card className="mt-6 border-l-[3px] border-l-[var(--color-info)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-info)]">
            Como cai na sabatina
          </p>
          <p className="mt-1.5 text-[15px] italic leading-relaxed">“{tema.comoCai}”</p>
        </Card>

        <section className="mt-6">
          <Rotulo className="mb-2">Erros comuns</Rotulo>
          <ul className="flex list-none flex-col gap-2 p-0">
            {tema.errosComuns.map((erro, i) => (
              <li
                key={i}
                className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3.5 py-3 text-sm leading-relaxed"
              >
                {erro}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-6">
          <Rotulo className="mb-2">Flashcards</Rotulo>
          <Flashcards cards={tema.flashcards} temaSlug={tema.slug} />
        </section>

        {tema.drills.map((drill, i) => (
          <section key={i} className="mt-6">
            <Drill drill={drill} />
          </section>
        ))}

        {objetivas.length > 0 ? (
          <section className="mt-6">
            <Quiz perguntas={objetivas} trilhaSlug={trilha.slug} temaSlug={tema.slug} />
          </section>
        ) : null}

        <Card className="mt-6">
          <RotuloAcento>Explique para um gerente</RotuloAcento>
          <p className="mt-1.5 text-[15px] leading-relaxed text-[var(--text-2)]">{tema.feynman}</p>
          <p className="mt-3 rounded-xl border border-dashed border-[var(--border)] px-3.5 py-3 text-sm text-[var(--muted)]">
            Responda em voz alta antes de seguir. Se travar numa palavra técnica, é sinal de que
            ainda não entendeu essa parte.
          </p>
        </Card>

        {orais.length > 0 ? (
          <Card className="mt-4">
            <RotuloAcento>Perguntas de sabatina deste tema</RotuloAcento>
            <ul className="mt-2 flex list-none flex-col gap-2 p-0">
              {orais.map((p, i) => (
                <li key={i} className="text-[15px] leading-relaxed">
                  · {p.enunciado}
                </li>
              ))}
            </ul>
            <Link
              href={`/simulado/?trilha=${trilha.slug}&modulo=${modulo.slug}`}
              className="mt-3 flex min-h-12 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--elevated)] text-sm font-semibold no-underline"
            >
              Responder no simulado
            </Link>
          </Card>
        ) : null}

        <section className="mt-6">
          <Rotulo className="mb-2">Para ir além</Rotulo>
          <ul className="flex list-none flex-col gap-2 p-0">
            {tema.artigos.map((artigo) => (
              <li key={artigo.url}>
                <a
                  href={artigo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-h-11 items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5 text-sm no-underline"
                >
                  <span className="text-[var(--text)]">{artigo.titulo}</span>
                  <span className="shrink-0 text-xs text-[var(--muted)]">{artigo.fonte}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>

        <div className="mt-8">
          <ConcluirTema
            trilhaSlug={trilha.slug}
            temaSlug={tema.slug}
            minutos={tema.minutos}
            proximo={
              proximo && proximoModulo
                ? { slug: proximo.slug, titulo: proximo.titulo, modulo: proximoModulo }
                : undefined
            }
          />
        </div>
      </article>

      <JsonLd
        dados={{
          "@context": "https://schema.org",
          "@type": "LearningResource",
          name: tema.titulo,
          description: tema.resumo,
          inLanguage: "pt-BR",
          educationalLevel: tema.nivel,
          timeRequired: `PT${tema.minutos}M`,
          learningResourceType: "lesson",
          isPartOf: {
            "@type": "Course",
            name: trilha.titulo,
            url: `${SITE.url}/trilhas/${trilha.slug}/`,
          },
          publisher: { "@id": `${SITE.url}/#organizacao` },
          video: tema.videos.map((v) => ({
            "@type": "VideoObject",
            name: v.titulo,
            description: v.porQue,
            uploadDate: v.publicadoEm,
            thumbnailUrl: `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`,
            embedUrl: `https://www.youtube-nocookie.com/embed/${v.id}`,
            duration: `PT${v.duracao}M`,
          })),
        }}
      />
      <JsonLd
        dados={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: orais.map((p) => ({
            "@type": "Question",
            name: p.enunciado,
            acceptedAnswer: { "@type": "Answer", text: p.respostaModelo },
          })),
        }}
      />
    </AppShell>
  );
}

/** Carrega o corpo já compilado do tema. */
async function CorpoDoTema({ slug }: { slug: string }) {
  const carregar = corpos[slug];
  if (!carregar) return null;
  const { default: Corpo } = await carregar();
  return <Corpo components={componentesMdx} />;
}
