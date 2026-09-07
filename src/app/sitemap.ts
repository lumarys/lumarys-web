import type { MetadataRoute } from "next";

import { listarTrilhas, rotasCanonicasDeTema } from "@/lib/content";
import { SITE } from "@/lib/seo";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const agora = new Date();

  const estaticas = [
    "/",
    "/trilhas/",
    "/simulado/",
    "/metodo/",
    "/sobre/",
    "/contato/",
    "/privacidade/",
    "/termos/",
  ].map((rota) => ({
    url: `${SITE.url}${rota}`,
    lastModified: agora,
    changeFrequency: "monthly" as const,
    priority: rota === "/" ? 1 : 0.6,
  }));

  const trilhas = listarTrilhas().flatMap((t) => [
    {
      url: `${SITE.url}/trilhas/${t.slug}/`,
      lastModified: agora,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    },
    {
      url: `${SITE.url}/trilhas/${t.slug}/plano/`,
      lastModified: agora,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    },
    // O glossário é a porta de entrada de busca de cauda longa ("o que é
    // particionamento de dados"), e o resumo é a folha de véspera.
    {
      url: `${SITE.url}/trilhas/${t.slug}/glossario/`,
      lastModified: agora,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
    ...t.modulos.map((m) => ({
      url: `${SITE.url}/trilhas/${t.slug}/${m.slug}/resumo/`,
      lastModified: agora,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ]);

  // Só a rota canônica de cada tema: um tema compartilhado por duas trilhas
  // tem duas URLs, e listar as duas seria declarar conteúdo duplicado.
  const temas = rotasCanonicasDeTema().map((r) => ({
    url: `${SITE.url}/trilhas/${r.trilha}/${r.modulo}/${r.tema}/`,
    lastModified: agora,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [...estaticas, ...trilhas, ...temas];
}
