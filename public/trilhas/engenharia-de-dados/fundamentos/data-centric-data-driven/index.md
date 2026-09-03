# Data Centric e Data Driven

> Data centric é sobre arquitetura: o dado é o ativo permanente e as aplicações giram em torno dele. Data driven é sobre decisão: o número entra antes da escolha, não depois. Um sustenta o outro, e a maioria das empresas confunde os dois.

Fonte: https://lumarys.com.br/trilhas/engenharia-de-dados/fundamentos/data-centric-data-driven/ · Lumarys (marca da Cernyn) · CC BY-NC-SA 4.0

## Em uma frase

**Data centric** é sobre onde o dado mora e quem responde por ele; **data
driven** é sobre o que acontece na sala em que se decide.

## Centric: o dado é o que fica

Em uma arquitetura centrada em aplicação, cada sistema é dono do seu banco. O
canal de atendimento tem o cadastro dele, o cartão tem o dele, o crédito tem o
dele. Quando o sistema é substituído, o dado vai junto ou é migrado às pressas,
e a definição de "cliente" muda de significado conforme a tela.

Em uma arquitetura **centrada no dado**, a ordem se inverte. O modelo, a
propriedade e o contrato do dado existem fora de qualquer sistema. As aplicações
são periféricas: elas vêm, mudam e saem; o dado permanece. Na prática isso
aparece como modelo canônico de cliente, dono por domínio, catálogo e contrato
versionado das tabelas que outros times consomem.

<Callout tipo="dica" titulo="A frase que resume">
Aplicação é efêmera, dado é permanente. Se trocar o sistema de canal obriga a
recriar o cadastro do zero, a empresa é centrada em aplicação, não em dado.
</Callout>

## Driven: o dado entra antes da decisão

Data driven não é sobre quantidade de painel. É sobre a ordem dos eventos.

Se a métrica é acordada, o critério é definido antes do teste e o time muda de
rumo quando o número contraria a hipótese, o time é data-driven. Se o número
aparece depois da escolha, para sustentar o que já foi decidido, o time é
opinião-driven com anexo de gráfico.

<Callout tipo="erro" titulo="O falso data-driven">
O sinal mais confiável é temporal: pergunte quando o número foi calculado em
relação à decisão. "Rodamos a análise para embasar a apresentação" é uma resposta
que se denuncia sozinha.
</Callout>

## Como os dois se cruzam

<Comparativo
  colunas={["", "Data centric", "Data driven"]}
  linhas={[
    ["Natureza", "Arquitetura e governança", "Comportamento de decisão"],
    ["Pergunta que responde", "De quem é o dado e onde ele vive?", "O que decidiu esta escolha?"],
    ["Se manifesta em", "Modelo canônico, catálogo, dono de domínio, contrato de dado", "Métrica acordada, critério prévio, experimento, decisão revertida por número"],
    ["Falha típica", "Cada sistema com seu cadastro e sua definição de cliente", "Painel bonito, decisão igual à de antes"],
    ["Dá para ter sem o outro?", "Sim, e é o caso mais comum em banco grande", "Dá, mas não escala além da planilha"]
  ]}
/>

Centric é infraestrutura de confiança; driven é o uso dela. Um banco pode ter os
dois desalinhados nas duas direções, e a resposta forte na sabatina é justamente
saber dizer qual dos dois está faltando em um cenário dado.

## O que precisa existir para um time ser data-driven

<Passos itens={[
  "Acesso: o analista vê o dado em minutos, com perfil e mascaramento adequados — não por chamado que demora mais que a janela da decisão.",
  "Confiança: linhagem conhecida, monitoramento de atraso e volume, e aviso quando a carga falha. Um número errado sem aviso queima a credibilidade de todos os outros.",
  "Métrica: uma definição única, documentada e com dono. Sem isso, cada área traz um 'cliente ativo' diferente e a reunião discute o número em vez da decisão.",
  "Mandato: alguém com poder de agir no ritmo em que o dado chega. Análise sem decisor vira relatório arquivado."
]} />

Repare que três dos quatro são trabalho de engenharia de dados e governança. O
quarto é organizacional, e é o que a maioria dos projetos de cultura de dados
esquece.

## Governança não é o freio, é a condição

Sem dono por domínio, catálogo e definição única de métrica, o dado não vira
ativo confiável: vira um monte de tabelas que ninguém garante. É a governança que
permite dizer, com segurança, que aquele número é o número.

Em banco existe uma camada a mais. Ser centric não é guardar tudo. Dado pessoal
exige finalidade, base legal, prazo de retenção e controle de acesso. Acumular
dado sem finalidade é passivo jurídico sob a LGPD, não é precaução. Mencionar
isso na sabatina mostra que você entende o contexto regulatório em que o banco
opera.

## Como responder isso em voz alta

Separe as duas palavras logo na primeira frase: uma é arquitetura, a outra é
comportamento. Dê o exemplo do banco que é centric sem ser driven, porque é o
caso real e mostra que você não decorou definição. Depois liste os quatro
requisitos — acesso, confiança, métrica, mandato — e feche com um caso concreto
de cobrança ou de limite, dizendo qual critério foi acordado antes do teste.
