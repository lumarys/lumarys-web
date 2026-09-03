"use client";

import { useCallback, useEffect, useState } from "react";

import { ler, type Progresso, progressoVazio } from "@/lib/storage";

/**
 * Lê o progresso do dispositivo e reage a mudanças, inclusive vindas de outra
 * aba. Começa vazio na primeira renderização de propósito: o HTML é estático e
 * precisa bater com o servidor para não dar hydration mismatch; o valor real
 * entra no efeito.
 */
export function useProgresso(): { progresso: Progresso; pronto: boolean; recarregar: () => void } {
  const [progresso, setProgresso] = useState<Progresso>(progressoVazio);
  const [pronto, setPronto] = useState(false);

  const recarregar = useCallback(() => setProgresso(ler()), []);

  useEffect(() => {
    recarregar();
    setPronto(true);

    const aoMudar = () => recarregar();
    window.addEventListener("lumarys:progresso", aoMudar);
    window.addEventListener("storage", aoMudar);
    return () => {
      window.removeEventListener("lumarys:progresso", aoMudar);
      window.removeEventListener("storage", aoMudar);
    };
  }, [recarregar]);

  return { progresso, pronto, recarregar };
}
