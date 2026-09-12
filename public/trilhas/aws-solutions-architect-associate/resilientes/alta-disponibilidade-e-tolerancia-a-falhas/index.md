# Alta disponibilidade e tolerância a falhas

> O vocabulário do Domínio 2 e o mapa da infraestrutura: região, zona de disponibilidade e borda; a diferença entre alta disponibilidade, tolerância a falhas e recuperação de desastres; o que é serviço de zona, de região e global; e por que a prova quase sempre responde 'mais de uma AZ'.

Fonte: https://lumarys.com.br/trilhas/aws-solutions-architect-associate/resilientes/alta-disponibilidade-e-tolerancia-a-falhas/ · Lumarys (marca da Cernyn) · CC BY-NC-SA 4.0

## Em uma frase

**Zona** é a unidade de falha isolada; **região** é o conjunto de zonas. A
resposta padrão do Domínio 2 é distribuir em **mais de uma zona**; a região
extra só entra quando o enunciado fala em perder a região inteira.

## O mapa da infraestrutura

<Termo nome="região">Área geográfica com várias zonas de disponibilidade, como sa-east-1 (São Paulo). Você escolhe a região por latência, custo, serviços disponíveis e exigência legal de onde o dado mora.</Termo>

<Termo nome="zona de disponibilidade">Um ou mais data centers dentro de uma região, com energia, refrigeração e rede independentes. Separados o bastante para um desastre local não atingir dois; próximos o bastante para replicação síncrona.</Termo>

Essa distância é uma decisão de engenharia que tem consequência direta na
prova: como as zonas estão a poucos milissegundos umas das outras, dá para
replicar **de forma síncrona** entre elas. É por isso que RDS Multi-AZ não
perde transação, e é por isso que o mesmo truque não funciona entre regiões
distantes, onde a replicação é assíncrona e existe janela de perda.

Além das zonas, a rede tem os **pontos de presença** (borda), onde vivem
CloudFront e Route 53. Eles servem desempenho e roteamento, não redundância de
computação.

## Três palavras que a prova separa

<Comparativo
colunas={["Conceito", "Pergunta que responde", "Custo típico", "Mecanismo"]}
linhas={[
["Alta disponibilidade", "Continua no ar se um componente cair?", "Moderado", "Redundância em mais de uma zona, failover automático"],
["Tolerância a falhas", "Continua sem NENHUMA interrupção nem perda?", "Alto", "Redundância total, capacidade de sobra"],
["Recuperação de desastres", "Se eu perder tudo, em quanto tempo volto e quanto perco?", "Depende da estratégia", "Backup, réplica ou ambiente em outra região; medido por RTO e RPO"]
]}
/>

Alta disponibilidade aceita a interrupção curta do failover. Tolerância a
falhas não aceita nenhuma, e paga por isso. Quando o enunciado diz "sem
interrupção" ou "sem perder nenhuma transação", ele está pedindo a segunda, e
a alternativa mais barata provavelmente não atende.

## Escopo do recurso: onde ele vive

Esta é a tabela que mais economiza tempo na prova:

<Comparativo
colunas={["Escopo", "Recursos", "O que isso implica"]}
linhas={[
["Zona", "Instância EC2, volume EBS, sub-rede, NAT Gateway", "Morre com a zona. Redundância é trabalho seu"],
["Região", "S3, DynamoDB, SQS, SNS, Lambda, ELB, Aurora", "A AWS já replica entre zonas. Sua decisão é entre regiões"],
["Global", "IAM, Route 53, CloudFront, Organizations", "Não pertence a região nenhuma"]
]}
/>

<Callout tipo="atencao" titulo="O erro que o escopo revela">
"Anexar o volume EBS à instância da outra zona" e "usar a mesma sub-rede nas
duas zonas" aparecem como alternativas e são **impossíveis**, não apenas
ruins. Saber o escopo elimina esse tipo de distrator sem raciocinar sobre o
cenário.
</Callout>

## Por que "pelo menos duas zonas" é quase sempre a resposta

Uma instância vive em uma zona e não migra sozinha. Um volume EBS idem. Se a
zona cai, tudo que estava só nela cai junto. Distribuir em duas zonas é a
mudança mais barata que transforma "cai" em "continua com metade da
capacidade" — e, com Auto Scaling, em "continua e repõe".

A matemática ajuda a entender a insistência: componentes **necessários em
série** multiplicam disponibilidades. Um balanceador de 99,99%, instâncias de
99,95% e um banco único de 99,95% resultam em cerca de 99,89%, pior que
qualquer um deles. Redundância em cada camada é o que inverte essa conta.

<Callout tipo="dica" titulo="Como a palavra do enunciado escolhe o escopo">
"Falha de uma zona", "falha de um data center" → **duas ou mais zonas**.
"Falha de uma região", "desastre regional", "continuidade de negócio" →
**segunda região**, e aí a pergunta seguinte é qual estratégia de DR. Responder
multirregião para falha de zona é responder acima do requisito, e a prova
considera isso errado.
</Callout>

## Responsabilidade compartilhada

A AWS entrega zonas isoladas e serviços regionais já redundantes. **Usar** mais
de uma zona é decisão sua. Nenhuma arquitetura vira resiliente porque está na
nuvem; ela vira resiliente porque alguém distribuiu a capacidade. Quando uma
alternativa diz "a AWS já garante isso" para um recurso de zona, ela está
errada.

## Como responder o cenário

Pergunte o que está falhando: **instância** (mais instâncias, Auto Scaling),
**zona** (mais zonas), **região** (DR, e qual estratégia), **dado** (backup e
replicação). Depois confira o escopo dos recursos citados: metade dos
distratores propõe algo que o escopo não permite. Por fim, aplique a palavra
do enunciado: "sem interrupção" pede mais que "continuar disponível", e
"menor custo" impede subir para multirregião sem que ela tenha sido pedida.
