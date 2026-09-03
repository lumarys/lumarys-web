"use client";

import { useState } from "react";

import { Card, RotuloAcento } from "@/components/ui/Card";
import { cx } from "@/lib/utils";
import type { Drill as TipoDrill } from "@content/types";

/**
 * Prática deliberada no ponto fraco do tema: itens curtos, feedback imediato,
 * sem cronômetro. O objetivo é repetir o julgamento que a sabatina cobra, não
 * medir velocidade.
 */
export function Drill({ drill }: { drill: TipoDrill }) {
  const [respostas, setRespostas] = useState<Record<number, string>>({});
  const [revelado, setRevelado] = useState(false);

  const acertos = drill.itens.filter(
    (item, i) => normalizar(respostas[i] ?? "") === normalizar(item.resposta),
  ).length;

  return (
    <Card>
      <RotuloAcento>Drill</RotuloAcento>
      <p className="font-display mt-1.5 text-lg font-semibold">{drill.titulo}</p>
      <p className="mt-1.5 text-sm leading-relaxed text-[var(--text-2)]">{drill.instrucao}</p>

      <ol className="mt-4 flex list-none flex-col gap-4 p-0">
        {drill.itens.map((item, i) => {
          const resposta = respostas[i];
          const certo = normalizar(resposta ?? "") === normalizar(item.resposta);
          return (
            <li key={i} className="flex flex-col gap-2">
              <p className="text-[15px] leading-relaxed">
                <span className="mr-2 font-semibold text-[var(--accent)]">{i + 1}.</span>
                {item.enunciado}
              </p>

              {drill.opcoes?.length ? (
                <div className="flex flex-wrap gap-2">
                  {drill.opcoes.map((opcao) => (
                    <button
                      key={opcao}
                      type="button"
                      disabled={revelado}
                      onClick={() => setRespostas((r) => ({ ...r, [i]: opcao }))}
                      className={cx(
                        "min-h-11 rounded-full px-4 text-sm font-semibold",
                        resposta === opcao
                          ? "bg-[var(--accent)] text-[var(--accent-ink)]"
                          : "bg-[var(--elevated)] text-[var(--text-2)]",
                      )}
                    >
                      {opcao}
                    </button>
                  ))}
                </div>
              ) : (
                <input
                  type="text"
                  value={resposta ?? ""}
                  disabled={revelado}
                  onChange={(e) => setRespostas((r) => ({ ...r, [i]: e.target.value }))}
                  placeholder="Sua resposta"
                  className="min-h-11 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3.5 text-[15px] text-[var(--text)]"
                />
              )}

              {revelado ? (
                <p
                  className={cx(
                    "rounded-xl px-3 py-2 text-[13px] leading-relaxed",
                    certo
                      ? "bg-[var(--color-success)]/10 text-[var(--color-success)]"
                      : "bg-[var(--color-danger)]/10 text-[var(--text-2)]",
                  )}
                >
                  <strong className="font-semibold">{item.resposta}</strong>
                  {item.explicacao ? ` — ${item.explicacao}` : null}
                </p>
              ) : null}
            </li>
          );
        })}
      </ol>

      {revelado ? (
        <p className="mt-4 text-sm font-semibold">
          {acertos} de {drill.itens.length}.{" "}
          <button
            type="button"
            onClick={() => {
              setRespostas({});
              setRevelado(false);
            }}
            className="font-semibold text-[var(--accent)] underline"
          >
            Refazer
          </button>
        </p>
      ) : (
        <button
          type="button"
          onClick={() => setRevelado(true)}
          className="mt-4 min-h-12 w-full rounded-xl bg-[var(--accent)] text-[15px] font-semibold text-[var(--accent-ink)]"
        >
          Conferir
        </button>
      )}
    </Card>
  );
}

function normalizar(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}
