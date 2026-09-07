import type { Metadata } from "next";

import { AppShell } from "@/components/layout/AppShell";
import { BotaoLink } from "@/components/ui/Botao";
import { Card, RotuloAcento } from "@/components/ui/Card";
import { alternativas } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Sem conexão",
  description: "Esta página só abre com rede.",
  alternates: alternativas("/offline/"),
  robots: { index: false, follow: false },
};

/**
 * Última parada do service worker: a pessoa pediu uma página que nunca abriu
 * antes e não há rede para buscá-la. Em vez do erro do navegador, o site
 * explica o que dá para fazer com o que já está no aparelho.
 */
export default function PaginaOffline() {
  return (
    <AppShell comRodape={false}>
      <div className="flex flex-col gap-3.5 px-5 pb-8 pt-5">
        <Card destaque>
          <RotuloAcento>Sem conexão</RotuloAcento>
          <h1 className="font-display mt-2 text-[22px] font-semibold">
            Esta página ainda não estava no aparelho
          </h1>
          <p className="mt-2 text-[15px] leading-relaxed">
            Os temas que você já abriu continuam disponíveis, e os cards funcionam sem rede. O que
            você estudar agora fica guardado e sobe quando a conexão voltar.
          </p>
        </Card>

        <BotaoLink href="/hoje/">Ver o que estudar hoje</BotaoLink>
        <BotaoLink href="/cards/" variante="secundario">
          Revisar cards
        </BotaoLink>
      </div>
    </AppShell>
  );
}
