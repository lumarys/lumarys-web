"use client";

import Link from "next/link";

import { ProgressRing } from "@/components/ui/ProgressRing";
import { useProgresso } from "@/features/progresso/useProgresso";
import { prontidaoDaTrilha, rotuloProntidao } from "@/lib/readiness";
import { contarRespostas, trilhaIniciada } from "@/lib/storage";
import { diasAte } from "@/lib/utils";

export function ResumoProgresso({
  trilhaSlug,
  modulos,
  totalTemas,
}: {
  trilhaSlug: string;
  modulos: { slug: string; titulo: string; temas: string[] }[];
  totalTemas: number;
}) {
  const { progresso, pronto } = useProgresso();
  const dadosTrilha = progresso.trilhas[trilhaSlug];
  const concluidos = Object.keys(dadosTrilha?.temasConcluidos ?? {}).length;
  const { geral, pontoFraco } = prontidaoDaTrilha(modulos, progresso, trilhaSlug);
  const nomePontoFraco = modulos.find((m) => m.slug === pontoFraco?.moduloSlug)?.titulo;
  const dias = dadosTrilha?.dataProva ? diasAte(dadosTrilha.dataProva) : null;
  const respostas = contarRespostas(dadosTrilha);

  if (!pronto) {
    return <div className="h-24 animate-pulse rounded-2xl border border-[var(--border)]" />;
  }

  if (!trilhaIniciada(dadosTrilha)) {
    return (
      <div className="rounded-2xl border border-[var(--accent)]/40 bg-[var(--surface)] p-4">
        <p className="text-sm leading-relaxed">
          Você ainda não começou esta trilha. Defina a data da prova e quanto tempo tem por dia, e
          eu monto o plano.
        </p>
        <Link
          href={`/trilhas/${trilhaSlug}/plano/`}
          className="mt-3 flex min-h-12 items-center justify-center rounded-xl bg-[var(--accent)] text-[15px] font-semibold text-[var(--accent-ink)] no-underline"
        >
          Montar meu plano
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3.5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3.5">
      <ProgressRing
        valor={(concluidos / Math.max(totalTemas, 1)) * 100}
        rotulo={`${concluidos}/${totalTemas}`}
      />
      <div className="flex flex-col gap-0.5">
        <p className="text-sm font-semibold">
          Prontidão {geral}% · {rotuloProntidao(geral)}
        </p>
        <p className="text-[13px] leading-snug text-[var(--text-2)]">
          {nomePontoFraco ? `Ponto fraco: ${nomePontoFraco}.` : "Siga o plano do dia."}
          {dias !== null ? ` Prova em ${dias} ${dias === 1 ? "dia" : "dias"}.` : ""}
        </p>
        {respostas.preTestes + respostas.quizzes > 0 ? (
          <p className="text-[12px] leading-snug text-[var(--muted)]">
            {respostas.preTestes > 0
              ? `${respostas.preTestes} pré-teste${respostas.preTestes > 1 ? "s" : ""}`
              : ""}
            {respostas.preTestes > 0 && respostas.quizzes > 0 ? " · " : ""}
            {respostas.quizzes > 0
              ? `${respostas.quizzes} quiz${respostas.quizzes > 1 ? "zes" : ""}`
              : ""}
            {concluidos === 0
              ? " respondidos. A barra anda quando você conclui um tema."
              : " respondidos."}
          </p>
        ) : null}
      </div>
    </div>
  );
}
