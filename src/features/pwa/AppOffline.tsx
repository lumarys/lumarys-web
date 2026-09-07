"use client";

import { useEffect, useSyncExternalStore } from "react";

import { Faixa } from "@/components/ui/Faixa";
import { assinarRede, lerOnline, onlineNoServidor } from "@/lib/rede";

/**
 * Duas coisas que só fazem sentido juntas: registrar o service worker e dizer
 * quando a rede caiu.
 *
 * O registro é feito daqui, e não por script inline, para não precisar de mais
 * um hash na política de conteúdo — este componente vive num chunk que a
 * política já autoriza.
 */
export function AppOffline() {
  const online = useSyncExternalStore(assinarRede, lerOnline, onlineNoServidor);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    // Sem await e sem estado: falhar em registrar não pode atrapalhar a página.
    void navigator.serviceWorker.register("/sw.js").catch(() => null);
  }, []);

  if (online) return null;

  return (
    <Faixa>
      <span>
        Você está <strong className="font-semibold">sem rede</strong>. O que já foi aberto continua
        funcionando, e o progresso sobe sozinho quando a conexão voltar.
      </span>
    </Faixa>
  );
}
