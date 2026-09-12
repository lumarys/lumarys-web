# Bancos resilientes: Multi-AZ, réplicas de leitura e tabelas globais

> A distinção que a prova mais cobra em banco de dados: Multi-AZ é disponibilidade com réplica síncrona que ninguém lê, réplica de leitura é desempenho com replicação assíncrona. Mais Aurora e seu Global Database, DynamoDB com tabelas globais, e o que cada um faz num failover.

Fonte: https://lumarys.com.br/trilhas/aws-solutions-architect-associate/resilientes/bancos-de-dados-resilientes/ · Lumarys (marca da Cernyn) · CC BY-NC-SA 4.0

## Em uma frase

**Multi-AZ** é disponibilidade: uma espera síncrona que ninguém lê e que assume
sozinha. **Réplica de leitura** é desempenho: uma cópia assíncrona que você lê
e que só vira principal por promoção manual. A prova oferece uma como distrator
da outra.

## A tabela que resolve metade das questões

<Comparativo
colunas={["", "Multi-AZ", "Réplica de leitura"]}
linhas={[
["Para que serve", "Disponibilidade", "Desempenho de leitura"],
["Replicação", "Síncrona: nada se perde", "Assíncrona: pode estar atrasada"],
["Aceita leitura?", "Não. A espera não recebe conexão", "Sim, com endpoint próprio"],
["Failover", "Automático, em um a dois minutos", "Não existe: promoção é manual"],
["Onde fica", "Outra zona da mesma região", "Mesma região ou outra"],
["Quantas", "Uma espera (ou duas, no modelo de cluster)", "Várias"]
]}
/>

O cenário mais repetido junta os dois requisitos numa frase só: "continuar
disponível se a zona cair **e** tirar os relatórios de cima do banco". A
resposta certa cita **Multi-AZ e réplica de leitura**; as erradas tentam
resolver os dois com um mecanismo só.

<Callout tipo="atencao" titulo="A espera não é legível">
"Direcionar os relatórios para a instância de espera do Multi-AZ" aparece em
quase toda questão deste tema e é sempre errada: a espera não aceita conexão
nenhuma. Ela existe para assumir, não para ajudar.
</Callout>

## O failover e o endpoint

No failover do Multi-AZ, o nome do endpoint **não muda**; o que muda é para
onde ele aponta. Consequência prática, que vira questão: a aplicação precisa
**reconectar**. Conexões antigas continuam tentando a instância que saiu, e
cliente com cache de DNS longo demora a enxergar a troca. A correção esperada é
TTL curto e lógica de reconexão com novas tentativas — não é configuração do
banco, é do cliente.

## Aurora: o mesmo vocabulário, outra arquitetura

<Termo nome="Aurora">Banco compatível com MySQL e PostgreSQL em que o armazenamento é uma camada compartilhada, com seis cópias em três zonas, separada das instâncias de computação.</Termo>

Como o dado não pertence a uma instância, as peças mudam:

- Até **15 réplicas** na mesma região, que servem leitura **e** são candidatas
  a assumir a escrita em segundos, com prioridade configurável.
- **Endpoint de escrita** e **endpoint de leitura** separados: usar o de
  leitura é o que distribui consulta entre as réplicas.
- **Global Database** replica o cluster para outras regiões com atraso típico
  abaixo de um segundo; a secundária serve leitura e é promovida em cerca de um
  minuto.

A pista do enunciado: "compatível com MySQL", "leitura em outra região",
"promoção em minutos" junta os três e aponta para Global Database.

## DynamoDB: resiliente por desenho, global por escolha

Dentro da região, o DynamoDB já replica entre três zonas; não há Multi-AZ para
ligar. O que sobra decidir é **entre regiões**:

<Termo nome="tabela global">Replicação ativa em várias regiões: escreve-se e lê-se em qualquer uma delas, com resolução de conflito pelo último escritor.</Termo>

É diferente de tudo que veio antes neste tema: não há primário e réplica, há
**várias regiões ativas**. Por isso a pergunta "usuários dos dois lados do
oceano precisam escrever com baixa latência" só tem essa resposta — réplica de
leitura não aceita escrita.

<Callout tipo="dica" titulo="Recuperação não é disponibilidade">
Backup automático do RDS e point-in-time recovery do DynamoDB restauram o
passado, criando um recurso novo, com tempo parado. Servem contra erro humano e
corrupção, não contra falha de zona. Quando a alternativa oferece backup para
um requisito de disponibilidade, ela está trocando de problema.
</Callout>

## Como responder o cenário

Separe os requisitos antes de olhar as alternativas: **continuar no ar**
(Multi-AZ, Aurora com réplicas), **aguentar leitura** (réplica de leitura,
endpoint de leitura), **escrever perto do usuário em outra região** (tabela
global, ou Aurora Global Database para relacional), **voltar de um erro**
(backup, point-in-time). Quase toda questão combina dois desses, e a
alternativa certa é a que nomeia os dois mecanismos.
