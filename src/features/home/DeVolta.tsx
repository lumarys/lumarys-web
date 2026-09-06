"use client";

import { BotaoLink } from "@/components/ui/Botao";
import { useProgresso } from "@/features/progresso/useProgresso";
import { estadoDoPlano } from "@/lib/plano";
import { proximaAcao, type TemaRef } from "@/lib/proximaAcao";

/**
 * Para quem já estuda, a home era a mesma página do primeiro dia: nenhuma
 * menção ao que a pessoa fez, nenhum caminho de volta. Todo o estado existia e
 * ficava confinado às telas de app.
 *
 * Renderiza depois de hidratar, senão o HTML servido — igual para todo mundo —
 * não bateria com o primeiro quadro.
 */
export function DeVolta({
  trilhaSlug,
  temas,
  prazoDias,
}: {
  trilhaSlug: string;
  temas: TemaRef[];
  prazoDias: number;
}) {
  const { progresso, pronto } = useProgresso();
  const trilha = progresso.trilhas[trilhaSlug];

  if (!pronto || !trilha) return null;

  const concluidos = trilha.temasConcluidos ?? {};
  const feitos = Object.keys(concluidos).length;
  const acao = proximaAcao({ temas, concluidos, ultimoTema: trilha.ultimoTema, vencidos: 0 });
  const tema = acao.tipo === "continuar" || acao.tipo === "estudar" ? acao.tema : undefined;
  const estado = estadoDoPlano(trilha.dataProva, prazoDias);

  return (
    <div className="mt-8 rounded-2xl border border-[var(--accent)]/40 bg-[var(--surface)] p-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--accent)]">
        Você já começou
      </p>
      <p className="mt-1.5 text-[15px] leading-relaxed">
        {feitos} de {temas.length} temas
        {progresso.streak.atual > 0
          ? ` · ${progresso.streak.atual} ${progresso.streak.atual === 1 ? "dia seguido" : "dias seguidos"}`
          : ""}
        {estado.situacao === "em-curso" ? ` · dia ${estado.dia} de ${estado.total}` : ""}
      </p>
      {tema ? (
        <BotaoLink
          href={`/trilhas/${trilhaSlug}/${tema.modulo}/${tema.slug}/`}
          className="mt-3 w-full"
        >
          {acao.tipo === "continuar" ? "Continuar" : "Próximo"}: {tema.titulo}
        </BotaoLink>
      ) : (
        <BotaoLink href="/hoje/" className="mt-3 w-full">
          Ver o que estudar hoje
        </BotaoLink>
      )}
    </div>
  );
}
