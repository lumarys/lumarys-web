"use client";

import Link from "next/link";

import { IconeCheck } from "@/components/ui/icons";
import { useProgresso } from "@/features/progresso/useProgresso";
import { cx } from "@/lib/utils";

/**
 * Temas que convêm antes deste. O campo existe no conteúdo desde o começo e
 * nenhuma tela lia: dava para cair num tema avançado sem a base e não entender
 * por que travou. O aviso é suave de propósito — ninguém é bloqueado, só
 * informado, porque quem chega de uma busca tem todo o direito de ler fora de
 * ordem.
 */
export function PreRequisitos({
  trilhaSlug,
  temas,
}: {
  trilhaSlug: string;
  temas: { slug: string; titulo: string; modulo: string }[];
}) {
  const { progresso, pronto } = useProgresso();
  const concluidos = progresso.trilhas[trilhaSlug]?.temasConcluidos ?? {};
  const faltando = pronto ? temas.filter((t) => !concluidos[t.slug]) : [];

  return (
    <nav aria-label="Pré-requisitos" className="mt-4 flex flex-wrap items-center gap-2">
      <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
        Antes deste
      </span>
      {temas.map((tema) => {
        const feito = pronto && Boolean(concluidos[tema.slug]);
        return (
          <Link
            key={tema.slug}
            href={`/trilhas/${trilhaSlug}/${tema.modulo}/${tema.slug}/`}
            className={cx(
              "inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold no-underline",
              feito
                ? "border-[var(--color-success)]/40 bg-[var(--color-success)]/10 text-[var(--color-success)]"
                : "border-[var(--border)] bg-[var(--surface)] text-[var(--text-2)]",
            )}
          >
            {feito ? <IconeCheck size={13} /> : null}
            {tema.titulo}
          </Link>
        );
      })}
      {pronto && faltando.length > 0 ? (
        <span className="w-full text-xs leading-relaxed text-[var(--muted)]">
          Dá para ler assim mesmo; se algo soar solto, é provavelmente daí.
        </span>
      ) : null}
    </nav>
  );
}
