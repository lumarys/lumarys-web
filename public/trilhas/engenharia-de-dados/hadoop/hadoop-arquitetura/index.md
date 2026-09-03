# Hadoop: conceito e arquitetura

> Hadoop foi a resposta dos anos 2010 para processar dado em escala com máquinas comuns: HDFS guarda em blocos replicados, YARN reparte os recursos. Entender por que ele venceu, e por que perdeu espaço para S3 com Spark, é o que a banca cobra.

Fonte: https://lumarys.com.br/trilhas/engenharia-de-dados/hadoop/hadoop-arquitetura/ · Lumarys (marca da Cernyn) · CC BY-NC-SA 4.0

## Em uma frase

Hadoop é um framework para **armazenar e processar dado em escala usando muitas
máquinas comuns**, com o HDFS cuidando do armazenamento distribuído e o YARN
repartindo os recursos entre as aplicações.

## A premissa: hardware comum e falha como rotina

Antes do Hadoop, escalar significava comprar uma máquina maior e um storage
caro. O Hadoop inverteu a aposta: usar **hardware commodity**, servidor comum
sem storage especializado, e assumir no software que máquina falha o tempo todo.

Isso muda quem é responsável por quê. Confiabilidade deixa de ser característica
do equipamento e passa a ser característica do sistema distribuído. E escalar
deixa de ser trocar de máquina e passa a ser somar máquinas, o que traz três
problemas novos: como dividir o dado, como sobreviver à perda de um nó e como
coordenar o processamento.

## HDFS: armazenamento distribuído

O HDFS é mestre e escravo.

O **NameNode** é o mestre e guarda apenas metadado: a árvore de diretórios,
quais blocos formam cada arquivo e em quais nós está cada réplica. Ele não
trafega dado. Isso o torna leve, mas também o torna ponto único de falha e o
limite prático para a quantidade de arquivos do cluster.

Os **DataNodes** são os escravos. Guardam os blocos nos discos locais, atendem
leitura e escrita dos clientes e mandam heartbeat e relatório de blocos ao
NameNode. Se um heartbeat para de chegar, o NameNode considera o nó perdido e
manda recriar as réplicas que estavam nele.

O arquivo é quebrado em **blocos grandes**, 128 MB por padrão. Bloco grande
amortiza o custo de posicionar a cabeça do disco e reduz o volume de metadado no
NameNode. É coerente com o desenho: HDFS é para leitura sequencial de arquivo
grande, não para acesso aleatório.

<Callout tipo="erro" titulo="O problema dos arquivos pequenos">
Cada arquivo e cada bloco ocupa metadado na memória do NameNode. Milhões de
arquivos de poucos kilobytes esgotam o mestre e destroem a leitura sequencial.
Em pipeline bancário isso aparece quando alguém grava um arquivo por transação
em vez de compactar por partição de data.
</Callout>

### Por que replicação 3 e não RAID

Cada bloco é gravado em três nós por padrão, com pelo menos uma cópia em outro
rack. A pergunta que a banca faz é por que não usar RAID.

Porque resolvem problemas diferentes. **RAID protege contra a falha de um disco
dentro de um servidor.** Em um cluster de hardware comum, o que cai é o servidor
inteiro — fonte, placa, sistema operacional — ou o rack inteiro, por switch ou
energia. Réplica em outro nó cobre esse cenário; RAID não.

Tem um segundo ganho: com três cópias, três nós podem servir o mesmo bloco, o
que dá paralelismo de leitura e mais opções de agendar a tarefa perto do dado.

O preço é 200% de espaço extra. É exatamente esse preço que o armazenamento de
objetos com codificação de apagamento cobrou mais barato depois.

## YARN: gerenciamento de recursos

O YARN responde por CPU e memória, não por dado.

O **ResourceManager** é o escalonador global: recebe pedidos das aplicações e
decide quem recebe quantos contêineres, aplicando fila e política de prioridade.
O **NodeManager** roda em cada nó, sobe os contêineres que o mestre alocou e
reporta o consumo.

A mudança que o YARN trouxe no Hadoop 2 foi separar o gerenciamento de recursos
do modelo de processamento. Antes, o cluster só sabia rodar MapReduce. Depois do
YARN, Spark e outros motores passaram a dividir o mesmo cluster — e isso, na
prática, foi o que permitiu a migração para Spark sem trocar a infraestrutura.

## O ecossistema em volta

<Comparativo
  colunas={["Ferramenta", "O que faz em uma frase"]}
  linhas={[
    ["Hive", "Interface SQL sobre arquivos no HDFS, traduzindo consulta em job distribuído"],
    ["HBase", "Banco NoSQL orientado a coluna sobre HDFS, para leitura e escrita aleatória por chave"],
    ["Sqoop", "Transferência em lote entre banco relacional e HDFS, típica de ingestão de core bancário"]
  ]}
/>

## Por que Hadoop perdeu espaço

Não foi só porque Spark é mais rápido. A razão é estrutural: **o HDFS acopla
armazenamento e computação**, e esses dois recursos crescem em ritmos diferentes.

Para guardar mais dado no HDFS você precisa de mais nós ligados, mesmo que não
esteja processando nada. Para processar um pico você precisa de nós que ficam
ociosos no resto do mês. Você paga os dois o tempo todo.

Com armazenamento de objetos, o desenho vira outro:

<Passos itens={[
  "O dado vive no S3, durável e barato por gigabyte, independente de qualquer cluster estar ligado.",
  "A computação sobe sob demanda: um cluster Spark efêmero lê do S3, processa e é destruído.",
  "Vários times sobem clusters diferentes sobre o mesmo dado, sem disputar o mesmo cluster nem duplicar o armazenamento.",
  "Durabilidade e disponibilidade são responsabilidade do provedor — não há NameNode para operar em alta disponibilidade."
]} />

O argumento técnico mais forte a favor do HDFS era **data locality**: levar a
computação ao nó que tem o bloco para evitar tráfego de rede. Ele fazia muito
sentido quando a rede do datacenter era o gargalo. Com as redes atuais, ler do
armazenamento de objetos deixou de ser o fator dominante, e o ganho de
elasticidade e custo passou a pesar mais.

<Callout tipo="atencao" titulo="Não diga que o Hadoop morreu">
O que perdeu espaço foi o HDFS como armazenamento primário. O modelo de
processamento distribuído, o metastore do Hive e a ideia de gerenciador de
recursos continuam vivos no que se usa hoje. E há casos válidos de HDFS: cluster
on-premises já pago, restrição regulatória de residência do dado e armazenamento
temporário de estágio intermediário dentro de um cluster.
</Callout>

## Como responder isso em voz alta

Comece pela premissa — hardware comum, falha como rotina — porque ela explica
todo o resto. Descreva HDFS e YARN separando quem cuida de dado de quem cuida de
recurso. Justifique a replicação contra falha de nó e de rack, contrastando com
RAID. E feche com a separação de armazenamento e computação, dizendo onde o HDFS
ainda se justifica. Reconhecer o caso que continua válido é o que transforma a
resposta em julgamento, não em opinião de moda.
