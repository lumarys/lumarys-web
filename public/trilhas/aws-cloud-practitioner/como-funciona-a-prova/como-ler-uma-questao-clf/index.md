# Como ler uma questão da CLF

> A prova CLF-C02 descreve uma necessidade em duas ou três linhas e pede o serviço, o conceito ou a prática que atende. Este tema é o formato do exame, a pontuação, os dois tipos de questão e o método de achar o pedido antes de olhar as alternativas.

Fonte: https://lumarys.com.br/trilhas/aws-cloud-practitioner/como-funciona-a-prova/como-ler-uma-questao-clf/ · Lumarys (marca da Cernyn) · CC BY-NC-SA 4.0

## Em uma frase

A CLF-C02 não pede arquitetura: ela descreve uma necessidade em duas ou três
linhas e pergunta qual serviço, conceito ou prática atende, com quatro
alternativas que são todas reais e quase todas vizinhas da certa.

## O formato, para não ser surpresa

<Comparativo
colunas={["", "Como é"]}
linhas={[
["Questões", "65, das quais 50 pontuam; 15 não pontuam e não são identificadas"],
["Tempo", "90 minutos, cerca de 1,4 minuto por questão"],
["Tipos", "Escolha única (1 certa de 4) e múltipla resposta (2 ou mais certas em 5 ou mais)"],
["Nota", "Escala de 100 a 1000, equalizada entre versões; passa com 700"],
["Penalidade", "Nenhuma por erro; questão não respondida conta como errada"],
["Domínios", "Conceitos 24% · Segurança 30% · Tecnologia 34% · Cobrança 12%"]
]}
/>

A pontuação é **compensatória**: basta passar no total, não em cada domínio.
O quadro por domínio que vem no resultado serve para você saber onde é fraco,
não para aprovar ou reprovar.

## O que a questão realmente pergunta

O guia diz quem é o candidato-alvo: alguém com até seis meses de exposição à
AWS, de qualquer papel. E diz o que está fora: codificar, desenhar arquitetura,
resolver incidentes, implementar e testar carga. Isso muda tudo na hora de ler.

Uma questão da CLF é quase sempre uma destas três formas:

<Passos itens={[
"Necessidade e serviço: 'a equipe precisa de X; qual serviço atende?'. A resposta é um nome do catálogo.",
"Prática e conceito: 'qual princípio ou pilar descreve isto?'. A resposta é um conceito, não um produto.",
"Responsabilidade e limite: 'de quem é esta tarefa?'. A resposta separa o que a AWS faz do que o cliente faz."
]} />

Em nenhuma delas você monta solução. Você **reconhece e posiciona**.

## O pedido é o verbo mais o objeto

Na SAA o desempate está numa palavra em maiúsculas. Na CLF o desempate está no
**verbo** do enunciado, porque os quatro serviços tratam do mesmo assunto e só
um faz aquele verbo.

<Comparativo
colunas={["O enunciado diz", "O pedido é", "O distrator típico"]}
linhas={[
["Detectar comportamento suspeito", "Achar ameaça em atividade", "O serviço que acha vulnerabilidade"],
["Saber quanto foi gasto por projeto", "Analisar custo passado", "O serviço que alerta sobre custo futuro"],
["Baixar relatório de conformidade", "Obter documento pronto", "O serviço que audita configuração"],
["Guardar arquivo acessado uma vez por ano", "Arquivar barato", "A classe de acesso frequente"],
["Rodar código sem gerenciar servidor", "Executar sem infraestrutura", "A máquina virtual com script de instalação"]
]}
/>

<Callout tipo="atencao" titulo="O distrator da CLF é sempre real">
Nenhuma alternativa da CLF é absurda. Ela cita um serviço que existe, do mesmo
tema, com propósito ligeiramente diferente. Quem decora o nome sem decorar o
propósito cai em todas. Por isso cada tema desta trilha traz o serviço em uma
linha **e** a pista que o aponta no enunciado: são as duas metades da mesma
resposta.
</Callout>

## O método, em quatro passos

<Passos itens={[
"Leia as duas ou três linhas inteiras antes de olhar as alternativas. É rápido: o enunciado da CLF é curto de propósito.",
"Diga em voz baixa o pedido, verbo mais objeto, com as suas palavras. Se você não consegue, releia; não adianta ir para a lista.",
"Elimine por propósito, não por familiaridade. Pergunte de cada alternativa: este serviço faz esse verbo?",
"Passou de dois minutos: marque para revisar e siga. Nunca deixe em branco, porque não responder conta como errada."
]} />

<Callout tipo="dica" titulo="Múltipla resposta é onde se perde ponto bobo">
O enunciado diz quantas escolher, e a correção é pelo conjunto exato. Se você
tem certeza de duas e uma terceira parece plausível, a terceira é o distrator:
ela está ali exatamente para isso. Marque o número pedido, nem uma a mais.
</Callout>

## Como responder o cenário

Leia o verbo, não o assunto. Quatro serviços de segurança numa lista não
significam quatro respostas possíveis: significam quatro verbos diferentes, e
só um combina com o do enunciado. Depois confira o nível: se a sua resposta
exige desenhar algo, dimensionar algo ou investigar um incidente, você saiu do
escopo da CLF e provavelmente escolheu a alternativa acima do pedido.
