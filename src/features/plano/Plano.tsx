"use client";

import { useState } from "react";
import Link from "next/link";

import { Card, Rotulo, RotuloAcento } from "@/components/ui/Card";
import { IconeCheck } from "@/components/ui/icons";
import { useProgresso } from "@/features/progresso/useProgresso";
import { definirPlano } from "@/lib/storage";
import { hojeISO, somarDias } from "@/lib/srs";
import { cx, diasAte } from "@/lib/utils";

export type DiaVisual = {
  dia: number;
  titulo: string;
  nota?: string;
  temas: { slug: string; titulo: string; minutos: number; href: string }[];
  revisao: string[];
};

/**
 * Onboarding em três toques (data da prova, minutos por dia) e o plano do
 * cronograma da trilha ancorado nessa data.
 */
export function Plano({
  trilhaSlug,
  prazoSugerido,
  dias,
}: {
  trilhaSlug: string;
  prazoSugerido: number;
  dias: DiaVisual[];
}) {
  const { progresso, pronto } = useProgresso();
  const trilha = progresso.trilhas[trilhaSlug];
  const [dataProva, setDataProva] = useState("");
  const [minutos, setMinutos] = useState(30);

  if (!pronto) {
    return <div className="mx-5 h-48 animate-pulse rounded-2xl border border-[var(--border)]" />;
  }

  if (!trilha?.dataProva) {
    const sugestao = somarDias(hojeISO(), prazoSugerido);
    return (
      <div className="flex flex-col gap-3.5 px-5">
        <Card destaque>
          <RotuloAcento>Montar o plano</RotuloAcento>
          <p className="mt-2 text-[15px] leading-relaxed">
            Duas respostas e eu distribuo os {dias.length} dias de estudo até a sua prova.
          </p>

          <label className="mt-4 block">
            <span className="text-[13px] font-semibold">Quando é a prova?</span>
            <input
              type="date"
              value={dataProva || sugestao}
              min={hojeISO()}
              onChange={(e) => setDataProva(e.target.value)}
              className="mt-1.5 min-h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3.5 text-[15px] text-[var(--text)]"
            />
          </label>

          <fieldset className="mt-4 border-0 p-0">
            <legend className="text-[13px] font-semibold">Quantos minutos por dia?</legend>
            <div className="mt-1.5 flex gap-2">
              {[20, 30, 45, 60].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMinutos(m)}
                  className={cx(
                    "min-h-12 flex-1 rounded-xl text-sm font-semibold",
                    minutos === m
                      ? "bg-[var(--accent)] text-[var(--accent-ink)]"
                      : "bg-[var(--elevated)] text-[var(--text-2)]",
                  )}
                >
                  {m}
                </button>
              ))}
            </div>
          </fieldset>

          <button
            type="button"
            onClick={() => definirPlano(trilhaSlug, dataProva || sugestao, minutos)}
            className="mt-4 min-h-13 w-full rounded-xl bg-[var(--accent)] text-[15px] font-semibold text-[var(--accent-ink)]"
          >
            Gerar plano
          </button>
        </Card>
      </div>
    );
  }

  const faltam = diasAte(trilha.dataProva);
  const diaAtual = Math.max(1, dias.length - faltam + 1);
  const concluidos = trilha.temasConcluidos ?? {};

  return (
    <div className="flex flex-col gap-3.5 px-5">
      <Card destaque>
        <div className="flex items-baseline justify-between gap-3">
          <div>
            <RotuloAcento>Seu plano</RotuloAcento>
            <p className="mt-1 text-[15px] font-semibold">
              {faltam > 0
                ? `Faltam ${faltam} ${faltam === 1 ? "dia" : "dias"}`
                : faltam === 0
                  ? "A prova é hoje"
                  : "A data da prova já passou"}
            </p>
          </div>
          <p className="text-xs text-[var(--muted)]">{trilha.minutosPorDia ?? 30} min/dia</p>
        </div>
        {faltam > 0 && faltam < dias.length ? (
          <p className="mt-2 text-[13px] leading-relaxed text-[var(--text-2)]">
            O plano tem {dias.length} dias e faltam {faltam}. Priorize os dias marcados como
            essenciais e deixe os complementares para depois da prova.
          </p>
        ) : null}
      </Card>

      <Rotulo>Cronograma</Rotulo>
      <ol className="flex list-none flex-col gap-2 p-0">
        {dias.map((dia) => {
          const passado = dia.dia < diaAtual;
          const hoje = dia.dia === diaAtual;
          const todosFeitos = dia.temas.length > 0 && dia.temas.every((t) => concluidos[t.slug]);

          return (
            <li key={dia.dia}>
              <details
                open={hoje}
                className={cx(
                  "rounded-2xl border bg-[var(--surface)]",
                  hoje ? "border-[var(--accent)] bg-[var(--elevated)]" : "border-[var(--border)]",
                )}
              >
                <summary className="flex min-h-13 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3">
                  <span className="flex items-center gap-2.5">
                    <span
                      className={cx(
                        "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                        todosFeitos
                          ? "bg-[var(--color-success)] text-[var(--bg)]"
                          : hoje
                            ? "bg-[var(--accent)] text-[var(--accent-ink)]"
                            : passado
                              ? "bg-[var(--elevated)] text-[var(--muted)]"
                              : "border border-[var(--border)] text-[var(--text-2)]",
                      )}
                    >
                      {todosFeitos ? <IconeCheck size={14} /> : dia.dia}
                    </span>
                    <span
                      className={cx(
                        "text-sm",
                        hoje ? "font-semibold" : "font-medium text-[var(--text-2)]",
                      )}
                    >
                      {dia.titulo}
                    </span>
                  </span>
                  <span className="shrink-0 text-xs text-[var(--muted)]">
                    {dia.temas.reduce((a, t) => a + t.minutos, 0) || "—"}
                    {dia.temas.length ? " min" : ""}
                  </span>
                </summary>

                <div className="flex flex-col gap-1 px-4 pb-3">
                  {dia.temas.map((tema) => (
                    <Link
                      key={tema.slug}
                      href={tema.href}
                      className="flex min-h-11 items-center justify-between gap-3 border-t border-[var(--border)] py-2 text-sm no-underline"
                    >
                      <span className={cx(concluidos[tema.slug] ? "text-[var(--muted)] line-through" : "text-[var(--text)]")}>
                        {tema.titulo}
                      </span>
                      <span className="shrink-0 text-xs text-[var(--muted)]">{tema.minutos} min</span>
                    </Link>
                  ))}
                  {dia.revisao.length > 0 ? (
                    <p className="border-t border-[var(--border)] pt-2 text-xs text-[var(--text-2)]">
                      Revisar: {dia.revisao.join(", ")}
                    </p>
                  ) : null}
                  {dia.nota ? (
                    <p className="mt-1 rounded-lg bg-[var(--bg)] px-3 py-2 text-xs leading-relaxed text-[var(--text-2)]">
                      {dia.nota}
                    </p>
                  ) : null}
                </div>
              </details>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
