"use client";

/**
 * Preferências de leitura, no mesmo padrão de `lib/store.ts`: estado externo ao
 * React, lido por `useSyncExternalStore`. Ler o armazenamento dentro de um
 * efeito e chamar setState dispararia renderização em cascata, e ler no corpo
 * do componente quebraria a hidratação — o HTML é o mesmo para todo mundo.
 */

const CHAVE = "lumarys.escala-leitura";

export const ESCALAS = [0.9, 1, 1.15, 1.3] as const;
export type Escala = (typeof ESCALAS)[number];

const PADRAO: Escala = 1;

let cache: Escala = PADRAO;
let carregado = false;
const ouvintes = new Set<() => void>();

function doArmazenamento(): Escala {
  try {
    const guardada = Number(window.localStorage.getItem(CHAVE));
    return ESCALAS.includes(guardada as Escala) ? (guardada as Escala) : PADRAO;
  } catch {
    return PADRAO;
  }
}

export function assinarEscala(ouvinte: () => void): () => void {
  if (!carregado) {
    cache = doArmazenamento();
    carregado = true;
  }
  ouvintes.add(ouvinte);
  return () => ouvintes.delete(ouvinte);
}

export function lerEscala(): Escala {
  return cache;
}

/** No servidor todo mundo lê no tamanho padrão. */
export function escalaDoServidor(): Escala {
  return PADRAO;
}

export function definirEscala(escala: Escala): void {
  cache = escala;
  carregado = true;
  try {
    window.localStorage.setItem(CHAVE, String(escala));
  } catch {
    /* preferência de conforto não vale um erro na tela */
  }
  for (const ouvinte of ouvintes) ouvinte();
}

/** Um passo para cima ou para baixo dentro das escalas permitidas. */
export function proximaEscala(atual: Escala, passo: number): Escala {
  const i = ESCALAS.indexOf(atual);
  return ESCALAS[Math.min(ESCALAS.length - 1, Math.max(0, i + passo))] ?? PADRAO;
}
