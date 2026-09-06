"use client";

import { useEffect } from "react";

import { marcarVisita } from "@/lib/storage";

/**
 * Guarda que este tema foi aberto, para a tela Hoje conseguir oferecer
 * "continuar de onde parou". Não desenha nada: é só o efeito.
 */
export function RegistrarVisita({
  trilhaSlug,
  temaSlug,
}: {
  trilhaSlug: string;
  temaSlug: string;
}) {
  useEffect(() => {
    marcarVisita(trilhaSlug, temaSlug);
  }, [trilhaSlug, temaSlug]);

  return null;
}
