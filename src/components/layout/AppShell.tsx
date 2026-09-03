import type { ReactNode } from "react";

import { SiteFooter } from "./SiteFooter";
import { TabBar } from "./TabBar";

/**
 * Casca do app: conteúdo rolável, rodapé legal no fim da página e barra de
 * navegação fixa embaixo. Largura máxima de leitura em telas grandes, mas o
 * alvo primário é 390px.
 */
export function AppShell({
  children,
  comRodape = true,
  comAbas = true,
}: {
  children: ReactNode;
  comRodape?: boolean;
  comAbas?: boolean;
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      <main id="conteudo" className="mx-auto w-full max-w-3xl flex-1">
        {children}
      </main>
      {comRodape ? <SiteFooter /> : null}
      {comAbas ? <TabBar /> : null}
    </div>
  );
}
