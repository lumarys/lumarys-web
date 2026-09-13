# Percepção visual e escolha do gráfico

> Por que alguns gráficos são lidos em meio segundo e outros exigem esforço: a hierarquia de precisão da percepção, a pergunta que determina a forma (comparar, compor, distribuir, relacionar, evoluir), e os erros que distorcem a leitura sem mentir no número.

Fonte: https://lumarys.com.br/trilhas/engenharia-de-analytics/dataviz/percepcao-e-escolha-do-grafico/ · Lumarys (marca da Cernyn) · CC BY-NC-SA 4.0

## Em uma frase

A escolha do gráfico se justifica por **como a percepção funciona**, não por
gosto: comparamos **posição e comprimento** com muito mais precisão que
**ângulo, área e cor** — e a pergunta de negócio decide a forma.

## A hierarquia que sustenta toda justificativa

Do mais preciso para o menos:

<Passos itens={[
"Posição numa escala comum (dispersão, pontos alinhados).",
"Comprimento (barras).",
"Ângulo e inclinação (pizza, linha).",
"Área (bolhas, treemap).",
"Volume e cor (mapas de calor, 3D)."
]} />

É daqui que sai a resposta para "por que não pizza": com sete categorias,
ninguém ordena as fatias do meio, e a pessoa acaba **lendo os rótulos** — sinal
de que o gráfico não fez o trabalho dele.

<Termo nome="atributo pré-atentivo">Característica visual processada antes da atenção consciente — cor, tamanho, posição, orientação. É o que faz um ponto saltar da tela em milissegundos, e por isso é um recurso escasso.</Termo>

## A pergunta decide a forma

<Comparativo
colunas={["Pergunta de negócio", "Forma", "Por quê"]}
linhas={[
["Qual é maior?", "Barras ordenadas", "Comprimento, o canal preciso para comparar"],
["Está subindo?", "Linha", "Inclinação comunica tendência"],
["Uma coisa acompanha a outra?", "Dispersão", "Posição em duas escalas comuns"],
["Do que é feito o total?", "Barra empilhada única", "Composição sem exigir comparação fina"],
["Como se distribui?", "Histograma ou boxplot", "Mostra forma, e não só a média"],
["Qual é o valor exato?", "Tabela", "Quando o número importa mais que o padrão"]
]}
/>

<Callout tipo="atencao" titulo="O eixo truncado">
Em **barras**, começar fora do zero quebra a proporção entre comprimento e
valor: dois pontos de diferença viram uma montanha. Em **linha**, truncar é
aceitável, porque o que se lê é a variação — mas deixe o corte explícito. Saber
distinguir os dois casos é o que separa a regra decorada do critério.
</Callout>

## Cor: poderosa e escassa

Usada em todas as séries, a cor deixa de destacar. O padrão que funciona é
**uma cor para o que importa e cinza para o resto** — a mensagem aparece sem
ninguém procurar.

E há a parte que é acessibilidade, não estética: **vermelho e verde** como
único diferenciador exclui cerca de 8% dos homens. A correção não é só trocar
a paleta; é **não depender só de cor**: acrescente rótulo direto, forma ou
posição.

<Callout tipo="dica" titulo="Rótulo direto vence legenda">
Legenda no canto obriga o olho a ir e voltar para cada série. Nome junto do
fim da linha elimina esse vaivém. É a mudança que mais reduz esforço de
leitura sem tocar em um único número.
</Callout>

## O segundo eixo

Dois eixos verticais com escalas diferentes criam uma correlação visual que
**depende de como as escalas foram escolhidas** — ou seja, ela pode ser
fabricada, com ou sem intenção. Prefira dois gráficos alinhados no mesmo eixo
de tempo, ou normalize as séries.

## Como responder isso em voz alta

Nunca justifique por gosto. Diga **qual pergunta o gráfico responde**, **qual
canal perceptual ele usa** e **por que esse canal é adequado à pergunta**.
Quando discordarem, mostre os dois e faça uma pergunta concreta — "qual é o
terceiro maior?" — porque a hesitação de quem olha a pizza convence mais que
qualquer teoria.
