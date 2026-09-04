import type { ReactNode } from "react";

import { SincronizarConta } from "@/features/progresso/SincronizarConta";

import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";
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
  comCabecalho = false,
  largura = "leitura",
}: {
  children: ReactNode;
  comRodape?: boolean;
  comAbas?: boolean;
  /** Páginas públicas ganham cabeçalho; telas de app usam só a barra inferior. */
  comCabecalho?: boolean;
  /** "leitura" para texto corrido, "site" para páginas de apresentação. */
  largura?: "leitura" | "site";
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      <SincronizarConta />
      {comCabecalho ? <SiteHeader /> : null}
      <main
        id="conteudo"
        className={largura === "site" ? "w-full flex-1" : "mx-auto w-full max-w-3xl flex-1"}
      >
        {children}
      </main>
      {comRodape ? <SiteFooter /> : null}
      {comAbas ? <TabBar /> : null}
    </div>
  );
}
