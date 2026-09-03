# Spark avançado: DataFrame, tuning e streaming

> Como o Spark realmente executa: Catalyst planeja, AQE replaneja em tempo de execução e o shuffle é onde o tempo vai embora. Skew, broadcast, cache, UDF em Python e as noções de Structured Streaming que a banca cobra.

Fonte: https://lumarys.com.br/trilhas/engenharia-de-dados/alem-da-ementa/spark-avancado/ · Lumarys (marca da Cernyn) · CC BY-NC-SA 4.0

## Em uma frase

Spark avançado é saber que **Catalyst planeja, AQE replaneja e o shuffle é onde o
tempo vai embora** — e conseguir provar cada hipótese na Spark UI.

## DataFrame e Spark SQL: por que a API mudou

Com RDD você descreve **como** processar; o motor executa o que você mandou.
Com DataFrame e Spark SQL você descreve **o que** quer, e aí o otimizador tem
espaço para reescrever. Essa é a razão técnica da mudança, não preferência de
sintaxe. Se a banca perguntar quando usar RDD, a resposta honesta é: quase
nunca, só em manipulação de baixo nível que a API estruturada não expressa.

## Catalyst

<Termo nome="Catalyst">Otimizador de consultas do Spark: analisa a expressão, aplica regras de otimização lógica, gera planos físicos candidatos e escolhe um.</Termo>

O que ele faz de mais visível no dia a dia:

<Passos itens={[
  "Empurra o filtro para perto da leitura (predicate pushdown), inclusive para dentro do Parquet.",
  "Empurra a projeção: se você usa 3 colunas, ele não lê as outras 57.",
  "Poda partições quando o filtro bate na coluna de particionamento.",
  "Reordena joins e escolhe a estratégia de cada um: broadcast, sort-merge ou hash.",
  "Gera código Java especializado para o estágio, em vez de interpretar operador por operador."
]} />

O ponto prático: **tudo isso depende de o Catalyst enxergar sua lógica**. É por
isso que UDF em Python custa caro — ela é opaca para o otimizador.

## AQE: replanejar durante a execução

O plano do Catalyst nasce de estimativas. AQE usa **estatísticas reais** dos
estágios já concluídos para corrigir o plano no meio do caminho. Três
otimizações que valem decorar:

- Junta partições de shuffle pequenas demais, evitando milhares de tarefas
  minúsculas.
- Divide partições de shuffle desbalanceadas, atacando skew em alguns tipos de
  join.
- Converte sort-merge join em broadcast join quando descobre que um lado é
  pequeno de verdade.

<Callout tipo="atencao" titulo="AQE não é bala de prata">
Ele atua sobre partições de shuffle. Concentração extrema numa única chave, ou
desbalanceamento que existe antes do shuffle, continuam pedindo salting ou
tratamento manual das chaves quentes.
</Callout>

## Shuffle: o operador caro

Shuffle é redistribuir dados entre executores para que as linhas da mesma chave
fiquem juntas. Custa por três motivos somados: serialização e escrita em disco
local, transferência pela rede, e a **barreira** — o próximo estágio só começa
quando o anterior termina inteiro.

Provocam shuffle: `join` por chave, `groupBy` e agregações, `distinct`,
`orderBy`, `repartition` e window function cuja partição difere da atual.

<Comparativo
  colunas={["", "repartition", "coalesce"]}
  linhas={[
    ["Faz shuffle", "Sim, completo", "Não"],
    ["Pode aumentar partições", "Sim", "Não, só reduz"],
    ["Distribuição resultante", "Equilibrada", "Pode ficar desigual"],
    ["Uso típico", "Rebalancear antes de um join pesado", "Reduzir número de arquivos antes de escrever"]
  ]}
/>

## Broadcast join

Quando um lado do join é pequeno, o Spark envia a tabela inteira para cada
executor e elimina o shuffle do lado grande. Junta transações com a dimensão de
bandeira sem embaralhar bilhões de linhas.

Ele escolhe sozinho quando **estima** que o lado cabe no limite configurado. A
estimativa vem das estatísticas da fonte; sem elas, ou com elas desatualizadas,
o plano cai em sort-merge join. Quando você vê isso no plano, atualize
estatísticas — e só então considere um hint.

## Data skew

<Termo nome="data skew">Distribuição desigual das chaves, em que uma ou poucas concentram volume desproporcional e caem todas na mesma partição.</Termo>

**Como perceber**: na Spark UI, dentro de um stage, quase todas as tarefas
terminam rápido e uma ou poucas demoram muito, com shuffle read muito maior.
Confirme contando linhas por chave.

**Como tratar**, em ordem de esforço: habilitar o skew join do AQE; usar
broadcast, se o outro lado for pequeno; isolar as chaves quentes num caminho
separado e unir o resultado; e, por último, **salting** — acrescentar um sufixo
aleatório à chave para espalhá-la em várias partições, replicando o lado menor
para cada valor do sal.

Em banco isso é comum: conta agregadora de lojista, cliente institucional com
milhões de transações, ou chave nula usada como preenchimento.

## Cache e persist

Cache só paga quando o **mesmo** DataFrame é reutilizado várias vezes numa
cadeia cara. Não use quando o dado é lido uma vez só, quando ele não cabe na
memória dos executores ou quando ler a origem já é barato. Cache mal colocado
rouba memória de execução e provoca spill, deixando o job mais lento
exatamente enquanto você tenta acelerá-lo.

## UDF em Python

Cada linha atravessa a fronteira JVM-Python com serialização, e o Catalyst não
enxerga o que a função faz — logo não empurra filtro, não reordena, não gera
código. A ordem de preferência é: função nativa do Spark SQL, depois UDF
vetorizada com Pandas (que processa em lote via Arrow), e só então UDF comum.

## Structured Streaming, em noções

O stream é tratado como uma tabela que cresce. O motor processa em
**micro-batches**: a cada intervalo de trigger, um pequeno job em lote roda
sobre o que chegou desde a última execução. Três conceitos que a banca cobra:

- **Trigger**: define quando o micro-batch dispara — por intervalo fixo, o mais
  rápido possível, ou uma única passada sobre o que existe.
- **Checkpoint**: guarda até onde a fonte foi consumida e o estado das
  agregações. É o que permite retomar após falha sem perder nem duplicar.
- **Modo de saída**: append, update ou complete, conforme o que faz sentido para
  a agregação e para o destino.

Num banco, o caso típico é scoring de fraude sobre autorizações: janela curta,
checkpoint obrigatório e destino em tabela Delta para o histórico continuar
consultável em lote.
