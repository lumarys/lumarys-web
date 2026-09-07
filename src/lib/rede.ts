"use client";

/**
 * Se o navegador acha que há rede. Mesmo padrão de `lib/preferencias`: estado
 * externo ao React, lido por `useSyncExternalStore`, porque ler no corpo do
 * componente quebraria a hidratação (o HTML é o mesmo para todo mundo) e ler
 * num efeito para chamar setState dispara renderização em cascata.
 *
 * `navigator.onLine` mente para os dois lados — diz "online" num wi-fi de
 * hotel sem saída, e demora a admitir a volta. Serve para avisar, nunca para
 * decidir se vale tentar uma requisição.
 */

export function assinarRede(ouvinte: () => void): () => void {
  window.addEventListener("online", ouvinte);
  window.addEventListener("offline", ouvinte);
  return () => {
    window.removeEventListener("online", ouvinte);
    window.removeEventListener("offline", ouvinte);
  };
}

export function lerOnline(): boolean {
  return navigator.onLine;
}

/** No servidor não há navegador: assumir rede evita uma faixa falsa no HTML. */
export function onlineNoServidor(): boolean {
  return true;
}
