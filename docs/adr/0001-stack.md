# ADR 0001 — Site estático em Next.js com export

Data: 2026-09-03 · Status: aceito

## Contexto

Precisamos publicar uma plataforma de estudo mobile-first, pública, indexável
por buscadores e por agentes de IA, com prazo curto (o primeiro aluno tem prova
em duas semanas) e custo perto de zero em baixa escala.

## Decisão

Next.js 16 com `output: "export"`, servido como arquivos estáticos em S3 atrás
do CloudFront. Sem servidor de aplicação.

## Por quê

- **Custo e operação.** Arquivo estático em CDN não tem servidor para escalar,
  atualizar nem monitorar. O que sobra de operação é DNS e cache.
- **Desempenho.** O conteúdo é conhecido no build; renderizar por requisição não
  traria nada e custaria latência.
- **SEO.** Página completa no HTML, sem depender de execução de JavaScript, é o
  que buscador e agente de IA leem melhor.
- **Segurança.** Sem servidor de aplicação, some uma classe inteira de risco. A
  única superfície dinâmica é a API de progresso, pequena e isolada.

## Consequências

- Todo conteúdo precisa existir em build. Publicar um tema exige um deploy —
  aceitável, já que o deploy leva poucos minutos.
- O progresso do aluno é resolvido no cliente, com sincronização opcional pela
  API. É o que permite estudar sem conta.
- Rota dinâmica exige `generateStaticParams`; não existe página gerada sob
  demanda.
