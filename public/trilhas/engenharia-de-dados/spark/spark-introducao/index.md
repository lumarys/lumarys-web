# Spark: introdução

> Spark é um motor de processamento distribuído que substituiu o MapReduce por manter dado intermediário em memória e por montar um plano antes de executar. Driver, cluster manager e executores; lazy evaluation, DAG e a fronteira de stage que o shuffle cria.

Fonte: https://lumarys.com.br/trilhas/engenharia-de-dados/spark/spark-introducao/ · Lumarys (marca da Cernyn) · CC BY-NC-SA 4.0

## Em uma frase

Spark é um motor de processamento distribuído que divide o dado em partições,
**monta um plano antes de executar** e processa em paralelo num cluster,
encadeando etapas em memória em vez de gravar cada uma em disco.

## Por que ele substituiu o MapReduce

O MapReduce resolveu o problema de processar dado em muitas máquinas comuns, mas
com um custo estrutural: **cada etapa grava o resultado em disco**. Um pipeline de
cinco etapas paga cinco idas e voltas ao HDFS. Em carga iterativa — treino de
modelo, recálculo de score — isso domina o tempo.

O Spark encadeia operações dentro de um mesmo estágio sem materializar em disco, e
só grava quando é obrigado. Some a isso duas coisas: uma API muito mais expressiva
que escrever `map` e `reduce` à mão, e o fato de montar o plano inteiro antes de
executar, o que abre espaço para otimização.

<Callout tipo="atencao" titulo="Cuidado com a frase pronta">
"Spark é rápido porque roda em memória" é meia resposta e a banca percebe. Diga o
que ele deixa de fazer: não grava o intermediário de cada etapa em disco. E deixe
claro que ele não carrega a base inteira na RAM — trabalha por partição e derrama
para disco quando não cabe.
</Callout>

## Arquitetura: quem faz o quê

<Comparativo
  colunas={["Componente", "Onde roda", "Responsabilidade"]}
  linhas={[
    ["Driver", "Processo da sua aplicação", "Mantém a SparkSession, converte o código em DAG, divide em stages e tasks, agenda nos executores e recebe o resultado das ações"],
    ["Cluster manager", "Serviço externo (standalone, YARN, Kubernetes)", "Aloca recursos: quantos executores, com quanta memória e quantos núcleos"],
    ["Executor", "Nós de trabalho", "Roda as tasks sobre as partições, mantém cache e grava a saída de shuffle"]
  ]}
/>

Repare que o driver **não processa dado**. Ele coordena. Quando você chama
`collect()`, aí sim o dado vem para ele — e é por isso que essa ação derruba
aplicação.

## Lazy evaluation

<Termo nome="transformação">Operação que devolve outro conjunto distribuído e apenas acrescenta um nó ao plano: filter, select, join, groupBy.</Termo>
<Termo nome="ação">Operação que devolve um valor ao driver ou escreve num destino, e por isso dispara a execução: count, collect, show, write.</Termo>

Você pode encadear vinte transformações e não ver nada acontecer. Isso é
proposital. Com o plano completo em mãos, o otimizador consegue empurrar filtros
para perto da leitura, descartar colunas que ninguém usa e combinar operações.

Um efeito colateral que você deve saber citar: **erro de transformação aparece na
ação**. O rastreamento de pilha aponta a linha do `count()`, não a do `join`
errado — saber disso poupa horas de depuração.

## DAG, job, stage e task

<Passos itens={[
  "Ação chamada: o driver fecha o plano lógico e o otimizador gera o plano físico.",
  "Job: cada ação dispara um job.",
  "DAG: o job vira um grafo acíclico dirigido de operações.",
  "Stage: o DAG é cortado nos pontos de shuffle. Sem shuffle, tudo cabe num stage só.",
  "Task: cada stage vira N tasks, uma por partição, e é isso que roda no executor."
]} />

<Termo nome="shuffle">Redistribuição de dados entre executores, necessária quando a mesma chave precisa terminar no mesmo lugar.</Termo>

A fronteira do stage é o shuffle porque, enquanto cada partição pode ser
processada isoladamente, o Spark encadeia tudo sem parar. No momento em que o
`groupBy` exige que todas as transações do mesmo cartão fiquem juntas, o estágio
anterior precisa terminar e gravar sua saída antes de o próximo poder ler.

<Callout tipo="dica" titulo="Como isso vira resposta de sabatina">
Se perguntarem por que um job está lento, a primeira hipótese defensável é
shuffle: quantos stages, quanto cada um lê e escreve, e se há uma task destoando
das demais na Spark UI. Isso é raciocínio, não chute.
</Callout>

## O que acontece de verdade num .count()

Você chama a ação. O driver fecha e otimiza o plano, monta o DAG e o corta em
stages nos pontos de shuffle. Cada stage vira tasks, uma por partição. O cluster
manager já entregou os executores; o driver agenda as tasks neles. Os executores
leem suas partições, aplicam as operações e, se houver shuffle, gravam a saída
para o estágio seguinte. No último estágio cada task devolve uma contagem parcial,
o driver soma e imprime um número.

O detalhe que impressiona: **o único dado que volta ao driver é esse número**. Foi
o cluster inteiro que trabalhou, e a resposta cabe num inteiro.
