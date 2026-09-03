# JSON

> JSON virou o formato padrão de troca entre sistemas por ser simples, auto-descrito e mapear direto nas estruturas das linguagens. O que a engenharia de dados precisa saber: tipos, JSON Schema, aninhamento, evolução de schema e como o Spark lê tudo isso.

Fonte: https://lumarys.com.br/trilhas/engenharia-de-dados/tipos-de-dados/json/ · Lumarys (marca da Cernyn) · CC BY-NC-SA 4.0

## Em uma frase

JSON é um formato de texto **auto-descrito e hierárquico** que virou o padrão de
troca entre sistemas, e o trabalho da engenharia de dados é transformá-lo em
tabela colunar sem perder o original nem quebrar quando o schema muda.

## Por que ele venceu

JSON tem seis tipos: string, número, booleano, `null`, objeto e array. Só isso.
A simplicidade é o argumento: um objeto JSON mapeia direto em dicionário e lista
nas linguagens usadas em API web, então o custo de adotar é quase zero.

Note duas ausências que causam problema em banco: **não existe tipo de data**,
que trafega como string por convenção, e **não existe decimal exato**, o que
exige cuidado ao tipar valor monetário para não herdar erro de ponto flutuante.

## JSON Schema: o contrato que quase ninguém escreve

JSON Schema descreve a estrutura esperada de um documento: campos obrigatórios,
tipos, formatos e restrições. É o equivalente ao XSD do mundo XML.

Ele raramente vem pronto de um produtor interno. Quando não vem, o substituto
prático é um conjunto de regras de qualidade na ingestão: campo obrigatório
presente, tipo esperado, domínio permitido e volume dentro da faixa. O ponto não
é a ferramenta; é ter contrato.

## Aninhamento: struct e array não são a mesma coisa

<Comparativo
  colunas={["Estrutura", "Como tratar", "Efeito na tabela"]}
  linhas={[
    ["Objeto (struct)", "Selecionar por caminho e achatar em colunas nomeadas", "Número de linhas não muda"],
    ["Array", "Explode: uma linha por elemento", "Muda a granularidade da tabela"],
    ["Parte genuinamente variável", "Mapa ou string JSON preservada", "Mantém flexibilidade sem criar coluna por variação"]
  ]}
/>

<Callout tipo="atencao" titulo="Explode muda o significado da tabela">
Ao explodir o array de parcelas de uma autorização, a tabela deixa de ser "uma
linha por transação" e passa a ser "uma linha por parcela". Somar valor nessa
tabela sem perceber isso é como se produz um indicador inflado que ninguém
consegue explicar depois.
</Callout>

## JSON no Spark: declare o schema

Inferência de schema é conveniente no notebook e perigosa em produção, por dois
motivos. Ela **custa uma passada extra pelos dados**, o que pesa em volume alto.
E ela **depende da amostra**: se numa madrugada alguns registros vierem com o
campo `valor` como texto, o tipo resolvido muda, e o mesmo pipeline entrega
contratos diferentes em dias diferentes.

Declarar o schema transforma isso em algo visível: o que não bate vira erro ou
vai para uma <Termo nome="coluna de dado resgatado">Coluna onde o leitor guarda
os campos que não batem com o schema declarado, para que nada se perca e a
mudança de origem fique registrada.</Termo>

Sobre o formato do arquivo: prefira **JSON Lines**, um objeto completo por linha.
É o que permite dividir o arquivo em blocos e ler em paralelo. Um documento
`multiLine` grande precisa ser lido por uma tarefa só e vira gargalo.

## Evolução de schema: o problema de verdade

Campo novo não é incidente, é rotina de quem consome evento. A política precisa
existir antes:

<Passos itens={[
  "Grave o JSON cru na raw, sempre: é o que permite reprocessar depois de descobrir a mudança.",
  "Declare o schema na leitura e resgate o desconhecido em vez de descartar.",
  "Campo novo opcional: alerte o dono do dado e promova ao contrato só quando o negócio precisar.",
  "Campo obrigatório ausente ou tipo alterado no núcleo: falhe ou quarentene, nunca preencha com nulo em silêncio.",
  "Versione o contrato e leve a mudança para o time produtor: é lá que o problema se resolve de fato."
]} />

## Quando NÃO guardar JSON cru na camada analítica

<Callout tipo="erro" titulo="O custo escondido">
Ler JSON exige parsing de cada registro, não tem compressão colunar, não permite
ler só as colunas necessárias e não oferece estatística por arquivo para o motor
pular blocos. Cada consulta paga tudo isso de novo. Cru pertence à raw; a
trusted e a refined são colunares.
</Callout>

A única exceção razoável é o trecho **genuinamente variável** do documento, que
pode viver em uma coluna de mapa ou string. Modele o núcleo estável em colunas
tipadas e deixe o caso raro fora do caminho do consumidor comum.

<Callout tipo="dica" titulo="Como fechar em voz alta">
Diga a política inteira em quatro movimentos: cru na raw, schema declarado na
leitura, resgate do desconhecido, conduta diferente para campo opcional e para
campo do núcleo. Termine com contrato de dados versionado. É a resposta que
mostra que você já viveu isso, não que leu sobre.
</Callout>
