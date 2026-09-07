"use client";

import Link from "next/link";

import { IconeCheck } from "@/components/ui/icons";
import { useProgresso } from "@/features/progresso/useProgresso";
import { aprovado } from "@/lib/checkpoint";
import { estadoDoPlano } from "@/lib/plano";
import { prontidaoDaTrilha } from "@/lib/readiness";
import { cx } from "@/lib/utils";

export type ModuloResumo = {
  slug: string;
  titulo: string;
  resumo: string;
  oficial: boolean;
  /** "em-breve" é um módulo que a ementa nomeia e ainda não tem tema. */
  status?: "disponivel" | "em-breve";
  temas: { slug: string; titulo: string; minutos: number }[];
};

/**
 * Módulos com progresso real. O progresso vive no dispositivo, então a lista é
 * cliente; o conteúdo em si vem estático do servidor.
 */
export function ListaModulos({
  trilhaSlug,
  modulos,
  cronograma,
  prazoDias,
}: {
  trilhaSlug: string;
  modulos: ModuloResumo[];
  /** Cronograma da trilha: qual dia pede quais temas. */
  cronograma: { dia: number; temas: string[] }[];
  prazoDias: number;
}) {
  const { progresso, pronto } = useProgresso();
  const trilha = progresso.trilhas[trilhaSlug];
  const { porModulo } = prontidaoDaTrilha(
    modulos.map((m) => ({ slug: m.slug, temas: m.temas.map((t) => t.slug) })),
    progresso,
    trilhaSlug,
  );

  const proximoTema = modulos
    .flatMap((m) => m.temas.map((t) => ({ modulo: m.slug, ...t })))
    .find((t) => !trilha?.temasConcluidos[t.slug]);

  // Módulo que o plano pede hoje. É diferente de "onde você parou": dá para
  // estar atrasado e o selo mostra para onde o cronograma aponta.
  const estado = estadoDoPlano(trilha?.dataProva, prazoDias);
  const temasDeHoje =
    estado.situacao === "em-curso"
      ? (cronograma.find((d) => d.dia === estado.dia)?.temas ?? [])
      : [];

  if (!pronto) {
    // Altura fixa: sem isto a lista renderiza "N temas" e troca para "0/6" ao
    // hidratar, empurrando a página inteira para baixo.
    return (
      <ul className="flex list-none flex-col gap-2 p-0">
        {modulos.map((m) => (
          <li
            key={m.slug}
            className="h-16 animate-pulse rounded-2xl border border-[var(--border)]"
          />
        ))}
      </ul>
    );
  }

  return (
    <ul className="flex list-none flex-col gap-2 p-0">
      {modulos.map((modulo) => {
        const dados = porModulo.find((p) => p.moduloSlug === modulo.slug);
        const concluidos = dados?.temasConcluidos ?? 0;
        const total = modulo.temas.length;
        const completo = pronto && total > 0 && concluidos === total;
        const atual = proximoTema && modulo.temas.some((t) => t.slug === proximoTema.slug);
        const doDia = modulo.temas.some((t) => temasDeHoje.includes(t.slug));
        const checkpoint = trilha?.checkpoints?.[modulo.slug];
        const fechado = Boolean(checkpoint && aprovado(checkpoint.acertos, checkpoint.total));

        // Módulo que a ementa nomeia e ainda não tem conteúdo. Aparece na
        // lista, com o resumo do que vai cobrir, mas não abre: um acordeão
        // vazio com "0/0" e link para um checkpoint sem perguntas seria pior
        // que dizer "em breve".
        if (modulo.status === "em-breve") {
          return (
            <li
              key={modulo.slug}
              id={modulo.slug}
              className="scroll-mt-4 rounded-2xl border border-dashed border-[var(--border)] px-4 py-3"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2.5">
                  <span className="size-6 shrink-0 rounded-full border-2 border-dashed border-[var(--border)]" />
                  <span className="flex flex-col">
                    <span className="text-sm font-medium text-[var(--text-2)]">
                      {modulo.titulo}
                    </span>
                    {!modulo.oficial ? (
                      <span className="text-[11px] text-[var(--muted)]">
                        além da ementa oficial
                      </span>
                    ) : null}
                  </span>
                </span>
                <span className="shrink-0 rounded-full border border-[var(--border)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--muted)]">
                  em breve
                </span>
              </div>
              <p className="mt-2 text-[13px] leading-relaxed text-[var(--muted)]">
                {modulo.resumo}
              </p>
            </li>
          );
        }

        return (
          <li key={modulo.slug} id={modulo.slug} className="scroll-mt-4">
            <details
              open={Boolean(atual)}
              className={cx(
                "rounded-2xl border bg-[var(--surface)]",
                atual ? "border-[var(--accent)] bg-[var(--elevated)]" : "border-[var(--border)]",
              )}
            >
              <summary className="flex min-h-13 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3">
                <span className="flex items-center gap-2.5">
                  {doDia ? (
                    <span className="shrink-0 rounded-full bg-[var(--accent)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[var(--accent-ink)]">
                      hoje
                    </span>
                  ) : null}
                  {/* Três estados, não dois: círculo vazio, verde de "li
                      todos os temas" e âmbar de "passei no checkpoint". A
                      diferença entre ter lido e ter provado é o ponto do
                      módulo fechado. */}
                  <span
                    aria-label={
                      fechado ? "Checkpoint aprovado" : completo ? "Temas concluídos" : undefined
                    }
                    className={cx(
                      "flex size-6 shrink-0 items-center justify-center rounded-full",
                      fechado
                        ? "bg-[var(--accent)] text-[var(--accent-ink)]"
                        : completo
                          ? "bg-[var(--color-success)] text-[var(--bg)]"
                          : atual
                            ? "border-2 border-[var(--accent)]"
                            : "border-2 border-[var(--border)]",
                    )}
                  >
                    {fechado || completo ? <IconeCheck size={14} /> : null}
                  </span>
                  <span className="flex flex-col">
                    <span
                      className={cx(
                        "text-sm",
                        atual
                          ? "font-semibold text-[var(--text)]"
                          : "font-medium text-[var(--text-2)]",
                      )}
                    >
                      {modulo.titulo}
                    </span>
                    {!modulo.oficial ? (
                      <span className="text-[11px] text-[var(--muted)]">
                        além da ementa oficial
                      </span>
                    ) : null}
                  </span>
                </span>
                <span className="shrink-0 text-xs text-[var(--muted)]">
                  {pronto ? `${concluidos}/${total}` : `${total} temas`}
                </span>
              </summary>

              <div className="px-4 pb-3">
                <p className="mb-2 text-[13px] leading-relaxed text-[var(--text-2)]">
                  {modulo.resumo}
                </p>
                <ul className="flex list-none flex-col p-0">
                  {modulo.temas.map((tema) => {
                    const feito = Boolean(trilha?.temasConcluidos[tema.slug]);
                    return (
                      <li key={tema.slug}>
                        <Link
                          href={`/trilhas/${trilhaSlug}/${modulo.slug}/${tema.slug}/`}
                          className="flex min-h-11 items-center justify-between gap-3 border-t border-[var(--border)] py-2 text-sm no-underline"
                        >
                          <span
                            className={cx(
                              feito ? "text-[var(--muted)] line-through" : "text-[var(--text)]",
                            )}
                          >
                            {tema.titulo}
                          </span>
                          <span className="shrink-0 text-xs text-[var(--muted)]">
                            {tema.minutos} min
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>

                {/* Sempre visível, e não só com o módulo inteiro concluído: o
                    checkpoint também serve para descobrir o que já se sabe
                    antes de ler. */}
                <Link
                  href={`/trilhas/${trilhaSlug}/${modulo.slug}/checkpoint/`}
                  className="mt-2 flex min-h-11 items-center justify-between gap-3 rounded-xl border border-[var(--border)] px-3.5 text-[13px] font-semibold no-underline"
                >
                  <span>Checkpoint do módulo</span>
                  <span className="shrink-0 font-normal text-[var(--muted)]">
                    {checkpoint
                      ? `${checkpoint.acertos}/${checkpoint.total}${fechado ? " · fechado" : ""}`
                      : "ainda não feito"}
                  </span>
                </Link>

                <Link
                  href={`/trilhas/${trilhaSlug}/${modulo.slug}/resumo/`}
                  className="mt-2 flex min-h-11 items-center justify-between gap-3 rounded-xl border border-[var(--border)] px-3.5 text-[13px] font-semibold no-underline"
                >
                  <span>Folha de revisão</span>
                  <span className="shrink-0 font-normal text-[var(--muted)]">para imprimir</span>
                </Link>
              </div>
            </details>
          </li>
        );
      })}
    </ul>
  );
}
