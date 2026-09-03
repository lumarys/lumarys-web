# AWS para engenharia de dados

> Os serviços que aparecem num pipeline de dados na AWS e o critério para escolher entre eles: S3, Glue, Athena, EMR, Redshift, Lake Formation, Kinesis, Lambda, Step Functions e o IAM que amarra tudo.

Fonte: https://lumarys.com.br/trilhas/engenharia-de-dados/alem-da-ementa/aws-para-dados/ · Lumarys (marca da Cernyn) · CC BY-NC-SA 4.0

## Em uma frase

Na AWS, um pipeline de dados é **S3 como camada de persistência, Glue como
catálogo e motor de transformação, um motor de consulta escolhido pelo padrão de
uso, e IAM amarrando quem pode o quê**.

## S3: a base de tudo

O S3 guarda objetos, não tabelas. Isso é a força — armazenamento barato e
desacoplado do processamento — e a fonte dos problemas.

- **Classes de armazenamento**: Standard para dado quente, Intelligent-Tiering
  quando o padrão de acesso é imprevisível, Standard-IA e One Zone-IA para acesso
  raro, e as famílias Glacier para arquivamento, com custo e latência de
  recuperação crescentes.
- **Lifecycle**: regra que move ou expira objeto por idade. Extrato bruto sai do
  Standard em 90 dias, vai para Glacier em um ano e expira no fim do prazo legal
  de retenção — que em banco é definido por norma, não por preferência
  [verificar prazo aplicável ao seu caso].
- **Organização por prefixo**: `zona/dominio/tabela/data_ref=2026-03-11/`. O
  formato `coluna=valor` é o que permite ao motor fazer poda de partição.
- **Consistência**: o S3 oferece leitura consistente após escrita para operações
  de objeto. O que não se atualiza sozinho é o **catálogo**: partição nova no S3
  continua invisível para o Athena até ser registrada.

<Callout tipo="erro" titulo="Arquivo pequeno demais">
Milhares de objetos de poucos KB derrubam o desempenho de Athena e Spark por
sobrecarga de listagem e abertura. Compacte para a faixa de dezenas ou centenas
de MB por arquivo.
</Callout>

## Glue: catálogo, crawler e jobs

O **Data Catalog** é o metastore: schema, formato, localização no S3 e lista de
partições. Athena, Spark e Redshift Spectrum leem a mesma definição a partir
dele.

O **crawler** inspeciona um caminho no S3, infere schema e registra ou atualiza a
tabela. Útil na chegada de dado de terceiro; perigoso como fonte única de
verdade de schema, porque inferência erra tipo.

Os **jobs** são Spark gerenciado, para ETL sem manter cluster.

## Athena: SQL sobre o S3

Serverless: você não dimensiona nada, e a cobrança padrão é por **volume de dados
varridos** [verificar preço por TB na região usada].

Reduzir a conta é reduzir bytes lidos:

<Passos itens={[
  "Particionar pela coluna que você filtra, e registrar a partição no catálogo",
  "Gravar em formato colunar (Parquet) com compressão",
  "Projetar colunas: SELECT explícito em vez de SELECT estrela",
  "Compactar arquivos pequenos para reduzir sobrecarga"
]} />

## EMR: quando ainda usar

Quando você precisa de **controle**: versão específica de Spark, ecossistema
Hadoop, bibliotecas nativas, ajuste fino de tipos de instância, uso agressivo de
spot, carga longa em que o custo por hora compensa. Se nada disso é requisito,
Glue ou Databricks entregam o mesmo Spark com menos operação.

## Redshift

Warehouse colunar e distribuído, para consulta recorrente e concorrente sobre
dado modelado. **Spectrum** deixa o Redshift consultar dados que continuam no S3,
permitindo juntar tabela do warehouse com histórico no lake.

**Distribution key** define como as linhas se distribuem entre os nós, e a
escolha certa evita redistribuir dados no JOIN. **Sort key** define a ordem
física dos blocos, e a escolha certa permite pular blocos inteiros no filtro.

## Athena, Redshift e EMR: quando cada um

<Comparativo
  colunas={["", "Athena", "Redshift", "EMR"]}
  linhas={[
    ["Modelo", "Serverless, sob demanda", "Cluster provisionado (ou serverless)", "Cluster que você configura"],
    ["Cobrança típica", "Por dados varridos", "Por capacidade ligada", "Por hora de instância"],
    ["Melhor para", "SQL ad hoc e esporádico sobre o lake", "Painel e consulta recorrente com concorrência alta", "Processamento pesado e customizado em Spark"],
    ["Pior para", "Consulta repetitiva de alto volume, que fica cara por varredura", "Uso esporádico, que paga cluster ocioso", "Time pequeno, por causa do custo operacional"]
  ]}
/>

## Lake Formation, Kinesis, Lambda e Step Functions

**Lake Formation** concede permissão fina sobre o lake — por banco, tabela,
coluna, linha e tag — aplicada de forma consistente aos motores de consulta.
É o que permite liberar a tabela de clientes ao marketing **sem** a coluna de
CPF, em vez de duplicar uma versão mascarada.

**Kinesis Data Streams** é o streaming gerenciado: shard no lugar de partição,
chave de partição com o mesmo papel do Kafka, retenção configurável.

**Lambda** cobre tarefa curta orientada a evento: validar arquivo que chegou,
disparar job, publicar métrica. **Step Functions** orquestra os passos como
máquina de estados, com retry e tratamento de erro declarativos — alternativa ao
Airflow quando o fluxo é todo de serviços AWS.

## IAM para dados

**Role** é a identidade que o job assume. **Policy** é o documento que diz quais
ações são permitidas sobre quais recursos. **Menor privilégio** é conceder apenas
o que aquele job usa: um prefixo específico do bucket, as ações de leitura e
escrita necessárias, nada além.

<Callout tipo="atencao" titulo="Resposta que vale ponto em banco">
Uma role por job, escopo por prefixo, criptografia com KMS e permissão analítica
por Lake Formation. Dizer isso sem ser perguntado mostra que você entende que em
instituição financeira acesso é matéria regulatória, não conveniência.
</Callout>
