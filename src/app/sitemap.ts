import type { MetadataRoute } from "next";

import { listarTrilhas, todasAsRotasDeTema } from "@/lib/content";
import { SITE } from "@/lib/seo";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const agora = new Date();

  const estaticas = ["/", "/trilhas/", "/metodo/", "/sobre/", "/contato/", "/privacidade/", "/termos/"].map(
    (rota) => ({
      url: `${SITE.url}${rota}`,
      lastModified: agora,
      changeFrequency: "monthly" as const,
      priority: rota === "/" ? 1 : 0.6,
    }),
  );

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
  ]);

  const temas = todasAsRotasDeTema().map((r) => ({
    url: `${SITE.url}/trilhas/${r.trilha}/${r.modulo}/${r.tema}/`,
    lastModified: agora,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [...estaticas, ...trilhas, ...temas];
}
