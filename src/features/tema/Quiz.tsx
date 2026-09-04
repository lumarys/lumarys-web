"use client";

import { useMemo, useState } from "react";

import { Card, RotuloAcento } from "@/components/ui/Card";
import { IconeCheck, IconeFechar } from "@/components/ui/icons";
import { registrarQuiz } from "@/lib/storage";
import { cx, embaralhar, sementeDeTexto } from "@/lib/utils";
import type { Pergunta } from "@content/types";

type Objetiva = Extract<Pergunta, { tipo: "unica" | "multipla" }>;

/** Quiz pós-tema: recuperação depois da explicação, com o porquê de cada alternativa. */
export function Quiz({
  perguntas,
  trilhaSlug,
  temaSlug,
}: {
  perguntas: Objetiva[];
  trilhaSlug: string;
  temaSlug: string;
}) {
  const [indice, setIndice] = useState(0);
  const [marcadas, setMarcadas] = useState<number[]>([]);
  const [revelado, setRevelado] = useState(false);
  const [acertos, setAcertos] = useState(0);
  const [terminou, setTerminou] = useState(false);

  const pergunta = perguntas[indice];

  // Mesma razão do pré-teste: a ordem de escrita vazava a resposta.
  const alternativas = useMemo(
    () =>
      pergunta
        ? embaralhar(pergunta.alternativas, sementeDeTexto(pergunta.enunciado))
        : [],
    [pergunta],
  );

  if (!pergunta) return null;

  const multipla = pergunta.tipo === "multipla";

  function alternar(i: number) {
    setMarcadas((m) => (multipla ? (m.includes(i) ? m.filter((x) => x !== i) : [...m, i]) : [i]));
  }

  function conferir() {
    const corretas = alternativas.map((a, i) => (a.correta ? i : -1)).filter((i) => i >= 0);
    const certo =
      marcadas.length === corretas.length && corretas.every((i) => marcadas.includes(i));
    if (certo) setAcertos((a) => a + 1);
    setRevelado(true);
  }

  function avancar() {
    if (indice + 1 >= perguntas.length) {
      registrarQuiz(trilhaSlug, temaSlug, acertos, perguntas.length);
      setTerminou(true);
      return;
    }
    setIndice((i) => i + 1);
    setMarcadas([]);
    setRevelado(false);
  }

  if (terminou) {
    const proporcao = acertos / perguntas.length;
    return (
      <Card>
        <RotuloAcento>Quiz concluído</RotuloAcento>
        <p className="mt-2 text-[15px] leading-relaxed">
          {acertos} de {perguntas.length}.{" "}
          {proporcao >= 0.7
            ? "Bom o bastante para seguir. O que fixa daqui em diante são os cards."
            : "Abaixo de 70%: vale reler a explicação e refazer o drill antes de marcar o tema como concluído."}
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-baseline justify-between gap-3">
        <RotuloAcento>
          Quiz · {indice + 1} de {perguntas.length}
        </RotuloAcento>
        {multipla ? (
          <span className="text-xs text-[var(--muted)]">mais de uma correta</span>
        ) : null}
      </div>

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
                revelado && alt.correta && "border-[var(--color-success)] bg-[var(--color-success)]/10",
                revelado && !alt.correta && marcada && "border-[var(--color-danger)] bg-[var(--color-danger)]/10",
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
        onClick={revelado ? avancar : conferir}
        className={cx(
          "mt-3 min-h-12 w-full rounded-xl text-[15px] font-semibold disabled:opacity-40",
          revelado
            ? "border border-[var(--border)] bg-[var(--elevated)]"
            : "bg-[var(--accent)] text-[var(--accent-ink)]",
        )}
      >
        {revelado ? (indice + 1 >= perguntas.length ? "Ver resultado" : "Próxima") : "Conferir"}
      </button>
    </Card>
  );
}
