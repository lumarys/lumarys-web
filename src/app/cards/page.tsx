import type { Metadata } from "next";

import { AppShell } from "@/components/layout/AppShell";
import { Rotulo } from "@/components/ui/Card";
import { FilaCards, type CardConteudo } from "@/features/cards/FilaCards";
import { listarTrilhas, temasDoModulo } from "@/lib/content";
import { alternativas } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Cards",
  description: "Revisão espaçada dos cards que vencem hoje, intercalados entre módulos.",
  alternates: alternativas("/cards/"),
  robots: { index: false, follow: true },
};

export default function PaginaCards() {
  // Todos os cards de todas as trilhas, indexados pelo id que o SRS usa.
  const conteudo: Record<string, CardConteudo> = {};
  for (const trilha of listarTrilhas()) {
    for (const modulo of trilha.modulos) {
      for (const tema of temasDoModulo(modulo)) {
        tema.flashcards.forEach((card, i) => {
          conteudo[`${tema.slug}#${i}`] = {
            id: `${tema.slug}#${i}`,
            temaSlug: tema.slug,
            temaTitulo: tema.titulo,
            frente: card.frente,
            verso: card.verso,
            href: `/trilhas/${trilha.slug}/${modulo.slug}/${tema.slug}/`,
          };
        });
      }
    }
  }

  return (
    <AppShell comRodape={false}>
      <header className="px-5 pb-3 pt-5">
        <Rotulo>Revisão</Rotulo>
        <h1 className="font-display mt-1 text-[22px] font-semibold">Cards de hoje</h1>
      </header>
      <FilaCards conteudo={conteudo} />
    </AppShell>
  );
}
