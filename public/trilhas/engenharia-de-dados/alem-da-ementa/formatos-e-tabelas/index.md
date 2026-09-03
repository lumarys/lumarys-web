# Formatos de arquivo e formatos de tabela

> CSV, JSON e Avro guardam por linha; Parquet e ORC guardam por coluna e é por isso que ganham em analytics. Delta, Iceberg e Hudi não substituem o Parquet: acrescentam ACID, time travel e evolução de schema sobre ele.

Fonte: https://lumarys.com.br/trilhas/engenharia-de-dados/alem-da-ementa/formatos-e-tabelas/ · Lumarys (marca da Cernyn) · CC BY-NC-SA 4.0

## Em uma frase

Formato de **arquivo** decide como os bytes ficam organizados no disco; formato
de **tabela** decide como um monte de arquivos vira uma tabela com transação,
versão e schema.

## Formatos de arquivo

### Orientados a linha

**CSV** é texto separado por delimitador, sem tipo forte e sem schema. Serve
para troca com humano e com sistema legado. Em escala é caro: exige parsing,
não tem estatística e obriga a ler a linha inteira mesmo quando a consulta usa
duas colunas.

**JSON** resolve estrutura aninhada e campos opcionais, que é como API entrega
dado. Herda os mesmos custos do texto e ainda repete o nome do campo em cada
registro.

**Avro** é binário, orientado a linha e carrega o schema junto. É o formato do
caminho de escrita: evento em stream, tópico de Kafka, integração entre
serviços. Evolução de schema é bem resolvida por design.

### Orientados a coluna

**Parquet** e **ORC** guardam os valores agrupados por coluna, dentro de blocos
horizontais chamados row groups, cada um com estatísticas próprias. Isso libera
três ganhos que se somam:

<Passos itens={[
  "Column pruning: a consulta lê só as colunas que usa. Em tabela de 60 colunas usando 3, você lê 5% do arquivo.",
  "Predicate pushdown: o filtro é avaliado contra o mínimo e o máximo de cada row group, e os blocos fora da faixa são pulados sem descompressão.",
  "Compressão por coluna: valores do mesmo tipo vizinhos permitem codificação por dicionário e por repetição, reduzindo bytes lidos do S3."
]} />

<Callout tipo="dica" titulo="A frase que responde a pergunta-chave">
"Parquet ganha porque lê menos: menos colunas, menos blocos e menos bytes por
bloco." Depois desdobre cada um dos três.
</Callout>

<Comparativo
  colunas={["Formato", "Orientação", "Schema", "Compressão", "Onde brilha", "Onde perde"]}
  linhas={[
    ["CSV", "Linha", "Nenhum", "Externa, do arquivo inteiro", "Troca simples, leitura humana", "Escala analítica, tipagem, nulos"],
    ["JSON", "Linha", "Implícito", "Externa", "Estrutura aninhada, saída de API", "Volume repetido de chaves, parsing caro"],
    ["Avro", "Linha", "Embutido, com evolução", "Por bloco", "Stream, escrita contínua, integração", "Consulta analítica por poucas colunas"],
    ["Parquet", "Coluna", "Embutido no rodapé", "Por coluna, com dicionário", "Analytics em Spark, Databricks, Athena", "Escrita incremental fina, leitura humana"],
    ["ORC", "Coluna", "Embutido", "Por coluna, com índices internos", "Ecossistema Hive e Trino sobre Hive", "Menos padrão fora desse ecossistema"]
  ]}
/>

## Formatos de tabela

Uma pasta com arquivos Parquet no S3 não é uma tabela: não tem transação, não
tem versão, e um job que morre no meio deixa arquivo parcial que o próximo
leitor vai contar. Formato de tabela resolve isso com uma camada de
**metadados** que declara, a cada versão, quais arquivos compõem a tabela.

<Termo nome="log de transações">Registro ordenado das operações sobre a tabela — quais arquivos entram e quais saem — que define o estado da tabela em cada versão.</Termo>

O que os três acrescentam sobre o Parquet cru:

- **ACID por tabela**: escrita atômica, leitura por snapshot consistente,
  concorrência controlada.
- **Time travel**: consultar a tabela como ela estava numa versão ou data
  anterior, enquanto os arquivos daquela versão existirem.
- **Evolução de schema**: acrescentar, renomear e alterar coluna de forma
  controlada, em vez de descobrir a mudança no erro de leitura.
- **MERGE / upsert e delete**: viabiliza aplicar CDC do core bancário e atender
  pedido de exclusão sob LGPD sem reescrever a tabela inteira.
- **Compaction**: juntar arquivos pequenos, que é o que mata performance em
  ingestão frequente.

<Comparativo
  colunas={["Formato de tabela", "Origem e foco", "Ponto forte", "Considere quando"]}
  linhas={[
    ["Delta Lake", "Databricks; integração profunda com Spark", "Maturidade no ecossistema Spark e Databricks, MERGE e time travel diretos", "Sua plataforma é Databricks e o time já vive em Spark"],
    ["Apache Iceberg", "Netflix; tabelas muito grandes e multiengine", "Particionamento oculto e evolução de partição sem reescrever a tabela; adoção ampla entre motores", "Vários motores leem a mesma tabela e o particionamento vai mudar"],
    ["Apache Hudi", "Uber; ingestão incremental de baixa latência", "Upsert eficiente e modo merge-on-read para escrita frequente", "O caminho crítico é atualizar registros com frequência alta"]
  ]}
/>

<Callout tipo="atencao" titulo="Não confunda as duas camadas">
"Delta é melhor que Parquet" é uma frase errada. Delta **usa** Parquet. Se a
banca perguntar isso, corrija com educação e explique as duas camadas — é um dos
pontos em que dá para se destacar.
</Callout>

## O custo que vem junto

Formato de tabela não é grátis. Você passa a operar metadado: rodar compaction
para não acumular arquivo pequeno, definir retenção e rodar limpeza dos arquivos
antigos, e decidir por quanto tempo o time travel precisa alcançar. Em banco
essa decisão conversa direto com política de retenção e com pedido de exclusão
sob LGPD — dado apagado da versão corrente ainda existe nas versões anteriores
até a limpeza rodar.
