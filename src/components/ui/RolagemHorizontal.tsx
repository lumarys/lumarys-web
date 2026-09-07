"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

import { cx } from "@/lib/utils";

/**
 * Conteúdo largo demais para 390 px — uma tabela comparativa, sobretudo.
 * Antes ele simplesmente era cortado na borda: a coluna da direita existia e
 * ninguém sabia, porque nada na tela dizia que dava para arrastar.
 *
 * Um degradê nas bordas mostra que há mais de cada lado, e some quando não há.
 * Só isso exige medir, e por isso o componente é cliente; a alternativa em CSS
 * puro (sombras com background-attachment) fica atrás das linhas da tabela,
 * que têm fundo próprio.
 */
export function RolagemHorizontal({
  children,
  className,
  rotulo,
}: {
  children: ReactNode;
  className?: string;
  /** Nome do conteúdo, para quem navega por teclado ou leitor de tela. */
  rotulo: string;
}) {
  const referencia = useRef<HTMLDivElement>(null);
  const [bordas, setBordas] = useState({ esquerda: false, direita: false });

  const medir = useCallback(() => {
    const el = referencia.current;
    if (!el) return;
    const folga = el.scrollWidth - el.clientWidth;
    // 2 px de tolerância: arredondamento de zoom e de fonte faz o scrollWidth
    // passar do clientWidth por uma fração mesmo sem nada para rolar.
    setBordas({
      esquerda: el.scrollLeft > 2,
      direita: folga > 2 && el.scrollLeft < folga - 2,
    });
  }, []);

  useEffect(() => {
    const el = referencia.current;
    if (!el) return;
    medir();
    const observador = new ResizeObserver(medir);
    observador.observe(el);
    for (const filho of Array.from(el.children)) observador.observe(filho);
    return () => observador.disconnect();
  }, [medir]);

  const rolavel = bordas.esquerda || bordas.direita;

  return (
    <div className={cx("relative", className)}>
      <div
        ref={referencia}
        onScroll={medir}
        // Só vira parada de tabulação quando há o que rolar: um contêiner que
        // não rola no teclado de ninguém não deveria receber foco.
        //
        // A regra desconfia de tabIndex em elemento não interativo, e aqui ela
        // erra: uma região rolável PRECISA ser focável para quem usa teclado
        // conseguir rolá-la com as setas. É o que o WAI-ARIA APG recomenda, e
        // por isso vem junto de role="region" e de um nome acessível.
        // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
        tabIndex={rolavel ? 0 : undefined}
        role={rolavel ? "region" : undefined}
        aria-label={rolavel ? `${rotulo} (rolável na horizontal)` : undefined}
        className="scroll-x"
      >
        {children}
      </div>
      <Borda lado="esquerda" visivel={bordas.esquerda} />
      <Borda lado="direita" visivel={bordas.direita} />
    </div>
  );
}

function Borda({ lado, visivel }: { lado: "esquerda" | "direita"; visivel: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cx(
        "pointer-events-none absolute inset-y-0 w-8 transition-opacity",
        lado === "esquerda"
          ? "left-0 bg-gradient-to-r from-[var(--surface)] to-transparent"
          : "right-0 bg-gradient-to-l from-[var(--surface)] to-transparent",
        visivel ? "opacity-100" : "opacity-0",
      )}
    />
  );
}
