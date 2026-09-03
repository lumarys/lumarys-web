import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AppShell } from "@/components/layout/AppShell";
import { Rotulo } from "@/components/ui/Card";
import { ListaModulos } from "@/features/trilha/ListaModulos";
import { ResumoProgresso } from "@/features/trilha/ResumoProgresso";
import { contarTemas, listarTrilhas, minutosDaTrilha, obterTrilha, temasDoModulo } from "@/lib/content";
import { JsonLd, SITE, jsonLdBreadcrumb } from "@/lib/seo";
import { formatarMinutos } from "@/lib/utils";

type Params = { trilha: string };

export function generateStaticParams(): Params[] {
  return listarTrilhas().map((t) => ({ trilha: t.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { trilha: slug } = await params;
  const trilha = obterTrilha(slug);
  if (!trilha) return {};
  return {
    title: trilha.titulo,
    description: trilha.resumo,
    alternates: { canonical: `/trilhas/${slug}/` },
    openGraph: { type: "website", url: `/trilhas/${slug}/`, title: trilha.titulo, description: trilha.resumo },
  };
}

export default async function PaginaTrilha({ params }: { params: Promise<Params> }) {
  const { trilha: slug } = await params;
  const trilha = obterTrilha(slug);
  if (!trilha) notFound();

  const modulos = trilha.modulos.map((m) => ({
    slug: m.slug,
    titulo: m.titulo,
    resumo: m.resumo,
    oficial: m.oficial,
    temas: temasDoModulo(m).map((t) => ({ slug: t.slug, titulo: t.titulo, minutos: t.minutos })),
  }));
  const total = contarTemas(trilha);

  return (
    <AppShell>
      <div className="px-5 pb-8 pt-5">
        <Rotulo>{trilha.origem}</Rotulo>
        <h1 className="font-display mt-1.5 text-[26px] font-bold leading-[1.15]">
          {trilha.titulo}
        </h1>
        <div className="mt-2.5 flex flex-wrap gap-2">
          <Etiqueta>{trilha.formatoProva}</Etiqueta>
          <Etiqueta>
            {total} temas · {formatarMinutos(minutosDaTrilha(trilha))}
          </Etiqueta>
          <Etiqueta>Plano de {trilha.prazoSugeridoDias} dias</Etiqueta>
        </div>

        <div className="mt-5">
          <ResumoProgresso
            trilhaSlug={trilha.slug}
            modulos={modulos.map((m) => ({
              slug: m.slug,
              titulo: m.titulo,
              temas: m.temas.map((t) => t.slug),
            }))}
            totalTemas={total}
          />
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <Bloco titulo="O quê" texto="A ementa oficial da carreira, mais o que ela não cobre." />
          <Bloco titulo="Por quê" texto="A sabatina cobra raciocínio e trade-off, não definição." />
          <Bloco titulo="Como" texto="Recall antes do vídeo, cards espaçados e simulado oral." />
        </div>

        <p className="mt-4 text-sm leading-relaxed text-[var(--text-2)]">{trilha.objetivo}</p>

        <div className="mt-5 flex gap-2">
          <Link
            href={`/trilhas/${trilha.slug}/plano/`}
            className="flex min-h-12 flex-1 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-sm font-semibold no-underline"
          >
            Plano de {trilha.prazoSugeridoDias} dias
          </Link>
          <Link
            href={`/simulado/?trilha=${trilha.slug}`}
            className="flex min-h-12 flex-1 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-sm font-semibold no-underline"
          >
            Simulado
          </Link>
        </div>

        <div className="mt-6">
          <Rotulo className="mb-2">Módulos</Rotulo>
          <ListaModulos trilhaSlug={trilha.slug} modulos={modulos} />
        </div>
      </div>

      <JsonLd
        dados={jsonLdBreadcrumb([
          { nome: "Início", url: "/" },
          { nome: "Trilhas", url: "/trilhas/" },
          { nome: trilha.titulo, url: `/trilhas/${trilha.slug}/` },
        ])}
      />
      <JsonLd
        dados={{
          "@context": "https://schema.org",
          "@type": "Course",
          name: trilha.titulo,
          description: trilha.resumo,
          inLanguage: "pt-BR",
          url: `${SITE.url}/trilhas/${trilha.slug}/`,
          provider: { "@id": `${SITE.url}/#organizacao` },
          teaches: trilha.modulos.map((m) => m.titulo),
          hasCourseInstance: {
            "@type": "CourseInstance",
            courseMode: "online",
            courseWorkload: `PT${minutosDaTrilha(trilha)}M`,
          },
        }}
      />
    </AppShell>
  );
}

function Etiqueta({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-[var(--elevated)] px-2.5 py-1 text-xs font-semibold">
      {children}
    </span>
  );
}

function Bloco({ titulo, texto }: { titulo: string; texto: string }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-2.5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--accent)]">
        {titulo}
      </p>
      <p className="mt-1 text-xs leading-snug text-[var(--text-2)]">{texto}</p>
    </div>
  );
}
