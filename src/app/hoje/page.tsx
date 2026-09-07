import type { Metadata } from "next";
import { Suspense } from "react";

import { AppShell } from "@/components/layout/AppShell";
import { HojeAtivo } from "@/features/hoje/HojeAtivo";
import type { DadosHoje } from "@/features/hoje/PainelHoje";
import { listarTrilhas, temasDoModulo } from "@/lib/content";
import { alternativas } from "@/lib/seo";
import type { Trilha } from "@content/types";

export const metadata: Metadata = {
  title: "Hoje",
  description: "Sua próxima ação de estudo, a sequência de dias e a prontidão por módulo.",
  alternates: alternativas("/hoje/"),
  robots: { index: false, follow: true },
};

/** O que o painel precisa saber de uma trilha, resolvido no build. */
function dadosDe(trilha: Trilha): DadosHoje {
  return {
    trilhaSlug: trilha.slug,
    trilhaTitulo: trilha.titulo,
    temas: trilha.modulos.flatMap((m) =>
      temasDoModulo(m).map((t) => ({
        slug: t.slug,
        titulo: t.titulo,
        minutos: t.minutos,
        modulo: m.slug,
        moduloTitulo: m.titulo,
        itensDeDrill: t.drills[0]?.itens.length ?? 0,
      })),
    ),
    prazoDias: trilha.prazoSugeridoDias,
    modulos: trilha.modulos.map((m) => ({
      slug: m.slug,
      titulo: m.titulo,
      temas: temasDoModulo(m).map((t) => t.slug),
    })),
  };
}

export default function PaginaHoje() {
  const trilhas = listarTrilhas().map(dadosDe);

  return (
    <AppShell comRodape={false}>
      {/* Suspense porque a escolha da trilha lê a query string, e isso faz o
          Next renderizar o trecho só no cliente. */}
      <Suspense
        fallback={
          <div className="mx-5 mt-5 h-64 animate-pulse rounded-2xl border border-[var(--border)]" />
        }
      >
        <HojeAtivo trilhas={trilhas} />
      </Suspense>
    </AppShell>
  );
}
