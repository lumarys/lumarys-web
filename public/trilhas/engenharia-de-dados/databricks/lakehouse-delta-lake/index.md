# Lakehouse e Delta Lake

> O Lakehouse resolve o dilema entre o data lake barato mas sem garantia e o data warehouse confiável mas caro e fechado. O Delta Lake é o formato de tabela que traz ACID, time travel e controle de schema para arquivos no object storage.

Fonte: https://lumarys.com.br/trilhas/engenharia-de-dados/databricks/lakehouse-delta-lake/ · Lumarys (marca da Cernyn) · CC BY-NC-SA 4.0

## Em uma frase

Lakehouse é a arquitetura que traz **garantias de data warehouse para arquivos
abertos em object storage**, e Delta Lake é o formato de tabela que entrega
essas garantias com um log transacional ao lado dos arquivos Parquet.

## O dilema que originou o Lakehouse

Antes, você escolhia um lado. O **data lake** era barato, aberto e aceitava
qualquer coisa: log de app, JSON de API, PDF de contrato. Em troca, não garantia
nada. A tabela era literalmente o que estivesse no diretório, então um job que
morria na metade deixava dado parcial que o leitor consumia sem nenhum aviso.

O **data warehouse** garantia transação, schema e governança, mas cobrava caro
por armazenamento acoplado a computação, prendia o dado em formato proprietário e
não digeria bem dado não estruturado. O resultado prático em muitos bancos era
manter os dois, copiar dado de um para o outro e passar o dia explicando por que
os números divergem.

O Lakehouse recusa a escolha: **um armazenamento só**, em formato aberto, com as
garantias na camada de metadados.

## O que é um formato de tabela

Essa distinção derruba muito candidato:

<Comparativo
  colunas={["Camada", "Exemplos", "Do que trata"]}
  linhas={[
    ["Formato de arquivo", "Parquet, ORC, Avro, JSON", "Como os bytes de um arquivo são codificados"],
    ["Formato de tabela", "Delta Lake, Apache Iceberg, Apache Hudi", "Quais arquivos formam a tabela agora, qual é o schema, qual é o histórico"]
  ]}
/>

Delta Lake **não substitui** o Parquet. Os dados continuam em Parquet. O que o
Delta acrescenta é o diretório `_delta_log`, com a sequência de commits que diz
quais arquivos estão ativos em cada versão.

## Como o Delta consegue ACID sobre object storage

O truque é que **o commit não é mover dados, é gravar um arquivo de log**. O
escritor grava os arquivos Parquet novos em silêncio, invisíveis para todo mundo,
e só no fim registra no log que aqueles arquivos entraram e quais saíram. Essa
última gravação é atômica: ou o número de versão novo existe, ou não existe.

Com vários escritores, entra a
<Termo nome="concorrência otimista">Cada escritor lê a versão atual, faz o
trabalho e tenta registrar a próxima versão. Se outro chegou primeiro, ele relê
o que mudou e tenta de novo.</Termo> Nada é bloqueado enquanto o trabalho está
em andamento.

Como o log também guarda estatísticas por arquivo (mínimo, máximo, nulos por
coluna), o motor consegue **pular arquivos** que não podem conter o filtro. Isso
é o data skipping, e é a base da performance.

## Os recursos que a banca cobra

<Passos itens={[
  "Time travel: consultar a tabela em uma versão ou instante anterior, para auditar, comparar cargas e reverter erro.",
  "Schema enforcement: recusar a gravação fora do contrato, para o problema estourar no pipeline e não no relatório.",
  "Schema evolution: acrescentar coluna nova de propósito, quando a mudança é combinada.",
  "MERGE: upsert atômico, que é como se aplica CDC do core e como se atende exclusão de titular por LGPD.",
  "OPTIMIZE: compactar arquivos pequenos gerados por ingestão frequente.",
  "Z-ORDER: agrupar valores próximos das colunas de filtro nos mesmos arquivos para ampliar o data skipping.",
  "VACUUM: remover arquivos que nenhuma versão ativa referencia, respeitando a retenção."
]} />

<Callout tipo="erro" titulo="A armadilha do VACUUM">
Reduzir a retenção do VACUUM para economizar armazenamento apaga o histórico
que o time travel usa e pode derrubar leitores de longa duração que ainda
apontam para arquivos antigos. Trate retenção de histórico como decisão de
governança, junto com a política da zona, não como faxina de disco.
</Callout>

## Por que Parquet puro não basta

Esta é a pergunta-chave do tema, e a resposta melhor é uma lista curta de
falhas concretas:

<Comparativo
  colunas={["Necessidade", "Parquet puro", "Delta Lake"]}
  linhas={[
    ["Escrita atômica", "Job que morre no meio deixa dado parcial legível", "Commit atômico no log: a versão existe ou não existe"],
    ["Isolamento leitor/escritor", "Nenhum: o leitor vê o diretório mudando", "Leitor fixa uma versão e a lê inteira"],
    ["Histórico e auditoria", "Só com backup externo", "Time travel por versão ou timestamp"],
    ["Contrato de schema", "Qualquer arquivo entra no diretório", "Enforcement na gravação, evolution quando intencional"],
    ["Upsert e exclusão pontual", "Reescrita manual de partição", "MERGE e DELETE atômicos"]
  ]}
/>

<Callout tipo="dica" titulo="Como fechar em voz alta">
Comece dizendo que os dados continuam em Parquet, para desarmar a ideia de que
Delta é um formato concorrente. Depois liste três falhas do Parquet puro com
exemplo bancário: escrita parcial no fechamento diário, CDC do cadastro e
exclusão de titular por LGPD. Termine dizendo onde você não usaria Delta, que é
staging descartável.
</Callout>
