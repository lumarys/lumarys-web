import { EMPRESA } from "./company";

export const SITE = {
  nome: "Lumarys",
  url: "https://lumarys.com.br",
  descricao:
    "Trilhas de estudo para as provas, sabatinas e certificações que as empresas pedem. Vídeo em português, explicação, recall espaçado e simulado no formato real.",
  locale: "pt_BR",
} as const;

/** Organization + WebSite. A Lumarys é uma marca da Cernyn, e o schema diz isso. */
export function jsonLdOrganizacao() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE.url}/#organizacao`,
        name: SITE.nome,
        url: SITE.url,
        slogan: EMPRESA.tagline,
        description: SITE.descricao,
        parentOrganization: { "@id": "https://cernyn.com/#organizacao" },
      },
      {
        "@type": "Organization",
        "@id": "https://cernyn.com/#organizacao",
        name: EMPRESA.controladora,
        legalName: EMPRESA.controladora,
        url: EMPRESA.controladoraUrl,
        taxID: EMPRESA.cnpj,
        address: {
          "@type": "PostalAddress",
          streetAddress: "Rua Dona Francisca, 8300",
          addressLocality: "Joinville",
          addressRegion: "SC",
          postalCode: "89219-600",
          addressCountry: "BR",
        },
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer support",
          email: `${EMPRESA.contatoUsuario}@${EMPRESA.contatoDominio}`,
        },
      },
      {
        "@type": "WebSite",
        "@id": `${SITE.url}/#site`,
        url: SITE.url,
        name: SITE.nome,
        inLanguage: "pt-BR",
        publisher: { "@id": `${SITE.url}/#organizacao` },
      },
    ],
  };
}

/**
 * `alternates` completo de uma rota: canônica, hreflang pt-BR (único idioma,
 * declarado mesmo assim, com x-default apontando para a mesma URL) e, nos
 * temas, o link para a versão Markdown que o gen-seo escreve ao lado do HTML.
 */
export function alternativas(url: string, opcoes: { markdown?: boolean } = {}) {
  return {
    canonical: url,
    languages: { "pt-BR": url, "x-default": url },
    ...(opcoes.markdown ? { types: { "text/markdown": `${url}index.md` } } : {}),
  };
}

export function jsonLdBreadcrumb(itens: { nome: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: itens.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.nome,
      item: `${SITE.url}${item.url}`,
    })),
  };
}

export function JsonLd({ dados }: { dados: object }) {
  return (
    <script
      type="application/ld+json"
      // Conteúdo próprio, gerado em build a partir do frontmatter validado.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(dados).replace(/</g, "\\u003c") }}
    />
  );
}
