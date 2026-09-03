"use client";

import { useState } from "react";

import { Card, RotuloAcento } from "@/components/ui/Card";
import { IconeCheck, IconeCopiar } from "@/components/ui/icons";

/**
 * O simulado do site cobre as perguntas escritas por nós. Este prompt existe
 * para o aluno continuar treinando com uma IA quando quiser mais volume — e
 * está aqui em vez de escondido, porque é assim que a pessoa vai usar de
 * qualquer jeito.
 */
export function PromptIA({ prompt }: { prompt: string }) {
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopiado(true);
      window.setTimeout(() => setCopiado(false), 2500);
    } catch {
      /* navegador sem permissão de área de transferência: o texto continua visível abaixo */
    }
  }

  return (
    <Card>
      <RotuloAcento>Treinar com uma IA</RotuloAcento>
      <p className="mt-2 text-sm leading-relaxed text-[var(--text-2)]">
        Cole este prompt em qualquer assistente para continuar praticando. Ele tem dois modos:
        tutor, que explica um tema por vez, e sabatina, que faz uma pergunta e avalia a sua
        resposta.
      </p>

      <button
        type="button"
        onClick={copiar}
        className="mt-3 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--accent)] text-[15px] font-semibold text-[var(--accent-ink)]"
      >
        {copiado ? <IconeCheck size={18} /> : <IconeCopiar size={18} />}
        {copiado ? "Copiado" : "Copiar o prompt"}
      </button>

      <details className="mt-3">
        <summary className="min-h-11 cursor-pointer list-none text-[13px] text-[var(--muted)]">
          Ver o texto
        </summary>
        <pre className="scroll-x mt-2 whitespace-pre-wrap rounded-xl border border-[var(--border)] bg-[var(--bg)] p-3 text-[12px] leading-relaxed text-[var(--text-2)]">
          {prompt}
        </pre>
      </details>
    </Card>
  );
}
