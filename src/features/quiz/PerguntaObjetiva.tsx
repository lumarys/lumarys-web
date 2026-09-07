"use client";

import { useMemo, useState } from "react";

import { Card, RotuloAcento } from "@/components/ui/Card";
import { IconeCheck, IconeFechar } from "@/components/ui/icons";
import { cx, embaralhar, sementeDeTexto } from "@/lib/utils";
import type { Pergunta } from "@content/types";

export type Objetiva = Extract<Pergunta, { tipo: "unica" | "multipla" }>;

/**
 * Uma pergunta de múltipla escolha, do enunciado até o "por quê" de cada
 * alternativa. Mora aqui, e não dentro do quiz do tema, porque o checkpoint
 * de módulo faz exatamente a mesma coisa — e duas cópias divergiriam na
 * primeira correção.
 *
 * O estado de marcação é interno. Quem monta a lista troca a `key` a cada
 * pergunta e recebe o resultado por `aoConferir`.
 */
export function PerguntaObjetiva({
  pergunta,
  rotulo,
  numero,
  total,
  aoConferir,
  aoAvancar,
  rodape,
}: {
  pergunta: Objetiva;
  /** "Quiz" ou "Checkpoint": o que aparece antes da contagem. */
  rotulo: string;
  numero: number;
  total: number;
  /** Chamado uma vez, ao conferir. */
  aoConferir: (acertou: boolean) => void;
  aoAvancar: () => void;
  /** Linha extra sob o cabeçalho — o checkpoint usa para dizer o tema. */
  rodape?: string;
}) {
  const [marcadas, setMarcadas] = useState<number[]>([]);
  const [revelado, setRevelado] = useState(false);

  // Mesma razão do pré-teste: a ordem de escrita vazava a resposta.
  const alternativas = useMemo(
    () => embaralhar(pergunta.alternativas, sementeDeTexto(pergunta.enunciado)),
    [pergunta],
  );

  const multipla = pergunta.tipo === "multipla";
  const ultima = numero >= total;

  function alternar(i: number) {
    setMarcadas((m) => (multipla ? (m.includes(i) ? m.filter((x) => x !== i) : [...m, i]) : [i]));
  }

  function conferir() {
    const corretas = alternativas.map((a, i) => (a.correta ? i : -1)).filter((i) => i >= 0);
    const certo =
      marcadas.length === corretas.length && corretas.every((i) => marcadas.includes(i));
    setRevelado(true);
    aoConferir(certo);
  }

  return (
    <Card>
      <div className="flex items-baseline justify-between gap-3">
        <RotuloAcento>
          {rotulo} · {numero} de {total}
        </RotuloAcento>
        {multipla ? <span className="text-xs text-[var(--muted)]">mais de uma correta</span> : null}
      </div>

      {rodape ? (
        <p id="origem-da-pergunta" className="mt-1 text-xs text-[var(--muted)]">
          {rodape}
        </p>
      ) : null}

      <p className="mt-3 text-[15px] font-medium leading-snug">{pergunta.enunciado}</p>

      <div className="mt-3 flex flex-col gap-2">
        {alternativas.map((alt, i) => {
          const marcada = marcadas.includes(i);
          return (
            <button
              key={i}
              type="button"
              disabled={revelado}
              onClick={() => alternar(i)}
              className={cx(
                "flex min-h-11 items-start gap-2 rounded-xl border px-3.5 py-3 text-left text-sm leading-relaxed",
                revelado &&
                  alt.correta &&
                  "border-[var(--color-success)] bg-[var(--color-success)]/10",
                revelado &&
                  !alt.correta &&
                  marcada &&
                  "border-[var(--color-danger)] bg-[var(--color-danger)]/10",
                !revelado && marcada && "border-[var(--accent)] bg-[var(--accent)]/10",
                !revelado && !marcada && "border-[var(--border)]",
                revelado && !alt.correta && !marcada && "border-[var(--border)] opacity-60",
              )}
            >
              {revelado ? (
                <span className="mt-0.5 shrink-0">
                  {alt.correta ? (
                    <IconeCheck size={16} className="text-[var(--color-success)]" />
                  ) : marcada ? (
                    <IconeFechar size={16} className="text-[var(--color-danger)]" />
                  ) : (
                    <span className="block size-4" />
                  )}
                </span>
              ) : null}
              <span>
                {alt.texto}
                {revelado ? (
                  <span className="mt-1 block text-[13px] text-[var(--text-2)]">
                    {alt.explicacao}
                  </span>
                ) : null}
              </span>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        disabled={!revelado && marcadas.length === 0}
        onClick={revelado ? aoAvancar : conferir}
        className={cx(
          "mt-3 min-h-12 w-full rounded-xl text-[15px] font-semibold disabled:opacity-40",
          revelado
            ? "border border-[var(--border)] bg-[var(--elevated)]"
            : "bg-[var(--accent)] text-[var(--accent-ink)]",
        )}
      >
        {revelado ? (ultima ? "Ver resultado" : "Próxima") : "Conferir"}
      </button>
    </Card>
  );
}
