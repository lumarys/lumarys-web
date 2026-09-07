import type { Metadata } from "next";
import { Suspense } from "react";

import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

import { AppShell } from "@/components/layout/AppShell";
import { Rotulo } from "@/components/ui/Card";
import { AmostraPublica, type PerguntaDeAmostra } from "@/features/simulado/AmostraPublica";
import { PromptIA } from "@/features/simulado/PromptIA";
import { SimuladoComEscopo } from "@/features/simulado/SimuladoComEscopo";
import { listarTrilhas, temasDoModulo } from "@/lib/content";
import type { PerguntaSimulado } from "@/features/simulado/Simulado";
import { alternativas, JsonLd, jsonLdBreadcrumb, jsonLdFaq } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Simulado",
  description:
    "Sabatina simulada: perguntas orais no formato da banca, resposta-modelo e autoavaliação por rubrica.",
  alternates: alternativas("/simulado/"),
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

  // Uma por módulo, sempre a primeira: escolha determinística, para a página
  // estática não mudar de conteúdo a cada build.
  const amostra: PerguntaDeAmostra[] = trilha.modulos.flatMap((modulo) => {
    const primeira = perguntas.find((p) => p.moduloSlug === modulo.slug);
    return primeira
      ? [
          {
            moduloSlug: modulo.slug,
            moduloTitulo: modulo.titulo,
            temaTitulo: primeira.temaTitulo,
            href: primeira.href,
            enunciado: primeira.enunciado,
            respostaModelo: primeira.respostaModelo,
            rubrica: primeira.rubrica,
          },
        ]
      : [];
  });

  const caminhoPrompt = join(process.cwd(), "content", "prompts", `${trilha.slug}.md`);
  const prompt = existsSync(caminhoPrompt) ? readFileSync(caminhoPrompt, "utf8").trim() : null;

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
        <h1 className="font-display mt-1 text-[22px] font-semibold">{trilha.formatoProva}</h1>
      </header>
      <Suspense
        fallback={
          <div className="mx-5 h-48 animate-pulse rounded-2xl border border-[var(--border)]" />
        }
      >
        <SimuladoComEscopo
          trilhaSlug={trilha.slug}
          trilhaTitulo={trilha.titulo}
          perguntas={perguntas}
        />
      </Suspense>
      {/* Fora do Suspense de propósito: `SimuladoComEscopo` lê a query string,
          o que faz o Next renderizar aquele trecho só no cliente. Se a amostra
          morasse lá dentro, ela não estaria no HTML — que é justamente o que
          um buscador ou um agente lê. */}
      <div className="px-5 pt-8">
        <AmostraPublica perguntas={amostra} />
      </div>
      {prompt ? (
        <div className="px-5 pb-8 pt-6">
          <PromptIA prompt={prompt} />
        </div>
      ) : null}
    </AppShell>
  );
}
