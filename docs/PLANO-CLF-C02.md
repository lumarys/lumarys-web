# Plano de execução: trilha AWS Cloud Practitioner (CLF-C02)

Plano escrito em 17/09/2026 para ser executado por sessões com Sonnet e Opus,
um card por vez, seguindo o protocolo da fila do agente. Quem executa não
precisa ter lido nada além deste arquivo, do `docs/CONTENT-GUIDE.md` e da
trilha SAA, que é o molde.

Cards no board (épico E3, Certificações AWS): ver a seção 8. Ordem de
execução é a ordem dos cards. Um card por commit, WIP máximo 3, Done só com
deploy verde e valor provado no site real.

---

## 1. O que já existe e é reaproveitado sem mudança

A SAA-C03 foi a primeira trilha de certificação e deixou a estrutura pronta.
Nada disto precisa ser tocado:

| Peça                                                                 | Onde                                                          | O que faz                                                                                   |
| -------------------------------------------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Tipo `Trilha` com `exame` e módulos com `dominioExame` e `pesoExame` | `content/types.ts`                                            | Modela versão do exame, questões, minutos, corte, preço e guia oficial                      |
| Prova simulada cronometrada                                          | `src/lib/prova.ts`, `src/features/simulado/ProvaSimulada.tsx` | Sorteia questões por peso de domínio, cronometra, entrega no fim, nota na escala 100 a 1000 |
| Checkpoint por módulo                                                | `src/lib/checkpoint.ts`                                       | Dez questões dos temas do módulo, aprovação em 70%                                          |
| Vigia da versão do exame                                             | `scripts/verify-exames.mjs`                                   | Falha o CI se o código sumir do índice oficial; avisa se aparecer versão nova               |
| Lint de conteúdo                                                     | `scripts/content-lint.mjs`                                    | Schema, MDX seguro, `formato: prova` com 3 objetivas, cronograma x módulos x pré-requisitos |
| `formato: prova` nos temas                                           | `content/types.ts` e `docs/CONTENT-GUIDE.md`                  | Cenários objetivos com explicação em toda alternativa, orais opcionais                      |
| Molde de tema de certificação                                        | `content/temas/banco-de-dados-por-caso-de-uso.mdx`            | Frontmatter completo, Comparativo, Callout, "Como responder o cenário"                      |
| Molde de trilha de certificação                                      | `content/trilhas/aws-solutions-architect-associate.ts`        | Módulos por domínio, cronograma com checkpoint e prova por domínio                          |
| Teste de tela de certificação                                        | `tests/e2e/saa.spec.ts`                                       | Exame na página da trilha, prova objetiva, sem gabarito antes do fim                        |

Tudo que a CLF precisa é conteúdo novo mais três ajustes pequenos de código
(seção 6).

## 2. O exame, conferido no guia oficial em 17/09/2026

| Item             | Valor                                                                                                 | Fonte                                                                                              |
| ---------------- | ----------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Código vigente   | CLF-C02. O índice oficial de guias não lista C03                                                      | https://docs.aws.amazon.com/aws-certification/latest/examguides/aws-certification-exam-guides.html |
| Guia             | https://docs.aws.amazon.com/aws-certification/latest/cloud-practitioner-02/cloud-practitioner-02.html | `guiaUrl` da trilha                                                                                |
| Questões         | 65, sendo 50 pontuadas e 15 não pontuadas, sem identificação                                          | guia, seção Exam Content                                                                           |
| Tipos de questão | múltipla escolha (1 certa, 3 erradas) e múltipla resposta (2 ou mais certas em 5 ou mais)             | guia                                                                                               |
| Duração          | 90 minutos                                                                                            | página de certificação da AWS; o executor confere antes de gravar `minutos`                        |
| Corte            | 700 na escala de 100 a 1000; modelo compensatório, não exige mínimo por domínio                       | guia, seção Exam Results                                                                           |
| Preço            | USD 100                                                                                               | página de certificação da AWS; conferir junto com a duração                                        |
| Candidato-alvo   | até 6 meses de exposição à AWS, qualquer papel                                                        | guia                                                                                               |
| Fora de escopo   | codificar, desenhar arquitetura, resolver incidentes, implementar, testar carga                       | guia                                                                                               |

