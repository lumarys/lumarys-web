# Formas de implantar e operar na AWS

> Console, CLI, SDK e API como formas de falar com a AWS; CloudFormation, CDK e Elastic Beanstalk como formas de implantar; e as opções de implantação pública, privada e híbrida no nível que a prova cobra.

Fonte: https://lumarys.com.br/trilhas/aws-cloud-practitioner/tecnologia/formas-de-operar-na-aws/ · Lumarys (marca da Cernyn) · CC BY-NC-SA 4.0

## Em uma frase

Existem três portas para falar com a AWS, console, CLI e SDK, todas batendo na
mesma API, e três formas de implantar o que foi decidido: clicando, descrevendo
em um modelo ou entregando a aplicação a uma plataforma gerenciada.

## As três portas para a mesma API

Toda ação em uma conta da AWS é uma chamada de API. O que muda é quem faz a
chamada. O **console** é a interface gráfica no navegador, boa para explorar e
para tarefa pontual. A **CLI** é o comando no terminal, boa para automatizar em
script e em pipeline. O **SDK** é a biblioteca dentro do código, boa para a
aplicação chamar serviços em tempo de execução.

Essa unidade explica um detalhe que a prova cobra em outro domínio: como o
CloudTrail consegue registrar tudo o que acontece na conta. Ele registra
chamadas de API, e clique, comando e linha de código viram a mesma chamada.

## Implantar: modelo, código ou plataforma

<Comparativo
colunas={["Recurso", "O que é em uma linha", "A pista no enunciado"]}
linhas={[
["Console de gerenciamento", "Interface gráfica para operar a conta no navegador", "Primeira vez, olhar o recurso, ação manual única"],
["AWS CLI", "Comandos de terminal que chamam a API da AWS", "Script de shell, pipeline, automatizar tarefa operacional"],
["SDK da AWS", "Biblioteca da linguagem que chama a API de dentro da aplicação", "Chamar a AWS pelo código em Python, Java ou JavaScript"],
["AWS CloudFormation", "Provisiona recursos a partir de um modelo declarativo, em pilhas", "Repetível, idêntico, versionado, criar e remover de uma vez"],
["AWS CDK", "Escreve a infraestrutura em linguagem de programação e gera o modelo", "Infraestrutura como código na linguagem do time"],
["AWS Elastic Beanstalk", "Plataforma que recebe o código e opera capacidade, escala e saúde", "Entregar a aplicação e não administrar servidor"]
]}
/>

<Callout tipo="dica" titulo="A pergunta que separa os três">
Pergunte **o que o time entrega**. Se entrega cliques, é console. Se entrega um
arquivo que descreve os recursos, é CloudFormation, ou CDK quando esse arquivo
é escrito em linguagem de programação. Se entrega a aplicação pronta e não quer
saber de servidor, é Elastic Beanstalk.
</Callout>

## Opções de implantação

O guia também cobra os modelos de implantação no nível do nome. **Na nuvem**
significa tudo na AWS. **Local** significa tudo no ambiente do cliente.
**Híbrido** significa parte em cada lado, com VPN ou Direct Connect ligando os
dois. O erro comum é ler híbrido como uso de dois provedores de nuvem, o que a
AWS chama de outra coisa.

Junto disso aparece a conectividade: acesso **público** pela internet, acesso
**privado** por endpoints dentro da VPC e acesso **híbrido** pela ligação com o
ambiente local. Esses três voltam no tema de rede, e aqui basta reconhecer que
eles são escolhas de implantação, não serviços.

<Callout tipo="atencao" titulo="Beanstalk não é infraestrutura como código">
Os dois reduzem trabalho manual, e por isso aparecem juntos como alternativas.
A diferença está no insumo: o CloudFormation recebe a **descrição da
infraestrutura**; o Beanstalk recebe o **código da aplicação**. Quando o
enunciado fala em versionar o ambiente, é modelo; quando fala em publicar a
aplicação, é plataforma.
</Callout>

## Como responder o cenário

Ache o verbo do pedido. Explorar aponta console. Automatizar no terminal aponta
CLI. Chamar de dentro do programa aponta SDK. Repetir infraestrutura sem erro
humano aponta CloudFormation, e CDK quando o enunciado insiste na linguagem de
programação. Publicar uma aplicação sem administrar servidor aponta Elastic
Beanstalk. Manter parte no datacenter aponta implantação híbrida. Se duas
alternativas parecerem servir, escolha a que trata do insumo que o enunciado
nomeou, e não a que automatiza mais coisas.
