"use client";

import { useState } from "react";

import { Card, Rotulo, RotuloAcento } from "@/components/ui/Card";
import { useProgresso } from "@/features/progresso/useProgresso";
import { PerguntaObjetiva, type Objetiva } from "@/features/quiz/PerguntaObjetiva";
import { registrarQuiz } from "@/lib/storage";
import { formatarData } from "@/lib/utils";

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
  const [acertos, setAcertos] = useState(0);
  const [terminou, setTerminou] = useState(false);
  const [erradas, setErradas] = useState<number[]>([]);
  const { progresso, pronto } = useProgresso();
  const anterior = progresso.trilhas[trilhaSlug]?.quizzes[temaSlug];
  const [refazendo, setRefazendo] = useState(false);

  const pergunta = perguntas[indice];
  if (!pergunta) return null;

  if (pronto && anterior && !refazendo && !terminou) {
    return (
      <Card>
        <RotuloAcento>Quiz concluído</RotuloAcento>
        <p className="mt-2 text-[15px] leading-relaxed">
          {anterior.acertos} de {anterior.total}, em {formatarData(anterior.atualizadoEm)}.
          {anterior.acertos / Math.max(anterior.total, 1) >= 0.7
            ? " Bom o bastante para seguir."
            : " Abaixo de 70%: vale reler a explicação e refazer."}
        </p>
        <button
          type="button"
          onClick={() => setRefazendo(true)}
          className="mt-3 min-h-11 text-[13px] text-[var(--muted)] underline underline-offset-4"
        >
          Refazer o quiz
        </button>
      </Card>
    );
  }

  function conferir(certo: boolean) {
    if (certo) setAcertos((a) => a + 1);
    else setErradas((e) => [...e, indice]);
  }

  function avancar() {
    if (indice + 1 >= perguntas.length) {
      registrarQuiz(trilhaSlug, temaSlug, acertos, perguntas.length, "quiz", { erradas });
      setTerminou(true);
      return;
    }
    setIndice((i) => i + 1);
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

        {/* Saber a nota não diz o que revisar. As erradas, sim. */}
        {erradas.length > 0 ? (
          <div className="mt-3">
            <Rotulo className="mb-1.5">O que revisar</Rotulo>
            <ul className="flex list-none flex-col gap-1.5 p-0">
              {erradas.map((i) => (
                <li key={i} className="text-sm leading-relaxed text-[var(--text-2)]">
                  · {perguntas[i]?.enunciado}
                </li>
              ))}
            </ul>
            <a
              href="#cards"
              className="mt-3 flex min-h-12 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--elevated)] text-sm font-semibold no-underline"
            >
              Revisar os cards deste tema
            </a>
          </div>
        ) : null}
      </Card>
    );
  }

  return (
    <PerguntaObjetiva
      key={indice}
      pergunta={pergunta}
      rotulo="Quiz"
      numero={indice + 1}
      total={perguntas.length}
      aoConferir={conferir}
      aoAvancar={avancar}
    />
  );
}
