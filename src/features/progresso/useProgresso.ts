"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";

import {
  assinarProgresso,
  lerProgresso,
  progressoDoServidor,
  recarregarProgresso,
} from "@/lib/store";
import { registrarSincronizador, type Progresso } from "@/lib/storage";
import { agendarEnvio } from "@/lib/sync";

/**
 * Progresso do dispositivo, reagindo a mudanças em qualquer aba.
 *
 * `pronto` distingue "ainda não hidratou" de "não há progresso": o HTML
 * estático precisa bater com a primeira renderização no cliente, então o
 * servidor sempre entrega vazio e a interface só mostra números depois.
 */
export function useProgresso(): {
  progresso: Progresso;
  pronto: boolean;
  recarregar: () => void;
} {
  const progresso = useSyncExternalStore(
    assinarProgresso,
    lerProgresso,
    progressoDoServidor,
  );

  const pronto = useSyncExternalStore(
    assinarProgresso,
    () => true,
    () => false,
  );

  useEffect(() => {
    registrarSincronizador(agendarEnvio);
  }, []);

  const recarregar = useCallback(() => recarregarProgresso(), []);

  return { progresso, pronto, recarregar };
}
