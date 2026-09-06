"use client";

import { useCallback, useEffect, useState } from "react";

import { temSessaoPersistida } from "@/lib/auth";
import { Faixa } from "@/components/ui/Faixa";
import { useProgresso } from "./useProgresso";
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
  const { armazenamentoOk } = useProgresso();
  const [falhouSync, setFalhouSync] = useState(false);

  // setState acontece na volta da promessa, não no corpo do efeito: chamar
  // direto ali dispara renderização em cascata.
  const tentar = useCallback(() => {
    void sincronizarConta()
      .then((ok) => {
        setFalhouSync(false);
        if (ok) recarregarProgresso();
      })
      .catch(() => setFalhouSync(true));
  }, []);

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

    tentar();
  }, [tentar]);

  // O aparelho continua sendo a verdade em qualquer um destes casos; o que não
  // pode é a pessoa achar que está tudo guardado quando não está.
  if (!armazenamentoOk) {
    return (
      <Faixa tom="erro">
        <span>
          Seu progresso <strong className="font-semibold">não está sendo salvo</strong> neste
          navegador. Em janela privada ou com o armazenamento bloqueado, o que você estudar some ao
          fechar a aba.
        </span>
      </Faixa>
    );
  }

  if (falhouSync) {
    return (
      <Faixa>
        <span className="flex-1">
          Não consegui falar com a sua conta agora. O que você estudar fica guardado neste aparelho
          e sobe depois.
        </span>
        <button type="button" onClick={tentar} className="shrink-0 font-semibold underline">
          Tentar de novo
        </button>
      </Faixa>
    );
  }

  return null;
}

export type { Progresso };