Domínios e pesos:

| Domínio                       | Peso | Task statements do guia                                                                                                                                                                |
| ----------------------------- | ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Conceitos de nuvem         | 24%  | 1.1 valor da nuvem; 1.2 princípios de design (Well-Architected); 1.3 migração e CAF; 1.4 economia da nuvem                                                                             |
| 2. Segurança e conformidade   | 30%  | 2.1 responsabilidade compartilhada; 2.2 segurança, governança e conformidade; 2.3 gestão de acesso; 2.4 componentes e recursos de segurança                                            |
| 3. Tecnologia e serviços      | 34%  | 3.1 formas de implantar e operar; 3.2 infraestrutura global; 3.3 computação; 3.4 bancos de dados; 3.5 rede; 3.6 armazenamento; 3.7 IA, ML e analytics; 3.8 demais categorias em escopo |
| 4. Cobrança, preços e suporte | 12%  | 4.1 modelos de preço; 4.2 recursos de cobrança, orçamento e custo; 4.3 recursos técnicos e opções de suporte                                                                           |

O executor do primeiro card abre o guia, confere os task statements acima
e a lista de serviços em escopo. Se algo divergir, o guia vence este plano.

## 3. A diferença de nível, que decide como escrever

A SAA descreve um cenário e pede a melhor arquitetura. A CLF descreve uma
necessidade em uma ou duas frases e pede o serviço, o conceito ou a prática
que atende. O candidato não desenha nada: ele **reconhece e posiciona**.

Consequências para o conteúdo:

- Enunciados curtos, de duas a quatro linhas. Cenário longo é marca de SAA e
  fica fora.
- Alternativas erradas são **serviços vizinhos** ou **conceitos parecidos**
  (Inspector no lugar de GuardDuty, Reserved no lugar de Savings Plans, NACL
  no lugar de security group), nunca absurdos.
- Cada explicação de alternativa diz em uma frase por que aquele serviço
  serve ou não serve ao pedido.
- `nivel: fundamental` em todos os temas. `minutos` entre 20 e 30.
- O corpo do tema é um mapa de reconhecimento: para cada serviço, o que ele
  é em uma linha e a pista no enunciado que aponta para ele. O componente
  `Comparativo` é a forma natural desse conteúdo.
- Os temas da CLF **não são compartilhados com a SAA**, ainda que tratem dos
  mesmos serviços. Motivo: a prova simulada sorteia as questões dos temas dos
  módulos da trilha, e uma questão de arquitetura da SAA dentro de uma prova
  de CLF quebra a calibração. O único reaproveitamento permitido é copiar a
  estrutura do tema `como-ler-uma-questao-saa` para escrever o
  `como-ler-uma-questao-clf`.

## 4. Os 23 temas

Slugs escolhidos para não colidir com os da SAA. Todos com
`formato: prova`, `nivel: fundamental`, `publicadoEm` na data do commit.
O campo `preRequisitos` só aponta para temas desta trilha e respeita a ordem
do cronograma (o lint reprova o contrário).

### Módulo `como-funciona-a-prova` (oficial: false)

| Slug                       | Título                      | Cobre                                                                                                                                                                                                                                             |
| -------------------------- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `como-ler-uma-questao-clf` | Como ler uma questão da CLF | Formato, 50 pontuadas de 65, 90 minutos, os dois tipos de questão, escala e corte, o que "identificar o serviço" quer dizer, o método de ler o pedido antes das alternativas, as palavras que apontam domínio (custo, segurança, disponibilidade) |

### Módulo `conceitos` · Domínio 1 · 24%

