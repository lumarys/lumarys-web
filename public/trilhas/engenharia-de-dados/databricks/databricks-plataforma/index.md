# Databricks: a plataforma

> Databricks é o Spark gerenciado mais tudo o que falta em volta dele: workspace, clusters, orquestração de jobs, ingestão incremental com Auto Loader e governança com Unity Catalog, rodando sobre o S3 na AWS.

Fonte: https://lumarys.com.br/trilhas/engenharia-de-dados/databricks/databricks-plataforma/ · Lumarys (marca da Cernyn) · CC BY-NC-SA 4.0

## Em uma frase

Databricks é a **plataforma gerenciada construída em volta do Apache Spark**:
ela entrega o motor, mais o ambiente de trabalho, a orquestração, a ingestão
incremental e a governança que o Spark sozinho não tem.

## Databricks não é o Spark

A distinção parece pedante até a banca perguntar. O Spark é um motor de
processamento distribuído: você o instala, configura, orquestra e monitora. O
Databricks empacota o Spark num runtime próprio e acrescenta o que falta em
volta dele — workspace, catálogo, permissões, agendamento, monitoramento e
provisionamento de máquina.

Na AWS, o desenho é: o **plano de controle** fica com a Databricks, a
**computação** roda em máquinas provisionadas para você, e os **dados continuam
no S3 da conta da própria instituição**. Isso importa na sabatina porque muda a
conversa com segurança: o banco não está entregando os dados, está terceirizando
o gerenciamento da computação.

## As peças que você precisa saber nomear

<Comparativo
  colunas={["Peça", "Para que serve", "Onde erra quem não usou"]}
  linhas={[
    ["Workspace", "Ambiente com notebooks, código, jobs e permissões", "Misturar dev e produção no mesmo workspace"],
    ["Notebook", "Interface de desenvolvimento e exploração", "Deixar lógica de produção só no notebook, sem versionamento"],
    ["Cluster", "A computação que executa o Spark", "Escolher o tipo errado e pagar ociosidade"],
    ["Jobs / Workflows", "Orquestração nativa com dependência, retry e alerta", "Subir um orquestrador externo para encadear dois notebooks"],
    ["Auto Loader", "Ingestão incremental de arquivos do object storage", "Reler o diretório inteiro toda madrugada"],
    ["Unity Catalog", "Governança: permissão, linhagem, auditoria", "Controlar acesso por bucket e perder rastreabilidade"]
  ]}
/>

## Escolha de cluster é decisão de custo

Esta é a parte em que a banca separa quem já respondeu por uma fatura.

<Comparativo
  colunas={["Tipo", "Quando usar", "Efeito no custo"]}
  linhas={[
    ["All-purpose", "Exploração interativa em notebook, trabalho compartilhado", "Fica ligado até alguém encerrar e tem a tarifa por DBU mais alta"],
    ["Job cluster", "Pipeline agendado, execução automatizada", "Nasce com o job e morre no fim: sem ociosidade e com tarifa menor"],
    ["Serverless", "Consulta e job em que o tempo de subida incomoda", "Sem VM para administrar e partida rápida; menos controle fino de configuração"]
  ]}
/>

<Callout tipo="erro" titulo="O clássico caro">
Rodar pipeline de produção em cluster all-purpose ligado 24 horas. Você paga a
tarifa mais alta e ainda paga as 23 horas em que nada roda. A correção é
migrar para job compute e aplicar cluster policy para que ninguém refaça isso.
</Callout>

## Auto Loader: ingestão incremental sem gambiarra

Arquivo caindo em S3 ao longo do dia é o padrão de ingestão bancária: retorno de
adquirente, arquivo de câmbio, extração do core. O Auto Loader mantém um
<Termo nome="checkpoint">Registro persistente de quais arquivos já foram
processados, para que a próxima execução continue de onde parou.</Termo>
Com isso, reprocessamento não duplica, arquivo novo é detectado sem revarrer o
diretório inteiro e a evolução de schema é tratada em vez de derrubar o job.

## Delta Live Tables, em poucas linhas

DLT é a forma declarativa de escrever pipeline: você declara as tabelas e as
regras de qualidade (as *expectations*), e a plataforma resolve a ordem de
execução, o estado incremental e o que fazer com o registro que viola a regra —
descartar, deixar passar com aviso ou falhar. Vale citar como opção; não invente
detalhe de configuração que você não usou. [verificar o nome comercial vigente
do produto na documentação, que a Databricks reposicionou sob a família Lakeflow]

## Unity Catalog: onde a governança acontece

Sem Unity Catalog, permissão em lakehouse é permissão de bucket, e bucket não
sabe o que é coluna de CPF. Com ele, você endereça tudo em três níveis —
`catalog.schema.objeto` — e concede acesso no nível do objeto.

<Passos itens={[
  "Desenhe o namespace com intenção: catálogo por ambiente ou domínio, schema por assunto.",
  "Conceda a grupos mapeados no diretório corporativo, nunca a usuários individuais.",
  "Use máscara de coluna e filtro de linha em vez de criar cópias mascaradas que divergem.",
  "Ative linhagem e auditoria: é o que responde 'quem consultou o CPF desse cliente'.",
  "Dê acesso ao S3 por credencial gerenciada no catálogo, não por chave dentro do notebook."
]} />

<Callout tipo="dica" titulo="Como responder a pergunta-chave">
Comece dizendo por que acesso por bucket não serve. Depois desça para o
namespace de três níveis, grupos, máscara e filtro. Termine com auditoria e
linhagem, e acrescente a camada de computação (cluster policy, credencial
gerenciada). Quem só fala de GRANT em tabela responde metade.
</Callout>
