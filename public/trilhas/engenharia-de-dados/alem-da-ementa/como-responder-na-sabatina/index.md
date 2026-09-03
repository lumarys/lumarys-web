# Como responder na sabatina

> A estrutura que faz uma resposta oral pontuar: contexto, opções, trade-offs e recomendação. Como abrir com pergunta de esclarecimento, como admitir que não sabe sem perder ponto e os erros de comunicação que derrubam candidato bom.

Fonte: https://lumarys.com.br/trilhas/engenharia-de-dados/alem-da-ementa/como-responder-na-sabatina/ · Lumarys (marca da Cernyn) · CC BY-NC-SA 4.0

## Em uma frase

Resposta oral que pontua tem quatro movimentos: **contexto, opções, trade-offs e
recomendação** — nessa ordem, em até dois minutos.

## A estrutura, passo a passo

<Passos itens={[
  "Contexto: diga o que entendeu da pergunta e qual premissa está assumindo",
  "Opções: nomeie dois ou três caminhos reais, mesmo os que você vai descartar",
  "Trade-offs: diga o que cada caminho custa, não só o que ele entrega",
  "Recomendação: escolha um, justifique e declare o que te faria mudar de ideia"
]} />

Parece longo escrito. Falado, cabe em noventa segundos. A vantagem é que a banca
consegue te acompanhar e marcar a rubrica dela enquanto você fala — e rubrica marcada
é ponto.

### Como isso soa na prática

Pergunta: *"O banco quer detectar fraude em transações de cartão. Como você
desenharia?"*

**Contexto:** "Antes de desenhar, a decisão precisa sair durante a autorização, em
milissegundos, ou é detecção posterior? Vou assumir tempo real, com pico alto."

**Opções:** "Há três caminhos: batch noturno, micro-batch e streaming contínuo."

**Trade-offs:** "Batch é o mais barato e o mais simples de operar, mas não atende: a
transação já passou. Micro-batch traz a latência para segundos e reaproveita quem já
conhece Spark. Streaming entrega milissegundos e cobra em operação, estado e evento
fora de ordem."

**Recomendação:** "Eu iria de streaming para o score na autorização, com batch em
paralelo para retreino e auditoria. Mudaria de ideia se a latência exigida fosse de
minutos — aí micro-batch entrega o mesmo valor por muito menos complexidade."

## Comece pela pergunta de esclarecimento

Questão de cenário é ambígua **de propósito**. Ela testa se você desenha para o
problema certo. Uma ou duas perguntas que realmente mudam a resposta — latência,
volume, se a origem suporta captura de mudança, quem é o consumidor — valem mais que
cinco minutos de solução para o problema errado.

<Callout tipo="atencao" titulo="Limite: duas perguntas">
Três ou mais perguntas de esclarecimento deixam de parecer método e passam a parecer
fuga. Se não vier resposta, assuma em voz alta: "vou assumir X" — e siga.
</Callout>

## Trade-off sem parecer indeciso

A diferença é uma frase. Indeciso para em "depende". Sênior diz **de que** depende,
escolhe, e nomeia a condição de mudança:

<Comparativo
  colunas={["Soa indeciso", "Soa sênior"]}
  linhas={[
    ["Depende de vários fatores", "Depende da latência exigida e do volume de pico"],
    ["Os dois têm vantagens", "Batch custa menos e não atende milissegundos; streaming atende e cobra operação"],
    ["Eu ficaria em cima do muro", "Eu iria de streaming; mudaria para micro-batch se a janela for de minutos"]
  ]}
/>

## Quando você não sabe

A frase é: **"Não sei, mas raciocinaria assim: ..."** — e então o método. Que
problema essa coisa provavelmente resolve, o que você testaria, onde procuraria,
quem consultaria.

Isso pontua mais que chute por dois motivos. Chute errado **contamina o que veio
antes**: a banca passa a duvidar do que você já tinha acertado. E o que está sendo
avaliado é raciocínio, que você consegue demonstrar sem conhecer a ferramenta.

<Callout tipo="erro" titulo="O que não fazer">
Silêncio longo, mudança de assunto e definição inventada que soa plausível. As três
são lidas como a mesma coisa: você não sabe e não quis dizer.
</Callout>

## Erros de comunicação que derrubam candidato bom

**Responder rápido demais.** Dois a quatro segundos de pausa são bem vistos. Se
precisar de mais, verbalize: "deixa eu organizar isso em duas frentes".

**Monólogo.** Ser interrompido é o sinal. Feche em dois minutos e devolva: "eu iria
por aqui; quer que eu detalhe a parte de X?".

**Jargão sem tradução.** Diga o termo e emende uma frase: "CDC, que é capturar só o
que mudou na origem em vez de trazer a tabela inteira". Cinco segundos, outra nota.

**Negar a premissa.** "O pipeline está lento" é o cenário, não um convite ao debate.
Aceite e investigue dentro dele.

## Exemplo da sua experiência

Use o formato **situação, ação, resultado**, em três frases. Caso pequeno e
verdadeiro vale mais que projeto grande e vago. Assuma o erro quando o exemplo for de
erro: terceirizar culpa é o que a banca menos quer ouvir. E prepare dois ou três
casos antes, porque improvisar história sob pressão sai confuso.

## Tempo, voz e corpo

De um a dois minutos por resposta, até três em arquitetura. Se a pergunta tem duas
partes, anuncie: "vou responder em duas frentes" — isso segura a atenção e evita que
você esqueça a segunda.

Fale mais devagar do que o instinto pede: ansiedade acelera e a banca perde o fio.
Faça pausa entre os quatro movimentos, é ela que dá estrutura audível à resposta. Em
vídeo, olhe para a câmera nos fechamentos, não para a sua própria imagem. Mãos
visíveis, tronco à frente, e nada de ler resposta pronta — dá para ouvir.

## O último conselho

Ensaie **em voz alta**, cronometrado, respondendo às perguntas orais de cada tema
desta trilha. Ler a resposta modelo não treina a fala. Gravar sessenta segundos e se
ouvir é desconfortável e é o exercício que mais melhora a nota em pouco tempo.
