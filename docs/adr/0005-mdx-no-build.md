# ADR 0005 — MDX compilado no build, não em tempo de execução

Data: 2026-09-04 · Status: aceito · Substitui parte do ADR 0002

## Contexto

Os temas nasceram usando `next-mdx-remote`, que compila o MDX a cada
renderização. Duas coisas apareceram no CI:

1. A versão 5 carrega um aviso de segurança **alto**: execução de código
   arbitrário ao renderizar MDX não confiável no servidor. O `npm audit`
   reprova o build.
2. A versão 6, que corrige o aviso, troca avaliação por compilação e deixa de
   passar as props dos componentes. Na prática, `<Comparativo colunas={[...]}>`
   chegava com `colunas` indefinido e todo tema quebrava no prerender.

Ficaríamos entre um aviso de segurança aberto e conteúdo quebrado.

## Decisão

Sair do `next-mdx-remote` e compilar MDX no build com `@next/mdx`.

O conjunto de temas é fechado no build (`generateStaticParams` já os enumera),
então `scripts/gen-seo.mjs` gera `content/temas/corpos.generated.ts`, um mapa de
slug para `import()` do `.mdx`. A página do tema carrega o módulo já compilado.
O `remark-frontmatter` impede o bloco YAML de virar texto na página; o
frontmatter continua sendo lido e validado pelo zod no servidor.

## Por quê

- **O aviso deixa de existir**, em vez de ser justificado. Nosso MDX é de
  primeira parte e revisado, então o aviso não se aplicava ao nosso modelo de
  ameaça — mas manter `npm audit` vermelho ensina o time a ignorar o `npm
  audit`, e esse é o custo real.
- **Não há compilação por requisição.** Site estático não deveria compilar nada
  em tempo de execução.
- **`@next/mdx` é o caminho oficial** do Next para MDX, mantido junto com o
  framework.

## Consequências

- `corpos.generated.ts` é gerado, entra no `.gitignore` e nasce no `prebuild`.
  Quem clonar e rodar `npm run dev` sem `prebuild` verá o arquivo faltando; o
  `npm run build` sempre gera.
- O Turbopack serializa as opções do loader, então plugins remark entram pelo
  **nome do pacote**, não pela função importada.
- `@mdx-js/react` **não** é instalado: ele usa contexto de React e quebra em
  componente de servidor. Os componentes da allowlist são passados por prop.
- `tema.corpo` (texto cru) continua existindo, mas só alimenta o
  `llms-full.txt` e a versão Markdown de cada tema. A página não usa mais.