| Slug                                      | Título                                         | Cobre                                                                                                                                                                                                                                                       |
| ----------------------------------------- | ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `valor-da-nuvem-e-modelos-de-implantacao` | O valor da nuvem e os modelos de implantação   | Seis benefícios (troca de capital por variável, economia de escala, sem adivinhar capacidade, velocidade, sem gastar com data center, alcance global); nuvem pública, híbrida e local; IaaS, PaaS e SaaS com um exemplo AWS cada                            |
| `well-architected-os-seis-pilares`        | Well-Architected: os seis pilares              | Excelência operacional, segurança, confiabilidade, eficiência de desempenho, otimização de custo, sustentabilidade; a pista de cada pilar no enunciado; a ferramenta Well-Architected Tool                                                                  |
| `economia-da-nuvem`                       | Economia da nuvem                              | CapEx e OpEx, custo fixo e variável, TCO e o que entra nele, economia de escala, licenciamento próprio (BYOL), right-sizing como conceito, o que muda no orçamento de TI                                                                                    |
| `migracao-para-a-nuvem-7-rs-e-caf`        | Migração: os 7 Rs e o Cloud Adoption Framework | Rehost, replatform, refactor, repurchase, retire, retain, relocate com um caso cada; as perspectivas do CAF; serviços de apoio no nível de reconhecimento: Migration Hub, Application Discovery Service, DMS, Snow, DataSync, Application Migration Service |

### Módulo `seguranca` · Domínio 2 · 30%

| Slug                                       | Título                                           | Cobre                                                                                                                                                                                                                                                     |
| ------------------------------------------ | ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `modelo-de-responsabilidade-compartilhada` | O modelo de responsabilidade compartilhada       | Segurança "da" nuvem e "na" nuvem; como a linha se move entre EC2, RDS, Lambda e S3; patch, criptografia, IAM, dado do cliente; o que a AWS nunca faz pelo cliente                                                                                        |
| `iam-usuarios-grupos-roles-e-politicas`    | IAM: usuários, grupos, roles e políticas         | Usuário raiz e o que proteger nele, MFA, chaves de acesso, grupos, roles para serviços e para acesso entre contas, políticas gerenciadas e inline, privilégio mínimo, IAM Identity Center, credenciais temporárias                                        |
| `conformidade-e-governanca-na-aws`         | Conformidade e governança na AWS                 | Artifact e relatórios de conformidade, programas (ISO, SOC, PCI, LGPD no nível de conceito), residência de dados por região, CloudTrail e Config no papel de trilha e conformidade, Audit Manager, Control Tower e SCPs no nível de reconhecimento        |
| `servicos-de-seguranca-da-aws`             | Os serviços de segurança e o que cada um detecta | GuardDuty, Inspector, Macie, Security Hub, Detective, Shield, WAF, Firewall Manager, Network Firewall, Secrets Manager, Trusted Advisor no papel de segurança; a pista de cada um ("ameaça", "vulnerabilidade", "dado sensível", "DDoS", "SQL injection") |
| `criptografia-em-repouso-e-em-transito`    | Criptografia em repouso e em trânsito            | KMS e CloudHSM, chaves gerenciadas pela AWS e pelo cliente, criptografia padrão do S3, EBS e RDS, ACM e TLS, o que "em trânsito" cobre, Secrets Manager contra Parameter Store, quem tem a chave em cada caso                                             |

### Módulo `tecnologia` · Domínio 3 · 34%

