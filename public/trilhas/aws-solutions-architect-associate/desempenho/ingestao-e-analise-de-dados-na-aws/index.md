# Ingestão e análise de dados: Kinesis, Glue, EMR e Lake Formation

> O último item do Domínio 3: levar dado para dentro da AWS na frequência certa (Kinesis Data Streams ou Firehose para fluxo, DataSync para lote), transformar com Glue ou EMR, guardar num data lake no S3 governado pelo Lake Formation e consultar com Athena e QuickSight.

Fonte: https://lumarys.com.br/trilhas/aws-solutions-architect-associate/desempenho/ingestao-e-analise-de-dados-na-aws/ · Lumarys (marca da Cernyn) · CC BY-NC-SA 4.0

## Em uma frase

A questão descreve **como o dado chega** (a cada segundo, a cada hora, uma
vez só) e **o que precisa acontecer com ele** (entregar, transformar, governar,
consultar). Cada trecho aponta um serviço, e o conjunto vira a alternativa
certa.

## O roteiro em quatro decisões

<Passos
itens={[
"Frequência: eventos contínuos são fluxo (Kinesis); arquivos periódicos são lote (S3, Glue, DataSync).",
"Entrada: quem precisa ler o fluxo? Ninguém em especial, só entregar: Firehose. Consumidores próprios, vários leitores ou reler: Data Streams.",
"Transformação: sem servidor e sob demanda: Glue. Spark, Hadoop, Hive ou controle do cluster no enunciado: EMR.",
"Consumo: SQL sobre o S3: Athena. Painel: QuickSight. Permissão por tabela e coluna: Lake Formation.",
]}
/>

## Fluxo: Data Streams ou Firehose

Os dois se chamam Kinesis e a prova conta com a confusão.

<Comparativo
colunas={["", "Kinesis Data Streams", "Kinesis Data Firehose"]}
linhas={[
["Quem lê", "Consumidores que você escreve (Lambda, KCL, EMR)", "Ninguém: o serviço entrega no destino"],
["Latência", "Tempo real, registro a registro", "Quase tempo real: lotes de segundos a minutos"],
["Retenção", "24 horas a 365 dias; dá para reler", "Nenhuma: entrega e esquece"],
["Escala", "Shards (provisionado) ou sob demanda", "Automática"],
["Transformação", "No consumidor", "Lambda no caminho e conversão para Parquet ou ORC"],
["Pista no enunciado", "'Vários consumidores', 'reprocessar', 'tempo real'", "'Entregar no S3 ou Redshift', 'menor esforço'"],
]}
/>

O padrão que mais aparece é **Data Streams na entrada e Firehose na saída**:
os eventos entram no fluxo, uma aplicação lê em tempo real e o Firehose lê o
mesmo fluxo para gravar a cópia histórica no S3. Quando o enunciado só pede a
cópia histórica, Firehose sozinho basta.

<Callout tipo="atencao" titulo="Fila não é fluxo">
SQS entrega cada mensagem a um consumidor e apaga. Fluxo mantém a ordem por
chave de partição e deixa vários leitores verem todos os registros. Quando a
questão fala em telemetria, clique ou log **para análise**, SQS é distrator.
</Callout>

## Transformação: Glue ou EMR

**Glue** é o serviço de integração sem servidor: o **crawler** descobre o
schema dos arquivos, o **Data Catalog** guarda as tabelas, e o **job** roda
Spark sob demanda. A tarefa clássica é converter CSV ou JSON em **Parquet
particionado**, que é o que faz consulta no Athena ficar rápida e barata.

**EMR** é o cluster gerenciado de Hadoop, Spark, Hive e afins. Ele ganha quando
o enunciado nomeia o framework, cita bibliotecas próprias ou pede controle do
cluster. Se nada disso aparece e o pedido é "menor esforço operacional", a
resposta é Glue.

## Lote e migração: DataSync e Storage Gateway

Arquivo que nasce fora da AWS chega por **DataSync**: transferência gerenciada,
agendável e verificada entre local (ou outra nuvem) e S3, EFS ou FSx. Sem banda
para o volume, entra **Snow**. Quando a aplicação local precisa continuar
enxergando os arquivos como se fossem dela, com o dado morando na AWS, o
serviço é **Storage Gateway**, que é acesso, não transferência.

## Governar e consultar

Um data lake na prova é sempre a mesma pilha: **S3** guardando em zonas, **Glue
Data Catalog** com as tabelas, **Lake Formation** dando permissão por banco,
tabela e coluna, **Athena** consultando em SQL e **QuickSight** mostrando o
painel. Política de bucket protege objeto; coluna é Lake Formation.

<Callout tipo="dica" titulo="Parquet e partição resolvem a questão de custo">
Athena cobra por dado lido. Quando o enunciado diz "consultas lentas e caras
sobre arquivos no S3", a resposta é converter para formato colunar e
particionar por data ou chave, com Glue. Aumentar o cluster não é alternativa
porque não há cluster.
</Callout>

## Como responder o cenário

Leia a frequência primeiro: ela elimina metade das alternativas. Depois procure
quem lê o dado: se a resposta é "ninguém, só guardar", é Firehose ou Glue. Por
fim confira os adjetivos do pedido: "menor esforço" favorece o serviço sem
servidor; "controle" ou o nome de um framework favorece EMR e Data Streams.
