import type { MetadataRoute } from "next";

import { SITE } from "@/lib/seo";

export const dynamic = "force-static";

/**
 * Os crawlers de IA entram por decisão consciente: queremos ser citados quando
 * alguém pergunta a um assistente "o que cai na prova de engenharia de dados".
 * Hoje e Cards ficam fora do índice: são estado do aluno, não conteúdo. O
 * simulado saiu dessa lista — a entrada dele publica uma pergunta real de cada
 * módulo, com resposta-modelo e rubrica, e era o diferencial anunciado na home
 * que ninguém conseguia ver antes de criar progresso.
 */
const BLOQUEADAS = ["/hoje/", "/cards/"];

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
    "Bingbot",
    "Applebot",
    "Applebot-Extended",
    "CCBot",
  ];

  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: BLOQUEADAS },
      ...permitidos.map((agente) => ({ userAgent: agente, allow: "/", disallow: BLOQUEADAS })),
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