| Slug                                     | Título                                       | Cobre                                                                                                                                                                                                                                                                                                                                                                                                                         |
| ---------------------------------------- | -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `formas-de-operar-na-aws`                | Formas de implantar e operar na AWS          | Console, CLI, SDKs, APIs; infraestrutura como código com CloudFormation e CDK; Elastic Beanstalk como plataforma; conectividade privada, pública e híbrida como opções de implantação                                                                                                                                                                                                                                         |
| `infraestrutura-global-da-aws`           | A infraestrutura global                      | Regiões, zonas de disponibilidade, Local Zones, Wavelength, Outposts; edge locations; CloudFront, Route 53 e Global Accelerator no nível de "para que serve"; escolher região por latência, residência de dados, preço e serviços disponíveis                                                                                                                                                                                 |
| `computacao-na-aws`                      | Computação na AWS                            | EC2 e famílias de instância pelo nome (uso geral, computação, memória, armazenamento, acelerada), Auto Scaling e balanceadores no nível de conceito, Lambda, containers com ECS, EKS e Fargate, Lightsail, Batch; a pista de cada um                                                                                                                                                                                          |
| `armazenamento-na-aws`                   | Armazenamento na AWS                         | S3 e as classes com o caso de cada uma, ciclo de vida, versionamento; EBS, EFS, FSx, Storage Gateway, AWS Backup, família Snow; objeto, bloco e arquivo como a pergunta que decide                                                                                                                                                                                                                                            |
| `rede-e-conectividade-na-aws`            | Rede e conectividade                         | VPC, sub-rede pública e privada, internet gateway e NAT, security group contra NACL, VPN site a site, Direct Connect, PrivateLink e endpoints no nível de reconhecimento, Route 53 como DNS                                                                                                                                                                                                                                   |
| `bancos-de-dados-na-aws-visao-geral`     | Bancos de dados: visão geral                 | RDS e os motores, Aurora, DynamoDB, Redshift, ElastiCache, Neptune, DocumentDB, MemoryDB, DMS; relacional contra não relacional; a pista de cada um em uma linha                                                                                                                                                                                                                                                              |
| `analytics-e-ia-na-aws`                  | Analytics, IA e machine learning             | Athena, Glue, QuickSight, Kinesis, EMR, OpenSearch, Data Exchange; SageMaker, Rekognition, Lex, Polly, Transcribe, Translate, Comprehend, Textract, Bedrock, Q; posicionar pelo caso de uso, sem entrar em arquitetura                                                                                                                                                                                                        |
| `integracao-de-aplicacoes-na-aws`        | Integração de aplicações                     | SQS, SNS, EventBridge, Step Functions, API Gateway, AppSync, MQ; fila contra tópico contra barramento de eventos em uma frase cada                                                                                                                                                                                                                                                                                            |
| `gestao-monitoramento-e-outros-servicos` | Gestão, monitoramento e as demais categorias | CloudWatch, CloudTrail, Config, Systems Manager, Trusted Advisor, Health Dashboard, Service Catalog, License Manager; e as categorias restantes em escopo no nível de nome e propósito: ferramentas de desenvolvedor (CodeBuild, CodeDeploy, CodePipeline, Cloud9, X-Ray), aplicações de negócio e engajamento (Connect, SES, Pinpoint), usuário final (WorkSpaces, AppStream), IoT Core, Amplify e AppSync para web e mobile |

### Módulo `cobranca` · Domínio 4 · 12%

| Slug                                        | Título                                     | Cobre                                                                                                                                                                                                                                                  |
| ------------------------------------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `modelos-de-preco-e-free-tier`              | Modelos de preço e o nível gratuito        | Sob demanda, Savings Plans, instâncias reservadas, Spot, hosts e instâncias dedicadas; os três tipos de Free Tier; o que é cobrado na transferência de dados no nível de conceito                                                                      |
| `ferramentas-de-custo-e-orcamento`          | Ferramentas de custo e orçamento           | Cost Explorer, Budgets, Cost and Usage Report, Pricing Calculator, tags de alocação, Cost Anomaly Detection, Billing Conductor; qual ferramenta responde a qual pergunta                                                                               |
| `organizations-e-faturamento-consolidado`   | Organizations e faturamento consolidado    | Contas múltiplas, unidades organizacionais, fatura consolidada e desconto por volume, SCPs no nível de conceito, Control Tower como ponto de partida                                                                                                   |
| `planos-de-suporte-marketplace-e-parceiros` | Planos de suporte, Marketplace e parceiros | Basic, Developer, Business, Enterprise On-Ramp e Enterprise com o que muda em cada degrau (tempo de resposta, TAM, Trusted Advisor completo); re:Post, Knowledge Center, Professional Services, Marketplace, Partner Network, programas de treinamento |

## 5. Regras de escrita por tema

Vale o `docs/CONTENT-GUIDE.md` inteiro. Em cima dele, para esta trilha:

