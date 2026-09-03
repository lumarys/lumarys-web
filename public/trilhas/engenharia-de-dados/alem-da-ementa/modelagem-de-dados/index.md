# Modelagem de dados

> Normalizar até 3NF serve ao transacional; modelar em estrela serve à análise. O tema cobre grão, fato e dimensão, star contra snowflake, dimensões conformadas, SCD 1, 2 e 3, Data Vault e One Big Table no Lakehouse.

Fonte: https://lumarys.com.br/trilhas/engenharia-de-dados/alem-da-ementa/modelagem-de-dados/ · Lumarys (marca da Cernyn) · CC BY-NC-SA 4.0

## Em uma frase

Modelagem de dados é decidir **o que uma linha representa** e como o contexto se
liga a ela — normalizando quando a carga é transacional, dimensionalizando
quando a carga é analítica.

## 3NF serve ao OLTP

Normalizar até a terceira forma normal elimina redundância e dependência
transitiva: cada fato fica em um lugar só, e atualizar o nome de um
estabelecimento muda uma linha. Isso é exatamente o que um core bancário
precisa, onde a escrita é constante e a integridade por linha é o produto.

O preço é junção. Uma consulta analítica que atravesse oito tabelas
normalizadas paga oito joins, e num motor distribuído cada join é um candidato a
shuffle.

## Modelagem dimensional de Kimball

### Comece pelo grão

<Termo nome="grão">A frase que define o que uma linha da tabela fato representa. "Uma linha por autorização de cartão" é um grão; "dados de cartão" não é.</Termo>

Declarar o grão primeiro não é formalidade. Ele determina quais dimensões são
aplicáveis, quais medidas são aditivas e qual teste de unicidade prova que a
carga está certa. Modelo que começa pela lista de colunas quase sempre produz
**grão misto** — linhas de transação convivendo com linhas de agregado mensal — e
o erro só aparece quando alguém soma tudo e o número dobra.

Prefira o grão atômico. Do evento você deriva qualquer agregado; do agregado
você não recupera o evento.

### Fato e dimensão

<Comparativo
  colunas={["", "Tabela fato", "Tabela dimensão"]}
  linhas={[
    ["Guarda", "Evento mensurável e chaves de dimensão", "Contexto descritivo"],
    ["Tamanho", "Cresce sem parar", "Pequena e relativamente estável"],
    ["Exemplo", "Transação de cartão, transferência PIX", "Cliente, conta, estabelecimento, data"],
    ["Uso na consulta", "Somar, contar, medir", "Filtrar e agrupar"]
  ]}
/>

Três tipos de fato aparecem sempre em banco: **transacional** (uma linha por
evento), **snapshot periódico** (saldo da conta no fim de cada dia) e **snapshot
acumulado** (a proposta de crédito, atualizada a cada etapa). Saldo é medida
semiaditiva: soma entre contas, não soma ao longo do tempo — dizer isso rende
ponto.

### Star, snowflake e dimensão conformada

Star mantém cada dimensão numa tabela desnormalizada, com redundância assumida.
Snowflake quebra a dimensão em níveis. A economia de espaço do snowflake é
pequena e o custo em joins é real, então o padrão é star, com snowflake apenas
onde a hierarquia é grande e volátil.

**Dimensão conformada** é a mesma dimensão, com a mesma definição e as mesmas
chaves, compartilhada por vários fatos. É o que permite pôr receita de cartão e
receita de crédito lado a lado por cliente e por mês. Sem ela, cada área traz o
seu "cliente" e o painel não fecha.

## SCD: o que fazer quando a dimensão muda

O cliente muda de endereço. Três respostas possíveis:

<Comparativo
  colunas={["Tipo", "O que faz", "Quando usar"]}
  linhas={[
    ["Tipo 1", "Sobrescreve o valor antigo, sem histórico", "Correção de erro de digitação, atributo que o negócio não analisa no tempo"],
    ["Tipo 2", "Encerra a versão vigente e insere uma nova linha com nova chave substituta", "Atributo que o negócio precisa analisar historicamente: região, segmento, faixa de risco"],
    ["Tipo 3", "Guarda o valor anterior numa coluna paralela", "Um único nível de histórico, típico de reclassificação pontual"]
  ]}
/>

Como se implementa o tipo 2, na prática:

<Passos itens={[
  "A dimensão ganha chave substituta (surrogate), além da chave natural do cliente.",
  "Ganha também data de início de vigência, data de fim e uma flag de versão corrente.",
  "Na carga, comparam-se os atributos monitorados com a versão vigente; se algum mudou, a linha atual recebe data de fim e a flag cai.",
  "Insere-se uma nova linha com nova chave substituta, data de início igual à data da mudança e fim em aberto.",
  "Na carga do fato, a chave de dimensão é resolvida por busca com faixa de vigência: a versão que valia na data do evento."
]} />

<Callout tipo="atencao" titulo="O erro que anula o tipo 2">
Ligar o fato pela chave natural do cliente. Se você fizer isso, toda transação
histórica passa a enxergar os atributos atuais — que é exatamente o problema que
o tipo 2 existia para resolver.
</Callout>

## Data Vault, em resumo

Três construções: **hub** guarda a chave de negócio, **link** guarda o
relacionamento entre hubs, **satellite** guarda os atributos descritivos com
histórico e origem. O modelo é feito para integrar e auditar, não para
consumir.

Faz sentido quando há muitas fontes heterogêneas, exigência forte de
rastreabilidade e regras de negócio ainda em movimento. O padrão é usar Data
Vault na integração e derivar um star schema para o consumo. Num banco isso
aparece quando cadastro, cartões, crédito e canais digitais têm noções
diferentes de "cliente" e ninguém quer congelar uma delas cedo demais.

## One Big Table no Lakehouse

Com armazenamento colunar e poda de coluna, muita gente desiste do join e
publica o fato já desnormalizado, com os atributos das dimensões embutidos. A
consulta fica trivial e rápida.

O trade-off é manutenção: quando a definição de um atributo muda, você reescreve
histórico em vez de atualizar uma dimensão pequena; e a regra de negócio deixa
de ter um lugar único onde mora. Use OBT como **camada de consumo** derivada de
um modelo dimensional, não como substituta dele.
