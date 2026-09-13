# Estatística para analytics, sem virar estatístico

> O mínimo que impede conclusão errada: por que a média engana e a distribuição não, correlação que não é causalidade, variação normal confundida com tendência, o paradoxo de Simpson, viés de sobrevivência e o que um teste A/B realmente prova.

Fonte: https://lumarys.com.br/trilhas/engenharia-de-analytics/alem-da-ementa/estatistica-para-analytics/ · Lumarys (marca da Cernyn) · CC BY-NC-SA 4.0

## Em uma frase

A estatística que o engenheiro de analytics precisa não é a de derivar
fórmula: é a que **impede conclusão errada** — variação normal, distribuição
em vez de média, e a distância entre associação e causa.

## A média engana; a distribuição, não

Renda, ticket, tempo de resposta e duração de sessão quase sempre são
assimétricos ou têm valores extremos. Nesses casos, a média descreve mal o
típico.

<Comparativo
colunas={["O que reportar", "O que ela responde"]}
linhas={[
["Média", "Quanto daria se dividisse igualmente (sensível a extremos)"],
["Mediana", "O valor do caso do meio: o típico"],
["Quartis", "Onde estão os 25% menores e maiores"],
["Histograma", "A forma: há um grupo ou dois?"]
]}
/>

<Callout tipo="atencao" titulo="O caso das duas populações">
"A nota média é 8,2, nossos clientes estão satisfeitos" — com metade dando 10 e
metade dando 6. A média existe, e não descreve **ninguém**. O histograma mostra
duas populações e muda completamente a conversa.
</Callout>

## Associação não é causa

<Termo nome="autosseleção">Quando as pessoas escolhem em qual grupo estar. Quem opta por usar um recurso já é diferente de quem não opta, e essa diferença contamina qualquer comparação entre os dois grupos.</Termo>

É a armadilha mais cobrada: "quem usa o recurso converte o dobro". Pode ser o
recurso causando — ou o cliente engajado, que já convertia mais, sendo o que
adota o recurso.

Duas saídas, em ordem de custo:

1. **Checagem barata**: os grupos já eram diferentes **antes** do lançamento? Se
   sim, a hipótese cai sem experimento nenhum.
2. **Experimento**: oferecer a uma parcela **aleatória**, comparar com controle,
   com tamanho e duração definidos **antes**.

<Callout tipo="dica" titulo="Parar quando deu bom">
Olhar o teste todo dia e encerrar quando aparece significância é a forma mais
comum de **fabricar** um resultado. Por isso tamanho de amostra e duração são
definidos antes e respeitados — e por isso significância **não** é o mesmo que
relevância: com amostra grande, diferenças minúsculas ficam significantes.
</Callout>

## Variação normal: confirmar que houve fato

Antes de explicar uma queda, confirme que ela é diferente do ruído. "Caiu 8%"
num indicador que oscila 10% por semana não é evento — e investigar isso gera
narrativa para algo que não aconteceu.

<Passos itens={[
"Olhar a série de várias semanas, não só a anterior: qual é a oscilação habitual?",
"Considerar sazonalidade: feriado, virada de mês, campanha. O comparativo honesto costuma ser a mesma semana do ano anterior.",
"Se continua fora do padrão, decompor: concentrado numa região ou canal aponta causa; queda uniforme costuma ser sistêmico.",
"Checar falha de dado. Pipeline que rodou parcialmente parece exatamente queda de vendas."
]} />

## Duas armadilhas com nome

**Paradoxo de Simpson.** Um padrão no agregado pode **se inverter** em cada
subgrupo, quando os subgrupos têm tamanhos e taxas diferentes. A campanha pode
parecer melhor no total e ser pior em todas as faixas de idade. A defesa é
simples: sempre olhar segmentado.

**Viés de sobrevivência.** Analisar só quem restou e concluir sobre todos.
Entrevistar clientes atuais sobre a mudança de preço ignora exatamente quem
saiu por causa dela.

## A pergunta que desarma quase tudo

**Comparado com o quê?** Período anterior, mesmo período do ano passado, grupo
de controle, variação habitual. Toda conclusão apressada morre nessa pergunta,
e fazê-la em voz alta na sabatina é mais valioso que qualquer fórmula.

## Como responder isso em voz alta

Separe **o que o dado mostra** do **que ele não mostra**. Ofereça a checagem
barata antes do experimento caro. Para qualquer movimento de indicador,
confirme **variação habitual e sazonalidade** antes de procurar causa. E diga
sempre o que é achado e o que é suposição — é isso que faz alguém confiar no
próximo número que você trouxer.
