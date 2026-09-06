import type { ReactNode } from "react";

import { SincronizarConta } from "@/features/progresso/SincronizarConta";

import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";
import { TabBar } from "./TabBar";

/**
 * Casca do app: cabeçalho em toda página, conteúdo rolável, rodapé legal no fim
 * e a barra de abas apenas nas telas que dependem do progresso do aluno.
 *
 * A regra mora aqui e em `lib/rotas`, não em cada página. Antes cada rota
 * escolhia: a home ficava sem abas, a trilha ficava sem cabeçalho — o clique
 * principal do site jogava o visitante numa página sem marca e sem menu — e as
 * páginas públicas ofereciam abas de telas vazias. Largura máxima de leitura em
 * telas grandes, mas o alvo primário é 390px.
 */
export function AppShell({
  children,
  comRodape = true,
  largura = "leitura",
}: {
  children: ReactNode;
  comRodape?: boolean;
  /** "leitura" para texto corrido, "site" para páginas de apresentação. */
  largura?: "leitura" | "site";
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      <SincronizarConta />
      <SiteHeader />
      <main
        id="conteudo"
        className={largura === "site" ? "w-full flex-1" : "mx-auto w-full max-w-3xl flex-1"}
      >
        {children}
      </main>
      {comRodape ? <SiteFooter /> : null}
      <TabBar />
    </div>
  );
}
