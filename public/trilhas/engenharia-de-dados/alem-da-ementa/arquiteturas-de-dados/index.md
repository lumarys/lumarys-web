# Arquiteturas de dados

> Lambda contra Kappa, Data Warehouse contra Data Lake contra Lakehouse, os quatro princípios do Data Mesh e a diferença entre Source of Record e Source of Truth: o vocabulário de arquitetura que a sabatina cobra em nível de trade-off.

Fonte: https://lumarys.com.br/trilhas/engenharia-de-dados/alem-da-ementa/arquiteturas-de-dados/ · Lumarys (marca da Cernyn) · CC BY-NC-SA 4.0

## Em uma frase

Arquitetura de dados é a escolha de **onde o dado mora, quem manda nele e quantas
vezes a mesma regra é escrita** — e cada opção cobra num lugar diferente.

## Lambda contra Kappa

**Lambda** tem duas camadas de processamento. A *batch* reprocessa o histórico
inteiro e produz o número correto, com latência de horas. A *speed* processa o
que chega agora e produz um número aproximado, em segundos. A camada de serviço
junta as duas na hora da consulta: histórico da batch, últimas horas da speed.

**Kappa** elimina a camada batch. Tudo é stream, e reprocessar histórico é reler
o log de eventos desde o começo com o código novo.

<Comparativo
  colunas={["", "Lambda", "Kappa"]}
  linhas={[
    ["Caminhos de processamento", "Dois: batch e speed", "Um: stream"],
    ["Custo principal", "A mesma regra escrita duas vezes, que diverge com o tempo", "Depender do log reter histórico e reprocessar volume grande por stream"],
    ["Quando faz sentido", "Regra batch complexa que não se traduz bem para stream", "Lógica que cabe em stream e log com retenção suficiente"]
  ]}
/>

<Callout tipo="atencao" titulo="A frase que a banca espera">
O custo do Lambda não é infraestrutura, é manutenção: duas implementações do
cálculo de exposição de crédito acabam discordando, e descobrir qual está certa
vira projeto.
</Callout>

## Warehouse, Lake e Lakehouse

<Comparativo
  colunas={["", "Data Warehouse", "Data Lake", "Lakehouse"]}
  linhas={[
    ["Schema", "On write: modela antes de carregar", "On read: aplica na leitura", "On read com contrato de tabela por cima"],
    ["Dado que aceita", "Estruturado", "Qualquer formato", "Qualquer formato, com tabelas governadas sobre os arquivos"],
    ["Transação", "ACID nativo", "Não tem: escrita parcial é visível", "ACID pela camada Delta, Iceberg ou Hudi"],
    ["Custo de armazenamento", "Alto", "Baixo (objetos)", "Baixo (objetos)"],
    ["Risco típico", "Rigidez e fila de modelagem", "Virar pântano sem catálogo e qualidade", "Complexidade de operar a camada de tabela"],
    ["Uso no banco", "Relatório regulatório estável", "Payload cru de PIX, log, áudio", "Tabelas de transação com MERGE e time travel para auditoria"]
  ]}
/>

## Data Mesh

Mesh responde a um gargalo **organizacional**: um time central de dados que não
dá conta da fila de pedidos de quatro áreas de negócio. Quatro princípios:

<Passos itens={[
  "Propriedade descentralizada por domínio: quem gera o dado responde por ele",
  "Dado como produto: dono, consumidor, contrato, SLA, documentação, descoberta",
  "Plataforma de dados self-serve: o domínio publica sem depender do time central",
  "Governança federada computacional: regras globais decididas em conjunto e aplicadas por automação"
]} />

Um **data product** não é uma tabela publicada. É uma tabela com dono nomeado,
consumidor conhecido, SLA de atualização, qualidade medida e presença no
catálogo. O **contrato de dados** é o acordo explícito de schema, semântica,
frequência e política de mudança — o que transforma quebra silenciosa em
violação detectável.

<Callout tipo="erro" titulo="Quando Mesh é overhead">
Sem domínios que tenham time de engenharia próprio, e sem plataforma self-serve,
descentralizar propriedade só distribui o problema. Em organização pequena, o
custo de coordenação supera o ganho e centralizar continua mais rápido.
</Callout>

## Source of Record e Source of Truth

Este par é o que mais derruba candidato, porque parece sinônimo e não é.

<Termo nome="Source of Record">O sistema onde o dado nasce e que é autoritativo sobre o fato original.</Termo>
O core bancário é o SoR do lançamento. O sistema de cadastro é o SoR do endereço.
Se a base analítica discorda do SoR sobre *o que aconteceu*, é a base analítica
que se explica.

<Termo nome="Source of Truth">A visão consolidada, tratada e governada que a organização usa para decidir.</Termo>
A SoT reúne vários SoRs, resolve duplicidade, aplica regra de negócio e corte
temporal, e é a referência do relatório e do indicador.

**Elas divergem por bons motivos.** Corte temporal diferente (o core é agora, o
relatório é o fechamento de ontem às 23h59). Regra distinta (lançamento em
contingência que a contabilidade ainda não reconhece). Atraso de ingestão. E, às
vezes, defeito real.

A resposta profissional não é eleger um número, é **reconciliar**: comparar o
mesmo corte, isolar a causa, documentar a explicação e configurar alerta para
quando a diferença sair da faixa esperada. Divergência explicada é operação
normal; divergência sem explicação é incidente.

## Modern data stack, em uma frase

Conjunto de ferramentas gerenciadas e desacopladas — ingestão, armazenamento em
nuvem, transformação em SQL, orquestração, catálogo e BI — montadas por
integração em vez de por plataforma única.
