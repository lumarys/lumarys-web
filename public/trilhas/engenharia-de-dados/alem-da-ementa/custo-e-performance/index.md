# Custo e performance

> O que realmente gera fatura numa plataforma de dados, por que arquivo pequeno é caro, como particionamento e data skipping cortam varredura, e o método para investigar um custo que dobrou sem chutar.

Fonte: https://lumarys.com.br/trilhas/engenharia-de-dados/alem-da-ementa/custo-e-performance/ · Lumarys (marca da Cernyn) · CC BY-NC-SA 4.0

## Em uma frase

Custo em plataforma de dados é, quase sempre, **bytes desnecessários movidos e
máquina ligada sem trabalho útil** — e as duas coisas se medem antes de se
consertar.

## De onde vem a fatura

<Comparativo
  colunas={["Categoria", "O que cobra", "Alavanca típica"]}
  linhas={[
    ["Armazenamento", "Volume guardado, por classe e por tempo", "Retenção, ciclo de vida, VACUUM de versões antigas"],
    ["Computação", "Cluster de pé e query executada", "Sizing, autoscaling, cluster de job, spot"],
    ["Transferência", "Dado saindo da região ou entre zonas", "Manter processamento perto do dado"],
    ["Varredura", "Bytes lidos por consulta em motor serverless", "Partição, formato colunar, data skipping"]
  ]}
/>

Em lake bancário, varredura e computação dominam. Armazenamento costuma ser o menor
dos quatro — o que engana muita gente que começa apagando dado antigo e economiza
pouco.

## O problema dos arquivos pequenos

Cada arquivo vira pelo menos uma tarefa e uma chamada ao object storage. Com 400 mil
arquivos de 2 MB, o motor gasta mais tempo listando, planejando e abrindo arquivo do
que lendo bytes. A CPU fica ociosa, o job demora e você paga por máquina parada.

A mira é **centenas de megabytes por arquivo**, na casa de 128 MB a 1 GB. O
Databricks faz autotuning do `targetFileSize` conforme o tamanho da tabela
[verificar o valor padrão vigente na sua runtime].

<Passos itens={[
  "OPTIMIZE compacta arquivos pequenos em arquivos maiores, reescrevendo os dados",
  "Auto compaction junta arquivos pequenos logo após a escrita, dentro da partição",
  "Optimized writes ajusta o tamanho já na hora de gravar, evitando o problema na origem"
]} />

<Callout tipo="atencao" titulo="A causa mais comum de small files">
Ingestão em micro-lotes frequentes sem compactação, e particionamento por coluna de
alta cardinalidade. As duas coisas produzem arquivos minúsculos por construção.
</Callout>

## Particionamento como alavanca de custo

Partição vira diretório no storage. Se a consulta filtra pela coluna de partição, o
motor **elimina diretórios inteiros** sem abrir nada — é a economia mais barata que
existe. No Athena, onde a cobrança é por dado varrido, isso aparece direto na fatura.

Critério de escolha: **baixa cardinalidade**, presente nos filtros frequentes, e que
produza partições grandes o bastante. Data de transação é o padrão em banco. CPF,
id_transacao e timestamp cheio são erro clássico.

## Z-ORDER e data skipping

O formato de tabela guarda mín, máx e contagem por arquivo. Se o filtro não cabe na
faixa do arquivo, o motor não abre — isso é
<Termo nome="data skipping">pular arquivos com base nas estatísticas gravadas</Termo>.
O truque é que isso só funciona quando os valores estão **agrupados**: se cada
arquivo tem clientes de 1 a 10 milhões, nenhum arquivo é pulável.

`ZORDER BY` reorganiza fisicamente os dados para colocar valores próximos das colunas
escolhidas nos mesmos arquivos, apertando as estatísticas. Use para colunas de
cardinalidade alta que aparecem nos filtros — id_cliente, número do cartão
tokenizado. Partição e Z-ORDER são complementares, não alternativas.

## Cluster, autoscaling e spot

Cluster de **job** sobe, executa e morre: você paga o que usou. Cluster
**interativo** cobra enquanto está de pé, inclusive ocioso — é a linha silenciosa da
fatura. Autoscaling resolve carga variável dentro da execução, mas não conserta job
mal escrito: escalar um shuffle ruim distribui o desperdício por mais máquinas.

**Spot** cabe em workers de carga em lote tolerante a reexecução, com checkpoint,
fora de janela crítica. Não cabe no driver, porque perder o driver mata o job, nem
em pipeline com SLA regulatório.

**Cache de resultado** ataca outro eixo: consulta idêntica repetida por muitos
usuários no mesmo painel não precisa reprocessar.

## FinOps de dados

<Callout tipo="dica" titulo="Sem tag, não há conversa">
Tag em bucket, cluster, job e warehouse é pré-requisito. Sem alocação por time e por
produto, a discussão de custo vira opinião e ninguém assume dono.
</Callout>

Acrescente orçamento com alerta antes do estouro, revisão periódica das tabelas e
jobs mais caros, e uma métrica de custo por produto de dado. Custo vira
responsabilidade quando tem nome.

## A regra de ouro

Medir antes de otimizar. A Spark UI mostra número de tarefas, duração, shuffle e
desbalanceamento. O plano de execução mostra se a partição está sendo aproveitada. O
relatório de custo mostra qual serviço subiu. Chegar na sabatina dizendo **como você
confirmaria a hipótese** vale mais do que acertar a hipótese de primeira.

## Como responder isso em voz alta

Divida em quatro categorias de custo, diga qual delas domina em lake, e só então
proponha a alavanca. Sempre acompanhe a proposta de como você mediria o antes e o
depois — é isso que separa quem otimiza de quem repete receita.
