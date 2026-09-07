"use client";

/**
 * Escolha de tema, no mesmo padrão de `lib/preferencias.ts`: estado externo ao
 * React, lido por `useSyncExternalStore`.
 *
 * São três estados, não dois. "auto" é o padrão e segue o sistema, que é o
 * certo para quem tem o celular no modo noturno por horário. Os outros dois
 * existem para quem lê no escuro num quarto claro, ou o contrário — e essa
 * escolha tem de sobreviver ao sistema mudar de ideia às 18h.
 *
 * Quem aplica o atributo antes da primeira pintura é o script inline do
 * `layout.tsx` (CHAVE_TEMA e SCRIPT_TEMA abaixo). Sem ele a página abriria no
 * escuro e piscaria para o claro depois de hidratar.
 */

export const CHAVE_TEMA = "lumarys.tema";

export const TEMAS = ["auto", "claro", "escuro"] as const;
export type Tema = (typeof TEMAS)[number];

const PADRAO: Tema = "auto";

let cache: Tema = PADRAO;
let carregado = false;
const ouvintes = new Set<() => void>();

function doArmazenamento(): Tema {
  try {
    const guardado = window.localStorage.getItem(CHAVE_TEMA);
    return TEMAS.includes(guardado as Tema) ? (guardado as Tema) : PADRAO;
  } catch {
    return PADRAO;
  }
}

export function assinarTema(ouvinte: () => void): () => void {
  if (!carregado) {
    cache = doArmazenamento();
    carregado = true;
  }
  ouvintes.add(ouvinte);
  return () => ouvintes.delete(ouvinte);
}

export function lerTema(): Tema {
  return cache;
}

/** No servidor o HTML é o mesmo para todos: sai em "auto". */
export function temaDoServidor(): Tema {
  return PADRAO;
}

export function definirTema(tema: Tema): void {
  cache = tema;
  carregado = true;
  aplicarTema(tema);
  try {
    window.localStorage.setItem(CHAVE_TEMA, tema);
  } catch {
    /* preferência visual não vale um erro na tela */
  }
  for (const ouvinte of ouvintes) ouvinte();
}

/** Escreve (ou apaga) o atributo que o CSS observa. */
export function aplicarTema(tema: Tema): void {
  const raiz = document.documentElement;
  if (tema === "auto") raiz.removeAttribute("data-tema");
  else raiz.setAttribute("data-tema", tema);
}

export const ROTULOS: Record<Tema, string> = {
  auto: "Automático",
  claro: "Claro",
  escuro: "Escuro",
};

/**
 * O mesmo que `aplicarTema`, em uma linha, para rodar no `<head>` antes da
 * primeira pintura. Mora aqui para a chave não ser escrita em dois lugares.
 */
export const SCRIPT_TEMA = `try{var t=localStorage.getItem(${JSON.stringify(CHAVE_TEMA)});if(t==="claro"||t==="escuro")document.documentElement.setAttribute("data-tema",t)}catch(e){}`;