1. **Vídeos.** Um ou dois por tema, só em português, verificados com
   `node scripts/video-info.mjs <id>` antes de entrar. Canal, duração e
   `publicadoEm` são os que o script imprime. Vídeo com um minuto de duração
   é um Short e não entra. Muitos canais brasileiros cobrem a CLF; preferir
   vídeo que trate do serviço no nível do exame, não tutorial de console.
2. **Artigos.** De 1 a 5, nos domínios da allowlist de
   `scripts/verify-links.mjs`. Para a CLF, `docs.aws.amazon.com` e
   `aws.amazon.com` cobrem tudo. O guia do exame entra como artigo no tema
   `como-ler-uma-questao-clf`.
3. **Perguntas.** Mínimo três objetivas por tema, todas no estilo da CLF
   (seção 3). Pelo menos uma `multipla` com "Quais DUAS" ou "Quais TRÊS" no
   enunciado. Nada de questão real de prova: tudo escrito do zero.
4. **Pré-teste.** De 1 a 3 perguntas, uma correta cada, explicação em todas.
5. **Flashcards.** De 8 a 14. Para a CLF o card típico é "serviço X, em uma
   linha" e "a pista de Y no enunciado".
6. **Drill.** Um drill de classificar: o pedido e o serviço que atende, com
   `opcoes` cobrindo os serviços do tema.
7. **Corpo.** Entre 250 e 1.200 palavras, abrindo com `## Em uma frase`, com
   ao menos um `Comparativo` e fechando com "Como responder o cenário".
   Componentes só os da allowlist.
8. **Erros comuns.** De 2 a 8, cada um com o erro e o motivo.
9. **Frases proibidas.** Nome de banco ou de empregador, "esta questão caiu
   na prova", número sem fonte, trecho copiado de simulado de terceiro.
10. **Gate antes de fechar o card.** `npm run check` (lint, typecheck,
    unitários, content-lint), `npm run build`, `node scripts/verify-videos.mjs`,
    `node scripts/verify-exames.mjs`, `npm run test:e2e`. Atualizar a contagem
    em `tests/e2e/temas.spec.ts` a cada card (69 hoje; 92 ao fim).

## 6. Os três ajustes de código, todos no primeiro card

1. **`content/trilhas/aws-cloud-practitioner.ts`**, copiado do arquivo da
   SAA e ajustado: `slug: "aws-cloud-practitioner"`, `tipo: "certificacao"`,
   `origem: "AWS · CLF-C02"`, `exame` com os valores da seção 2, cinco
   módulos (os quatro domínios com `dominioExame` e `pesoExame`; os que ainda
   não têm tema ficam `status: "em-breve"` com `temas: []`), cronograma só
   com os dias que já existem. Registrar em `content/trilhas/index.ts`
   **antes** da SAA no array, porque no catálogo a fundacional vem primeiro
   (a ordem só decide canônica de tema compartilhado, e a CLF não compartilha
   nada). Remover a entrada de `trilhasEmBreve`.
2. **Lista de "em breve" vazia.** `src/app/page.tsx` (bloco "Em breve",
   linha 382 em diante) e `src/app/trilhas/page.tsx` (linha 77 em diante)
   renderizam a lista de `trilhasEmBreve`. Com a CLF publicada a lista fica
   vazia e as duas páginas precisam omitir a seção inteira, sem rótulo órfão.
   `tests/e2e/em-breve.spec.ts` testava o cartão da CLF e passa a testar a
   ausência da seção nas duas páginas. Conferir `tests/e2e/home.spec.ts` e
   `tests/e2e/cards.spec.ts` por asserções sobre a ordem ou a quantidade de
   trilhas no catálogo.
3. **`tests/e2e/clf.spec.ts`**, copiado de `saa.spec.ts`: cabeçalho da trilha
   mostrando CLF-C02 com link para o guia, "65 questões · 90 min", "Corte
   700/1000", os quatro pesos, e a prova simulada objetiva e cronometrada.
   Enquanto houver domínio em breve, a asserção de "em breve" ausente fica
   para o card 5.

