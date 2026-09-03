# Spark: RDD, transformações e ações

> RDD é a coleção distribuída, imutável e particionada que está na base do Spark. Transformações montam plano, ações executam; narrow encadeia, wide causa shuffle. É também API legada: hoje se escreve DataFrame, que passa pelo Catalyst.

Fonte: https://lumarys.com.br/trilhas/engenharia-de-dados/spark/spark-rdd/ · Lumarys (marca da Cernyn) · CC BY-NC-SA 4.0

## Em uma frase

RDD é uma **coleção distribuída, imutável e particionada** de registros, capaz de
se reconstruir sozinha depois de uma falha — e é a abstração de baixo nível sobre
a qual o Spark inteiro foi construído.

## As quatro propriedades

<Passos itens={[
  "Distribuído: os registros estão espalhados pelas máquinas do cluster.",
  "Imutável: nenhuma transformação altera o RDD existente; cada uma cria outro.",
  "Particionado: a partição é a unidade de paralelismo, e vira uma task.",
  "Resiliente: perdeu uma partição, o Spark recomputa só ela a partir do lineage."
]} />

A imutabilidade não é purismo funcional. É o que torna a recomputação segura:
como nada muda depois de criado, refazer uma partição produz exatamente o mesmo
resultado.

## Transformações e ações

<Comparativo
  colunas={["Tipo", "Devolve", "Executa?", "Exemplos"]}
  linhas={[
    ["Transformação", "Outro RDD", "Não: acrescenta ao plano", "map, filter, flatMap, reduceByKey, join"],
    ["Ação", "Valor ao driver ou escrita no destino", "Sim: dispara o job", "count, collect, take, reduce, saveAsTextFile"]
  ]}
/>

Você encadeia transformações à vontade e nada acontece. A ação é o gatilho.

## Narrow e wide

<Termo nome="dependência narrow">Cada partição de saída depende de no máximo uma partição de entrada.</Termo>
<Termo nome="dependência wide">Uma partição de saída depende de várias partições de entrada, porque a mesma chave precisa se reunir num lugar só.</Termo>

`map`, `filter`, `flatMap` e `union` são narrow: cada executor resolve o que tem em
mãos e o Spark encadeia essas etapas dentro do mesmo stage, sem tráfego de rede.

`groupByKey`, `reduceByKey`, `join`, `distinct` e `repartition` são wide. Para
somar o gasto de um cartão, todas as transações daquele cartão precisam terminar
na mesma partição, e não há como saber onde elas estão sem redistribuir. Isso é o
**shuffle**: serializar, gravar em disco local, transferir pela rede, reler.

<Callout tipo="dica" titulo="reduceByKey contra groupByKey">
Os dois são wide, mas `reduceByKey` agrega parcialmente em cada executor antes de
mandar pela rede. Em gasto por cartão, isso pode significar trafegar um valor por
cartão por partição em vez de todas as transações. `groupByKey` é fonte clássica
de estouro de memória em tabela grande.
</Callout>

## Lineage e tolerância a falhas

O Spark guarda como cada RDD foi derivado do anterior. Esse registro é o
**lineage**, e ele funciona como uma receita de reconstrução.

Quando um executor cai, o Spark não recorre a réplica: ele **recomputa**. Olha o
lineage, identifica quais partições se perderam, e reexecuta apenas as tasks
daquelas partições em outro executor. Se o shuffle anterior ainda existir em
disco, ele parte de lá; senão, refaz desde a leitura.

<Callout tipo="atencao" titulo="Não confunda com replicação">
Replicação de blocos é comportamento do HDFS, no armazenamento. Tolerância a
falhas do Spark é no processamento e é por recomputação. Trocar as duas coisas é
um erro que a banca reconhece na hora.
</Callout>

## RDD é API legada

Essa é a parte que o material de curso costuma não dizer. O RDD é a API original,
de 2014, e continua sendo a base de execução do Spark — mas **não é mais a API que
se escreve**. Hoje o padrão é DataFrame e Spark SQL.

O motivo é o **Catalyst**, o otimizador. Ele só consegue trabalhar se conhecer o
esquema e a semântica da operação: aí empurra filtro para a leitura do arquivo,
descarta colunas que ninguém pediu, reordena joins e escolhe a estratégia física.
Com RDD, o conteúdo da sua função é opaco: o Spark executa literalmente o que você
mandou, na ordem em que você mandou.

<Callout tipo="atencao" titulo="Sobre a ementa oficial">
O material oficial da ementa apresenta o Spark pela API de RDD [verificar: confirmar
como a ementa do Itaú trata o assunto]. Isso não está errado — é a fundação, e a
pergunta pode vir nesse vocabulário. O que muda é a recomendação prática: responda
o conceito de RDD com segurança e acrescente, por conta própria, que na
implementação você escreveria DataFrame. Esse acréscimo costuma valer ponto.
</Callout>

## Quando RDD ainda cabe

Três situações defensáveis: **controle fino** sobre particionamento ou sobre a
partição como unidade de processamento; **dado sem esquema**, como binário ou texto
livre que você precisa parsear antes de estruturar; e **código legado** que já roda
bem e não justifica reescrita.

Fora isso, descer para RDD é abrir mão de otimização de graça.
