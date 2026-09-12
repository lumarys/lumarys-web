# Como ler uma questão da SAA

> A prova SAA-C03 não pergunta o que um serviço faz; descreve um cenário e pede a melhor arquitetura para ele. Este tema é o formato do exame, a pontuação, os dois tipos de questão e o método para ler o enunciado antes de olhar as alternativas.

Fonte: https://lumarys.com.br/trilhas/aws-solutions-architect-associate/como-funciona-a-prova/como-ler-uma-questao-saa/ · Lumarys (marca da Cernyn) · CC BY-NC-SA 4.0

## Em uma frase

A SAA-C03 descreve um cenário e pede a **melhor** arquitetura para ele; "melhor"
é definido por uma palavra do enunciado (menor custo, menor esforço operacional,
mais resiliente), e ler essa palavra antes das alternativas é metade da prova.

## O formato, para não ser surpresa

<Comparativo
colunas={["", "Como é"]}
linhas={[
["Questões", "65, das quais 50 pontuam; 15 são experimentais e não identificadas"],
["Tempo", "130 minutos, dois por questão"],
["Tipos", "Escolha única (1 de 4) e múltipla resposta (2 ou mais de 5 ou mais)"],
["Nota", "Escala de 100 a 1000, equalizada entre versões; aprova com 720"],
["Penalidade", "Nenhuma por erro; branco conta como errada"],
["Domínios", "Seguras 30% · Resilientes 26% · Alto desempenho 24% · Custo 20%"]
]}
/>

A pontuação é **compensatória**: você precisa passar no total, não em cada
domínio. Um domínio fraco não reprova sozinho, e é por isso que o peso importa
na hora de decidir onde investir a última semana.

## O que a questão realmente pergunta

Uma questão da SAA quase nunca é "o que faz o serviço X". Ela é um parágrafo:
uma empresa, uma aplicação, uma restrição, e um pedido. Entre as alternativas,
duas ou três **funcionam**. Só uma atende ao pedido do jeito que ele foi feito.

O pedido está numa palavra, geralmente em maiúsculas na prova real:

<Comparativo
colunas={["Palavra", "Aponta para", "Descarta"]}
linhas={[
["MENOR esforço operacional", "Serviço gerenciado, serverless", "EC2 com script, banco auto-hospedado"],
["MENOR custo", "Spot, Savings Plans, classe fria, endpoint em vez de NAT", "Sob demanda 24x7, Standard para arquivo, multi-região sem pedido"],
["MAIS resiliente / alta disponibilidade", "Multi-AZ, Auto Scaling em várias AZs, failover", "Uma AZ, instância única"],
["MAIS rápido de implementar", "Reaproveitar o que existe, migração com mudança mínima", "Redesenho completo"],
["MAIS seguro", "Menor privilégio, criptografia, endpoint privado", "Chave no código, bucket público, tráfego pela internet"]
]}
/>

<Callout tipo="atencao" titulo="A pegadinha mais comum">
A prova pune resposta **acima** do requisito tanto quanto abaixo. Se o enunciado
pede tolerância à falha de uma zona, a alternativa multirregião está errada:
custa mais e faz mais do que foi pedido. "Melhor" na SAA é "exatamente o que
foi pedido, do jeito mais barato ou mais simples".
</Callout>

## O método, em quatro passos

<Passos itens={[
"Leia o enunciado inteiro antes de olhar qualquer alternativa. As alternativas foram escritas para parecerem certas a quem chega nelas sem o requisito fixado.",
"Sublinhe mentalmente a palavra que define a resposta e o número pedido em múltipla resposta. Sem isso você vai escolher a alternativa mais familiar, não a certa.",
"Elimine o que não funciona. Depois, entre as que funcionam, escolha pela palavra. Duas alternativas corretas com uma resposta certa é o desenho normal da questão.",
"Passou de dois minutos: marque para revisar e siga. Nunca deixe em branco; se o tempo acabar, chute vale mais que vazio."
]} />

## Múltipla resposta é onde se perde ponto bobo

A questão diz "Escolha DUAS" ou "Escolha TRÊS". A correção é pelo conjunto
exato: marcar três quando pede duas zera a questão, mesmo que as duas certas
estejam entre as três. Não há crédito parcial. Se você tem certeza de duas e
uma terceira parece plausível, a terceira é o distrator: ela está lá para isso.

<Callout tipo="dica" titulo="Serviço que você nunca ouviu falar">
Quando uma alternativa cita um serviço desconhecido, desconfie. O distrator
típico da SAA usa um serviço **real** para o problema **errado** (Kinesis para
fila simples, Redshift para transação). Um serviço que você nunca viu no
estudo raramente é a resposta; ele está ali para atrair quem chuta pelo nome.
</Callout>

## O que este tema muda no resto da trilha

Cada tema desta trilha termina com cenários no estilo da prova, e cada
alternativa vem com o porquê de estar certa ou errada. Ao responder, faça o
exercício ao contrário: antes de ver a explicação, diga qual palavra do
enunciado decidiu. Se você acertou a questão mas não sabe qual palavra
decidiu, acertou por sorte, e sorte não sobrevive a 65 questões.
