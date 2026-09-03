"use client";

import { EMPRESA } from "@/lib/company";

/**
 * O endereço nunca vai para o HTML: é montado no clique. Mesmo padrão
 * anti-robô usado em cernyn.com e youco.io.
 */
export function ContatoLink({ className, rotulo = "Contato" }: { className?: string; rotulo?: string }) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        window.location.href = ["mailto", `${EMPRESA.contatoUsuario}@${EMPRESA.contatoDominio}`].join(":");
      }}
    >
      {rotulo}
    </button>
  );
}
