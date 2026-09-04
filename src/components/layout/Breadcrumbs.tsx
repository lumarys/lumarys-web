import Link from "next/link";

import { JsonLd, jsonLdBreadcrumb } from "@/lib/seo";

export type Migalha = { nome: string; url: string };

/**
 * Trilha de navegação visível, com o BreadcrumbList correspondente no JSON-LD.
 *
 * Na tela, a página atual não aparece (o h1 logo abaixo já a nomeia) e "Início"
 * também não, porque a marca no cabeçalho e a aba Hoje já fazem esse papel.
 * No dado estruturado a lista vai inteira, que é o que o buscador espera.
 */
export function Breadcrumbs({ itens, className }: { itens: Migalha[]; className?: string }) {
  const visiveis = itens.slice(1, -1);

  return (
    <>
      {visiveis.length > 0 ? (
        <nav aria-label="Você está em" className={className}>
          <ol className="flex list-none flex-wrap items-center gap-x-1 p-0 text-xs text-[var(--muted)]">
            {visiveis.map((item, i) => (
              <li key={item.url} className="flex min-w-0 items-center gap-x-1">
                <Link
                  href={item.url}
                  className="inline-flex min-h-11 max-w-[42vw] items-center truncate no-underline hover:text-[var(--text-2)] sm:max-w-none"
                >
                  {item.nome}
                </Link>
                {i < visiveis.length - 1 ? <span aria-hidden="true">›</span> : null}
              </li>
            ))}
          </ol>
        </nav>
      ) : null}
      <JsonLd dados={jsonLdBreadcrumb(itens)} />
    </>
  );
}
