import type { Metadata } from "next";
import Link from "next/link";

import { AppShell } from "@/components/layout/AppShell";
import { Rotulo } from "@/components/ui/Card";
import { IconeConta } from "@/components/ui/icons";
import { PainelHoje, type DadosHoje } from "@/features/hoje/PainelHoje";
import { listarTrilhas, temasDoModulo } from "@/lib/content";
import { alternativas } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Hoje",
  description: "Sua próxima ação de estudo, a sequência de dias e a prontidão por módulo.",
  alternates: alternativas("/hoje/"),
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
      <header className="flex items-start justify-between gap-3 px-5 pb-3 pt-5">
        <div>
          <Rotulo>Hoje</Rotulo>
          <h1 className="font-display mt-1 text-[22px] font-semibold">{trilha.titulo}</h1>
        </div>
        <Link
          href="/conta/"
          aria-label="Minha conta"
          className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[var(--elevated)] text-[var(--text-2)] no-underline"
        >
          <IconeConta size={22} />
        </Link>
      </header>
      <PainelHoje dados={dados} />
    </AppShell>
  );
}
