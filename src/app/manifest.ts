import type { MetadataRoute } from "next";

import { EMPRESA } from "@/lib/company";
import { SITE } from "@/lib/seo";

export const dynamic = "force-static";

/**
 * Manifesto de app: permite "adicionar à tela inicial" no celular, que é
 * onde a Lumarys é usada. Os ícones vêm de design/marca (gerar.mjs); o
 * "maskable" tem margem para o Android cortar os cantos sem comer o símbolo.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE.nome} — ${EMPRESA.tagline}`,
    short_name: SITE.nome,
    description: SITE.descricao,
    lang: "pt-BR",
    start_url: "/hoje/",
    scope: "/",
    display: "standalone",
    background_color: "#0B1220",
    theme_color: "#0B1220",
    icons: [
      { src: "/icons/icone-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icone-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icons/icone-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
