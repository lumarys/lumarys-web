"use client";

import { useSearchParams } from "next/navigation";

import { Simulado, type PerguntaSimulado } from "./Simulado";

/**
 * Lê o módulo do endereço, para que o botão "simulado deste módulo" na página
 * do tema já abra com o escopo certo.
 */
export function SimuladoComEscopo(props: {
  trilhaSlug: string;
  trilhaTitulo: string;
  perguntas: PerguntaSimulado[];
}) {
  const params = useSearchParams();
  const modulo = params.get("modulo") ?? undefined;

  return <Simulado {...props} moduloInicial={modulo} />;
}
