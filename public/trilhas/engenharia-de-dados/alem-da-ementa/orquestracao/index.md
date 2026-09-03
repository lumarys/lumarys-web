# Orquestração de pipelines

> Orquestrador não processa dado: ele decide o que roda, em que ordem, quando e o que fazer quando falha. Airflow, idempotência, retry com backoff, backfill e os anti-padrões que a banca procura.

Fonte: https://lumarys.com.br/trilhas/engenharia-de-dados/alem-da-ementa/orquestracao/ · Lumarys (marca da Cernyn) · CC BY-NC-SA 4.0

## Em uma frase

Orquestrador é o componente que decide **o que roda, em que ordem, quando e o que
fazer quando falha** — e que não deve, ele mesmo, processar o dado.

## O que ele resolve

Cinco problemas, sempre os mesmos:

<Passos itens={[
  "Dependência: a agregação de fraude só pode começar depois que a carga de cartão terminou",
  "Ordem: o grafo declara a sequência, em vez de deixá-la implícita em horários",
  "Retry: falha transitória de rede não pode virar chamado às 3h da manhã",
  "Agendamento: por relógio, por evento ou por chegada de dado",
  "Visibilidade: qual janela rodou, quando, com qual duração e qual resultado"
]} />

Cron entrega só o quarto item. Todo o resto vira gambiarra em shell script.

## Airflow em cinco peças

Uma **DAG** é o grafo dirigido acíclico das tasks e das dependências entre elas.
Ela declara o fluxo; não é o lugar do processamento.

Um **operator** é o molde de uma task que executa uma ação: submeter um job no
Databricks, rodar um SQL, chamar uma API. Um **sensor** é uma task que espera uma
condição — arquivo do parceiro no S3, partição criada, tabela liberada.

O **scheduler** lê as DAGs, calcula quais task instances estão prontas e as
enfileira. O **executor** define onde a task enfileirada roda: processos locais,
workers Celery ou pods Kubernetes.

<Callout tipo="dica" titulo="Frase que fecha a pergunta">
Scheduler decide, executor executa, operator descreve a ação, sensor descreve a
espera, DAG descreve a ordem.
</Callout>

## Idempotência é o requisito número um

<Termo nome="idempotência">Rodar a mesma task sobre a mesma janela uma ou várias vezes deixa o destino no mesmo estado final.</Termo>

Por que é o mais importante: o orquestrador **vai** reexecutar. É o que ele faz de
madrugada, sozinho, sem perguntar. Se a task não for idempotente, a
funcionalidade que existe para dar resiliência passa a ser a maior fonte de dado
duplicado do lake.

Duas receitas práticas:

- **Sobrescrever a partição** da data de referência em vez de dar append. Barato,
  mas exige janela fechada.
- **MERGE pela chave de negócio** (identificador da transação, por exemplo).
  Aguenta dado atrasado e correção, mas lê o destino, então custa mais.

E o detalhe que derruba backfill: parametrize sempre pela **data lógica da
execução**, nunca por `current_date`. No reprocessamento de janeiro, o relógio
marca hoje.

## Retry, backoff e backfill

Retry cobre falha transitória: rede, throttling, cluster subindo. Sem **backoff**,
tentar de novo a cada 30 segundos pressiona uma origem já degradada. Com número
máximo de tentativas, falha permanente para de se disfarçar de amarelo eterno.

**Backfill** é reexecutar janelas passadas — porque falhou ou porque a regra
mudou. Reprocessar seis meses de extrato só é operação de rotina se cada janela
for independente e idempotente. Caso contrário é projeto.

## SLA e alerta

SLA é o prazo declarado da entrega. Sem ele, o pipeline travado às 2h é
descoberto às 9h pelo usuário do relatório regulatório. Alerta útil dispara em
dois eventos: falha da task e SLA estourado — este último pega o pipeline que
está rodando, mas devagar demais.

## Anti-padrões

<Comparativo
  colunas={["Anti-padrão", "Por que quebra", "O que fazer"]}
  linhas={[
    ["DAG que processa o dado", "Worker do orquestrador não escala e vira ponto único de falha", "Task submete job no Databricks ou EMR e acompanha o estado"],
    ["Dependência por horário", "No dia de pico o upstream atrasa e o downstream lê dado incompleto", "Sensor de partição, trigger do upstream ou evento"],
    ["Task não idempotente", "Retry automático duplica lançamento", "Sobrescrita de partição ou MERGE por chave"],
    ["Retry sem backoff nem limite", "Derruba origem degradada e esconde falha permanente", "Backoff exponencial com tentativas máximas"]
  ]}
/>

## Airflow, Databricks Workflows e Step Functions

<Comparativo
  colunas={["Ferramenta", "Onde brilha", "Custo de escolher"]}
  linhas={[
    ["Airflow", "Fluxo que cruza muitos sistemas; DAG em Python versionada; ecossistema grande de operators", "Você opera o cluster de controle: scheduler, banco de metadados, workers"],
    ["Databricks Workflows", "Quase tudo é notebook ou job Spark na própria plataforma; integra com Unity Catalog e cluster job", "Fica preso ao perímetro Databricks quando o fluxo puxa serviços de fora"],
    ["AWS Step Functions", "Fluxo feito de serviços AWS, serverless, com máquina de estados e retry declarativos", "Orquestração fica em JSON e a lógica se espalha entre estados e Lambdas"]
  ]}
/>

<Callout tipo="atencao" titulo="Onde a banca aperta">
A pergunta raramente é qual ferramenta é melhor. É por que a sua escolha não vai
duplicar dado no retry e como você descobre a falha antes do usuário.
</Callout>
