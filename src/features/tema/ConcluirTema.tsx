"use client";

import { useState } from "react";
import Link from "next/link";

import { Card, Rotulo } from "@/components/ui/Card";
import { IconeCheck, IconeSeta } from "@/components/ui/icons";
import { useProgresso } from "@/features/progresso/useProgresso";
import { prontidaoDaTrilha } from "@/lib/readiness";
import { hojeISO, previsao } from "@/lib/srs";
import { concluirTema, ler, type Progresso } from "@/lib/storage";

type Recibo = {
  minutos: number;
  minutosHoje: number;
  meta: number;
  streak: number;
  recorde: number;
  cardsAmanha: number;
  prontidaoAntes: number;
  prontidaoDepois: number;
  ganho?: { antes: number; depois: number; total: number };
};

/**
 * Concluir um tema é o maior esforço da sessão e era o menor retorno: o botão
 * virava um selo verde e não dizia nada. Os minutos somados à meta, a
 * sequência, os cards que passaram a valer e o quanto a prontidão andou já
 * estavam todos gravados — só não eram mostrados no único momento em que a
 * pessoa está olhando para o resultado do próprio esforço.
 */
export function ConcluirTema({
  trilhaSlug,
  espelhos = [],
  temaSlug,
  minutos,
  modulos,
  proximo,
}: {
  trilhaSlug: string;
  /** Outras trilhas que contêm este tema: o progresso vale nelas também. */
  espelhos?: string[];
  temaSlug: string;
  minutos: number;
  /** Módulos da trilha, para calcular a prontidão antes e depois. */
  modulos: { slug: string; temas: string[] }[];
  proximo?: { slug: string; titulo: string; modulo: string };
}) {
  const { progresso, pronto } = useProgresso();
  const [recibo, setRecibo] = useState<Recibo | null>(null);

  const jaConcluido = Boolean(progresso.trilhas[trilhaSlug]?.temasConcluidos[temaSlug]);
  const concluido = jaConcluido || recibo !== null;

  function concluir() {
    const antes = ler();
    const depois = concluirTema([trilhaSlug, ...espelhos], temaSlug, minutos);
    setRecibo(montarRecibo(antes, depois, trilhaSlug, temaSlug, minutos, modulos));
  }

  return (
    <div className="flex flex-col gap-3">
      {concluido ? (
        <p className="flex min-h-13 items-center justify-center gap-2 rounded-xl border border-[var(--color-success)]/40 bg-[var(--color-success)]/10 text-[15px] font-semibold text-[var(--color-success)]">
          <IconeCheck size={18} /> Tema concluído
        </p>
      ) : (
        <button
          type="button"
          disabled={!pronto}
          onClick={concluir}
          className="min-h-13 rounded-xl bg-[var(--accent)] text-[15px] font-semibold text-[var(--accent-ink)] disabled:opacity-50"
        >
          Concluir tema
        </button>
      )}

      {recibo ? (
        <Card destaque>
          <Rotulo className="mb-2">O que isso mudou</Rotulo>
          <ul className="flex list-none flex-col gap-1.5 p-0 text-[15px] leading-relaxed">
            <li>
              <strong className="font-semibold">+{recibo.minutos} min</strong> hoje ·{" "}
              {recibo.minutosHoje} de {recibo.meta} da sua meta
            </li>
            <li>
              <strong className="font-semibold">
                {recibo.streak} {recibo.streak === 1 ? "dia seguido" : "dias seguidos"}
              </strong>
              {recibo.recorde > recibo.streak
                ? ` · seu recorde é ${recibo.recorde}`
                : " · é o seu recorde"}
            </li>
            {recibo.cardsAmanha > 0 ? (
              <li>
                <strong className="font-semibold">{recibo.cardsAmanha} cards</strong> entram na
                revisão amanhã
              </li>
            ) : null}
            <li>
              Prontidão{" "}
              <strong className="font-semibold">
                {recibo.prontidaoAntes}% → {recibo.prontidaoDepois}%
              </strong>
            </li>
            {recibo.ganho ? (
              <li className="text-[var(--text-2)]">
                No pré-teste você acertou {recibo.ganho.antes} de {recibo.ganho.total}; no quiz,{" "}
                {recibo.ganho.depois}. Isso é o que você aprendeu hoje.
              </li>
            ) : null}
          </ul>
        </Card>
      ) : null}

      {/* O próximo tema só aparece depois de concluir: antes, ele competia com o
          próprio botão de concluir e a barra de navegação no fim da página. */}
      {concluido && proximo ? (
        <Link
          href={`/trilhas/${trilhaSlug}/${proximo.modulo}/${proximo.slug}/`}
          className="flex min-h-13 items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 text-[15px] font-semibold no-underline"
        >
          <span className="flex flex-col">
            <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
              Próximo
            </span>
            <span className="text-[var(--text)]">{proximo.titulo}</span>
          </span>
          <IconeSeta size={18} />
        </Link>
      ) : null}
    </div>
  );
}

function montarRecibo(
  antes: Progresso,
  depois: Progresso,
  trilhaSlug: string,
  temaSlug: string,
  minutos: number,
  modulos: { slug: string; temas: string[] }[],
): Recibo {
  const hoje = hojeISO();
  const trilha = depois.trilhas[trilhaSlug];
  const preTeste = trilha?.preTestes[temaSlug];
  const quiz = trilha?.quizzes[temaSlug];

  return {
    minutos,
    minutosHoje: depois.minutosPorDia[hoje] ?? 0,
    meta: trilha?.minutosPorDia ?? 30,
    streak: depois.streak.atual,
    recorde: depois.streak.recorde,
    // Os cards do tema passam a valer a partir de amanhã; o dia 0 da previsão
    // é hoje, que já foi.
    cardsAmanha: previsao(Object.values(depois.cards), 2)[1]?.total ?? 0,
    prontidaoAntes: prontidaoDaTrilha(modulos, antes, trilhaSlug).geral,
    prontidaoDepois: prontidaoDaTrilha(modulos, depois, trilhaSlug).geral,
    ganho:
      preTeste && quiz && preTeste.total === quiz.total
        ? { antes: preTeste.acertos, depois: quiz.acertos, total: quiz.total }
        : undefined,
  };
}
