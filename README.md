# Lumarys

**Life long Learning 4 Ever.** Trilhas de estudo para as provas, sabatinas e
certificações que as empresas pedem. Cada trilha parte de uma ementa oficial e
vira estudo ativo: vídeo em português, explicação própria, repetição espaçada e
simulado no formato real da prova.

Site: [lumarys.com.br](https://lumarys.com.br) · Marca da
[Cernyn](https://cernyn.com/).

**Stack:** Next.js 16 com `output: "export"` · TypeScript · Tailwind 4 · MDX
**Infra:** S3 + CloudFront + Route 53 · Cognito (login sem senha) + API Gateway
+ Lambda + DynamoDB · tudo em Terraform
**Deploy:** GitHub Actions com OIDC, sem chave de acesso guardada

## Rodar localmente

```bash
npm install
npm run dev          # http://localhost:3000
```

Não precisa de variável de ambiente para estudar: sem as chaves do Cognito o
site funciona em modo convidado, guardando o progresso no navegador.

Para exercitar o login localmente, crie `.env.local`:

```env
NEXT_PUBLIC_API_URL=https://api.lumarys.com.br
NEXT_PUBLIC_COGNITO_USER_POOL_ID=<saída do terraform>
NEXT_PUBLIC_COGNITO_CLIENT_ID=<saída do terraform>
```

## Comandos

| Comando | O que faz |
| --- | --- |
| `npm run check` | lint, tipos, testes e lint de conteúdo — rode antes de abrir PR |
| `npm run build` | gera o site estático em `out/` (o `prebuild` gera `llms.txt` e afins) |
| `npm test` | testes de repetição espaçada, mesclagem de progresso e prontidão |
| `npm run verify:videos` | confere no YouTube que todo vídeo citado ainda existe |
| `npm run verify:links` | confere os artigos e a allowlist de domínios |
| `npm run content:lint` | regras de conteúdo que o schema não pega |
| `node scripts/video-info.mjs <id>` | canal, duração e título de um vídeo, para preencher um tema |

## Estrutura

```
content/          conteúdo editorial, sem código de UI
  types.ts        schema zod que valida todo tema no build
  trilhas/        que módulos e temas cada trilha tem, e o cronograma
  temas/          um .mdx por tema: frontmatter + explicação
  prompts/        prompts prontos para colar em uma IA
src/
  app/            só rotas e layouts
  features/       uma pasta por funcionalidade (tema, cards, simulado, plano…)
  components/     ui/ (primitivos), mdx/ (allowlist do conteúdo), layout/
  lib/            srs (Leitner), storage (progresso), readiness (prontidão), seo
services/
  progress-api/   Lambda que sincroniza o progresso entre aparelhos
infra/            Terraform; apply é humano, o CI nunca roda terraform
scripts/          verificação de conteúdo, geração de SEO, empacotamento
docs/             arquitetura, guia de conteúdo e decisões (ADR)
```

## Escrever conteúdo

Leia [docs/CONTENT-GUIDE.md](docs/CONTENT-GUIDE.md) e copie
`content/temas/big-data.mdx`, que é o modelo. Regra que não se negocia: nenhum
vídeo entra sem passar por `node scripts/video-info.mjs`.

## Deploy

`main` publica sozinho. O papel da AWS é assumido por OIDC e está restrito ao
ambiente `production`, então nenhum branch nem pull request consegue publicar.

Infra muda por `terraform apply` rodado por gente, nunca pelo CI. Antes de todo
apply, **revise o plan procurando qualquer mudança em registro MX ou TXT**: a
zona `lumarys.com.br` recebe e-mail pelo Zoho, com registros criados fora do
Terraform.

## Licença

Código sob [MIT](LICENSE). Conteúdo editorial (explicações, exercícios,
perguntas e rubricas) sob [CC BY-NC-SA 4.0](LICENSE-CONTENT).

## Segurança

Encontrou uma falha? [SECURITY.md](SECURITY.md).
