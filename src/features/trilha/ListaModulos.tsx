"use client";

import Link from "next/link";

import { IconeCheck } from "@/components/ui/icons";
import { useProgresso } from "@/features/progresso/useProgresso";
import { prontidaoDaTrilha } from "@/lib/readiness";
import { cx } from "@/lib/utils";

export type ModuloResumo = {
  slug: string;
  titulo: string;
  resumo: string;
  oficial: boolean;
  temas: { slug: string; titulo: string; minutos: number }[];
};

/**
 * Módulos com progresso real. O progresso vive no dispositivo, então a lista é
 * cliente; o conteúdo em si vem estático do servidor.
 */
export function ListaModulos({
  trilhaSlug,
  modulos,
}: {
  trilhaSlug: string;
  modulos: ModuloResumo[];
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

  return (
    <ul className="flex list-none flex-col gap-2 p-0">
      {modulos.map((modulo) => {
        const dados = porModulo.find((p) => p.moduloSlug === modulo.slug);
        const concluidos = dados?.temasConcluidos ?? 0;
        const total = modulo.temas.length;
        const completo = pronto && total > 0 && concluidos === total;
        const atual = proximoTema && modulo.temas.some((t) => t.slug === proximoTema.slug);

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
                  <span
                    className={cx(
                      "flex size-6 shrink-0 items-center justify-center rounded-full",
                      completo
                        ? "bg-[var(--color-success)] text-[var(--bg)]"
                        : atual
                          ? "border-2 border-[var(--accent)]"
                          : "border-2 border-[var(--border)]",
                    )}
                  >
                    {completo ? <IconeCheck size={14} /> : null}
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
              </div>
            </details>
          </li>
        );
      })}
    </ul>
  );
}
