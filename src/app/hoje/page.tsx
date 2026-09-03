import type { Metadata } from "next";

import { AppShell } from "@/components/layout/AppShell";
import { Rotulo } from "@/components/ui/Card";
import { PainelHoje, type DadosHoje } from "@/features/hoje/PainelHoje";
import { listarTrilhas, temasDoModulo } from "@/lib/content";

export const metadata: Metadata = {
  title: "Hoje",
  description: "Sua próxima ação de estudo, a sequência de dias e a prontidão por módulo.",
  alternates: { canonical: "/hoje/" },
  robots: { index: false, follow: true },
};

export default function PaginaHoje() {
  const trilha = listarTrilhas()[0];
  if (!trilha) return null;

  const dados: DadosHoje = {
    trilhaSlug: trilha.slug,
    trilhaTitulo: trilha.titulo,
    temas: trilha.modulos.flatMap((m) =>
      temasDoModulo(m).map((t) => ({
        slug: t.slug,
        titulo: t.titulo,
        minutos: t.minutos,
        modulo: m.slug,
        moduloTitulo: m.titulo,
      })),
    ),
    modulos: trilha.modulos.map((m) => ({
      slug: m.slug,
      titulo: m.titulo,
      temas: temasDoModulo(m).map((t) => t.slug),
    })),
  };

  return (
    <AppShell comRodape={false}>
      <header className="px-5 pb-3 pt-5">
        <Rotulo>Hoje</Rotulo>
        <h1 className="font-display mt-1 text-[22px] font-semibold">{trilha.titulo}</h1>
      </header>
      <PainelHoje dados={dados} />
    </AppShell>
  );
}
