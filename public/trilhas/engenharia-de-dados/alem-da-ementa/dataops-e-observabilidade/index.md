# DataOps e observabilidade

> Tratar pipeline como software: teste de dados, contrato entre produtor e consumidor, linhagem e os quatro sinais que avisam que o dado quebrou antes do usuário abrir o dashboard.

Fonte: https://lumarys.com.br/trilhas/engenharia-de-dados/alem-da-ementa/dataops-e-observabilidade/ · Lumarys (marca da Cernyn) · CC BY-NC-SA 4.0

## Em uma frase

DataOps é aplicar disciplina de engenharia de software ao pipeline; observabilidade
é o conjunto de sinais que te avisa que **o dado** quebrou, e não só que o job
falhou.

## Job verde não é dado certo

Essa é a frase que ancora o tema inteiro. O Spark termina com sucesso lendo um
arquivo vazio. O `MERGE` roda perfeitamente com a regra de negócio errada. O
orquestrador pinta tudo de verde e o erro só aparece quando um diretor abre o
relatório de fraude com número estranho.

Tratar pipeline como software é o que fecha esse vão: código versionado, revisão
por par, teste automatizado, ambientes separados, deploy reproduzível, rollback
possível. Sai o script no notebook, entra o artefato com ciclo de vida.

## Teste de dados: seis famílias

<Comparativo
  colunas={["Teste", "Pergunta que ele faz", "Exemplo bancário"]}
  linhas={[
    ["Esquema", "A estrutura é a contratada?", "O core renomeou vlr_transacao e a coluna sumiu"],
    ["Volume", "Chegou a quantidade esperada?", "Ingestão de PIX trouxe 3% do volume de uma terça normal"],
    ["Nulos", "Campo obrigatório veio preenchido?", "data_liquidacao vazia em 12% dos registros"],
    ["Domínio", "Os valores estão na lista aceita?", "tipo_operacao trouxe um código novo que ninguém trata"],
    ["Unicidade", "A chave de negócio se repete?", "Transação duplicada depois de reprocessar"],
    ["Integridade", "As chaves existem do outro lado?", "id_cliente órfão na dimensão de clientes"]
  ]}
/>

Três ferramentas para citar, uma frase cada. **Great Expectations**: você declara
expectativas em Python, roda sobre Spark ou pandas e recebe relatório do que passou.
**dbt tests**: asserções no YAML do modelo — `unique`, `not_null`,
`accepted_values`, `relationships` — mais testes singulares em SQL. **Deequ**:
biblioteca da Amazon sobre Spark que calcula métricas e verifica restrições em
escala, com o AWS Glue Data Quality como versão gerenciada.

<Callout tipo="dica" titulo="Onde colocar o teste">
Na entrada de cada camada, não só na gold. Um erro que nasce na bronze e é detectado
na gold custa três reprocessamentos e uma investigação. Detectado na bronze, custa
um alerta.
</Callout>

## Contrato de dados

Contrato é o acordo entre quem produz e quem consome, e vale mais que qualquer
teste isolado. Precisa ter esquema, semântica de cada campo, granularidade, prazo de
entrega, política de mudança com aviso prévio e **consequência declarada** quando
alguém quebra. Sem consequência, é documentação.

O contrato só existe de verdade quando vira teste executável na entrada da bronze:
mudança compatível, como coluna nova, passa; incompatível, como troca de tipo, para
o pipeline e avisa o produtor.

## Linhagem

<Termo nome="linhagem">Registro de origem e destino de cada tabela e coluna ao longo
do pipeline.</Termo> responde duas perguntas caras: análise de impacto (quais
dashboards param se esta tabela estiver errada) e causa raiz (de onde veio o número
torto). **OpenLineage** é a especificação aberta para esses eventos, com integrações
para orquestradores e motores, para a linhagem não ficar presa a uma ferramenta só.
No Databricks, o Unity Catalog captura linhagem até o nível de coluna.

## Os quatro sinais

**Freshness**: há quanto tempo a tabela foi atualizada, contra o SLA. **Volume**:
quantos registros chegaram, contra a faixa histórica do dia da semana. **Schema**: a
estrutura mudou sem aviso. **Distribuição**: os valores continuam com a cara de
sempre — média, nulos, cardinalidade. Muitas listas somam **linhagem** como quinto
pilar.

A diferença para teste: teste afirma uma regra que você conhece e falha o pipeline.
Observabilidade detecta desvio de comportamento que você não enunciou.

## Alerta útil e alerta ignorado

<Callout tipo="erro" titulo="O alerta que ninguém lê">
Alerta sem dono, com limiar não calibrado, disparado para lista de trinta pessoas,
treina o time a ignorar o canal. Quando o alerta que importava chegar, ele vai para
a mesma pasta.
</Callout>

Alerta útil é acionável, tem dono nomeado, tem limiar tirado do histórico e traz
contexto para começar a investigar. Notificação de job que terminou bem não é
alerta.

## Reprocessamento idempotente

Rodar a mesma janela duas vezes precisa produzir o mesmo resultado. Na prática:
escrita por partição com overwrite dinâmico, ou `MERGE` pela chave de negócio.
Append cego é a causa número um de transação duplicada em fato. Idempotência é o que
transforma reprocessamento de operação de risco em rotina.

## CI/CD, IaC e versionamento

<Passos itens={[
  "Em CI, sem dado de produção: valide contrato e esquema, rode a transformação sobre amostra sintética com casos de borda, e um teste de fumaça ponta a ponta em ambiente reduzido",
  "Mantenha ambientes separados — desenvolvimento, homologação, produção — com o mesmo código e configuração por variável",
  "Em CD, faça deploy do artefato versionado e mantenha o caminho de rollback testado"
]} />

**IaC** fecha a conta: Terraform descreve bucket, catálogo, permissão, cluster e job
como código revisável, e recria o ambiente igual. Docker empacota a dependência do
job para o que rodou no seu laptop rodar igual no cluster. Ambiente clicado na
console é ambiente que ninguém consegue reproduzir depois do incidente.

**Versionamento de dado** é a última peça: Delta com time travel por versão ou
timestamp, Iceberg com snapshots. Permite comparar antes e depois de um
reprocessamento e voltar atrás sem restaurar backup.

## Como responder isso em voz alta

Comece pela distinção job versus dado. Liste as famílias de teste com um exemplo
bancário cada. Passe para os quatro sinais. Feche dizendo como prioriza cobertura
por criticidade, porque testar tudo igual é o que faz o time abandonar a prática.
