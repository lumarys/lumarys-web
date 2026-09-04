<!-- Migrado de ~/.claude/plans em 04/09/2026 (LUM-55). Sem IDs de conta nem de hosted zone. -->

> **Plano aprovado em 03/09/2026.** Este documento é a referência do que foi
> decidido e por quê; o acompanhamento do que está feito vive no
> [board do Notion](https://app.notion.com/p/5644ebef4018487db090e3c0e26c89b2),
> lido pelo agente segundo o
> [protocolo da fila](https://app.notion.com/p/3d031d9588a681c3ad05fb6c40c40db9).
> Os números de seção (§2.1, §11…) são citados nos cards do board.

# Plano: Lumarys — plataforma de trilhas de estudo para provas, sabatinas e certificações

## Contexto

O usuário tem sabatina de Engenharia de Dados no Itaú em ~2 semanas. A **Lumarys** (lumarys.com.br) nasce como site de estudos **mobile-first para profissionais**, organizado em **trilhas** derivadas do que empresas e certificadoras exigem. Método de estudo baseado nos 9 princípios de **Ultraaprendizado** (Scott Young) + práticas com evidência (recuperação, espaçamento, intercalação). Vídeos do YouTube só em **PT-BR**, explicações próprias, links para artigos.

Trilhas iniciais:
1. **Carreira · Engenharia de Dados (Itaú)** — prioridade; 17 artigos oficiais + Databricks + módulo "Além da ementa" **completo antes da sabatina** (decisão do usuário).
2. **Carreira · Engenharia de Analytics (Itaú)** — módulo Big Data recebido (13 de 17 itens); AWS, Banco de dados, Programação, DevOps, Dataviz, Data Mesh pendentes de ementa.
3. **Certificação · AWS Cloud Practitioner (CLF-C02)**, **Solutions Architect Associate (SAA-C03)** e **Solutions Architect Professional (SAP-C02)** — códigos confirmados nas páginas oficiais da AWS em 03/09/2026 (o "SAA-C04" citado em blogs não existe oficialmente).

Situação verificada (inalterada): hosted zone `lumarys.com.br` (na conta AWS da Cernyn) só com MX/SPF/DKIM do Zoho — **não tocar**; OIDC do GitHub já existe na conta; Terraform 1.13.5, Node 24, `gh` como `vieiradiego`; org GitHub `lumarys` não existe. O usuário autorizou criá-la; porém o token do `gh` não tem escopo `admin:org` e o GitHub.com não expõe endpoint de criação de organização (só o Enterprise Server). Na execução: (1) `gh auth refresh -s admin:org` e tentativa via `gh api`; (2) se o GitHub.com recusar, o usuário cria a org em github.com/organizations/plan (1 minuto) e o repo é criado direto em `lumarys/lumarys-web`; (3) só se nada disso ocorrer a tempo, o repo nasce em `vieiradiego/lumarys-web` e é transferido (role OIDC já aceita os dois `sub`). Referências: `~/Projects/youco-io/youco-web` (Next 16 export + Tailwind 4; `deploy.yml` OIDC + `s3 sync`), `youco-io-core/infra/hosting-app.tf`, `youco-io-neo/infra/github-oidc.tf`.

Decisões tomadas: PT-BR · landing na raiz + `/trilhas/<slug>/` · estado Terraform em bucket novo `lumarys-terraform-state` · **sem analytics de produto por enquanto** · **só CI no PR + prod no `main`** · extras completos antes da sabatina · **projeto público (open source)** · **org GitHub `lumarys` criada manualmente pelo usuário após a identidade visual** (até lá, desenvolvimento local; o primeiro push vai direto para `lumarys/lumarys-web`) · **login sem senha por código de e-mail (Cognito) com sincronização de progresso** (§12) · **Entrega 1 = MVP restrito à trilha de Engenharia de Dados + progresso salvo** (§10); Analytics, certificações AWS e os recursos de engajamento avançados ficam para as entregas seguintes.

---

## 1. Produto e design

**Marca**: **Lumarys — Life long Learning 4 Ever** (tagline oficial, definido pelo usuário). A marca é sobre aprendizado contínuo ao longo da carreira; as trilhas de prova/sabatina/certificação são a porta de entrada, e o histórico de trilhas concluídas compõe a "jornada" do profissional. O tagline aparece no logo/hero da landing, no `<title>` e `description` padrão, no OG image e no `manifest`; a abreviação **LL4E** pode ser usada como selo/monograma. Tom de voz: direto, encorajador, sem infantilizar.

**Posicionamento**: "Estude do jeito que a prova cobra, e continue aprendendo depois dela." Cada trilha parte da ementa oficial (empresa ou certificadora) e vira estudo ativo: vídeo → explicação → recall → drill → simulado no formato real (oral para sabatina; múltipla escolha cronometrada para certificação). Ao concluir uma trilha, o site sugere a próxima da jornada (ex.: Eng. Dados → CLF-C02 → SAA-C03).

**Catálogo** com duas categorias na landing: *Carreiras* (por empresa) e *Certificações* (por provedor). Cada trilha mostra origem, formato da prova, tempo estimado, progresso e "prontidão".

**Design system** (Tailwind 4 `@theme`): dark-first, acento âmbar sobre azul-profundo, neutros quentes; Inter; base 16px, títulos 22–28px; toque ≥ 44px; sem scroll horizontal; `prefers-color-scheme`. Componentes: `AppShell` (header compacto + tab bar Hoje / Trilha / Cards / Simulado), `TrilhaCard`, `ModuloAccordion`, `TemaHeader`, `VideoEmbed` (facade), `Callout`, `Comparativo`, `Flashcard`, `Quiz` (única/múltipla resposta/oral), `Drill`, `Rubrica`, `PomodoroTimer`, `ProgressRing`, `ReadinessScore`, `CopyPromptButton`, `ShareCard`.

**Etapa de design antes do código**: canvas com a skill `design` (artboards: landing/catálogo, Hoje, trilha, tema, simulado oral, simulado certificação) → aprovação → tokens viram `@theme`.

### 1.1 Briefing de marca e branding (base: "Lumarys — Life long Learning 4 Ever")

- **Naming**: *Lumarys* evoca *lumen/luz* (clareza, iluminar o caminho) com sonoridade de nome próprio, memorável e registrável; o sufixo "-arys" dá ar de constelação/rota (ex.: Antares, Polaris). Leitura da marca: "a luz que guia o aprendizado ao longo da carreira".
- **Tagline**: **Life long Learning 4 Ever** (grafia oficial do usuário); monograma **LL4E**. Uso: hero da landing, rodapé, OG image, manifest, assinatura de e-mail Zoho, capa de LinkedIn.
- **Propósito**: tornar o aprendizado contínuo viável para quem trabalha, em sessões curtas e com método.
- **Missão**: transformar ementas oficiais (empresas e certificadoras) em trilhas de estudo ativo que preparam para a prova e ficam como base de carreira.
- **Visão**: ser o lugar onde profissionais brasileiros voltam a cada nova etapa da carreira (sabatina, certificação, mudança de área).
- **Valores**: método com evidência (recuperação, espaçamento, feedback); clareza sobre hype; respeito ao tempo do aluno; conteúdo honesto (fontes citadas, nada de dumps); acessível no celular.
- **Público**: profissionais de tecnologia e dados em transição de carreira, prova interna ou certificação; estudam à noite/no deslocamento; querem saber "o que cai" e "quão pronto estou".
- **Promessa**: "Você sabe exatamente o que estudar hoje e o quão pronto está."
- **Personalidade**: mentor experiente e direto; encorajador sem ser infantil; preciso, sem jargão desnecessário. **Tom de voz**: 2ª pessoa, frases curtas, verbos de ação, português do Brasil; nunca prometer aprovação; celebrar progresso com fatos ("3 módulos, 71% de prontidão").
- **Identidade visual**: conceito do logo = símbolo de luz/rota (ponto luminoso + arco de trajetória, ou "L" que vira feixe); versões horizontal, empilhada e monograma LL4E; funciona em 24px (favicon/ícone PWA) e monocromático. Paleta: azul-profundo (base), âmbar (luz/ação), neutros quentes, verde para acerto e vermelho para erro com contraste AA; dark-first com par claro. Tipografia: Inter (UI) + uma display geométrica para títulos de marca. Iconografia linear, cantos arredondados, elevação sutil. Motion: transições curtas (150–250 ms), animação de "acender" ao concluir tema/trilha.
- **Aplicações**: site (landing, trilhas, cards de conquista compartilháveis), OG images por trilha, avatar/capa LinkedIn e Instagram, certificado de conclusão de trilha (PDF gerado no cliente), assinatura de e-mail, favicon/ícones PWA.
- **Entregáveis da Fase 0 (canvas `design`)**: artboard de marca (logo, variações, monograma, paleta com tokens, escala tipográfica, ícones, exemplos de tom de voz) + os 6 artboards de telas; após aprovação, exportar tokens para `@theme` e assets para `public/`.
- **Não fazer**: visual "gamificado infantil", gradientes neon, promessas de aprovação, uso de logos/marcas das empresas e certificadoras como se fossem parceiras (citar apenas como origem da ementa, com texto).

### 1.2 Empresa responsável e rodapé (padrão Cernyn)

A Lumarys é uma marca da **Cernyn** (cernyn.com, Consultoria Biônica de Engenharia Digital, Joinville-SC). O rodapé segue o mesmo padrão dos sites cernyn.com e youco.io (`cernyn-web/src/App.tsx` linhas 47–87 e `youco-web/src/app/page.tsx` linhas 796–806), com constantes em `src/lib/company.ts`:

```
Lumarys  © {ano} by Cernyn  (link https://cernyn.com/, target _blank, rel noopener noreferrer)
CNPJ: 65.962.788/0001-62
Rua Dona Francisca, 8300 · Zona Industrial Norte · Joinville-SC · CEP 89219-600
[selo] Sediada no Ágora Tech Park   (role="img", aria-label "Cernyn é sediada no Ágora Tech Park")
Links: Política de Privacidade (/privacidade) · Termos (/termos) · Método · Contato
```

- **Contato**: a Lumarys **não tem e-mail** hoje (o domínio tem MX do Zoho, mas nenhuma caixa). Todo contato usa `pinus@cernyn.com` (constante `CONTACT_EMAIL`, mesma do cernyn-web), renderizado com o padrão anti-bot dos outros sites (montagem do `mailto:` no clique, nunca no HTML). Página `/contato` explica: "Lumarys é uma marca da Cernyn; fale com a gente pelo e-mail da Cernyn". Um e-mail próprio da marca fica como melhoria futura, sem dependência para o lançamento.
- **Página "Sobre"** (`/sobre`): o que é a Lumarys, tagline, relação com a Cernyn (1 parágrafo, com link), autoria e política editorial (E-E-A-T).
- **Dados estruturados**: `Organization` da Lumarys com `parentOrganization` → `Organization` Cernyn (`legalName`, `url`, `taxID` = CNPJ, endereço em Joinville, `contactPoint` `pinus@cernyn.com`), no mesmo formato do JSON-LD de `youco-web/src/app/layout.tsx` linhas 115–131.
- **Política de privacidade e termos** nomeiam a Cernyn como controladora (LGPD), com o CNPJ e o canal de contato do encarregado; base para o `PRIVACY`/`/termos` já previstos na §2.
- **Componente**: `SiteFooter` em `src/components/layout/`, renderizado em todas as páginas pelo `AppShell`, com versão compacta no mobile (endereço e CNPJ em 11px, mesmo estilo dos demais sites).

## 2. Estrutura do projeto (padrão de mercado)

Repo `lumarys-web` em `~/Projects/lumarys/lumarys-web`. Um único app Next.js; ADR registra que vira monorepo (`apps/`, `packages/`) quando surgir API.

```
lumarys-web/
  .github/{workflows/{ci,deploy}.yml, ISSUE_TEMPLATE/, PULL_REQUEST_TEMPLATE.md, dependabot.yml, CODEOWNERS}
  docs/{ARCHITECTURE.md, CONTENT-GUIDE.md, adr/0001-stack.md, adr/0002-conteudo-mdx.md, adr/0003-sem-backend-v1.md}
  content/
    trilhas/*.ts                 # Trilha tipada: módulos → slugs de temas; metadados da prova
    temas/<slug>.mdx             # frontmatter (zod) + corpo com componentes MDX
    questoes/<trilha>/*.ts       # bancos de questões de simulado (certificações)
    prompts/*.md                 # prompts p/ IA (tutor, sabatina)
  src/
    app/                         # só rotas/layouts (thin)
    features/{catalogo,trilha,tema,flashcards,simulado,plano,foco,hoje,metodo}/  # componentes+hooks+lib por feature
    components/{ui,mdx}/         # primitivos (Button, Card, Sheet, Tabs, Progress) e componentes MDX
    lib/{content,srs,storage,readiness,share,tts,utils}.ts
    styles/globals.css
    types/
  scripts/{verify-videos.mjs, verify-links.mjs, content-lint.mjs, bundle-lambda.mjs}
  services/progress-api/         # Lambda (TS, esbuild → lambda.zip, padrão youco-io-neo/scripts/bundle-lambda.mjs)
  tests/{unit,e2e}/              # Vitest + Testing Library; Playwright (viewports Pixel 7 / iPhone 15)
  infra/{bootstrap,}/            # Terraform (site + auth + api; apply humano, nunca pelo CI)
  LICENSE (MIT para código) · LICENSE-CONTENT (CC BY-NC-SA 4.0 para conteúdo) · SECURITY.md · PRIVACY (política em /privacidade)
  public/{manifest.webmanifest, icons/, og/}
  .editorconfig .nvmrc .prettierrc eslint.config.mjs tsconfig.json vitest.config.ts playwright.config.ts
  commitlint.config.js lefthook.yml README.md CONTRIBUTING.md LICENSE
```

- **Conteúdo**: MDX por tema (`next-mdx-remote/rsc` + `gray-matter`), frontmatter validado por **zod** em build (`src/lib/content.ts`); `content-lint` falha o build se faltar pré-teste, ≥8 flashcards, ≥3 perguntas de simulado, vídeo verificado ou artigo quebrado.
- **Qualidade**: TS `strict` + `noUncheckedIndexedAccess`; ESLint (next + `jsx-a11y`) + Prettier; Vitest para `srs`, `readiness`, `storage`, schema de conteúdo; Playwright smoke mobile (abrir tema, virar card, concluir quiz, persistência); **Lefthook** + lint-staged; **Conventional Commits** + commitlint; Dependabot semanal; Lighthouse CI (`@lhci/cli`) com budget mobile ≥ 90 perf/a11y no PR.
- **CI (PR)**: lint → typecheck → unit → build → `verify-videos` + `verify-links` → e2e → Lighthouse. **Deploy (`main`)**: build → `s3 sync` (assets imutáveis; html/json `max-age=0, s-maxage=300`) → invalidação.
- **PWA**: `manifest` + service worker (**Serwist**) para leitura offline dos temas já visitados; `lang="pt-BR"`.
- **SEO**: ver §2.1 (requisito: ser encontrado organicamente por Google e por agentes de IA).

### 2.1 SEO completo — Google e agentes de IA

**Arquitetura indexável**
- Toda página de tema, trilha, glossário e método é HTML estático completo (sem conteúdo só via JS); URLs limpas com `trailingSlash`, canônica por página, `hreflang="pt-BR"`, breadcrumbs reais (`Início › Trilhas › Eng. de Dados › Spark › RDD`).
- Hierarquia de headings (1 `h1` por página), texto de explicação visível (não escondido em acordeões fechados), flashcards e quizzes renderizados com conteúdo textual no HTML (interatividade progressiva por cima).
- **Páginas long-tail**: `/glossario/<termo>/` (1 página por termo: "O que é particionamento de dados"), `/comparativos/<a>-vs-<b>/` (ETL vs ELT, Delta vs Iceberg, SQS vs SNS), `/certificacoes/<exame>/` (guia do exame, domínios, plano). São as buscas que profissionais fazem.
- Linkagem interna: tema → glossário → comparativo → trilha; "temas relacionados" e "próximo tema" em todas as páginas; sitemap HTML.

**Metadados e dados estruturados**
- Next Metadata API: `title` (padrão "<tema> | <trilha> · Lumarys"), `description` única por página, OG/Twitter cards com imagem gerada por trilha/tema (`opengraph-image.tsx`, como em youco-web).
- JSON-LD por tipo: `Organization` + `WebSite` (com `SearchAction`), `Course`/`LearningResource` (trilhas e temas, com `educationalLevel`, `timeRequired`, `teaches`), `BreadcrumbList`, `FAQPage` (pré-teste/perguntas frequentes do tema), `Quiz` (simulados), `DefinedTerm`/`DefinedTermSet` (glossário), `VideoObject` para vídeos embedados (título, canal, duração, thumbnail), `Person` (autor) para E-E-A-T.
- Página de autor/"sobre" com credenciais, política editorial e fontes citadas em cada tema (sinal de confiabilidade para Google e para LLMs).

**Descoberta por agentes de IA**
- `robots.txt` liberando explicitamente `GPTBot`, `ClaudeBot`, `Claude-SearchBot`, `PerplexityBot`, `Google-Extended`, `Bingbot`, `Applebot` (decisão consciente: queremos ser citados).
- `/llms.txt` (índice curto: o que é a Lumarys, trilhas, links canônicos) e `/llms-full.txt` (conteúdo integral em Markdown) gerados no build a partir do MDX — padrão já usado em `youco-web/public/`.
- Versão Markdown de cada tema em `/<url>/index.md` (content negotiation não é possível em S3; expor como link `alternate type="text/markdown"`).
- Feed Atom (`/feed.xml`) com novos temas e trilhas; respostas diretas no topo de cada tema ("Em uma frase: …") que facilitam citação.

**Performance e Core Web Vitals** (fator de ranking mobile): facade de vídeo (sem iframe até o clique), fontes self-hosted com `font-display: swap`, imagens AVIF/WebP com dimensões, sem CLS em cards/quizzes, JS mínimo por página (server components), Lighthouse CI com budget ≥ 90 perf/SEO/a11y/best-practices.

**Operação de SEO**
- Google Search Console e Bing Webmaster (verificação via registro TXT no Route 53 — Terraform), envio de sitemap, monitoramento de cobertura e Core Web Vitals.
- **IndexNow** no deploy (chave em `public/`, POST das URLs alteradas no workflow) para Bing/Yandex; ping de sitemap no Google.
- Conteúdo com data de atualização visível (`dateModified`), changelog por tema; títulos que espelham a pergunta do usuário ("O que é ETL vs ELT? Diferenças e quando usar cada um").
- Estratégia de palavras-chave PT-BR por trilha (buscas como "sabatina engenharia de dados", "simulado CLF-C02 português", "o que é lakehouse"); páginas de comparativo e glossário cobrem a cauda longa.
- Backlinks iniciais: LinkedIn (cards de conquista com link), artigos no Medium/dev.to apontando para os temas, comunidades PT-BR de dados.
- Sem analytics de produto por decisão; usar Search Console + logs do CloudFront como fonte de tráfego orgânico.
- **Docs**: README (rodar, estrutura, deploy), CONTENT-GUIDE (como escrever um tema, critérios de vídeo, rubrica), ADRs.

## 3. Modelo de conteúdo

```ts
Trilha { slug; tipo: "carreira"|"certificacao"; titulo; origem; objetivo; formatoProva; prazoSugeridoDias;
         modulos: Modulo[]; cronograma: Dia[]; exame?: { codigo; minutos; questoes; notaCorte; preco; dominios: {nome; peso}[] } }
Modulo { slug; titulo; status: "disponivel"|"em-breve"; oficial: boolean; temas: slug[]; dominioExame?: string }
Tema (frontmatter) { slug; titulo; minutos; porQue; nivel; preTeste[3]; videos[{id,titulo,canal,duracao,porQue}];
         artigos[{titulo,url,fonte}]; flashcards[8–12]; drills[]; perguntas[{tipo:"oral"|"unica"|"multipla"; enunciado;
         opcoes?; corretas?; respostaModelo; explicacao; rubrica?}]; feynman; errosComuns[]; comoCai: string }
```
Temas são compartilhados entre trilhas (ex.: Big Data aparece nas duas trilhas Itaú; IAM/VPC/S3 aparecem nas três AWS com profundidade marcada por `nivel`).

## 4. Ementas

### 4.1 Carreira · Engenharia de Dados (Itaú)
**Oficial (8 módulos, 18 temas)**: Fundamentos (Big Data 3→5 Vs; OLAP/OLTP/ETL/DW; Data Centric vs Data Driven) · Hadoop (HDFS/YARN; MapReduce) · Processamento (batch vs stream; ETL vs ELT; particionamento) · Spark (introdução; RDD/transformações/ações/narrow-wide/DataFrame) · Camada de dados (zonas do Data Lake) · Databricks (Lakehouse, Delta Lake, medallion, Unity Catalog, Workflows, Auto Loader) · Tipos de dados (classificação; XML; JSON) · Qualidade (governança; Data Quality).

**Além da ementa (módulo 9, completo, marcado `oficial: false`)** — ver §5 para justificativa:
1. SQL para engenharia de dados: joins, agregações, CTEs, window functions, plano de execução, índices
2. Modelagem: normalização (3NF), dimensional (Kimball: fato/dimensão, star/snowflake, SCD 1/2), Data Vault (noções)
3. Formatos e armazenamento: Parquet/ORC/Avro vs CSV/JSON, compressão, colunar vs linha, formatos de tabela (Delta vs Iceberg vs Hudi)
4. Spark avançado: DataFrame/Spark SQL, Catalyst, shuffle, repartition/coalesce, broadcast, skew, cache/persist, Structured Streaming, PySpark
5. Orquestração: Airflow (DAG, idempotência, retries, backfill), Databricks Workflows
6. Ingestão e CDC: incremental, upsert/merge, Debezium, Kafka (tópicos, partições, consumer groups, offsets, garantias de entrega), Kinesis
7. Arquiteturas: Lambda vs Kappa, Data Mesh (4 princípios, data products, contratos de dados), Lakehouse vs DW vs Lake, Source of Record vs Source of Truth
8. AWS para dados: S3, Glue (catálogo/jobs), Athena, EMR, Redshift, Lake Formation, Step Functions, Lambda, IAM básico
9. Segurança e privacidade bancária: LGPD, PII, anonimização/pseudonimização/tokenização, mascaramento, criptografia, RBAC/ABAC, auditoria
10. DataOps e observabilidade: testes de dados (Great Expectations/dbt tests), linhagem, SLAs, monitoramento, reprocessamento, CI/CD para pipelines, IaC, Docker
11. Custo e performance: particionamento/Z-order, tamanho de arquivo, cluster sizing, FinOps de dados
12. Como responder na sabatina: estrutura de resposta, trade-offs, perguntas de cenário, erros de comunicação

### 4.2 Carreira · Engenharia de Analytics (Itaú)
Big Data (disponível; = os 16 temas oficiais de Eng. de Dados + "Source of Record vs Source of Truth", conforme inferência em §5.2) · AWS, Banco de dados, Programação, DevOps, Dataviz, Data Mesh (sem itens na ementa recebida; construídos a partir da sugestão priorizada em §5.2, marcados `oficial: false` até o usuário validar) · "Além da ementa – Analytics" (dbt, camada semântica, modelagem para BI, estatística, reconciliação, LGPD, comunicação, como responder) · Feedback (link).

### 4.3 Certificação · AWS (ementa = guia oficial do exame; questões originais em estilo da prova, sem dumps)
| Trilha | Exame | Formato | Domínios (peso) |
|---|---|---|---|
| Cloud Practitioner | CLF-C02 | 65 questões · 90 min · corte 700 · USD 100 | Conceitos de nuvem 24% · Segurança e conformidade 30% · Tecnologia e serviços 34% · Cobrança, preços e suporte 12% |
| Solutions Architect Associate | SAA-C03 | 65 questões · 130 min · corte 720 · USD 150 | Arquiteturas seguras 30% · Resilientes 26% · Alto desempenho 24% · Otimizadas em custo 20% |
| Solutions Architect Professional | SAP-C02 | 75 questões · 180 min · corte 750 · USD 300 | Complexidade organizacional 26% · Novas soluções 29% · Melhoria contínua 25% · Migração e modernização 20% |

Cada domínio vira módulo; temas por serviço/conceito com `nivel` (fundamental/associate/professional). Recursos oficiais linkados por trilha: guia do exame (PDF), questões de exemplo, Skill Builder, FAQs, Well-Architected, whitepapers. Prazo sugerido: CLF 3 semanas · SAA 6–8 · SAP 10–12. Pré-requisito sugerido: SAA antes de SAP.

**Temas por domínio (ementa detalhada)**

*CLF-C02 (≈ 24 temas)*
- D1 Conceitos de nuvem: benefícios e modelos de nuvem; 6 pilares do Well-Architected; economia da nuvem (CapEx→OpEx, TCO, economia de escala); estratégias de migração (7 Rs) e Cloud Adoption Framework.
- D2 Segurança e conformidade: modelo de responsabilidade compartilhada; IAM (usuários, grupos, roles, políticas, MFA, root, Identity Center); conformidade (Artifact, Compliance Center); serviços de segurança (GuardDuty, Inspector, Shield, WAF, KMS, Macie, Security Hub, CloudTrail); criptografia em repouso e em trânsito.
- D3 Tecnologia e serviços: formas de operar (console, CLI, SDK, IaC); infraestrutura global (Regiões, AZs, edge, CloudFront, Route 53, Global Accelerator); computação (EC2 e famílias, Lambda, ECS/EKS/Fargate, Beanstalk, Lightsail); armazenamento (classes S3, EBS, EFS, FSx, Storage Gateway, Backup); rede (VPC, sub-redes, SG vs NACL, VPN, Direct Connect); bancos (RDS, Aurora, DynamoDB, Redshift, ElastiCache, Neptune, DocumentDB); IA/ML e analytics (SageMaker, Rekognition, Lex, Athena, Glue, QuickSight, Kinesis, EMR, Bedrock); integração (SQS, SNS, EventBridge, Step Functions); gestão (CloudFormation, CloudWatch, Config, Systems Manager, Trusted Advisor, Health).
- D4 Cobrança, preços e suporte: modelos de preço (On-Demand, Reserved, Savings Plans, Spot, Dedicated); Free Tier; ferramentas de custo (Cost Explorer, Budgets, CUR, Pricing Calculator); Organizations e faturamento consolidado; planos de suporte (Basic, Developer, Business, Enterprise On-Ramp, Enterprise); Marketplace e Partner Network.

*SAA-C03 (≈ 32 temas)*
- D1 Arquiteturas seguras: IAM avançado (políticas, condições, roles cross-account, federação, Identity Center, SCPs); segurança de VPC (SG, NACL, NAT, endpoints, PrivateLink); proteção de dados (KMS, criptografia S3/EBS/RDS, Secrets Manager, ACM, Macie); WAF/Shield/GuardDuty; segurança de aplicações e logs.
- D2 Arquiteturas resilientes: multi-AZ/multi-região; ELB e Auto Scaling; RDS Multi-AZ vs réplicas; Aurora; DynamoDB global tables; políticas de roteamento e failover do Route 53; replicação S3; desacoplamento (SQS, SNS, EventBridge); estratégias de DR (backup/restore, pilot light, warm standby, multi-site) com RTO/RPO.
- D3 Alto desempenho: seleção de armazenamento (classes S3, tipos EBS, EFS, FSx); computação (famílias EC2, Lambda, containers); caching (CloudFront, ElastiCache, DAX); seleção de banco por caso de uso; rede (Global Accelerator, Direct Connect, Transit Gateway); ingestão e transformação (Kinesis, Glue, Athena, EMR, Lake Formation).
- D4 Custo otimizado: modelos de preço; lifecycle e Intelligent-Tiering no S3; right-sizing; Spot e Savings Plans; custos de transferência (NAT, cross-AZ, egress); ferramentas de custo e tagging.

*SAP-C02 (≈ 36 temas)*
- D1 Complexidade organizacional: multi-conta (Organizations, Control Tower, SCPs, landing zones); IAM cross-account e federação corporativa; rede em escala (Transit Gateway, peering, Direct Connect gateway, Route 53 Resolver, PrivateLink); segurança e logs centralizados; alocação de custos.
- D2 Novas soluções: estratégias de deploy (blue/green, canary, CodeDeploy, StackSets); continuidade de negócio; controles de segurança; desempenho e confiabilidade (ELB, ASG, Aurora Global, DynamoDB); padrões (serverless, orientado a eventos, microsserviços, híbrido); API Gateway, Step Functions.
- D3 Melhoria contínua: excelência operacional (CloudWatch, X-Ray, Systems Manager, CloudTrail); reforço de segurança; otimização de desempenho (caching, bancos); confiabilidade (AWS Backup, testes de falha); revisões de custo (Compute Optimizer, Cost Explorer, Trusted Advisor).
- D4 Migração e modernização: 7 Rs; descoberta (Application Discovery Service, Migration Hub); serviços de migração (DMS, SCT, DataSync, Snow, Application Migration Service, Transfer Family); modernização (containers, serverless, bancos gerenciados, desacoplamento); migração de data lake.

Cada tema de certificação inclui: "o que o examinador quer ver", 2 cenários no estilo da prova com análise de cada alternativa, comparativos de serviços (ex.: SQS vs SNS vs EventBridge; EBS vs EFS vs FSx), e flashcards de limites/números que caem.

## 5. Revisão de conteúdo — lacunas detalhadas por trilha

Legenda de prioridade: **P1** alta probabilidade de cair / bloqueia entendimento · **P2** provável · **P3** complementar. Profundidade: *conceito* (saber explicar) · *aplicação* (resolver cenário) · *prática* (escrever código/SQL).

### 5.1 Engenharia de Dados (Itaú) — o que a ementa oficial cobre e o que falta

**Lacunas dentro dos temas oficiais** (ajustes nos 18 temas, não temas novos):
| Tema oficial | Falta | Como cai |
|---|---|---|
| Big Data | 5 Vs (veracidade, valor); Big Data ≠ ferramenta; quando NÃO usar | "Todo problema de dados é Big Data?" |
| OLAP/OLTP/ETL/DW | modelagem dimensional básica; DW vs Data Lake vs Lakehouse; camadas staging/ODS/DM | "Por que não fazer analytics direto no OLTP?" |
| Data Centric vs Driven | exemplos de decisão; relação com governança e cultura | "Como você tornaria um time data-driven?" |
| Hadoop | replicação HDFS, NameNode/DataNode, YARN; por que Hadoop perdeu espaço para cloud/object storage | "HDFS ainda faz sentido na AWS?" |
| MapReduce | shuffle, combiner, custo de I/O em disco vs Spark em memória | "Explique um word count e onde está o gargalo" |
| Batch x Stream | latência vs custo, micro-batch, event time vs processing time, watermark, exactly-once | "Fraude em tempo real: batch ou stream? Trade-offs" |
| ETL x ELT | onde a transformação roda, custo de compute, governança de dados brutos, quando cada um | "ELT em Lakehouse: riscos?" |
| Particionamento | por data vs por chave, small files, hot partitions, partition pruning, bucketing | "Como você particionaria transações de cartão?" |
| Spark introdução | driver/executors, DAG, lazy evaluation, jobs/stages/tasks, cluster manager | "O que acontece quando você chama `.count()`?" |
| Spark RDD | RDD é legado → DataFrame/Dataset; narrow vs wide; lineage e tolerância a falhas | "Quando ainda usaria RDD?" |
| Zonas do Data Lake | mapeamento zonas ↔ medallion; retenção; controle de acesso por zona; dados sensíveis na raw | "PII pode ficar na raw?" |
| Databricks | Delta (ACID, time travel, OPTIMIZE/Z-order, MERGE), Unity Catalog (linhagem, permissões), Jobs, Auto Loader, DLT, cluster vs serverless | "Por que Delta e não Parquet puro?" |
| Classificação de dados | estruturado/semi/não; qualitativo/quantitativo; nominal/ordinal/discreto/contínuo; impacto em modelagem | "Como armazenar e consultar dados semiestruturados?" |
| XML / JSON | schema (XSD/JSON Schema), aninhamento, evolução de schema, JSON no Spark (`explode`, schema inference) | "Como tratar JSON com schema variável?" |
| Governança | papéis (owner/steward/custodian), catálogo, linhagem, políticas, LGPD, classificação de dados | "Quem responde por um dado errado no relatório?" |
| Data Quality | 6 dimensões + testes automatizados, SLAs, quarentena, monitoramento | "Como você garantiria qualidade em um pipeline diário?" |

**Temas novos (módulo "Além da ementa", 12 temas)** — subtemas, profundidade e prioridade:
1. **SQL para dados** (P1, prática): joins e anti-joins; agregações; CTEs; window functions (`ROW_NUMBER`, `LAG`, running totals); dedup; `EXPLAIN`; índices; SQL no Spark/Athena. Drill: 10 exercícios com dataset bancário fictício.
2. **Modelagem de dados** (P1, aplicação): 3NF; Kimball (fato/dimensão, grão, star vs snowflake, SCD tipos 1/2/3, dimensões conformadas); Data Vault (hub/link/satellite, noções); One Big Table em Lakehouse.
3. **Formatos e tabelas** (P1, conceito→aplicação): CSV/JSON vs Avro vs Parquet/ORC; colunar, compressão, predicate pushdown; Delta vs Iceberg vs Hudi (ACID, time travel, schema evolution, compaction).
4. **Spark avançado** (P1, aplicação): DataFrame/Spark SQL; Catalyst e AQE; shuffle; `repartition` vs `coalesce`; broadcast join; skew; `cache`/`persist`; UDFs e por que evitar; Structured Streaming; PySpark idiomático.
5. **Orquestração** (P1, aplicação): Airflow (DAG, operadores, sensores, idempotência, retries, backfill, SLA); Databricks Workflows; Step Functions; dependências entre pipelines.
6. **Ingestão e CDC** (P1, conceito→aplicação): full vs incremental; watermark de ingestão; CDC (log-based, Debezium, DMS); upsert/MERGE; Kafka (tópicos, partições, consumer groups, offsets, retenção, garantias at-least/exactly-once); Kinesis.
7. **Arquiteturas de dados** (P1, conceito): Lambda vs Kappa; DW vs Lake vs Lakehouse; Data Mesh (domínios, data as a product, self-serve, governança federada, contratos de dados); Source of Record vs Source of Truth; modern data stack.
8. **AWS para dados** (P1, aplicação): S3 (classes, lifecycle, prefixos), Glue (catálogo, crawlers, jobs), Athena, EMR, Redshift (Spectrum, distribuição/sort keys), Lake Formation, Kinesis, Lambda, Step Functions, IAM para dados.
9. **Segurança e privacidade em banco** (P1, conceito→aplicação): LGPD (bases legais, direitos, DPO), PII/dados sensíveis, anonimização vs pseudonimização vs tokenização, mascaramento dinâmico, criptografia (KMS, em repouso/trânsito), RBAC/ABAC, row/column-level security, auditoria, retenção.
10. **DataOps e observabilidade** (P2, aplicação): testes de dados (Great Expectations, dbt tests, Deequ), contratos de schema, linhagem (OpenLineage), SLAs/SLOs de dados, alertas, reprocessamento idempotente, CI/CD de pipelines, IaC (Terraform), Docker, versionamento de dados.
11. **Custo e performance** (P2, aplicação): particionamento e ordenação (Z-order), tamanho ideal de arquivo, compaction, cluster sizing e autoscaling, Spot, FinOps de dados, cache de resultados.
12. **Como responder na sabatina** (P1, prática): estrutura contexto→opções→trade-offs→recomendação; perguntas de cenário; "não sei, mas raciocinaria assim"; erros de comunicação; simulação com gravação.

**Prioridade para as 2 semanas**: todos os P1 acima entram em D8–D11; P2 em D12–D13 em formato cheat-sheet + flashcards; aprofundamento de P2 e P3 (Data Vault, FinOps, Docker/IaC) pós-sabatina.

### 5.2 Engenharia de Analytics (Itaú) — revisão da ementa recebida e lacunas

**O que foi recebido**: trilha "Preparação para Prova – Engenharia de Analytics" (Hub de Dados e Analytics; coautores listados) com 8 módulos: Big Data, AWS, Banco de dados, Programação, DevOps, Dataviz, Data Mesh, Feedback. Só o módulo **Big Data** veio com itens: 13 dos 17 (2h17 no total).

**Os 13 itens recebidos**: Big Data · OLAP/OLTP/ETL · Data Centric vs Data Driven · Hadoop · MapReduce · Batch x Stream · ETL x ELT · Particionamento · Spark Introdução · Spark RDD · Zonas do Data Lake · **Source of Record vs Source of Truth** (artigo interno Itaú, 4 min) · Classificação de tipos de dados.

**Os 4 itens ausentes (inferência forte)**: a trilha de Eng. de Dados tem 16 itens únicos; os 13 acima cobrem 12 deles + SoR vs SoT. Os 4 que faltam para fechar 17 são exatamente os 4 da trilha de Dados que não aparecem aqui: **Tipos de dados – XML**, **Tipos de dados – JSON**, **Qualidade – Governança de dados**, **Qualidade – Data Quality**. Conclusão: o módulo Big Data de Analytics = módulo completo de Eng. de Dados + SoR vs SoT. Modelar assim (temas compartilhados) e confirmar com o usuário; se a inferência estiver errada, basta ajustar `content/trilhas/engenharia-de-analytics.ts`.

**Avaliação do módulo Big Data para quem faz prova de Analytics** (mesmo conteúdo, ênfase diferente):
- Reduzir profundidade em Hadoop/MapReduce/RDD (contexto histórico, 1 vídeo curto) e aumentar em **OLAP/DW/modelagem**, **zonas ↔ camadas de consumo**, **SoR vs SoT** (reconciliação de números, "qual fonte é a oficial do KPI") e **classificação de dados** (impacto em métricas e gráficos).
- Acrescentar, dentro do módulo, "o que o engenheiro de analytics faz com isso": consumir a zona refined/gold, definir métricas, garantir consistência.
- Tema SoR vs SoT: SoR = sistema onde o dado nasce (core bancário, CRM); SoT = visão consolidada e governada usada para decisão; regras de precedência, reconciliação, linhagem até a origem; exemplos bancários (saldo no core vs saldo no DW).

**Módulos sem itens — o que deveria conter** (sugestão a validar; prioridade P1/P2):
- **AWS**: S3 (P1), Glue catálogo/crawlers/jobs (P1), Athena (P1), Redshift + Spectrum + modelagem de distribuição (P1), QuickSight (P1), Lambda e Step Functions (P2), IAM e Lake Formation para dados (P2), Kinesis (P3).
- **Banco de dados**: relacional vs NoSQL e quando usar (P1), ACID vs BASE (P1), normalização vs modelagem dimensional (P1), índices e planos de execução (P1), SQL avançado — window functions, CTEs, agregações, dedup (P1), views/materializadas e performance de consulta (P2), DynamoDB/Redis noções (P3).
- **Programação**: Python para dados (pandas, tipos, funções, tratamento de nulos) (P1), SQL como linguagem principal (P1), Git básico e fluxo de PR (P1), testes (pytest) e qualidade de código (P2), notebooks e reprodutibilidade (P2), APIs/JSON (P2).
- **DevOps**: CI/CD para dados e dashboards (P1), Docker (P2), IaC/Terraform noções (P2), observabilidade e alertas (P2), ambientes dev/homolog/prod e versionamento (P1).
- **Dataviz**: percepção visual e princípios (Tufte, pré-atenção) (P1), escolha de gráfico por pergunta (P1), storytelling com dados (P1), dashboards eficazes e KPIs (P1), erros comuns (eixos, cores, pizza) (P1), ferramentas: QuickSight, Power BI, Looker (P2), acessibilidade em gráficos (P3).
- **Data Mesh**: 4 princípios (P1), data product e suas características (P1), contratos de dados (P1), plataforma self-serve (P2), governança federada (P2), Mesh vs Lake centralizado — trade-offs (P1), como fica no Itaú/Hub (P2).
- **Feedback**: não é conteúdo; vira formulário/link de avaliação da trilha.

**O que falta na trilha inteira e é núcleo de Analytics Engineering (recomendo módulo "Além da ementa – Analytics")**:
1. **dbt** (P1): models, refs, tests, docs, sources, snapshots (SCD), ambientes, CI.
2. **Camada semântica e métricas** (P1): definição única de KPI, metric store, consistência entre dashboards.
3. **Modelagem para BI** (P1): grão, tabelas agregadas, star schema para desempenho de dashboard, SCD na prática.
4. **Estatística para analytics** (P1): descritiva, distribuições, correlação vs causalidade, sazonalidade, testes A/B e significância, armadilhas (Simpson, sobrevivência).
5. **Qualidade e reconciliação de números** (P1): por que dois relatórios divergem; testes de dados; auditoria de KPI; freshness.
6. **Governança e LGPD aplicadas a analytics** (P2): dados sensíveis em dashboards, mascaramento, acesso por papel.
7. **Comunicação com negócio** (P2): traduzir pergunta de negócio em métrica, apresentar insight, "so what".
8. **Como responder na prova** (P1): estrutura de resposta e perguntas de cenário, igual à trilha de Dados.

### 5.3 Certificações AWS — lacunas típicas de quem vem de dados
- CLF-C02: cobrança/suporte (12%) é subestimado; decorar planos de suporte e modelos de preço. Segurança (30%) exige responsabilidade compartilhada de cor.
- SAA-C03: quem vem de dados erra rede (VPC, SG vs NACL, endpoints), DR (RTO/RPO por estratégia) e custo de transferência; incluir módulo "fundamentos de rede para quem não é de infra".
- SAP-C02: exige leitura de cenários longos; treinar gerenciamento de tempo (2,4 min/questão) e multi-conta/Organizations; incluir "como ler uma questão Pro" e simulados de 75 questões.
- Comum às três: mudanças de nomes/serviços (ex.: Bedrock e IA generativa em CLF e SAA), diferença entre "mais barato" e "menos esforço operacional" no enunciado.

### 5.4 Lacunas do plano de aprendizado (método) e como fechá-las
- **Diagnóstico inicial** por trilha (20 questões) para posicionar nível e priorizar módulos fracos → hoje o plano trata todos iguais.
- **Marcos**: fim de cada módulo tem "checkpoint" (quiz 10 questões, mín. 70% para marcar concluído; abaixo, gera drills).
- **Revisão semanal** (retrospectiva guiada: o que rendeu, o que mudar — princípio de experimentação) e **simulado final** obrigatório antes de marcar trilha concluída.
- **Pré-requisitos** entre temas (ex.: Spark avançado ← Spark introdução ← MapReduce) exibidos no tema e usados para ordenar sugestões.
- **Carga realista**: cada tema declara minutos de vídeo + leitura + prática; plano soma e alerta quando o dia passa da meta.
- **Transferência**: cada módulo termina com um "mini-projeto mental" (desenhar um pipeline/arquitetura para um caso bancário) — direcionamento além de perguntas.
- **Após a prova**: trilha entra em modo manutenção (cards espaçados a 30/90 dias) — coerente com "Life long Learning 4 Ever".

## 6. Evolução do site para atenção e aprendizado

**v1 (antes da sabatina)**
- **Onboarding em 3 toques**: escolher trilha → data da prova → minutos/dia ⇒ gera o plano. Retorno abre em **"Hoje"** com uma única próxima ação (tema, cards vencidos ou drill), não em um menu.
- **Streak + meta diária** e **prontidão por módulo** (score ponderado por quiz, simulado e cards; para certificações, ponderado pelo peso do domínio) → "Você está 68% pronto; ponto fraco: Spark".
- **Sessões curtas** (10–25 min), Pomodoro, modo sem distração, marcador "parei aqui".
- **Recuperação primeiro**: pré-teste com nível de confiança; **intercalação** de cards entre módulos; quiz pós-tema; drills nos erros.
- **Simulado no formato real**: oral (gravação local, rubrica, resposta-modelo) para sabatina; cronometrado com questões proporcionais aos domínios para certificação; relatório por módulo/domínio.
- **Apoios de leitura**: ouvir explicação (Web Speech API, útil no deslocamento), tamanho de fonte, glossário, cheat-sheet imprimível por módulo, mapa mental SVG por módulo, "erros comuns" e "como o entrevistador pergunta" por tema.
- **Offline (PWA)** para temas já abertos; instalação na tela inicial.
- **Compartilhar progresso**: card de conquista gerado no cliente (LinkedIn/WhatsApp) — canal de crescimento sem backend.
- **Prompt para IA** (tutor/sabatina) com botão copiar, por trilha.

**v2 (pós-sabatina)**: feedback e "reportar erro" por tema; lembretes por e-mail (Zoho já configurado no domínio); feedback de IA no simulado (Claude API via Lambda); analytics de produto (decisão adiada); novas certificações (DevOps Pro, Data Engineer Associate) e outras empresas.

## 7. Ultraaprendizado → funcionalidades

| Princípio | No site |
|---|---|
| Metaaprendizado | Página da trilha: o que/por que/como, pesos e formato da prova, `porQue` e `comoCai` por tema |
| Foco | Pomodoro, um tema por sessão, modo sem distração |
| Direcionamento | Simulado no formato real (oral ou múltipla escolha cronometrado) |
| Drills | Exercício isolado do ponto fraco por tema |
| Recuperação | Pré-teste, flashcards, quiz, intercalação |
| Feedback | Rubrica 0-5, resposta-modelo, prontidão por módulo/domínio, prompt para IA |
| Retenção | Leitner 1/3/7/12 dias em `localStorage`, fila "Hoje" |
| Intuição | Feynman ("explique para um gerente"), cadeias de "por quê" |
| Experimentação | Página método: variar técnica e registrar rendimento |

**Cronograma Eng. Dados (14 dias)**: D1 método + Fundamentos · D2 Hadoop · D3 Processamento · D4 Spark · D5 Data Lake + Databricks 1/2 · D6 Databricks 2/2 + Tipos · D7 Qualidade + revisão · D8 SQL + modelagem · D9 formatos + Spark avançado · D10 Airflow + Kafka/CDC + AWS dados · D11 LGPD/PII + arquiteturas + como responder · D12–D13 simulados completos + revisões · D14 revisão leve.

## 8. Curadoria (PT-BR)
Por tema: 1 vídeo principal + até 1 complementar, em português (para AWS: canais oficiais AWS Brasil e comunidade PT-BR). `WebSearch` (`site:youtube.com … português`) → `WebFetch` → **validação por oEmbed** (testado). Artigos PT-BR verificados (`verify-links`). Embed `youtube-nocookie.com` com facade. Questões de certificação **originais**, escritas por domínio, com explicação de cada alternativa.

## 9. Infra (Terraform em `infra/`)
1. `infra/bootstrap/`: bucket `lumarys-terraform-state` (versionado, criptografado, público bloqueado).
2. `infra/`: `data aws_route53_zone` (só adiciona A/AAAA apex + `www` e CNAME ACM) · ACM apex + SAN `www` (us-east-1) · S3 `lumarys-site-prod` + OAC · CloudFront (aliases apex+www, `PriceClass_100`, compress, CloudFront Function: `/x/`→`/x/index.html` e `www`→apex 301, 404→`/404.html`) · role OIDC `lumarys-web-github-actions-prod` (`sub` restrito a `repo:lumarys/lumarys-web:environment:production`; `s3:ListBucket/PutObject/DeleteObject` no bucket do site + `cloudfront:CreateInvalidation` na distribuição + `lambda:UpdateFunctionCode` na função da API) · política de cabeçalhos de resposta (CSP, HSTS, etc., §13) · registro CAA · recursos de auth/API/SES/DynamoDB/budget da §12.
3. `gh variable set AWS_ROLE_ARN`; environment `production`.
4. Verificação do Google Search Console e do Bing Webmaster **por arquivo HTML em `public/` e meta tag** (propriedade de prefixo de URL), **não por DNS**: o TXT do apex já existe com o SPF do Zoho fora do Terraform, e o Route 53 aceita um único conjunto TXT por nome, então qualquer gestão desse registro pelo Terraform arriscaria o e-mail. Nenhum registro TXT é criado ou alterado.

## 10. Entregas

### Entrega 1 — MVP: trilha de Engenharia de Dados + progresso salvo

**Objetivo**: em `lumarys.com.br`, uma pessoa abre no celular, estuda a trilha completa de Engenharia de Dados (ementa oficial do Itaú + "Além da ementa") com o método Ultraaprendizado, faz o simulado da sabatina e, se quiser, entra com código por e-mail para continuar de onde parou em qualquer dispositivo. Prazo-alvo: pronto para uso antes da sabatina (≈ 2 semanas), com o conteúdo entrando por módulo para o usuário já estudar enquanto o resto é produzido.

**Escopo do MVP (dentro)**
- Fundação (§2): scaffold Next.js 16 + Tailwind 4, tooling (lint, typecheck, Vitest, Playwright smoke, Lefthook, Conventional Commits, Dependabot, gitleaks), infra Terraform (§9 + §12), CI no PR e deploy no `main`, cabeçalhos de segurança e demais controles da §13.
- Marca aplicada (§1, §1.1, §1.2): design canvas **enxuto** (marca + 4 telas: Hoje, trilha, tema, simulado) → tokens; rodapé Cernyn; páginas `/sobre`, `/contato`, `/privacidade`, `/termos`, `/metodo`.
- Landing com **uma** trilha (Eng. Dados) e catálogo com "em breve" para Analytics e AWS (sem conteúdo).
- Trilha Eng. Dados completa: 8 módulos oficiais (18 temas) + módulo "Além da ementa" (12 temas), cada tema com pré-teste, vídeo PT-BR verificado, explicação, artigos, flashcards, drill, perguntas orais com rubrica, Feynman, erros comuns, "como cai".
- Funcionalidades de estudo (§4, §7): Hoje, onboarding (data da prova + minutos/dia → plano de 14 dias), streak e meta diária, Pomodoro, pré-teste, flashcards Leitner intercalados, quiz, drills, simulado oral com gravação local e rubrica, prontidão por módulo, prompt para IA com botão copiar, checkpoint por módulo.
- Conta e progresso (§12): login por código de e-mail, mesclagem convidado→conta, sincronização entre dispositivos, exportar e excluir conta.
- SEO essencial (§2.1): metadata e OG por página, JSON-LD (`Organization` com Cernyn, `WebSite`, `Course`, `BreadcrumbList`, `FAQPage`, `VideoObject`), sitemap, robots com crawlers de IA liberados, `llms.txt`/`llms-full.txt`, Search Console e Bing verificados por arquivo HTML, IndexNow no deploy, Lighthouse ≥ 90.

**Fora do MVP (entregas seguintes)**: trilha de Analytics, certificações AWS e o modelo `exame`/simulado cronometrado, glossário e páginas de comparativo, PWA/offline, leitura em voz alta, cheat-sheets e mapas mentais, card de conquista compartilhável, certificado de conclusão, feed Atom, feedback por tema, lembretes por e-mail, feedback de IA no simulado, analytics de produto.

**Marcos do MVP** (o conteúdo entra em produção assim que cada marco fecha):
- **M0 — Marca e telas** (dia 1): canvas de design aprovado, tokens e assets exportados.
- **M1 — Site no ar com conta** (dias 1–3): fundação, infra (bootstrap → plan revisado → apply), Cognito + SES (pedido de saída do sandbox enviado no dia 1) + API + DynamoDB, landing, método, páginas legais, rodapé, tela Conta funcionando, SEO essencial. Até a org `lumarys` existir, roda local; o deploy acontece no primeiro push após a criação.
- **M2 — Trilha oficial, módulos 1–4** (dias 3–5): loader MDX e features de estudo completas; Fundamentos, Hadoop, Processamento e Spark publicados. Produção de conteúdo em paralelo com subagentes (1 por módulo) seguindo o CONTENT-GUIDE, cada vídeo validado por oEmbed.
- **M3 — Trilha oficial, módulos 5–8** (dias 5–7): Data Lake, Databricks, Tipos de dados, Qualidade; plano de 14 dias e prontidão calibrados com os 18 temas.
- **M4 — Além da ementa** (dias 7–10): 12 temas extras (P1 primeiro: SQL, modelagem, formatos, Spark avançado, Airflow, Kafka/CDC, AWS dados, LGPD/PII, arquiteturas, como responder; depois DataOps e custo); simulado completo com banco de perguntas dos 30 temas.
- **M5 — Endurecimento** (dias 10–12): verificação §11 completa, Lighthouse, securityheaders, teste real de login em 2 dispositivos, revisão de conteúdo (links, vídeos, ortografia), ajustes de UX vindos do uso do próprio usuário nos dias anteriores.

### Entregas seguintes (ordem sugerida, pós-MVP)
- **Entrega 2 — Analytics**: tema SoR vs SoT, trilha de Analytics sobre os temas compartilhados, módulos pendentes conforme validação do usuário, módulo "Além da ementa – Analytics" (dbt etc.).
- **Entrega 3 — Certificações AWS**: modelo `exame`, quiz de múltipla resposta, simulado cronometrado por domínio; CLF-C02 → SAA-C03 → SAP-C02.
- **Entrega 4 — Engajamento e alcance**: PWA/offline, leitura em voz alta, cheat-sheets, mapas mentais, card de conquista, certificado, glossário e comparativos (cauda longa de SEO), feed Atom.
- **Entrega 5 — v2** (§6): feedback por tema, lembretes, feedback de IA, analytics de produto, novas trilhas e empresas.

## 11. Verificação
- `npm run lint && npm run typecheck && npm test && npm run build`; `verify-videos`/`verify-links`/`content-lint` 100%; e2e mobile verde; Lighthouse mobile ≥ 90.
- `terraform plan`: zero mudanças em MX/TXT/DKIM; após apply `dig lumarys.com.br A`/`www` → CloudFront; `curl -I https://lumarys.com.br/trilhas/engenharia-de-dados/` = 200; `www` → 301; `dig MX` inalterado.
- No celular: onboarding → Hoje → tema → vídeo no toque → cards → quiz → simulado; progresso persiste; offline abre tema visitado; sem scroll horizontal.
- Certificação: simulado gera N questões respeitando pesos dos domínios, cronômetro e relatório por domínio.
- Conta: login por código de e-mail funciona no celular e no computador com o mesmo e-mail; progresso feito como convidado aparece após o login; alteração em um dispositivo aparece no outro após recarregar; exportar retorna JSON; excluir conta remove itens no DynamoDB e o usuário no Cognito; token expirado renova sem deslogar; `curl` na API sem JWT retorna 401 e com JWT de outro usuário não acessa dados alheios.
- Segurança: cabeçalhos verificados (securityheaders.com nota A), CSP sem violações no console, `gitleaks` e `npm audit` verdes, `terraform plan` sem mudanças em MX/TXT/DKIM, e-mail de código passa SPF/DKIM/DMARC (cabeçalhos do e-mail recebido), WAF bloqueia após o limite de tentativas.
- SEO: `sitemap.xml`, `robots.txt`, `llms.txt`, `llms-full.txt` e `feed.xml` gerados no build; JSON-LD validado no Rich Results Test / Schema Validator para tema, trilha, glossário e certificação; Search Console e Bing com sitemap aceito e sem erros de cobertura; `curl -A GPTBot` e `-A ClaudeBot` recebem 200; Lighthouse SEO ≥ 95; IndexNow retorna 200/202 no deploy.

## 12. Contas e progresso — "saber onde parou" com login simples

**Decisão**: Amazon Cognito com **login sem senha por código de e-mail** (`sign_in_policy.allowed_first_auth_factors = ["EMAIL_OTP"]`, `user_pool_tier = "ESSENTIALS"`, gratuito até 10.000 MAU) + API HTTP (API Gateway v2) + Lambda + DynamoDB, tudo em Terraform, na Fase 1. Alternativas avaliadas e descartadas: Supabase (dados fora da AWS), só código de sincronização (manual), Google Drive como armazenamento (frágil, só Google).

**Experiência**
- Estudar **não exige login**: progresso nasce em `localStorage` (modo convidado). O convite aparece em momentos de valor ("salve seu progresso para continuar no computador"), não na entrada.
- Login: digita e-mail → recebe código de 6 dígitos → entra. Ao entrar pela primeira vez, o progresso local é **mesclado** na conta (união de temas concluídos, máximo de scores, cards com a caixa Leitner mais avançada).
- Sincronização: a cada evento (tema concluído, card revisado, quiz) grava localmente e enfileira `PUT /progress` com debounce; ao abrir o app, `GET /progress` e mescla por `updatedAt` por item (last-write-wins por chave, nunca por documento inteiro). Funciona offline; sincroniza ao voltar.
- Tela "Conta": e-mail, dispositivos, **exportar meus dados (JSON)** e **excluir conta** (LGPD), sair.

**Modelo de dados (DynamoDB `lumarys-progress-prod`, PAY_PER_REQUEST, PITR ligado)**
- `pk = u#<sub>`, `sk = trilha#<slug>` (documento por trilha: temas concluídos, scores, streak, plano) e `sk = cards#<slug>` (estado Leitner). Item ≤ 50 KB; TTL de 24 meses sem atividade (renovado a cada gravação). Apenas `sub` e e-mail (no Cognito) como dado pessoal.

**API (`api.lumarys.com.br`, HTTP API + autorizador JWT do Cognito)**: `GET /me/progress`, `PUT /me/progress/{trilha}`, `PUT /me/cards/{trilha}`, `GET /me/export`, `DELETE /me` (apaga itens e o usuário no Cognito via `AdminDeleteUser`). Lambda Node 24 em TS (padrão `youco-io-neo/apps/neo-api` + `bundle-lambda.mjs`), validação de payload com zod, CORS restrito a `https://lumarys.com.br`, throttling 10 rps/burst 20 por rota.

**E-mail dos códigos**: SES (`email_sending_account = DEVELOPER`) com identidade de **domínio** `lumarys.com.br` — verificação só por DNS (DKIM por CNAMEs `*._domainkey`, novos registros que não tocam MX/SPF do Zoho), **sem precisar de caixa de e-mail**. Remetente `Lumarys <no-reply@lumarys.com.br>`; texto do e-mail diz "não responda; suporte: pinus@cernyn.com". MAIL FROM em `mail.lumarys.com.br` com MX/SPF próprios (padrão `youco-io-core/infra/email-dns.tf`) e `_dmarc` `p=none` com `rua=` apontando para um e-mail da Cernyn (variável Terraform). Bounces e reclamações vão para um tópico SNS → e-mail da Cernyn (sem caixa na Lumarys). Pedir saída do sandbox do SES na Fase 1 (o remetente padrão do Cognito limita a 50 e-mails/dia — inviável para site público). Template do e-mail com marca e aviso "nunca pedimos senha".

**Front-end**: `@aws-sdk/client-cognito-identity-provider` direto (`InitiateAuth` com `AuthFlow=USER_AUTH`, `PREFERRED_CHALLENGE=EMAIL_OTP`, `RespondToAuthChallenge`), sem Amplify; tokens em memória + refresh token em `localStorage` com rotação; `src/features/conta/` e `src/lib/sync.ts`.

**Infra adicional (Terraform)**: `aws_cognito_user_pool` (+ `prevent_user_existence_errors = ENABLED`, atributos mínimos: e-mail), `aws_cognito_user_pool_client` (sem secret, `explicit_auth_flows = ["ALLOW_USER_AUTH", "ALLOW_REFRESH_TOKEN_AUTH"]`, access/id token 60 min, refresh 30 dias), `aws_apigatewayv2_api` + autorizador JWT + domínio `api.lumarys.com.br` (ACM + A/AAAA na zona), `aws_lambda_function` + log group com retenção 30 dias, `aws_dynamodb_table`, `aws_sesv2_email_identity` + registros DKIM/MAIL FROM/DMARC, `aws_budgets_budget` com alerta (padrão `budget.tf`). Deploy do código da Lambda pelo CI via `lambda:UpdateFunctionCode` (role OIDC), com `ignore_changes` no zip (padrão youco).

## 13. Segurança e privacidade — revisão do plano (resposta à pergunta "há vulnerabilidades?")

Pontos fracos identificados no plano original e correções incorporadas:

1. **Role OIDC ampla demais** (`sub` = `repo:…:*` permitia qualquer branch/PR publicar). Correção: `sub` restrito a `repo:lumarys/lumarys-web:environment:production` (+ `ref:refs/heads/main`), environment `production` com aprovação obrigatória, branch protection em `main` (PR + revisão + checks verdes), **nenhum workflow `pull_request_target`**, secrets indisponíveis a forks (padrão GitHub), actions fixadas por SHA.
2. **Repositório público com infra**: o estado do Terraform (contém ARNs e possivelmente segredos) fica só no bucket privado com versionamento e SSE; `*.tfvars`, `.env*`, `dist/` no `.gitignore`; **gitleaks** e CodeQL no CI; nada de IDs de conta ou chaves hard-coded (variáveis Terraform + `gh variable`). IDs públicos por natureza (user pool client ID, URL da API) são aceitos, mas o client é sem secret e restrito por CORS e fluxo.
3. **Cabeçalhos de segurança ausentes**: política de cabeçalhos de resposta no CloudFront (base: `cernyn-web/cloudfront-security-headers.js`, adaptada para remover `unsafe-inline`, GTM e reCAPTCHA) com CSP estrita (`default-src 'self'`; `frame-src youtube-nocookie.com`; `img-src 'self' i.ytimg.com data:`; `connect-src 'self' https://api.lumarys.com.br https://cognito-idp.us-east-1.amazonaws.com`; sem `unsafe-inline` — nonces/hashes para scripts do Next), HSTS com preload, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` (microfone só no próprio site), `X-Frame-Options DENY`. Registro **CAA** na zona limitando a emissão à Amazon (registro novo, não conflita).
4. **Autenticação**: sem senha elimina vazamento de senhas; riscos residuais tratados com código de 6 dígitos com expiração curta e limite de tentativas (nativo do Cognito), `prevent_user_existence_errors` contra enumeração, WAF associado ao user pool e à API com regra de rate limit por IP, tokens de curta duração com rotação de refresh, logout invalida refresh (`RevokeToken`). Tokens no navegador dependem de CSP forte contra XSS (item 3) e de **zero scripts de terceiros** (decisão de não usar analytics ajuda).
5. **Autorização na API**: o Lambda deriva o usuário **só do `sub` do JWT validado pelo API Gateway**, nunca do payload; cada rota opera apenas em `pk = u#<sub>`; validação de schema e tamanho (≤ 64 KB) com zod; rejeita campos desconhecidos.
6. **Conteúdo e contribuições externas**: MDX executa JS — PRs de terceiros só com revisão (CODEOWNERS), componentes MDX permitidos por allowlist, sem HTML cru, `verify-links` bloqueia domínios fora de uma allowlist, `content-lint` proíbe `<script>` e URLs `javascript:`. Embeds só via `VideoEmbed` (facade + `youtube-nocookie` + `sandbox`), links externos com `rel="noopener noreferrer"`.
7. **Cadeia de suprimentos**: `npm ci` com lockfile, `npm audit --audit-level=high` no CI, Dependabot, actions por SHA, service worker (Serwist) com escopo e sem cache de respostas da API.
8. **Custo como vetor de negação de serviço**: throttling na API, WAF rate limit, `aws_budgets_budget` com alarme por e-mail, CloudFront `PriceClass_100`, DynamoDB sob demanda com alarme de consumo, logs com retenção curta.
9. **Privacidade / LGPD**: dados pessoais mínimos (e-mail + progresso); política de privacidade e termos em `/privacidade` e `/termos`; exportação e exclusão self-service; TTL de inatividade; e-mails nunca em logs (mascarar); gravações de voz **nunca saem do dispositivo**; Cognito/DynamoDB criptografados em repouso; CloudTrail já ativo na conta (verificar).
10. **E-mail**: SES com DKIM + MAIL FROM alinhado + DMARC evita spoofing do remetente dos códigos; texto do e-mail educa contra phishing; o apex TXT (SPF do Zoho) permanece intocado.
11. **Operação**: Terraform aplicado por humano, nunca pelo CI (padrão dos repos youco); `terraform plan` revisado quanto a MX/TXT/DKIM; `SECURITY.md` com canal de reporte; alarmes CloudWatch para 5xx da API e erros do Lambda.

Riscos aceitos (documentados): sem WAF gerenciado pago além de rate limit; sem Cognito Plus (proteção avançada) no início; dependência do YouTube para vídeos (facade mitiga rastreamento, mas o conteúdo pode sumir — `verify-videos` detecta).

## Pendências do usuário (não bloqueiam)
- Criar a org `lumarys` no GitHub após aprovar a identidade visual (Fase 0); até lá o código fica local.
- Aprovar o pedido de saída do sandbox do SES (a AWS pede caso de uso; texto preparado na execução) e informar o e-mail da Cernyn que receberá relatórios DMARC e avisos de bounce.
- Revisar política de privacidade e termos antes do lançamento público.
- (Opcional, futuro) criar uma caixa `contato@lumarys.com.br` no Zoho; nada no lançamento depende disso.
- Confirmar a inferência dos 4 itens do módulo Big Data de Analytics (XML, JSON, Governança, Data Quality) e validar a sugestão de conteúdo dos módulos AWS, Banco de dados, Programação, DevOps, Dataviz e Data Mesh, além do módulo extra com dbt.
