# dbt: transformação versionada em SQL

> A ferramenta que virou padrão na camada de transformação: modelos em SQL com referências que montam o grafo sozinho, testes e documentação junto do código, materialização escolhida por caso, e snapshots para histórico. É o T do ELT com disciplina de engenharia.

Fonte: https://lumarys.com.br/trilhas/engenharia-de-analytics/alem-da-ementa/dbt-e-transformacao-versionada/ · Lumarys (marca da Cernyn) · CC BY-NC-SA 4.0

## Em uma frase

O dbt dá ao SQL as garantias que o código de aplicação já tinha:
**versionamento, revisão, teste, documentação e linhagem** — e monta a ordem de
execução sozinho a partir das referências entre modelos.

## O que ele é, e o que não é

<Comparativo
colunas={["É", "Não é"]}
linhas={[
["A camada de transformação (o T do ELT)", "Ferramenta de extração ou carga"],
["Executor de SQL versionado dentro do warehouse", "Um banco de dados"],
["Resolvedor da ordem entre modelos", "Orquestrador do pipeline inteiro"],
["Gerador de documentação e linhagem", "Ferramenta de visualização"]
]}
/>

Delimitar o escopo é metade da resposta na sabatina: quem diz que o dbt
substitui o orquestrador mostra que não usou.

## A referência: a ideia que sustenta o resto

Em vez de escrever o nome da tabela, o modelo **referencia** outro modelo.
Dessa mudança pequena saem quatro capacidades:

<Passos itens={[
"O grafo de dependências se monta sozinho.",
"A ordem de execução é derivada do grafo, não de nomes de arquivo numerados.",
"O dbt sabe o que precisa reconstruir quando um modelo muda.",
"A linhagem vira um site navegável, respondendo 'quem consome isto' sem garimpo."
]} />

<Callout tipo="atencao" titulo="Escrever o nome da tabela quebra tudo isso">
É o erro mais comum de quem começa. O modelo funciona, o SQL roda — e o grafo
não se forma, a ordem volta a ser manual e a linhagem fica incompleta. O
sintoma aparece semanas depois, quando alguém confia na linhagem para avaliar
impacto.
</Callout>

## Materialização: três perguntas

<Comparativo
colunas={["Materialização", "Quando", "Custo"]}
linhas={[
["View", "Intermediário pequeno, consultado por outros modelos", "Nenhum de armazenamento; resolve na consulta"],
["Table", "Consultado com frequência por painéis", "Armazenamento e tempo de build"],
["Incremental", "Volume grande que cresce por período", "Complexidade: chave única, lógica de atualização, refazer do zero"],
["Ephemeral", "Lógica reaproveitada que não precisa existir no banco", "Nenhum: vira CTE em quem usa"]
]}
/>

As perguntas que decidem: **quem consulta**, **qual o volume**, **com que
frequência muda**. E o erro a evitar é materializar tudo como tabela por
reflexo — a maior parte dos modelos intermediários de um projeto não é
consultada por ninguém.

<Callout tipo="dica" titulo="O custo escondido do incremental">
Ele exige chave única, lógica de atualização e — o que se esquece — a
capacidade de **refazer tudo do zero** quando a regra mudar. Sem isso, o
histórico fica com dois cálculos diferentes convivendo na mesma tabela.
</Callout>

## Teste e documentação no mesmo lugar

**Testes genéricos** (unicidade, não nulo, conjunto de valores, integridade)
são declarados em configuração ao lado do modelo. **Testes específicos** são
consultas próprias que afirmam uma regra de negócio — e é aí que mora o teste
que pega erro caro: o total batendo com a origem.

A **documentação** fica junto do código, e o site gerado traz o dicionário e o
grafo. Isso resolve, de graça, a pergunta que sempre aparece em governança:
_o que essa coluna significa e quem depende dela?_

## Snapshot não é backup

<Termo nome="snapshot">Mecanismo que captura mudanças de um registro ao longo do tempo, implementando dimensão de mudança lenta do tipo 2: preserva o valor antigo com data de validade quando o novo chega.</Termo>

Serve para responder "qual era o segmento deste cliente em março". Não serve
para restaurar ambiente — essa confusão aparece em entrevista e é fácil de
evitar.

## Como responder isso em voz alta

Para "o que ele resolve": **ordem pelo grafo**, **teste junto do modelo**,
**documentação e linhagem**, e **o fluxo de trabalho de software aplicado ao
SQL**. Termine delimitando: não move dado, não substitui orquestrador. Para
materialização, dê os três critérios e mencione o custo escondido do
incremental — é o detalhe que mostra uso real.
