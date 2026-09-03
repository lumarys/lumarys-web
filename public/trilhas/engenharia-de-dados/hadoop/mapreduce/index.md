# MapReduce

> Map transforma cada registro em pares chave-valor, o shuffle agrupa tudo que tem a mesma chave e o reduce agrega. É simples de entender e caro de executar: entre cada estágio o resultado vai para o disco, e é aí que mora o gargalo.

Fonte: https://lumarys.com.br/trilhas/engenharia-de-dados/hadoop/mapreduce/ · Lumarys (marca da Cernyn) · CC BY-NC-SA 4.0

## Em uma frase

MapReduce é um modelo de processamento em que **map transforma cada registro em
pares chave-valor**, o **shuffle agrupa tudo que tem a mesma chave** e o
**reduce agrega** cada grupo.

## O paradigma

A ideia central é restringir o que o programador pode fazer para que o framework
consiga paralelizar e tolerar falha sozinho.

<Passos itens={[
  "Map: recebe um registro por vez e emite zero, um ou vários pares chave-valor. Nenhum mapper enxerga o conjunto inteiro — é isso que permite rodar centenas em paralelo.",
  "Shuffle: o framework aplica uma função de partição à chave, transfere os pares pela rede, ordena e agrupa. Ao final, todos os valores de uma chave estão no mesmo reducer.",
  "Reduce: recebe uma chave e o iterador com todos os valores dela, e produz o resultado agregado."
]} />

Como map e reduce são funções determinísticas sobre entrada imutável, o
framework pode reexecutar qualquer tarefa que falhe em outro nó, sem coordenação
complicada. Foi essa propriedade que tornou o processamento em hardware comum
viável.

## Passo a passo: total transacionado por agência

Imagine o arquivo diário de transações do banco, dividido em três pedaços que
vão para três mappers.

**Entrada do mapper 1:**

```
2026-03-01;0421;PIX;250.00
2026-03-01;0917;CARTAO;80.00
2026-03-01;0421;CARTAO;120.00
```

**Saída do map** — chave é a agência, valor é o montante:

```
(0421, 250.00)
(0917, 80.00)
(0421, 120.00)
```

Os outros dois mappers fazem o mesmo com seus pedaços, ao mesmo tempo, em outras
máquinas.

**Shuffle.** O framework decide, pela função de partição, que a agência 0421 vai
para o reducer A e a 0917 para o reducer B. Todos os pares de 0421 emitidos pelos
três mappers atravessam a rede até o reducer A.

**Entrada do reducer A:**

```
(0421, [250.00, 120.00, 940.00, 310.00, ...])
```

**Saída do reduce:**

```
(0421, 41820.00)
```

Repare que o volume que trafega no shuffle é proporcional ao número de pares
emitidos pelo map — não ao número de agências. É esse detalhe que o combiner
ataca.

## O combiner

O combiner é uma agregação parcial que roda **no lado do map**, sobre a saída
daquele mapper, antes do shuffle.

No exemplo acima, em vez de o mapper 1 mandar `(0421, 250.00)` e `(0421,
120.00)` pela rede, o combiner soma localmente e manda `(0421, 370.00)`. Com
milhões de transações e algumas milhares de agências, isso derruba o tráfego em
ordens de grandeza — e derruba junto o trabalho do reducer.

<Callout tipo="atencao" titulo="Combiner só serve para agregação associativa e comutativa">
O framework pode chamar o combiner zero, uma ou várias vezes — é uma otimização,
não uma garantia. Soma, contagem, mínimo e máximo funcionam. Média direta não:
média de médias não é a média. Para calcular ticket médio, o combiner precisa
emitir soma e contagem, e o reducer divide no fim.
</Callout>

## Onde está o gargalo

A resposta que a banca espera não é "CPU". É **I/O**.

<Comparativo
  colunas={["Momento", "O que acontece", "Custo"]}
  linhas={[
    ["Saída do map", "Os pares são gravados no disco local do nó do mapper", "Escrita em disco proporcional ao volume emitido"],
    ["Shuffle", "Os pares atravessam a rede até o reducer de destino, com ordenação e agrupamento", "Rede e disco — o ponto mais caro do job"],
    ["Saída do reduce", "O resultado é gravado no HDFS, com replicação", "Escrita multiplicada pelo fator de replicação"],
    ["Próximo job", "Lê tudo de volta do HDFS para começar", "Todo o custo acima novamente, por etapa da cadeia"]
  ]}
/>

Duas consequências práticas:

**Pipeline encadeado paga muitas vezes.** Um cálculo de cinco etapas vira cinco
jobs, e cada um materializa o resultado no HDFS com replicação para o seguinte
ler. O tempo é dominado por escrever e reler dado que só existe para ser
consumido pelo passo seguinte.

**Chave enviesada trava o job.** O job termina no ritmo da tarefa mais lenta. Se
você agrupa por estabelecimento e um grande varejista concentra o volume, um
reducer trabalha sozinho enquanto os outros já acabaram.

<Callout tipo="dica" titulo="A otimização de maior retorno">
Reduzir o volume que entra no shuffle. Filtrar cedo no map, projetar só as
colunas necessárias e usar combiner quando a agregação permitir. Otimizar o
reduce sem mexer no shuffle costuma render pouco.
</Callout>

## Por que Spark é mais rápido para o mesmo trabalho

Duas razões, e a banca quer as duas.

**Execução em memória.** O Spark mantém o dado intermediário em memória quando
cabe, em vez de gravar em disco entre estágios. Em processamento iterativo, em
que o mesmo conjunto é percorrido várias vezes, a diferença é grande.

**DAG em vez de jobs encadeados.** O Spark monta o grafo acíclico de todas as
transformações antes de executar. Com o plano na mão, ele funde operações em um
mesmo estágio e só materializa quando precisa — tipicamente na fronteira de
shuffle. O MapReduce não tem essa visão: cada job é independente e sempre grava
o resultado.

<Callout tipo="erro" titulo="O que não muda">
O shuffle continua existindo no Spark e continua sendo a operação mais cara.
Chave enviesada continua travando estágio. Trocar de motor melhora o custo entre
etapas; não conserta uma distribuição ruim de chave.
</Callout>

## Como responder isso em voz alta

Descreva as três fases nomeando o que entra e o que sai de cada uma. Faça o
exemplo bancário com números pequenos — total por agência funciona melhor que
contar palavras, porque mostra domínio. Diga que o gargalo é I/O, separando
escrita em disco de tráfego de rede. Acrescente combiner e chave enviesada como
os dois pontos de ataque. Feche com Spark, citando memória **e** DAG, e admita
que o shuffle não desaparece.
