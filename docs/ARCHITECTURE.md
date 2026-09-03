# Arquitetura

## Visão geral

```
navegador  ──▶  CloudFront  ──▶  S3 (site estático)
    │              └─ função de borda: www→apex, /x/ → /x/index.html
    │              └─ política de cabeçalhos: CSP, HSTS, Permissions-Policy
    │
    ├──▶  Cognito (código por e-mail, sem senha)  ──▶  SES (domínio verificado)
    │
    └──▶  api.lumarys.com.br (HTTP API)
              └─ autorizador JWT do Cognito
              └─ Lambda progresso-api  ──▶  DynamoDB (pk = u#<sub>)
```

## Onde cada coisa mora

**Conteúdo** (`content/`) é dado, não código. O schema zob valida no build; a
interface só renderiza. Um tema é único por slug e pode ser referenciado por
mais de uma trilha — Big Data cai em Engenharia de Dados e em Engenharia de
Analytics, e existe uma vez só.

**Progresso** tem duas camadas. `src/lib/storage.ts` é a verdade no dispositivo;
a API é uma cópia sincronizada. A mesclagem é por item, com regra de não
regressão, porque estudar no celular e no computador no mesmo dia é o caso
normal, não a exceção.

**Prontidão** (`src/lib/readiness.ts`) combina quatro sinais com pesos
diferentes. O peso maior é do simulado oral porque é o formato real da prova; a
cobertura pesa pouco de propósito, para que marcar tudo como concluído não
produza sensação de estar pronto.

**Repetição espaçada** (`src/lib/srs.ts`) é Leitner com 1, 3, 7 e 12 dias,
intervalos curtos por causa do prazo de duas semanas da primeira trilha. A fila
do dia intercala temas em vez de agrupar.

## Decisões que já foram tomadas

Leia os ADRs: [stack](adr/0001-stack.md),
[conteúdo em MDX](adr/0002-conteudo-mdx.md),
[progresso no dispositivo](adr/0003-sem-backend-v1.md).

## Fronteiras de segurança

1. **A borda** aplica CSP sem `unsafe-inline` para script, HSTS com preload e
   `Permissions-Policy` que libera microfone só para a própria origem (o
   simulado oral).
2. **O autorizador JWT** valida o token antes de a Lambda rodar. A Lambda deriva
   o usuário só do `sub`; não existe caminho para operar na partição de outro.
3. **O papel do GitHub Actions** tem `sub` preso ao ambiente `production`, não
   ao repositório. Branch e pull request não publicam.
4. **O conteúdo** passa por allowlist de componentes MDX e de domínios de
   artigo. MDX executa código, e conteúdo é a porta mais provável de PR externo.

## O que o CI faz e o que não faz

Faz: lint, tipos, testes, lint de conteúdo, build, verificação de vídeos e
links, gitleaks e auditoria de dependências. Em `main`, publica o site e o
código da Lambda.

Não faz: `terraform apply`. Infra muda por gente, depois de ler o plan.
