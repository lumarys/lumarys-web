# Particionamento de dados

> Particionar é dividir o dado por uma chave para que a consulta leia só o pedaço que interessa. Acertar a chave decide desempenho e custo; errar a cardinalidade produz milhões de arquivos pequenos ou uma partição quente que trava o cluster.

Fonte: https://lumarys.com.br/trilhas/engenharia-de-dados/processamento/particionamento-de-dados/ · Lumarys (marca da Cernyn) · CC BY-NC-SA 4.0

## Em uma frase

Particionar é **dividir fisicamente o dado por uma chave** para que a consulta
leia apenas o pedaço que interessa, em vez de varrer tudo.

## Para que serve: partition pruning

<Termo nome="partition pruning">Descarte de partições inteiras antes de abrir qualquer arquivo, com base no filtro da consulta.</Termo>

Esse é o ganho central, e ele tem uma condição: a consulta precisa **filtrar pela
coluna de partição**. Se o relatório do time de risco sempre traz
`WHERE data_transacao BETWEEN ...`, particionar por data faz o motor ler dois
diretórios em vez de dois mil. Se ninguém filtra por aquela coluna, você criou
complexidade sem retorno.

Há um segundo ganho, menos citado e muito valioso em banco: **expiração vira
operação de metadado**. Descartar log com mais de 90 dias é remover diretórios,
não varrer a tabela procurando linhas velhas.

## Data ou chave de negócio?

Data é o padrão em serviço financeiro por três motivos: quase toda consulta tem
recorte temporal, o volume por dia é previsível, e o ciclo de vida do dado é
temporal. Chave de negócio — produto, canal, segmento — só funciona quando a
cardinalidade é baixa **e** a distribuição é equilibrada **e** as consultas
filtram por ela.

Na prática, o desenho comum é data como primeiro nível e, no máximo, uma segunda
coluna de baixíssima cardinalidade.

## Cardinalidade e small files

<Callout tipo="erro" titulo="O erro que mais aparece em prova">
Particionar por `id_transacao` ou por CPF. A chave é única ou quase, então cada
partição fica com uma ou duas linhas. O resultado são milhões de arquivos de
poucos kilobytes, um metastore sobrecarregado e uma consulta mais lenta do que
sem particionamento nenhum.
</Callout>

O motor paga um custo fixo por arquivo: listar, abrir, ler o rodapé de metadados,
agendar a task. Quando o arquivo tem 4 KB, esse custo fixo é praticamente todo o
tempo de execução. A documentação do Databricks recomenda pelo menos 1 GB por
partição e desaconselha particionar tabelas abaixo de 1 TB — número de plataforma,
não lei universal, mas é a ordem de grandeza que você deve ter na cabeça.

O extremo oposto também existe: cardinalidade baixa demais, como particionar seis
anos de transação por ano, dá partições grandes que não podem ser podadas com
precisão.

## Hot partition

Distribuição desigual é o problema mais difícil de enxergar. Particionar eventos
de PIX por instituição recebedora parece razoável até você olhar os números: umas
poucas instituições concentram a maior parte do volume. Como cada partição vira
uma unidade de trabalho, uma task fica com quase todo o dado e as outras terminam
em segundos. O job passa a demorar o tempo da maior task, e comprar mais nós não
ajuda.

Sintoma na Spark UI: dentro do mesmo stage, uma task destoa em ordem de grandeza
em duração e em bytes lidos. Correções: trocar a chave, compor com uma segunda
coluna, aplicar hash ou salt no valor concentrado, ou tirar aquela dimensão da
partição e colocá-la em bucket.

## Bucketing e clustering

Bucketing distribui as linhas por **hash da chave** em um número fixo de arquivos,
dentro da partição. Resolve um problema diferente: colocalizar a mesma chave dos
dois lados de um join para evitar shuffle, e agrupar leituras por chave fina sem
criar diretório para cada valor.

<Comparativo
  colunas={["Técnica", "Como divide", "Resolve", "Sofre com cardinalidade alta?"]}
  linhas={[
    ["Partição", "Diretórios ou segmentos por valor da chave", "Pruning por filtro e expiração barata", "Sim, gera small files"],
    ["Bucket / clustering", "Hash da chave em N arquivos fixos", "Join e agregação por chave sem shuffle", "Não, N é fixo"]
  ]}
/>

A combinação clássica em banco: **data no diretório, cartão no bucket**.

## Mesmo nome, mecanismos diferentes

<Callout tipo="atencao" titulo="Não misture os dois mundos na resposta">
Em banco relacional, partição é estrutura interna: o otimizador conhece as
partições, mantém estatísticas e ainda tem índices por cima. Em data lake,
partição é literalmente um pedaço do caminho do arquivo, tipo
`/transacoes/dt=2026-03-01/`, e o pruning depende de o motor entender esse padrão.
Por isso small files é dor de lake e praticamente não existe no relacional.
</Callout>

## Como escolher a chave

<Passos itens={[
  "Levante o filtro dominante das consultas reais, não o imaginado.",
  "Meça a cardinalidade e a distribuição dos valores candidatos.",
  "Estime o tamanho médio da partição resultante e compare com a ordem de grandeza de 1 GB.",
  "Se a chave natural tiver cardinalidade alta, use granularidade mais grossa na partição e bucket na chave fina.",
  "Valide depois de implantar: distribuição de tasks, contagem e tamanho médio dos arquivos."
]} />
