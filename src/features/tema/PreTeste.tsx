"use client";

import { useMemo, useState } from "react";

import { Card, RotuloAcento } from "@/components/ui/Card";
import { IconeCheck, IconeFechar } from "@/components/ui/icons";
import { useProgresso } from "@/features/progresso/useProgresso";
import { registrarQuiz } from "@/lib/storage";
import { formatarData } from "@/lib/utils";
import { cx, embaralhar, sementeDeTexto } from "@/lib/utils";
import type { PreTeste as TipoPreTeste } from "@content/types";

type Confianca = "baixa" | "media" | "alta";

/**
 * Recuperação antes do conteúdo. Errar aqui é o objetivo: a tentativa fracassada
 * prepara o cérebro para a explicação que vem depois. Por isso o botão diz
 * "responder", não "ver resposta", e a confiança é registrada antes.
 */
export function PreTeste({
  perguntas,
  trilhaSlug,
  temaSlug,
}: {
  perguntas: TipoPreTeste[];
  trilhaSlug: string;
  temaSlug: string;
}) {
  const [indice, setIndice] = useState(0);
  const [escolha, setEscolha] = useState<number | null>(null);
  const [confianca, setConfianca] = useState<Confianca | null>(null);
  const [respondida, setRespondida] = useState(false);
  const [acertos, setAcertos] = useState(0);
  const [terminou, setTerminou] = useState(false);
  // Confiança alta com resposta errada é o sinal mais valioso do pré-teste:
  // é onde a pessoa não sabe que não sabe. Contamos para avisar no fim.
  const [enganos, setEnganos] = useState(0);
  const [acertou, setAcertou] = useState(false);
  // Resultado gravado numa visita anterior (neste ou em outro aparelho).
  // Refazer é possível, mas a regra do método é errar antes de ler uma vez só.
  const { progresso, pronto } = useProgresso();
  const anterior = progresso.trilhas[trilhaSlug]?.preTestes[temaSlug];
  const [refazendo, setRefazendo] = useState(false);

  const pergunta = perguntas[indice];

  /**
   * A ordem em que as alternativas foram escritas vazava a resposta: numa
   * auditoria dos 30 temas, a certa estava na segunda posição em 62% dos
   * pré-testes e quase nunca na terceira. Dava para acertar sem saber nada, e
   * isso inflava a prontidão. Embaralhar aqui resolve para todo o conteúdo, em
   * vez de depender de quem escreve. A semente vem do enunciado: a ordem é
   * imprevisível, mas estável entre renderizações.
   */
  const alternativas = useMemo(
    () => (pergunta ? embaralhar(pergunta.alternativas, sementeDeTexto(pergunta.enunciado)) : []),
    [pergunta],
  );

  if (!pergunta) return null;

  if (pronto && anterior && !refazendo && !terminou) {
    return (
      <Card className="mt-5">
        <RotuloAcento>Pré-teste concluído</RotuloAcento>
        <p className="mt-2 text-[15px] leading-relaxed">
          {anterior.acertos} de {anterior.total}, em {formatarData(anterior.atualizadoEm)}. Siga
          para o conteúdo; o pré-teste serve para a primeira leitura.
        </p>
        <button
          type="button"
          onClick={() => setRefazendo(true)}
          className="mt-3 min-h-11 text-[13px] text-[var(--muted)] underline underline-offset-4"
        >
          Refazer o pré-teste
        </button>
      </Card>
    );
  }

  function responder() {
    if (escolha === null) return;
    const certa = alternativas[escolha]?.correta ?? false;
    if (certa) setAcertos((a) => a + 1);
    if (!certa && confianca === "alta") setEnganos((n) => n + 1);
    setAcertou(certa);
    setRespondida(true);
  }

  function avancar() {
    if (indice + 1 >= perguntas.length) {
      registrarQuiz(trilhaSlug, temaSlug, acertos, perguntas.length, "preTeste");
      setTerminou(true);
      return;
    }
    setIndice((i) => i + 1);
    setEscolha(null);
    setConfianca(null);
    setRespondida(false);
  }

  if (terminou) {
    return (
      <Card className="mt-5">
        <RotuloAcento>Pré-teste concluído</RotuloAcento>
        <p className="mt-2 text-[15px] leading-relaxed">
          {acertos} de {perguntas.length}.{" "}
          {acertos === perguntas.length
            ? "Você já tem a base. Use o tema para fechar as bordas e vá direto para os cards."
            : "É exatamente para isso que serve o pré-teste. Leia a explicação com essas perguntas na cabeça."}
        </p>
        {enganos > 0 ? (
          <p className="mt-3 rounded-xl border border-[var(--accent)]/30 bg-[var(--accent)]/10 px-3.5 py-3 text-[14px] leading-relaxed">
            <strong className="font-semibold">Preste atenção nisto:</strong> em{" "}
            {enganos === 1 ? "uma resposta" : `${enganos} respostas`} você marcou confiança alta e
            errou. É o ponto mais perigoso numa sabatina, porque você não vai revisar o que acha que
            já sabe. Leia essa parte do tema com calma.
          </p>
        ) : null}
      </Card>
    );
  }

  return (
    <Card className="mt-5">
      <div className="flex items-baseline justify-between gap-3">
        <RotuloAcento>
          Pré-teste · {indice + 1} de {perguntas.length}
        </RotuloAcento>
        <span className="text-xs text-[var(--muted)]">responda antes de ver</span>
      </div>

      <p className="mt-3 text-[15px] font-medium leading-snug">{pergunta.enunciado}</p>

      <div className="mt-3 flex flex-col gap-2">
        {alternativas.map((alt, i) => {
          const selecionada = escolha === i;
          const revelar = respondida;
          return (
            <button
              key={i}
              type="button"
              disabled={respondida}
              onClick={() => setEscolha(i)}
              className={cx(
                "flex min-h-11 items-start gap-2 rounded-xl border px-3.5 py-3 text-left text-sm leading-relaxed transition-colors",
                revelar &&
                  alt.correta &&
                  "border-[var(--color-success)] bg-[var(--color-success)]/10",
                revelar &&
                  !alt.correta &&
                  selecionada &&
                  "border-[var(--color-danger)] bg-[var(--color-danger)]/10",
                !revelar && selecionada && "border-[var(--accent)] bg-[var(--accent)]/10",
                !revelar && !selecionada && "border-[var(--border)]",
                revelar && !alt.correta && !selecionada && "border-[var(--border)] opacity-60",
              )}
            >
              {revelar ? (
                <span className="mt-0.5 shrink-0">
                  {alt.correta ? (
                    <IconeCheck size={16} className="text-[var(--color-success)]" />
                  ) : selecionada ? (
                    <IconeFechar size={16} className="text-[var(--color-danger)]" />
                  ) : (
                    <span className="block size-4" />
                  )}
                </span>
              ) : null}
              <span>
                {alt.texto}
                {revelar ? (
                  <span className="mt-1 block text-[13px] text-[var(--text-2)]">
                    {alt.explicacao}
                  </span>
                ) : null}
              </span>
            </button>
          );
        })}
      </div>

      {respondida && confianca === "alta" && !acertou ? (
        <p className="mt-3 rounded-xl border border-[var(--accent)]/30 bg-[var(--accent)]/10 px-3.5 py-2.5 text-[13px] leading-relaxed">
          Você tinha certeza e errou. Guarde esta: é o tipo de lacuna que só aparece na hora da
          prova.
        </p>
      ) : null}

      {!respondida ? (
        <>
          <div
            role="radiogroup"
            aria-labelledby="rotulo-confianca"
            className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[var(--text-2)]"
          >
            <span id="rotulo-confianca">Quanta certeza você tem?</span>
            {(["baixa", "media", "alta"] as const).map((nivel) => (
              <button
                key={nivel}
                type="button"
                role="radio"
                aria-checked={confianca === nivel}
                onClick={() => setConfianca(nivel)}
                className={cx(
                  "inline-flex min-h-11 min-w-16 items-center justify-center rounded-full px-3 font-semibold",
                  confianca === nivel
                    ? "bg-[var(--accent)] text-[var(--accent-ink)]"
                    : "bg-[var(--elevated)] text-[var(--text-2)]",
                )}
              >
                {nivel === "media" ? "média" : nivel}
              </button>
            ))}
          </div>
          <button
            type="button"
            disabled={escolha === null || confianca === null}
            onClick={responder}
            className="mt-3 min-h-12 w-full rounded-xl bg-[var(--accent)] text-[15px] font-semibold text-[var(--accent-ink)] disabled:opacity-40"
          >
            {confianca === null ? "Escolha uma alternativa e o seu nível de certeza" : "Responder"}
          </button>
        </>
      ) : (
        <button
          type="button"
          onClick={avancar}
          className="mt-3 min-h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--elevated)] text-[15px] font-semibold"
        >
          {indice + 1 >= perguntas.length ? "Ir para o conteúdo" : "Próxima pergunta"}
        </button>
      )}
    </Card>
  );
}
