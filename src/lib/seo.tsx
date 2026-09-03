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
