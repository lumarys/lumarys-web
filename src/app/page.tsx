import type { Metadata } from "next";
import Link from "next/link";

import { AppShell } from "@/components/layout/AppShell";
import { Card, Rotulo } from "@/components/ui/Card";
import { IconeSeta, Marca } from "@/components/ui/icons";
import { contarTemas, listarTrilhas, minutosDaTrilha } from "@/lib/content";
import { EMPRESA } from "@/lib/company";
import { formatarMinutos } from "@/lib/utils";
import { trilhasEmBreve } from "@content/trilhas";

export const metadata: Metadata = {
  title: "Lumarys — trilhas de estudo para provas e certificações",
  description:
    "Estude do jeito que a prova cobra. Trilhas montadas a partir da ementa oficial, com vídeo em português, recall espaçado e simulado no formato real.",
  alternates: { canonical: "/" },
};

export default function Home() {
  const trilhas = listarTrilhas();

  return (
    <AppShell comAbas={false}>
      <section className="px-5 pb-10 pt-12">
        <div className="flex items-center gap-2.5">
          <Marca size={32} />
          <div>
            <p className="font-display text-xl font-semibold leading-none">Lumarys</p>
            <p className="text-[11px] uppercase tracking-[0.14em] text-[var(--text-2)]">
              {EMPRESA.tagline}
            </p>
          </div>
        </div>

        <h1 className="font-display mt-8 text-[32px] font-bold leading-[1.12]">
          Você sabe o que estudar hoje e o quão pronto está.
        </h1>
        <p className="mt-4 text-[17px] leading-relaxed text-[var(--text-2)]">
          Cada trilha parte da ementa oficial que a empresa ou a certificadora publica e vira
          estudo ativo: vídeo em português, explicação, recall espaçado e simulado no formato real
          da prova.
        </p>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <Link
            href={`/trilhas/${trilhas[0]?.slug ?? ""}/`}
            className="inline-flex min-h-13 flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-5 text-[15px] font-semibold text-[var(--accent-ink)] no-underline"
          >
            Começar pela trilha de dados
            <IconeSeta size={18} />
          </Link>
          <Link
            href="/metodo/"
            className="inline-flex min-h-13 flex-1 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] px-5 text-[15px] font-semibold text-[var(--text)] no-underline"
          >
            Como o método funciona
          </Link>
        </div>
      </section>

      <section className="px-5 pb-10" aria-labelledby="catalogo">
        <Rotulo className="mb-3">Trilhas de carreira</Rotulo>
        <h2 id="catalogo" className="sr-only">
          Catálogo de trilhas
        </h2>

        <ul className="flex list-none flex-col gap-3 p-0">
          {trilhas.map((trilha) => (
            <li key={trilha.slug}>
              <Link href={`/trilhas/${trilha.slug}/`} className="block no-underline">
                <Card destaque className="transition-colors hover:border-[var(--accent)]">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--accent)]">
                    {trilha.origem}
                  </p>
                  <p className="font-display mt-1.5 text-[22px] font-semibold text-[var(--text)]">
                    {trilha.titulo}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--text-2)]">
                    {trilha.resumo}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Etiqueta>{trilha.formatoProva}</Etiqueta>
                    <Etiqueta>
                      {contarTemas(trilha)} temas · {formatarMinutos(minutosDaTrilha(trilha))}
                    </Etiqueta>
                    <Etiqueta>Plano de {trilha.prazoSugeridoDias} dias</Etiqueta>
                  </div>
                </Card>
              </Link>
            </li>
          ))}
        </ul>

        <Rotulo className="mb-3 mt-8">Em breve</Rotulo>
        <ul className="flex list-none flex-col gap-2 p-0">
          {trilhasEmBreve.map((t) => (
            <li key={t.slug}>
              <Card className="opacity-70">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
                      {t.origem}
                    </p>
                    <p className="mt-1 text-[15px] font-semibold">{t.titulo}</p>
                    <p className="mt-1 text-[13px] leading-relaxed text-[var(--text-2)]">
                      {t.resumo}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-[var(--elevated)] px-2.5 py-1 text-[11px] font-semibold text-[var(--muted)]">
                    em breve
                  </span>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      </section>

      <section className="px-5 pb-12" aria-labelledby="como">
        <Rotulo className="mb-3">Como funciona</Rotulo>
        <h2 id="como" className="font-display text-[22px] font-semibold">
          Estudo ativo, em sessões curtas
        </h2>
        <ol className="mt-4 flex list-none flex-col gap-3 p-0">
          {[
            {
              titulo: "Responda antes de aprender",
              texto:
                "Cada tema começa com um pré-teste. Errar antes de estudar fixa mais do que ler duas vezes.",
            },
            {
              titulo: "Uma próxima ação por vez",
              texto:
                "A tela Hoje mostra um tema, um drill ou os cards vencidos. Nunca um menu de opções.",
            },
            {
              titulo: "Revisão espaçada",
              texto:
                "Os cards voltam em 1, 3, 7 e 12 dias, intercalados entre módulos para você não decorar a ordem.",
            },
            {
              titulo: "Simulado no formato real",
              texto:
                "Sabatina é oral: você responde em voz alta, compara com a resposta-modelo e se avalia por rubrica.",
            },
          ].map((passo, i) => (
            <li key={passo.titulo} className="flex gap-3">
              <span className="font-display mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-[var(--elevated)] text-[13px] font-bold text-[var(--accent)]">
                {i + 1}
              </span>
              <div>
                <p className="text-[15px] font-semibold">{passo.titulo}</p>
                <p className="mt-0.5 text-sm leading-relaxed text-[var(--text-2)]">{passo.texto}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-5 text-sm text-[var(--text-2)]">
          O método vem dos nove princípios de Ultraaprendizado, de Scott Young.{" "}
          <Link href="/metodo/">Veja como cada um aparece no site</Link>.
        </p>
      </section>
    </AppShell>
  );
}

function Etiqueta({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-[var(--elevated)] px-2.5 py-1 text-xs font-semibold text-[var(--text)]">
      {children}
    </span>
  );
}