O `verify-exames` já lê o código de qualquer trilha com `exame`: nada a fazer
além de rodar.

## 7. Cronograma final (card 6)

Trinta dias, um tema por dia, checkpoint e prova simulada no fim de cada
domínio, prova completa na reta final. O executor do card 6 ajusta se algum
domínio ficar mais leve, e a regra do lint continua: todo tema de módulo
aparece uma vez, dias em sequência, nenhum tema antes do pré-requisito.

| Dias    | Conteúdo                                                                                               |
| ------- | ------------------------------------------------------------------------------------------------------ |
| 1       | Método e `como-ler-uma-questao-clf`                                                                    |
| 2 a 5   | Domínio 1, um tema por dia                                                                             |
| 6       | Checkpoint do Domínio 1 e primeira prova simulada, no ritmo do exame (cerca de 1,4 minuto por questão) |
| 7 a 11  | Domínio 2                                                                                              |
| 12      | Checkpoint do Domínio 2 e segunda prova                                                                |
| 13 a 21 | Domínio 3                                                                                              |
| 22      | Checkpoint do Domínio 3 e terceira prova                                                               |
| 23 a 26 | Domínio 4                                                                                              |
| 27      | Checkpoint do Domínio 4                                                                                |
| 28      | Prova completa: 65 questões em 90 minutos, sem consultar nada                                          |
| 29      | Atacar os dois domínios mais fracos pelo resultado da véspera                                          |
| 30      | Véspera: reler como ler uma questão, cards vencidos e parar                                            |

`prazoSugeridoDias: 30`. As notas dos dias seguem o tom das da SAA: uma
frase útil, sem promessa de aprovação.

## 8. Os cards e o modelo de cada um

Seis cards, um commit cada, mensagem `feat(clf): ... (LUM-nn)` em
Conventional Commits, sem trailer de coautoria. Quem executa move o card para
Desenvolvendo antes da primeira linha, registra a evidência em `Corte` e move
para Deploy; Done é do dono, no celular.

| #   | Card                                                                                | Modelo | Por quê                                                                                               |
| --- | ----------------------------------------------------------------------------------- | ------ | ----------------------------------------------------------------------------------------------------- |
| 1   | Onda 1: trilha publicada, exame vigiado, como ler uma questão e Domínio 1           | Opus   | Mistura código, teste e os quatro temas mais conceituais; o tema de método define o tom dos outros 22 |
| 2   | Domínio 2: Segurança e conformidade (30%)                                           | Opus   | Maior peso do exame e distratores sutis (GuardDuty contra Inspector, KMS contra CloudHSM)             |
| 3   | Domínio 3, parte 1: operar, infraestrutura global, computação, armazenamento e rede | Sonnet | Temas de catálogo: serviço, uma linha, pista no enunciado; o molde resolve                            |
| 4   | Domínio 3, parte 2: bancos, analytics e IA, integração, gestão e demais categorias  | Sonnet | Idem                                                                                                  |
| 5   | Domínio 4: Cobrança, preços e suporte (12%)                                         | Sonnet | Memorização estruturada; a tabela de planos de suporte é o coração                                    |
| 6   | Fechamento: cronograma de 30 dias, auditoria cruzada e verificação em produção      | Opus   | Ler os 23 temas contra o guia e entre si exige julgamento                                             |

Critério de aceite comum: gates da seção 5 verdes, deploy verde, a página da
trilha e a prova simulada abrindo em produção com o conteúdo do card, sitemap
e feed contando os temas novos, nenhum erro de console. O card 5 acrescenta:
prova simulada com 65 questões em 90 minutos sorteadas nos quatro domínios.
O card 6 acrescenta: `docs/PLANO.md` §4.3 e §10 atualizados, README citando
as quatro trilhas, e a memória do projeto anotando a trilha concluída.

## 9. O que fica fora deste plano

- SAP-C02: próxima certificação, com plano próprio depois desta.
- "Próxima trilha sugerida" ao concluir (Dados para CLF, CLF para SAA), citado
  no `docs/PLANO.md` §1: é funcionalidade de produto, não conteúdo, e merece
  card à parte.
