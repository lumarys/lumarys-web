# Classificação de tipos de dados

> Classificar dado não é exercício de vocabulário: é o que decide onde armazenar, como modelar, que conta você pode fazer e quem pode ver. Estruturado, semi e não estruturado; qualitativo e quantitativo; e a classificação por sensibilidade.

Fonte: https://lumarys.com.br/trilhas/engenharia-de-dados/tipos-de-dados/classificacao-tipos-dados/ · Lumarys (marca da Cernyn) · CC BY-NC-SA 4.0

## Em uma frase

Classificar dado é decidir, antes de escrever qualquer código, **onde ele vai
morar, como será modelado, que conta pode ser feita com ele e quem pode vê-lo**.

## Três eixos, não um

Quase todo candidato conhece o primeiro eixo e para nele. A resposta completa
usa três:

<Comparativo
  colunas={["Eixo", "Categorias", "Decide"]}
  linhas={[
    ["Estrutura", "Estruturado, semiestruturado, não estruturado", "Formato de armazenamento e estratégia de ingestão"],
    ["Natureza da variável", "Qualitativo (nominal, ordinal) e quantitativo (discreto, contínuo)", "Que cálculo e que modelagem fazem sentido"],
    ["Sensibilidade", "Pública, interna, confidencial, restrita; e dado pessoal", "Zona, criptografia, mascaramento, acesso e retenção"]
  ]}
/>

## Eixo 1: estrutura

<Comparativo
  colunas={["Tipo", "O que define", "Exemplo no banco", "Onde armazenar"]}
  linhas={[
    ["Estruturado", "Schema fixo, definido antes da escrita", "Lançamentos do core, cadastro relacional, saldo diário", "Tabela Delta colunar ou relacional"],
    ["Semiestruturado", "Estrutura auto-descrita e hierárquica, sem tabela fixa", "JSON de autorização de cartão, XML de nota fiscal, log de app", "Cru na raw; achatado e colunar na trusted"],
    ["Não estruturado", "Sem estrutura interna consultável por campo", "Áudio de call center, imagem de documento, contrato em PDF", "Object storage, com metadado catalogado à parte"]
  ]}
/>

<Callout tipo="erro" titulo="JSON não é dado não estruturado">
É o deslize mais comum do tema. JSON e XML **carregam a própria estrutura**, em
chaves e tags, e por isso podem ser consultados por campo. Não estruturado é o
que não tem campo nenhum: o áudio, a imagem, o texto livre.
</Callout>

## Eixo 2: natureza da variável

Aqui está a diferença entre o tipo do banco de dados e o significado do dado. O
banco diz `INT`; a classificação diz se aquele inteiro **mede** ou **identifica**.

<Comparativo
  colunas={["Categoria", "Definição", "Exemplo bancário", "Estatística válida"]}
  linhas={[
    ["Nominal", "Categoria sem ordem", "CPF, código de agência, bandeira do cartão", "Contagem, frequência, moda"],
    ["Ordinal", "Categoria com ordem, sem distância comparável", "Rating de A a E, faixa de renda", "Mediana, percentil, frequência"],
    ["Discreto", "Contagem inteira", "Número de transações no mês, parcelas", "Soma, média, distribuição"],
    ["Contínuo", "Medida em escala", "Valor da transação, saldo, taxa, latência", "Média, desvio, percentis"]
  ]}
/>

Somar CPF é possível e inútil. Tirar média de código de agência devolve um
número que não corresponde a agência nenhuma. O motor não vai te avisar: quem
avisa é a classificação.

## O que muda no projeto

<Passos itens={[
  "Armazenamento: colunar para estruturado, aninhado na entrada para semiestruturado, object storage para não estruturado.",
  "Modelagem: nominal de baixa cardinalidade é boa dimensão e às vezes boa chave de partição; contínuo é fato, nunca chave.",
  "Cálculo: definir a estatística válida antes de o indicador ir para o painel evita indicador errado com aparência de certo.",
  "Contrato: declarar tipo e domínio na trusted é o que permite ao motor validar e ao consumidor confiar."
]} />

## Eixo 3: sensibilidade, a ponte para governança

Em banco, o eixo que mais muda o desenho não é o estatístico. Um campo pode ser
um inocente `varchar` e ainda assim exigir criptografia, mascaramento e prazo de
expurgo, porque é **dado pessoal**.

A LGPD ainda separa um subconjunto mais protegido, o
<Termo nome="dado pessoal sensível">Dado sobre origem racial ou étnica, convicção
religiosa, opinião política, filiação sindical ou a organização religiosa,
filosófica ou política, saúde, vida sexual, além de dado genético ou
biométrico ligado a uma pessoa natural.</Termo>
Saber apontar isso num campo de cadastro é o que transforma a resposta de
classificação em resposta de arquitetura.

<Callout tipo="dica" titulo="Como fechar em voz alta">
Não recite as listas. Diga os três eixos, dê um exemplo bancário por categoria e
termine sempre com o que muda no projeto: onde grava, como modela, que conta
vale, quem vê. Trinta segundos de "o que muda" valem mais que dois minutos de
taxonomia.
</Callout>
