"use client";

import { useEffect, useRef, type ReactNode } from "react";

import { cx } from "@/lib/utils";

/**
 * Diálogo do site, sobre o `<dialog>` nativo: foco preso, Escape e fundo já
 * vêm do navegador, sem biblioteca e sem script de terceiro — o que importa
 * numa página cuja política de conteúdo não admite script externo.
 *
 * Substitui o `window.confirm`, que não dá para escrever em português decente,
 * não mostra contexto e aparece com a cara do sistema operacional bem no
 * momento em que a pessoa decide apagar o próprio progresso.
 */
export function Dialogo({
  aberto,
  aoFechar,
  titulo,
  children,
  posicao = "centro",
}: {
  aberto: boolean;
  aoFechar: () => void;
  titulo: string;
  children: ReactNode;
  /** "baixo" é a folha que sobe do rodapé, usada pelo menu no celular. */
  posicao?: "centro" | "baixo";
}) {
  const referencia = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialogo = referencia.current;
    if (!dialogo) return;
    if (aberto && !dialogo.open) dialogo.showModal();
    if (!aberto && dialogo.open) dialogo.close();
  }, [aberto]);

  return (
    /* O onClick abaixo fecha ao clicar no fundo. A regra pede um handler de
       teclado ao lado dele, e aqui ele existe sem código: o <dialog> aberto
       com showModal() fecha no Escape por conta do navegador e dispara o mesmo
       onClose. Quem navega por teclado nunca fica preso. */
    /* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions */
    <dialog
      ref={referencia}
      onClose={aoFechar}
      // Clicar fora fecha: o alvo do clique é o próprio dialog quando o ponto
      // cai no backdrop.
      onClick={(e) => {
        if (e.target === referencia.current) aoFechar();
      }}
      aria-label={titulo}
      className={cx(
        "w-full border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] backdrop:bg-black/50",
        posicao === "baixo"
          ? "mb-0 mt-auto max-w-none rounded-t-2xl p-5 sm:mx-auto sm:mb-auto sm:max-w-sm sm:rounded-2xl"
          : "m-auto max-w-sm rounded-2xl p-5",
      )}
    >
      {children}
    </dialog>
  );
}
