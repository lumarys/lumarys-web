# Processamento batch e stream

> Batch processa um lote fechado, com começo e fim; stream processa um fluxo que não acaba. A diferença real está em latência, custo e complexidade — e em event time versus processing time, que é onde a maioria das respostas desmonta.

Fonte: https://lumarys.com.br/trilhas/engenharia-de-dados/processamento/batch-vs-stream/ · Lumarys (marca da Cernyn) · CC BY-NC-SA 4.0

## Em uma frase

Batch processa um **conjunto fechado**, com começo e fim conhecidos; stream
processa um **fluxo sem fim**, em que você decide com o que já chegou e nunca
viu tudo.

## A diferença real não é velocidade

Muita gente resume batch como "lento" e stream como "rápido". A diferença
estrutural é outra: em batch você sabe onde o dado termina, em stream não. Isso
muda tudo. Em batch dá para ordenar, agrupar e recalcular o conjunto inteiro. Em
stream você precisa decidir quanto tempo espera antes de fechar uma conta que
talvez ainda receba um registro atrasado.

<Comparativo
  colunas={["Aspecto", "Batch", "Stream"]}
  linhas={[
    ["Fronteira do dado", "Lote fechado: o arquivo do dia, a partição do mês", "Fluxo aberto: nunca acaba"],
    ["Latência típica", "Minutos a horas", "Milissegundos a segundos"],
    ["Custo", "Paga o cluster durante a janela de execução", "Paga cluster ligado o tempo todo, mais estado"],
    ["Complexidade", "Baixa: rodou, terminou, dá para reexecutar", "Alta: estado, atraso, ordem, plantão"],
    ["Reprocessar", "Simples: aponta para a partição e roda de novo", "Difícil: precisa reler o tópico e refazer o estado"],
    ["Exemplo no banco", "Reporte regulatório mensal, recálculo de limite", "Score de fraude na autorização, alerta de saldo"]
  ]}
/>

## Micro-batch: o meio de campo

O Spark Structured Streaming, por padrão, não processa evento a evento. Ele
agrupa a chegada em **micro-lotes** de alguns segundos e roda batch em cima. Você
ganha o modelo mental de batch com latência de segundos, e paga com um piso de
latência que não desce a milissegundos. Flink, por outro lado, processa registro
a registro.

Isso é uma resposta de sabatina, não trivialidade: se o negócio pede resposta em
duzentos milissegundos, micro-batch não entrega.

## Event time e processing time

<Termo nome="event time">O momento em que o fato aconteceu: a hora da compra registrada pela maquininha.</Termo>
<Termo nome="processing time">O momento em que o motor viu o evento.</Termo>

Os dois relógios divergem sempre que há fila, retentativa, agência sem rede ou
reprocessamento. A consequência prática é dura: **agregação por processing time
não é reproduzível**. Rode o mesmo histórico duas vezes e os números da janela
mudam, porque a chegada mudou. Em banco, isso significa um fechamento que não
bate com o de ontem e uma conversa desagradável com a área de controles.

Por isso a regra é agregar por event time. E aí aparece o problema seguinte: se o
evento pode chegar atrasado, quando você fecha a janela?

## Watermark e dado atrasado

O **watermark** é o limite de atraso que você aceita. Declarar watermark de trinta
minutos é dizer: "não espero mais evento com event time anterior a agora menos
trinta". Com isso o motor fecha a janela, emite o resultado e libera o estado.

<Callout tipo="atencao" titulo="O trade-off do watermark é de negócio">
Watermark longo aumenta a completude e o custo de memória e de latência.
Watermark curto libera estado e entrega rápido, mas descarta transação legítima
que chegou tarde. Quem decide o número é quem convive com o resultado
incompleto, não a infraestrutura.
</Callout>

Evento que chega depois do watermark não deve sumir. Mande para uma trilha
separada e tenha um job batch de reconciliação que recalcula a janela com tudo.

## Garantias de entrega

<Passos itens={[
  "at-most-once: commita o offset antes de processar. Em falha, perde o evento.",
  "at-least-once: processa e depois commita. Em falha, reprocessa e duplica.",
  "exactly-once: offset, estado e escrita no destino avançam de forma consistente."
]} />

Exactly-once é caro porque não é uma propriedade do transporte: é uma propriedade
do conjunto transporte mais estado mais destino. Exige checkpoint, armazenamento
de estado durável e um destino transacional ou idempotente. Cada uma dessas peças
custa latência, dinheiro e um ponto a mais de falha.

<Callout tipo="dica" titulo="O caminho barato para o mesmo efeito">
Na prática, o desenho mais comum no banco é at-least-once no transporte com
escrita idempotente no destino: `MERGE` em tabela Delta pela chave da transação.
O efeito visível é exactly-once, sem o custo de coordenação distribuída.
</Callout>

## Como escolher

Comece pelo prazo em que a decisão perde valor. Se o consumidor age em segundos
— bloquear cartão, alertar saldo, atualizar extrato no app — é stream. Se o
consumidor age em horas ou dias, e o resultado precisa ser auditável — reporte
ao regulador, fechamento, treino de modelo — é batch.

A resposta madura costuma ser as duas: stream para a decisão em linha e batch
para reprocessar, recalibrar e corrigir o que o stream errou.
