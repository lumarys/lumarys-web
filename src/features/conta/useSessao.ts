"use client";

import { useCallback, useSyncExternalStore } from "react";

import { emailSalvo, temSessaoPersistida } from "@/lib/auth";

/**
 * Se há sessão neste aparelho. Mesma razão de useProgresso usar
 * `useSyncExternalStore`: é estado externo ao React, e lê-lo num efeito para
 * chamar setState provoca renderização em cascata.
 */

type Snapshot = { logado: boolean; email: string | null } | null;

let cache: Snapshot = null;
const ouvintes = new Set<() => void>();

function calcular(): Snapshot {
  return { logado: temSessaoPersistida(), email: emailSalvo() };
}

function notificar() {
  cache = calcular();
  for (const ouvinte of ouvintes) ouvinte();
}

function assinar(ouvinte: () => void): () => void {
  if (cache === null) cache = calcular();

  ouvintes.add(ouvinte);
  if (ouvintes.size === 1) window.addEventListener("lumarys:sessao", notificar);

  return () => {
    ouvintes.delete(ouvinte);
    if (ouvintes.size === 0) window.removeEventListener("lumarys:sessao", notificar);
  };
}

/** Chamado depois de entrar, sair ou excluir a conta. */
export function avisarMudancaDeSessao(): void {
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("lumarys:sessao"));
}

export function useSessao(): {
  pronto: boolean;
  logado: boolean;
  email: string | null;
  atualizar: () => void;
} {
  const estado = useSyncExternalStore(
    assinar,
    () => cache,
    () => null,
  );

  const atualizar = useCallback(() => avisarMudancaDeSessao(), []);

  return {
    pronto: estado !== null,
    logado: estado?.logado ?? false,
    email: estado?.email ?? null,
    atualizar,
  };
}
