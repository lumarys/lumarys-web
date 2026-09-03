# SQL para engenharia de dados

> O SQL que a sabatina cobra não é o do CRUD: é anti-join, CTE, window function para deduplicar e calcular variação, leitura de plano de execução e a diferença entre SQL analítico e transacional.

Fonte: https://lumarys.com.br/trilhas/engenharia-de-dados/alem-da-ementa/sql-para-dados/ · Lumarys (marca da Cernyn) · CC BY-NC-SA 4.0

## Em uma frase

O SQL que a sabatina cobra é o de **transformação**: anti-join, CTE, window
function, leitura de plano — e saber que o SQL analítico sobre arquivos joga com
regras diferentes do SQL transacional sobre índice.

## Join, anti-join e o perigo do NOT IN

Anti-join é "traga o que não tem correspondência". Duas formas seguras e uma
armadilha:

```sql
-- Forma canônica: NOT EXISTS
SELECT c.id_conta
FROM contas c
WHERE NOT EXISTS (
  SELECT 1 FROM transacoes t WHERE t.id_conta = c.id_conta
);

-- Equivalente: LEFT JOIN com IS NULL
SELECT c.id_conta
FROM contas c
LEFT JOIN transacoes t ON t.id_conta = c.id_conta
WHERE t.id_transacao IS NULL;
```

<Callout tipo="erro" titulo="Por que NOT IN quebra">
Se a subconsulta devolver um único NULL, a comparação vira desconhecida para
toda linha e a consulta retorna **vazio**, sem erro nenhum. É falha silenciosa,
e a banca gosta de perguntar exatamente isso.
</Callout>

## Agregação e HAVING

WHERE filtra **linha** antes da agregação. HAVING filtra **grupo** depois dela.
"Clientes com mais de 50 transações no mês" precisa de HAVING, porque a contagem
só existe depois do GROUP BY.

## CTE no lugar de subquery aninhada

CTE nomeia o passo. Três subqueries aninhadas obrigam a leitura de dentro para
fora; a mesma lógica em CTE se lê na ordem em que foi pensada, e cada bloco pode
ser executado isolado durante a depuração. Em consulta de pipeline, isso vale
mais do que qualquer ganho de performance — o otimizador costuma produzir o
mesmo plano.

## Window functions: o coração do tema

<Termo nome="window function">Função que calcula um valor por linha olhando um conjunto de linhas relacionadas (a janela), sem colapsar o resultado como o GROUP BY faz.</Termo>

```sql
-- Deduplicar / última transação por conta
WITH ordenadas AS (
  SELECT t.*,
         ROW_NUMBER() OVER (
           PARTITION BY id_conta
           ORDER BY data_transacao DESC, id_transacao DESC
         ) AS rn
  FROM transacoes t
)
SELECT * FROM ordenadas WHERE rn = 1;

-- Variação em relação à transação anterior
SELECT id_conta, data_transacao, valor,
       valor - LAG(valor) OVER (PARTITION BY id_conta ORDER BY data_transacao) AS variacao
FROM transacoes;

-- Gasto acumulado no mês
SELECT id_conta, data_transacao, valor,
       SUM(valor) OVER (
         PARTITION BY id_conta ORDER BY data_transacao
         ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
       ) AS acumulado
FROM transacoes;
```

<Comparativo
  colunas={["Função", "Em caso de empate", "Uso típico"]}
  linhas={[
    ["ROW_NUMBER", "Desempata arbitrariamente, nunca repete", "Deduplicar, pegar a linha mais recente"],
    ["RANK", "Repete o número e pula as posições seguintes", "Ranking em que o buraco é informativo"],
    ["DENSE_RANK", "Repete o número e não pula", "Top N por categoria mantendo empates"]
  ]}
/>

<Callout tipo="atencao" titulo="Janela não se filtra no WHERE">
A window function é avaliada **depois** de WHERE e GROUP BY. Envolva numa CTE e
filtre fora, ou use `QUALIFY` — que existe em Databricks SQL, Snowflake e
BigQuery, mas não em Spark SQL puro.
</Callout>

```sql
-- Mesma dedupe, com QUALIFY
SELECT *
FROM transacoes
QUALIFY ROW_NUMBER() OVER (PARTITION BY id_transacao ORDER BY data_ingestao DESC) = 1;
```

## Ler o plano de execução

`EXPLAIN` mostra o que o motor pretende fazer. O que procurar, em ordem:

<Passos itens={[
  "Varredura completa onde deveria haver poda de partição — quase sempre é filtro com função aplicada sobre a coluna particionada.",
  "Estratégia de join escolhida: broadcast, sort-merge ou hash, e se ela faz sentido para o tamanho dos lados.",
  "Estimativa de linhas muito distante do real, sinal de estatística desatualizada.",
  "Ordenação ou agregação que você não pediu, geralmente induzida por DISTINCT ou por window mal escrita.",
  "Ordem dos joins: filtrar cedo e juntar tarde costuma valer mais que qualquer hint."
]} />

## Índice: quando ajuda e quando atrapalha

Ajuda em consulta **seletiva por chave** — cadastro por CPF, transação por id.
Atrapalha em tabela com escrita intensa, porque cada INSERT mantém a estrutura,
e quando a consulta lê boa parte da tabela, caso em que a varredura sequencial
sai mais barata que o acesso aleatório.

## SQL analítico não é SQL transacional

<Comparativo
  colunas={["Aspecto", "OLTP (Postgres, core bancário)", "Analítico (Spark SQL, Athena)"]}
  linhas={[
    ["Unidade de acesso", "Linha, via índice", "Arquivo e coluna, via varredura podada"],
    ["Otimização principal", "Índice e estatística de coluna", "Particionamento, ordenação, poda por estatística do Parquet"],
    ["Custo dominante", "Busca aleatória em disco", "Leitura de dados e shuffle na rede"],
    ["Atualização", "UPDATE e DELETE por linha, transacional", "Reescrita de arquivo; MERGE só com formato de tabela como Delta"],
    ["Transação", "ACID multi-tabela", "ACID por tabela, quando há Delta ou Iceberg"]
  ]}
/>

Dizer isso em voz alta muda o tom da resposta: você não está usando "o mesmo
SQL num lugar maior", está usando uma linguagem parecida sobre um motor com
outra física de custo.
