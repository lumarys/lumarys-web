"use client";

import { useState } from "react";
import Link from "next/link";

import { IconeCheck, IconeSeta } from "@/components/ui/icons";
import { concluirTema } from "@/lib/storage";
import { useProgresso } from "@/features/progresso/useProgresso";

export function ConcluirTema({
  trilhaSlug,
  temaSlug,
  minutos,
  proximo,
}: {
  trilhaSlug: string;
  temaSlug: string;
  minutos: number;
  proximo?: { slug: string; titulo: string; modulo: string };
}) {
  const { progresso, pronto } = useProgresso();
  const [acabouDeConcluir, setAcabouDeConcluir] = useState(false);

  const jaConcluido = Boolean(progresso.trilhas[trilhaSlug]?.temasConcluidos[temaSlug]);
  const concluido = jaConcluido || acabouDeConcluir;

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
          onClick={() => {
            concluirTema(trilhaSlug, temaSlug, minutos);
            setAcabouDeConcluir(true);
          }}
          className="min-h-13 rounded-xl bg-[var(--accent)] text-[15px] font-semibold text-[var(--accent-ink)] disabled:opacity-50"
        >
          Concluir tema
        </button>
      )}

      {proximo ? (
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
