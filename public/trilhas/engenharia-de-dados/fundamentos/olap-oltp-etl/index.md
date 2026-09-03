# OLAP, OLTP e ETL

> OLTP registra a transação enquanto ela acontece; OLAP responde perguntas sobre o histórico. ETL é a ponte entre os dois. Por que separar, quais camadas existem no data warehouse e o que muda no modelo de dados.

Fonte: https://lumarys.com.br/trilhas/engenharia-de-dados/fundamentos/olap-oltp-etl/ · Lumarys (marca da Cernyn) · CC BY-NC-SA 4.0

## Em uma frase

**OLTP** registra a transação no instante em que ela acontece; **OLAP** responde
perguntas sobre o conjunto histórico dessas transações; **ETL** é o processo que
leva o dado de um mundo para o outro.

## Dois propósitos, portanto dois desenhos

A diferença não começa no desempenho. Começa na pergunta que cada sistema
existe para responder.

O sistema transacional existe para que o PIX saia da sua conta e entre na conta
do beneficiário sem sumir no meio. Isso exige atomicidade, integridade
referencial e resposta em milissegundos. Para conseguir isso, o modelo é
normalizado: cada informação em um lugar só, sem redundância, para que a escrita
seja pequena e consistente.

O sistema analítico existe para responder qual foi o ticket médio por segmento
nos últimos 24 meses. Isso exige varrer muita linha, agregar e cruzar contexto.
Para conseguir isso, o modelo é desnormalizado em fato e dimensão, e o
armazenamento costuma ser colunar, porque a consulta lê poucas colunas de muitas
linhas.

<Comparativo
  colunas={["Aspecto", "OLTP", "OLAP"]}
  linhas={[
    ["Propósito", "Registrar a operação do dia a dia", "Analisar o histórico para decidir"],
    ["Unidade de trabalho", "Transação curta, poucas linhas", "Consulta longa, muitas linhas"],
    ["Modelo", "Normalizado, terceira forma normal", "Dimensional: fato e dimensão"],
    ["Carga", "Escrita intensa, leitura por chave", "Leitura intensa, escrita em lote"],
    ["Histórico", "Estado atual e janela recente", "Anos de histórico preservado"],
    ["Latência esperada", "Milissegundos", "Segundos a minutos"],
    ["Concorrência", "Milhares de sessões curtas", "Dezenas de consultas pesadas"],
    ["Exemplo no banco", "Autorizar compra no cartão", "Inadimplência por safra de originação"]
  ]}
/>

## Por que não fazer o relatório direto no transacional

Essa é a pergunta que a banca faz. Três motivos, em ordem de peso:

**Contenção.** Uma consulta que varre milhões de linhas disputa CPU, memória,
cache e I/O com as transações que estão acontecendo agora. O efeito aparece como
latência na autorização de cartão, que é justamente o que não pode acontecer.

**Bloqueio e versões.** Dependendo do nível de isolamento, a consulta longa
segura bloqueios de leitura ou obriga o banco a manter versões antigas de linha
enquanto ela roda. Isso incha o mecanismo de versionamento e atrasa quem escreve.

**Modelo.** O core é normalizado. Perguntar "ticket médio por segmento e canal"
ali vira uma consulta com dez joins, difícil de escrever, difícil de manter e
cara de executar. E o histórico que a pergunta pede muitas vezes já foi expurgado
do transacional.

<Callout tipo="atencao" titulo="Réplica de leitura não é a resposta completa">
Uma réplica tira a contenção do primário e é um bom paliativo. Mas ela replica o
mesmo modelo normalizado, o mesmo motor orientado a linha e a mesma ausência de
histórico. Dizer isso na sabatina mostra que você separou o sintoma da causa.
</Callout>

## O data warehouse e suas camadas

Data warehouse é o repositório integrado, histórico e orientado a assunto que
serve a carga analítica. Ele não é uma tabela grande: é um caminho com camadas,
e cada camada existe para desacoplar um problema.

<Passos itens={[
  "Staging: área de pouso do dado extraído, o mais próximo possível da origem. Volátil, sem regra de negócio. Existe para que a extração não dependa da transformação.",
  "ODS: base integrada de várias origens, granular e atual, para consumo operacional. Ex.: visão do cliente no atendimento. Não é lugar de histórico analítico.",
  "Warehouse: o núcleo integrado, histórico, com dimensões conformadas — a mesma dimensão de cliente valendo para cartão, crédito e investimentos.",
  "Data mart: recorte por domínio, já modelado para consumo. Ex.: data mart de cartões para o BI da área."
]} />

## Modelagem dimensional, o mínimo para a sabatina

A <Termo nome="tabela fato">tabela que guarda os eventos mensuráveis do negócio,
com métricas e chaves para as dimensões</Termo> registra o que aconteceu: uma
transação de cartão, com valor, data e as chaves de cliente, produto e
estabelecimento.

A <Termo nome="tabela dimensão">tabela que descreve o contexto do evento e
fornece filtros e agrupamentos</Termo> registra o contexto: quem é o cliente,
qual o produto, qual a agência, qual o dia.

E antes das duas vem o **grão**: a resposta para "o que é uma linha desta fato".
Uma transação autorizada? Um dia por conta? Um mês por contrato? O grão define
quais dimensões cabem e quais métricas podem ser somadas.

<Callout tipo="erro" titulo="Grão indefinido dobra número">
Se você mistura na mesma fato uma linha por transação e uma linha por
consolidação diária, qualquer soma passa a contar duas vezes. O erro não aparece
no build, aparece no comitê. Defina o grão antes de desenhar a tabela.
</Callout>

O aprofundamento de esquema estrela, floco de neve e dimensão que muda com o
tempo vem no tema de modelagem de dados. Para a sabatina de fundamentos, saber
definir fato, dimensão e grão com um exemplo bancário já cobre.

## ETL como processo

<Passos itens={[
  "Extract: tira o dado da origem, de preferência incremental (por data de processamento ou por CDC), para não varrer tudo todo dia.",
  "Transform: padroniza tipo e fuso, deduplica por chave, trata nulo e valor fora de faixa, aplica regra de negócio, conforma dimensões e reconcilia total contra a origem.",
  "Load: grava no destino de forma idempotente — sobrescrita de partição ou merge por chave — para que reexecutar o job não duplique nada."
]} />

<Callout tipo="dica" titulo="Idempotência é o detalhe que impressiona">
Job falha e é reexecutado. Se a sua carga soma em vez de substituir, a segunda
execução dobra o valor. Falar em sobrescrita de partição ou merge por chave
mostra que você já operou pipeline, não só desenhou um.
</Callout>

## Como responder isso em voz alta

Comece separando propósito, não desempenho. Diga o que cada sistema existe para
fazer, mostre que o propósito determina o modelo, e só então liste as
consequências: contenção, bloqueio, join e histórico. Feche com o caminho
staging, warehouse, data mart e um exemplo de cartão ou PIX. Cerca de noventa
segundos, e a rubrica inteira está coberta.
