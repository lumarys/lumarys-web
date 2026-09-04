"use client";

import { useEffect } from "react";

import { temSessaoPersistida } from "@/lib/auth";
import { registrarSincronizador, type Progresso } from "@/lib/storage";
import { recarregarProgresso } from "@/lib/store";
import { agendarEnvio, sincronizarConta, syncConfigurado } from "@/lib/sync";

const CHAVE_ULTIMA = "lumarys.sync.ultima";
const INTERVALO_MS = 60_000;

/**
 * Mora na casca de toda página. Duas responsabilidades:
 *
 * 1. Registrar o enviador de progresso assim que a página abre, para uma
 *    resposta gravada antes de qualquer painel montar não ficar só no
 *    aparelho.
 * 2. Com conta ligada, puxar o que foi feito em outro aparelho e mesclar.
 *    Uma vez por minuto por aba, no máximo: navegar entre temas não pode
 *    virar uma chamada por clique.
 */
export function SincronizarConta() {
  useEffect(() => {
    registrarSincronizador(agendarEnvio);
    if (!syncConfigurado || !temSessaoPersistida()) return;

    let ultima = 0;
    try {
      ultima = Number(window.sessionStorage.getItem(CHAVE_ULTIMA) ?? 0);
    } catch {
      /* sem sessionStorage: sincroniza assim mesmo */
    }
    if (Date.now() - ultima < INTERVALO_MS) return;

    try {
      window.sessionStorage.setItem(CHAVE_ULTIMA, String(Date.now()));
    } catch {
      /* idem */
    }

    void sincronizarConta()
      .then((ok) => {
        if (ok) recarregarProgresso();
      })
      .catch(() => {
        /* sem rede ou token vencido: o aparelho continua sendo a verdade */
      });
  }, []);

  return null;
}

export type { Progresso };