- Compartilhar temas entre CLF e SAA: decidido contra, seção 3.

## 10. Como a trilha ficou

Escrito no LUM-148, depois da auditoria de fechamento.

A trilha saiu do tamanho planejado: **23 temas**, cronograma de **30 dias** em
sequência, cada tema agendado uma vez só, e um banco objetivo de
**92 questões** (69 de resposta única e 23 de resposta múltipla), sorteadas por
peso de domínio na prova simulada. Somados, os temas dão **618 minutos**, que é
o que a página da trilha exibe como 10 h 18 min; o cronograma acomoda isso em
30 dias porque seis deles são checkpoint, prova simulada, ataque aos domínios
fracos e véspera, sem tema novo.

O que divergiu do plano:

- **O modelo.** O plano previa que os cards de conteúdo pudessem ser escritos
  por um modelo mais barato. Não deu: do card 3 ao 5, com quatro a nove temas
  por card e um tema passando de 250 linhas, o Sonnet estourou o limite de
  contexto antes de fechar o card. Os cards 3, 4 e 5 foram refeitos com Opus, e
  o LUM-148 também. Fica a lição: tema de certificação é conteúdo longo e denso,
  e o corte por modelo tem de ser feito por card, não por trilha.
- **Tempo de resposta dos planos de suporte.** O plano pedia a tabela de
  severidade com o tempo de resposta de cada plano. A página oficial de planos
  mudou de estrutura e deixou de publicar esses tempos no formato antes citado,
  então nenhum número entrou na trilha. Os planos são ensinados pelo que cada
  degrau libera (canal de atendimento, alcance do Trusted Advisor,
  acompanhamento designado), que é como a prova cobra.
- **README.** A seção 8 previa o README citando as quatro trilhas. O README não
  lista nem conta trilhas em lugar nenhum, então não houve o que atualizar; a
  contagem vive no catálogo do site, que é gerado a partir de
  `content/trilhas/index.ts`.
- **Banco de questões.** O card de fechamento falava em 88 questões; a contagem
  real no repositório é 92, e foi essa que entrou no `docs/PLANO.md`.

A auditoria de cobertura do LUM-148 conferiu os task statements dos quatro
domínios e a lista de serviços em escopo do guia oficial contra os 23 temas, e
achou vinte e cinco assuntos sem nenhuma menção. Todos foram acrescentados aos temas
existentes, sem tema novo: ESG nos resultados do CAF, a sigla BYOL, política de
senha e identidade federada no IAM, o AWS Directory Service, o Security Center e
o Security Blog, a sigla network ACL, os quatro motivos para usar mais de uma
região, o instance store, o AWS SCT, o WorkSpaces Secure Browser, a reserva de
capacidade e os graus de flexibilidade da reserva, a AWS Health API, o
Prescriptive Guidance, o Support Center, a equipe de Trust and Safety, os ISVs e
integradores de sistemas com os benefícios de parceiro, e os serviços que
faltavam da lista em escopo: Transit Gateway, Service Quotas, Compute Optimizer,
Migration Evaluator, Elastic Disaster Recovery e AWS RAM.

A auditoria de coerência achou uma duplicação real: a tabela de security group
contra lista de controle de acesso de rede estava repetida quase palavra por
palavra em `servicos-de-seguranca-da-aws` (dia 10) e em
`rede-e-conectividade-na-aws` (dia 17). A tabela ficou no tema que o leitor
encontra primeiro e o outro passou a remeter a ele em uma frase, que é a mesma
convenção já usada entre `gestao-monitoramento-e-outros-servicos` e
`conformidade-e-governanca-na-aws`. Fora isso, as descrições de serviço
repetido entre temas (Trusted Advisor, CloudWatch, CloudTrail, Config,
Organizations, S3, IAM, Well-Architected) estavam consistentes: mudam a ênfase,
não o significado. Nenhum tema da CLF referencia tema da SAA, e nenhum da SAA
referencia tema da CLF.
