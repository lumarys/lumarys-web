import type { Metadata } from "next";
import { Suspense } from "react";

import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

import { AppShell } from "@/components/layout/AppShell";
import { Rotulo } from "@/components/ui/Card";
import { PromptIA } from "@/features/simulado/PromptIA";
import { SimuladoComEscopo } from "@/features/simulado/SimuladoComEscopo";
import { listarTrilhas, temasDoModulo } from "@/lib/content";
import type { PerguntaSimulado } from "@/features/simulado/Simulado";

export const metadata: Metadata = {
  title: "Simulado",
  description:
    "Sabatina simulada: perguntas orais no formato da banca, resposta-modelo e autoavaliação por rubrica.",
  alternates: { canonical: "/simulado/" },
  robots: { index: false, follow: true },
};

export default function PaginaSimulado() {
  const trilha = listarTrilhas()[0];
  if (!trilha) return null;

  const perguntas: PerguntaSimulado[] = trilha.modulos.flatMap((modulo) =>
    temasDoModulo(modulo).flatMap((tema) =>
      tema.perguntas
        .filter((p): p is Extract<typeof p, { tipo: "oral" }> => p.tipo === "oral")
        .map((p, i) => ({
          id: `${tema.slug}#oral#${i}`,
          moduloSlug: modulo.slug,
          moduloTitulo: modulo.titulo,
          temaSlug: tema.slug,
          temaTitulo: tema.titulo,
          href: `/trilhas/${trilha.slug}/${modulo.slug}/${tema.slug}/`,
          enunciado: p.enunciado,
          respostaModelo: p.respostaModelo,
          rubrica: p.rubrica,
        })),
    ),
  );

  const caminhoPrompt = join(process.cwd(), "content", "prompts", `${trilha.slug}.md`);
  const prompt = existsSync(caminhoPrompt) ? readFileSync(caminhoPrompt, "utf8").trim() : null;

  return (
    <AppShell comRodape={false}>
      <header className="px-5 pb-4 pt-5">
        <Rotulo>Simulado</Rotulo>
        <h1 className="font-display mt-1 text-[22px] font-semibold">{trilha.formatoProva}</h1>
      </header>
      <Suspense fallback={<div className="mx-5 h-48 animate-pulse rounded-2xl border border-[var(--border)]" />}>
        <SimuladoComEscopo
          trilhaSlug={trilha.slug}
          trilhaTitulo={trilha.titulo}
          perguntas={perguntas}
        />
      </Suspense>
      {prompt ? (
        <div className="px-5 pb-8 pt-6">
          <PromptIA prompt={prompt} />
        </div>
      ) : null}
    </AppShell>
  );
}
