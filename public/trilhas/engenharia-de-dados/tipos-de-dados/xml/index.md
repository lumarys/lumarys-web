# XML

> XML é o formato de marcação que dominou a troca de dados entre sistemas antes do JSON e que continua vivo no Brasil em nota fiscal eletrônica e mensageria financeira. Estrutura, validação por XSD e como lê-lo num pipeline.

Fonte: https://lumarys.com.br/trilhas/engenharia-de-dados/tipos-de-dados/xml/ · Lumarys (marca da Cernyn) · CC BY-NC-SA 4.0

## Em uma frase

XML é uma **linguagem de marcação extensível** que descreve dados hierárquicos
em tags auto-descritas, e continua obrigatório no Brasil em documento fiscal
eletrônico mesmo tendo perdido as APIs novas para o JSON.

## A estrutura em três peças

Um documento XML tem **elementos**, que são os nós delimitados por tag de
abertura e fechamento e podem conter texto ou outros elementos; **atributos**,
que são pares nome e valor dentro da tag de abertura e não têm filhos; e
**namespaces**, que qualificam os nomes para evitar colisão quando o documento
combina vocabulários diferentes.

O namespace é a peça que mais causa dor prática. Arquivos fiscais e de
mensageria financeira declaram namespace, e um leitor configurado sem ele
simplesmente não encontra nó nenhum — o arquivo abre no editor e o parser
devolve vazio.

## Bem formado não é válido

<Comparativo
  colunas={["Nível", "O que checa", "Exemplo de falha"]}
  linhas={[
    ["Bem formado", "Sintaxe: tags fechadas, aninhamento correto, um único elemento raiz", "Tag aberta e nunca fechada"],
    ["Válido", "Conformidade com o XSD ou DTD declarado: elementos, tipos, obrigatoriedade, cardinalidade", "Campo obrigatório ausente num documento sintaticamente perfeito"]
  ]}
/>

O <Termo nome="XSD">XML Schema Definition: o arquivo que declara a estrutura
esperada do documento, com tipos e obrigatoriedade, permitindo rejeitar o que
não obedece.</Termo> é o que te dá validação na porta do pipeline. Quando ele
existe, use: erro que estoura na ingestão custa muito menos que erro que estoura
no relatório.

## Onde XML ainda vive no Brasil

<Passos itens={[
  "Documento fiscal eletrônico: NF-e e variantes trafegam e são armazenadas em XML assinado digitalmente, com prazo de guarda legal.",
  "Integração legada: serviços SOAP internos e de parceiros continuam trocando envelopes XML.",
  "Mensageria financeira: o padrão ISO 20022 organiza as mensagens em esquemas XML e é a base de vários fluxos do setor. [verificar o alcance exato da adoção no arranjo do Pix na documentação do Banco Central]"
]} />

## Por que perdeu espaço para JSON

Dois motivos práticos. **Verbosidade**: repetir o nome do campo na abertura e no
fechamento infla o payload, o que custa rede, armazenamento e tempo. E
**parsing**: JSON mapeia direto para dicionário e lista nas linguagens usadas em
API web, enquanto XML exige percorrer uma árvore com namespace, atributo e texto
misturados.

Isso explica a preferência em API nova. Não explica desaparecimento: obrigação
legal e padrão de setor não mudam porque o formato ficou fora de moda.

## Como ler XML num pipeline

<Callout tipo="atencao" titulo="Nunca com expressão regular">
XML permite aninhamento arbitrário, e regex não descreve estrutura recursiva. Use
o leitor nativo do Spark ou Databricks, informando a opção `rowTag` para dizer
qual elemento vira uma linha do DataFrame, e trate o namespace explicitamente.
</Callout>

O fluxo recomendado é o mesmo de qualquer semiestruturado: **grave o arquivo cru
na raw**, porque em documento fiscal o original assinado é a evidência; valide
contra o XSD; achate o que o negócio consulta; e materialize em tabela Delta na
trusted, que é onde a consulta fica barata.

<Callout tipo="dica" titulo="Resposta de 40 segundos">
"Semiestruturado, hierárquico, validável por XSD. Continua obrigatório em nota
fiscal eletrônica e presente em mensageria financeira. Eu guardo o original na
raw, leio com rowTag cuidando do namespace, valido pelo XSD e materializo
colunar na trusted." Isso já cobre a rubrica.
</Callout>
