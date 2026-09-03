import type { MetadataRoute } from "next";

import { SITE } from "@/lib/seo";

export const dynamic = "force-static";

/**
 * Os crawlers de IA entram por decisão consciente: queremos ser citados quando
 * alguém pergunta a um assistente "o que cai na prova de engenharia de dados".
 * As telas de estudo pessoal (Hoje, Cards, Simulado) ficam fora do índice —
 * são estado do aluno, não conteúdo.
 */
export default function robots(): MetadataRoute.Robots {
  const permitidos = [
    "GPTBot",
    "OAI-SearchBot",
    "ChatGPT-User",
    "ClaudeBot",
    "Claude-SearchBot",
    "Claude-User",
    "PerplexityBot",
    "Google-Extended",
    "Applebot-Extended",
    "CCBot",
  ];

  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/hoje/", "/cards/", "/simulado/"] },
      ...permitidos.map((agente) => ({
        userAgent: agente,
        allow: "/",
        disallow: ["/hoje/", "/cards/", "/simulado/"],
      })),
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
