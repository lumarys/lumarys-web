# Camada semântica e definição de métricas

> O lugar onde a definição de um indicador vive uma vez só: o que é camada semântica, por que a métrica calculada dentro de cada painel produz números divergentes, como escrever uma definição que não admite interpretação, e quem responde por ela.

Fonte: https://lumarys.com.br/trilhas/engenharia-de-analytics/alem-da-ementa/camada-semantica-e-metricas/ · Lumarys (marca da Cernyn) · CC BY-NC-SA 4.0

## Em uma frase

A camada semântica é onde a **definição de uma métrica vive uma vez só** e de
onde qualquer ferramenta recebe o mesmo número — mas ela não decide **qual**
definição vale: isso é decisão de negócio.

## Por que os números divergem

A causa estrutural não é cálculo errado: é **duplicação**. Quando cada painel
implementa a própria versão de "receita", as versões evoluem separadas. Uma
passa a excluir cancelamento, outra não; uma usa a data do pedido, outra a do
faturamento. Ninguém errou — e os números não batem.

<Comparativo
colunas={["Onde a métrica é definida", "O que acontece"]}
linhas={[
["Dentro de cada painel", "Lógica duplicada, evolução separada, divergência garantida"],
["Numa consulta compartilhada por cópia", "Divergem assim que alguém edita a cópia"],
["Na camada semântica", "Definida uma vez, consumida por todos, muda num lugar só"]
]}
/>

<Termo nome="camada semântica">Lugar onde métricas e dimensões são definidas de forma consultável, para que ferramentas diferentes recebam o mesmo número com a mesma regra.</Termo>

Ela **não** é o dicionário de dados: o dicionário descreve o significado de
colunas; a camada define **métricas**, e é consumida em tempo de consulta.

## O que uma definição precisa ter

<Passos itens={[
"Nome e fórmula.",
"Janela de tempo.",
"Filtros e exclusões: cancelamento, teste interno, pedido de funcionário.",
"Qual data usar: do pedido, do faturamento ou do pagamento.",
"Grão a que ela se aplica.",
"Dono, que é do negócio.",
"Versão, com data de vigência."
]} />

<Callout tipo="atencao" titulo="As duas omissões que mais causam divergência">
**Qual data usar** e **quais exclusões**. Receita pela data do pedido, do
faturamento e do pagamento dá três números — e todo mundo acha óbvio qual é o
certo, até comparar com a área do lado.
</Callout>

O teste de uma boa definição é operacional: **duas pessoas implementam a partir
do texto e chegam ao mesmo número**. Se não chegam, o problema está no texto.

## O problema é organizacional

Três áreas com três definições de "cliente ativo" quase sempre têm três
definições **legítimas** para contextos diferentes. A camada semântica dá o
lugar para resolver, mas alguém precisa **decidir**:

- Se uma é a oficial da empresa, ela é implementada uma vez, com dono do
  negócio, e as outras são aposentadas.
- Se as três são legítimas, a saída não é escolher: é **dar três nomes
  distintos**, cada um com dono, e abandonar a palavra genérica.

<Callout tipo="dica" titulo="Mudar a definição muda o passado">
Redefinir uma métrica altera a série histórica inteira quando recalculada. Sem
datar a mudança e comunicar, quem olha o gráfico vê uma quebra e acredita que
ela é do negócio. Versionar a definição não é burocracia: é o que preserva a
leitura da série.
</Callout>

## Como isso fecha com o resto da trilha

A camada semântica é onde a **regra de precedência** de Source of Truth vira
executável: a métrica oficial é definida sobre a **tabela certificada**, e
todo consumidor — painel, consulta, modelo — recebe esse número. O painel para
de recalcular, e a divergência deixa de ter por onde nascer.

## Como responder isso em voz alta

Comece dizendo que o problema é organizacional. Mostre as diferenças nos eixos
concretos (janela, critério, exclusão, data). Peça **decisão e dono de
negócio**. Só então proponha a implementação única na camada, sobre a tabela
certificada. E declare o efeito na série histórica — é a parte que o resto das
pessoas esquece e que, esquecida, gera a próxima crise de confiança.
