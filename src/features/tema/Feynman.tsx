"use client";

import { useEffect, useRef, useState } from "react";

import { Card, RotuloAcento } from "@/components/ui/Card";
import { Gravador } from "@/features/simulado/Gravador";
import { useProgresso } from "@/features/progresso/useProgresso";
import { salvarFeynman } from "@/lib/storage";

/**
 * "Explique para um gerente": o princípio de intuição do método depende de a
 * pessoa **produzir** a explicação, não de ler o pedido. O canvas de design
 * previa um campo para escrever ou gravar; o código tinha só um parágrafo
 * estático, e o exercício mais valioso do tema virava sugestão.
 */
export function Feynman({
  trilhaSlug,
  temaSlug,
  pergunta,
}: {
  trilhaSlug: string;
  temaSlug: string;
  pergunta: string;
}) {
  const { progresso, pronto } = useProgresso();
  const salvo = progresso.trilhas[trilhaSlug]?.feynman?.[temaSlug];
  const [texto, setTexto] = useState<string | null>(null);
  const [guardado, setGuardado] = useState(false);
  const temporizador = useRef<number | null>(null);

  // O valor do campo só é adotado depois de hidratar: o HTML é o mesmo para
  // todo mundo, então começar com o texto salvo quebraria a hidratação.
  const valor = texto ?? (pronto ? (salvo ?? "") : "");

  useEffect(() => {
    return () => {
      if (temporizador.current) window.clearTimeout(temporizador.current);
    };
  }, []);

  function escrever(novo: string) {
    setTexto(novo);
    setGuardado(false);
    if (temporizador.current) window.clearTimeout(temporizador.current);
    // Salvar a cada tecla encheria a fila de sincronização por nada.
    temporizador.current = window.setTimeout(() => {
      salvarFeynman(trilhaSlug, temaSlug, novo);
      setGuardado(true);
    }, 1200);
  }

  return (
    <Card id="explicar" className="mt-6 scroll-mt-16">
      <RotuloAcento>Explique para um gerente</RotuloAcento>
      <p className="mt-1.5 text-[15px] leading-relaxed text-[var(--text-2)]">{pergunta}</p>

      <label className="mt-3 block">
        <span className="sr-only">Sua explicação</span>
        <textarea
          value={valor}
          onChange={(e) => escrever(e.target.value)}
          rows={4}
          placeholder="Escreva em uma frase, sem jargão."
          className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] p-3.5 text-[15px] leading-relaxed text-[var(--text)]"
        />
      </label>

      <p className="text-xs text-[var(--muted)]">
        {guardado
          ? "Guardado neste aparelho."
          : "Se travar numa palavra técnica, é sinal de que ainda não entendeu essa parte."}
      </p>

      <details className="mt-3">
        <summary className="min-h-11 cursor-pointer list-none text-xs text-[var(--accent)]">
          Prefiro falar em voz alta
        </summary>
        <Gravador />
      </details>
    </Card>
  );
}
