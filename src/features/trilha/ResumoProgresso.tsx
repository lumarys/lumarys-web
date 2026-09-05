"use client";

import { BotaoLink } from "@/components/ui/Botao";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { useProgresso } from "@/features/progresso/useProgresso";
import { estadoDoPlano, ritmoDoPlano } from "@/lib/plano";
import { proximaAcao, type TemaRef } from "@/lib/proximaAcao";
import { prontidaoDaTrilha, rotuloProntidao } from "@/lib/readiness";
import { contarRespostas, trilhaIniciada } from "@/lib/storage";

/**
 * O cartão de topo da trilha responde a duas perguntas, nesta ordem: onde eu
 * paro agora, e como estou indo. Antes respondia só a segunda — o próximo tema
 * era calculado logo abaixo, na lista de módulos, e servia apenas para decidir
 * qual acordeão abria sozinho.
 */
export function ResumoProgresso({
  trilhaSlug,
  modulos,
  temas,
  totalTemas,
  prazoDias,
}: {
  trilhaSlug: string;
  modulos: { slug: string; titulo: string; temas: string[] }[];
  /** Sequência da trilha, na ordem do cronograma. */
  temas: TemaRef[];
  totalTemas: number;
  prazoDias: number;
}) {
  const { progresso, pronto } = useProgresso();
  const dadosTrilha = progresso.trilhas[trilhaSlug];

  if (!pronto) {
    return <div className="h-32 animate-pulse rounded-2xl border border-[var(--border)]" />;
  }

  const concluidos = dadosTrilha?.temasConcluidos ?? {};
  const feitos = Object.keys(concluidos).length;
  const { geral, pontoFraco } = prontidaoDaTrilha(modulos, progresso, trilhaSlug);
  const nomePontoFraco = modulos.find((m) => m.slug === pontoFraco?.moduloSlug)?.titulo;
  const respostas = contarRespostas(dadosTrilha);
  const estado = estadoDoPlano(dadosTrilha?.dataProva, prazoDias);
  const ritmo = ritmoDoPlano(estado, feitos, totalTemas);
  const emManutencao = dadosTrilha?.modo === "manutencao";

  const acao = proximaAcao({
    temas,
    concluidos,
    ultimoTema: dadosTrilha?.ultimoTema,
    // A revisão é decidida na tela Hoje, que enxerga os cards; aqui o cartão só
    // aponta para onde continuar lendo.
    vencidos: 0,
  });
  const temaDaAcao = acao.tipo === "continuar" || acao.tipo === "estudar" ? acao.tema : undefined;

  if (!trilhaIniciada(dadosTrilha)) {
    return (
      <div className="rounded-2xl border border-[var(--accent)]/40 bg-[var(--surface)] p-4">
        <p className="text-sm leading-relaxed">
          Você ainda não começou esta trilha. Defina a data da prova e quanto tempo tem por dia, e
          eu monto o plano.
        </p>
        <div className="mt-3 flex flex-col gap-2">
          <BotaoLink href={`/trilhas/${trilhaSlug}/plano/`}>Montar meu plano</BotaoLink>
          {temaDaAcao ? (
            <BotaoLink
              href={`/trilhas/${trilhaSlug}/${temaDaAcao.modulo}/${temaDaAcao.slug}/`}
              variante="secundario"
            >
              Ou comece pelo primeiro tema
            </BotaoLink>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3.5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3.5">
        <ProgressRing
          valor={(feitos / Math.max(totalTemas, 1)) * 100}
          rotulo={`${feitos}/${totalTemas}`}
        />
        <div className="flex min-w-0 flex-col gap-0.5">
          <p className="text-sm font-semibold">
            {emManutencao
              ? "Modo manutenção"
              : estado.situacao === "em-curso"
                ? `Dia ${estado.dia} de ${estado.total}`
                : `Prontidão ${geral}% · ${rotuloProntidao(geral)}`}
          </p>
          <p className="text-[13px] leading-snug text-[var(--text-2)]">
            {emManutencao
              ? "Sem cronograma. Os cards voltam em 30 e 90 dias."
              : estado.situacao === "em-curso"
                ? ritmo.atraso > 0
                  ? `Atrasado ${ritmo.atraso} ${ritmo.atraso === 1 ? "tema" : "temas"} · prontidão ${geral}%`
                  : `No ritmo do plano · prontidão ${geral}%`
                : nomePontoFraco
                  ? `Ponto fraco: ${nomePontoFraco}.`
                  : "Siga o plano do dia."}
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
              {" respondidos"}
              {respostas.simulados > 0
                ? ` · ${respostas.simulados} simulado${respostas.simulados > 1 ? "s" : ""}`
                : ""}
            </p>
          ) : null}
        </div>
      </div>

      {temaDaAcao ? (
        <BotaoLink href={`/trilhas/${trilhaSlug}/${temaDaAcao.modulo}/${temaDaAcao.slug}/`}>
          {acao.tipo === "continuar" ? "Continuar" : "Próximo"}: {temaDaAcao.titulo}
        </BotaoLink>
      ) : (
        <BotaoLink href="/simulado/">Trilha completa. Hora de simular</BotaoLink>
      )}
    </div>
  );
}
