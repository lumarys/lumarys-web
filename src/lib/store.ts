"use client";

import { ler, type Progresso, progressoVazio } from "./storage";

/**
 * Ponte entre o localStorage e o React.
 *
 * `useSyncExternalStore` é a API certa para isto: o progresso é estado externo,
 * mora fora do React e muda por eventos (outra aba, outra tela). Ler dentro de
 * um efeito e chamar setState funcionaria, mas dispara renderização em cascata
 * e o compilador do React reclama com razão.
 *
 * O snapshot é memorizado porque `useSyncExternalStore` compara por
 * referência: ler o JSON de novo a cada render entraria em laço infinito.
 */

const VAZIO = progressoVazio();

let cache: Progresso = VAZIO;
let carregado = false;

const ouvintes = new Set<() => void>();

function notificar() {
  cache = ler();
  for (const ouvinte of ouvintes) ouvinte();
}

export function assinarProgresso(ouvinte: () => void): () => void {
  if (!carregado) {
    cache = ler();
    carregado = true;
  }

  ouvintes.add(ouvinte);
  if (ouvintes.size === 1) {
    window.addEventListener("lumarys:progresso", notificar);
    window.addEventListener("storage", notificar);
  }

  return () => {
    ouvintes.delete(ouvinte);
    if (ouvintes.size === 0) {
      window.removeEventListener("lumarys:progresso", notificar);
      window.removeEventListener("storage", notificar);
    }
  };
}

export function lerProgresso(): Progresso {
  return cache;
}

/** No servidor não existe progresso: o HTML estático é o mesmo para todos. */
export function progressoDoServidor(): Progresso {
  return VAZIO;
}

export function recarregarProgresso(): void {
  notificar();
}
