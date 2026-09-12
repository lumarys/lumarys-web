"use client";

import { useSearchParams } from "next/navigation";

import { SeletorDeTrilha } from "@/components/ui/SeletorDeTrilha";
import { useProgresso } from "@/features/progresso/useProgresso";
import { trilhaAtiva } from "@/lib/trilhaAtiva";

import type { DominioDaProva, QuestaoDeProva } from "@/lib/prova";
import type { Exame } from "@content/types";

import { PromptIA } from "./PromptIA";
import { ProvaSimulada } from "./ProvaSimulada";
import { Simulado, type PerguntaSimulado } from "./Simulado";

export type TrilhaDeSimulado = {
  slug: string;
  titulo: string;
  tipo: "carreira" | "certificacao";
  /** Perguntas orais, para a sabatina de trilha de carreira. */
  perguntas: PerguntaSimulado[];
  /** Prompt de sabatina para treinar com uma IA; null se a trilha não tem. */
  prompt: string | null;
  /** Só em certificação: o exame, os domínios com peso e o banco objetivo. */
  exame?: Exame;
  dominios?: DominioDaProva[];
  banco?: QuestaoDeProva[];
};

/**
 * Lê da URL a trilha e o módulo, para o botão "simulado deste módulo" na
 * página do tema e o chip do Hoje já abrirem no escopo certo. Sem `?trilha=`,
 * a ativa é a última em que a pessoa mexeu.
 */
export function SimuladoComEscopo({ trilhas }: { trilhas: TrilhaDeSimulado[] }) {
  const params = useSearchParams();
  const { progresso } = useProgresso();

  const slug = trilhaAtiva(
    progresso,
    trilhas.map((t) => t.slug),
    params.get("trilha"),
  );
  const trilha = trilhas.find((t) => t.slug === slug) ?? trilhas[0];
  if (!trilha) return null;

  const modulo = params.get("modulo") ?? undefined;

  return (
    <div className="flex flex-col gap-3.5">
      <SeletorDeTrilha base="/simulado/" trilhas={trilhas} ativa={trilha.slug} className="px-5" />
      {/* A key reinicia o simulado ao trocar de trilha: um sorteio de
          perguntas não pode sobreviver à troca. Certificação é prova objetiva
          e cronometrada; carreira é sabatina oral com rubrica. */}
      {trilha.tipo === "certificacao" && trilha.exame && trilha.dominios && trilha.banco ? (
        <ProvaSimulada
          key={trilha.slug}
          trilhaSlug={trilha.slug}
          exame={trilha.exame}
          dominios={trilha.dominios}
          banco={trilha.banco}
        />
      ) : (
        <Simulado
          key={trilha.slug}
          trilhaSlug={trilha.slug}
          trilhaTitulo={trilha.titulo}
          perguntas={trilha.perguntas}
          moduloInicial={modulo}
        />
      )}
      {trilha.prompt ? (
        <div className="px-5 pt-6">
          <PromptIA prompt={trilha.prompt} />
        </div>
      ) : null}
    </div>
  );
}
