# Dashboards e indicadores que alguém usa

> Como um painel deixa de ser enfeite: definir a pergunta e a ação antes do layout, escolher indicadores que mudam decisão, organizar do resumo ao detalhe, e resolver as questões que a sabatina cobra — de que momento é o número, quem pode ver, e o que fazer com o painel que ninguém abre.

Fonte: https://lumarys.com.br/trilhas/engenharia-de-analytics/dataviz/dashboards-e-indicadores/ · Lumarys (marca da Cernyn) · CC BY-NC-SA 4.0

## Em uma frase

Painel útil nasce de **quem usa e que decisão toma**, não de layout: poucos
indicadores de topo, organização do resumo ao detalhe, e o número sempre
acompanhado de **quando** ele foi apurado e **contra o quê** é comparado.

## Métrica e indicador não são a mesma coisa

<Termo nome="métrica">Qualquer número medido: sessões, registros processados, ticket médio.</Termo>

<Termo nome="indicador">Métrica escolhida para acompanhar um objetivo, com meta, responsável e frequência definidos.</Termo>

A distinção importa porque explica por que nem todo número merece estar no
painel. Se ninguém tem meta nem responde por aquele número, ele é métrica
operacional — e ocupa espaço que deveria ser de decisão.

## As quatro perguntas antes do layout

<Passos itens={[
"Quem vai usar de fato? Diretoria e gerência regional precisam de coisas diferentes.",
"Que decisão essa pessoa toma olhando o painel? Se ninguém responde, o pedido é de relatório, não de painel.",
"Com que frequência ela olha? Define se o dado é diário ou quase em tempo real, o que muda arquitetura e custo.",
"O que ela faz quando o número está ruim? Se não há ação possível, aquele número talvez não precise estar ali."
]} />

<Callout tipo="atencao" titulo="A pergunta que desarma pedido genérico">
"Que decisão você toma olhando isso?" É a que mais economiza trabalho. Pedido
que não sobrevive a ela costuma virar um relatório mensal — mais barato de
fazer e mais honesto sobre o que é.
</Callout>

## Organizar do resumo ao detalhe

Três camadas, na ordem em que a pessoa lê:

<Comparativo
colunas={["Camada", "Conteúdo", "Para quem"]}
linhas={[
["Topo", "Três a cinco indicadores com meta e tendência", "Quem abre com pressa"],
["Decomposição", "O mesmo indicador por região, canal, produto", "Quem quer saber onde está concentrado"],
["Detalhe", "Tabela filtrável, registro a registro", "Quem vai investigar um caso"]
]}
/>

Acima de cinco indicadores no topo, a pessoa deixa de olhar para todos e o
painel perde a função de resumo.

## O que todo painel precisa mostrar sobre si mesmo

- **De que momento é o número**: carimbo da última atualização e janela de
  corte. Metade das discussões de divergência entre painéis é defasagem, não
  cálculo — e o carimbo na tela encerra essas discussões sem reunião.
- **A referência**: meta, período anterior, ou ambos. Número sem referência não
  sustenta decisão.

<Callout tipo="dica" titulo="Não recalcule a métrica no painel">
O painel deve consumir a **tabela certificada**. Escrever a consulta dentro da
ferramenta é exatamente como nascem duas definições vivas de "venda" na mesma
empresa. Isso liga este tema diretamente a Source of Record e Source of Truth.
</Callout>

## Acesso e camada em memória

**Segurança em nível de linha** permite que um painel único sirva várias
regiões, cada pessoa vendo só o que lhe cabe. É o mecanismo certo quando a
alternativa seria duplicar o painel por área.

E, quando há camada em memória (o SPICE do QuickSight, por exemplo), o número é
do **último refresh**. Isso precisa estar visível, ou a divergência com a
origem vira chamado toda semana.

## Painel que ninguém abre

Medir o uso — usuários distintos, frequência, páginas acessadas — faz parte do
trabalho. Painel abandonado custa manutenção e, pior, faz circular número
velho com aparência de acompanhado. Quando o uso não aparece, a conversa é com
quem pediu, e aposentar é uma resposta legítima.

E há o caso em que o painel nem era a ferramenta certa: se a pessoa só precisa
saber **quando algo sai da faixa**, um **alerta** serve melhor que um painel
que ela teria de lembrar de abrir.

## Como responder isso em voz alta

Comece pelas perguntas de uso e deixe claro que o layout vem depois. Cite
poucos indicadores de topo, a organização em camadas, o consumo da tabela
certificada e o carimbo de atualização. Termine com a medição de uso — é a
parte que quase ninguém menciona e que mostra que você já viu painel morrer.
