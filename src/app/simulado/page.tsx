import type { Metadata } from "next";
import { Suspense } from "react";

import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

import { AppShell } from "@/components/layout/AppShell";
import { Rotulo } from "@/components/ui/Card";
import { AmostraPublica, type PerguntaDeAmostra } from "@/features/simulado/AmostraPublica";
import { SimuladoComEscopo, type TrilhaDeSimulado } from "@/features/simulado/SimuladoComEscopo";
import { listarTrilhas, temasDoModulo } from "@/lib/content";
import type { PerguntaSimulado } from "@/features/simulado/Simulado";
import type { QuestaoDeProva } from "@/lib/prova";
import { alternativas, JsonLd, jsonLdBreadcrumb, jsonLdFaq } from "@/lib/seo";
import type { Trilha } from "@content/types";

export const metadata: Metadata = {
  title: "Simulado",
  description:
    "Sabatina simulada: perguntas orais no formato da banca, resposta-modelo e autoavaliação por rubrica.",
  alternates: alternativas("/simulado/"),
};

function perguntasDe(trilha: Trilha): PerguntaSimulado[] {
  return trilha.modulos.flatMap((modulo) =>
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
}

/** O banco objetivo de uma certificação: toda questão de cenário dos temas. */
function bancoDe(trilha: Trilha): QuestaoDeProva[] {
  return trilha.modulos.flatMap((modulo) =>
    temasDoModulo(modulo).flatMap((tema) =>
      tema.perguntas
        .filter((p): p is Extract<typeof p, { tipo: "unica" | "multipla" }> => p.tipo !== "oral")
        .map((p, i) => ({
          id: `${tema.slug}#obj#${i}`,
          moduloSlug: modulo.slug,
          moduloTitulo: modulo.titulo,
          temaSlug: tema.slug,
          temaTitulo: tema.titulo,
          href: `/trilhas/${trilha.slug}/${modulo.slug}/${tema.slug}/`,
          tipo: p.tipo,
          enunciado: p.enunciado,
          alternativas: p.alternativas,
        })),
    ),
  );
}

function promptDe(trilha: Trilha): string | null {
  const caminho = join(process.cwd(), "content", "prompts", `${trilha.slug}.md`);
  return existsSync(caminho) ? readFileSync(caminho, "utf8").trim() : null;
}

export default function PaginaSimulado() {
  const trilhas = listarTrilhas();
  const primeira = trilhas[0];
  if (!primeira) return null;

  const porTrilha: TrilhaDeSimulado[] = trilhas.map((t) => ({
    slug: t.slug,
    titulo: t.titulo,
    tipo: t.tipo,
    perguntas: perguntasDe(t),
    prompt: promptDe(t),
    ...(t.tipo === "certificacao" && t.exame
      ? {
          exame: t.exame,
          // Só os domínios do exame: o módulo "como funciona a prova" não
          // tem peso e não entra no sorteio.
          dominios: t.modulos
            .filter((m) => m.pesoExame)
            .map((m) => ({ slug: m.slug, titulo: m.titulo, peso: m.pesoExame ?? 0 })),
          banco: bancoDe(t),
        }
      : {}),
  }));

  // A amostra pública é da primeira trilha do catálogo: é o HTML que o
  // buscador indexa, e precisa ser o mesmo em todo build. Uma por módulo,
  // sempre a primeira pergunta: escolha determinística.
  const perguntasDaPrimeira = porTrilha[0]?.perguntas ?? [];
  const amostra: PerguntaDeAmostra[] = primeira.modulos.flatMap((modulo) => {
    const p = perguntasDaPrimeira.find((q) => q.moduloSlug === modulo.slug);
    return p
      ? [
          {
            moduloSlug: modulo.slug,
            moduloTitulo: modulo.titulo,
            temaTitulo: p.temaTitulo,
            href: p.href,
            enunciado: p.enunciado,
            respostaModelo: p.respostaModelo,
            rubrica: p.rubrica,
          },
        ]
      : [];
  });

  return (
    <AppShell comRodape={false}>
      <JsonLd
        dados={jsonLdBreadcrumb([
          { nome: "Início", url: "/" },
          { nome: "Simulado", url: "/simulado/" },
        ])}
      />
      {/* As perguntas de amostra estão no HTML com a resposta-modelo ao lado:
          é exatamente o par que o FAQPage descreve. */}
      <JsonLd
        dados={jsonLdFaq(
          amostra.map((p) => ({ pergunta: p.enunciado, resposta: p.respostaModelo })),
        )}
      />
      <header className="px-5 pb-4 pt-5">
        <Rotulo>Simulado</Rotulo>
        <h1 className="font-display mt-1 text-[22px] font-semibold">{primeira.formatoProva}</h1>
      </header>
      <Suspense
        fallback={
          <div className="mx-5 h-48 animate-pulse rounded-2xl border border-[var(--border)]" />
        }
      >
        <SimuladoComEscopo trilhas={porTrilha} />
      </Suspense>
      {/* Fora do Suspense de propósito: `SimuladoComEscopo` lê a query string,
          o que faz o Next renderizar aquele trecho só no cliente. Se a amostra
          morasse lá dentro, ela não estaria no HTML — que é justamente o que
          um buscador ou um agente lê. */}
      <div className="px-5 pb-8 pt-8">
        <AmostraPublica perguntas={amostra} />
      </div>
    </AppShell>
  );
}
