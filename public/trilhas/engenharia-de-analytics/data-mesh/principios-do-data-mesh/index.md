# Data Mesh: os quatro princípios

> A proposta que inverte o lake centralizado: propriedade por domínio, dado tratado como produto, plataforma self-serve e governança federada. O que cada princípio resolve, o que ele exige em troca, e por que Mesh não é ferramenta nem substitui o lake.

Fonte: https://lumarys.com.br/trilhas/engenharia-de-analytics/data-mesh/principios-do-data-mesh/ · Lumarys (marca da Cernyn) · CC BY-NC-SA 4.0

## Em uma frase

Data Mesh é uma proposta de **organização**, não de ferramenta: devolve a
propriedade do dado ao domínio que o gera, exige que ele seja tratado como
produto, e só funciona com uma plataforma self-serve e governança verificada
por automação.

## Os quatro princípios, e a dor de cada um

<Comparativo
colunas={["Princípio", "Dor que resolve", "O que exige em troca"]}
linhas={[
["Propriedade por domínio", "Time central vira gargalo porque não tem o contexto do negócio", "Gente capaz dentro do domínio"],
["Dado como produto", "Tabela sem dono, sem documentação e sem garantia de atualização", "Contrato, acordo de nível de serviço, versionamento, catálogo"],
["Plataforma self-serve", "Cada área reinventa ingestão, qualidade e observabilidade", "Um time de plataforma que entrega capacidade, não pipelines"],
["Governança federada e computacional", "Cada domínio define 'cliente' do seu jeito e nada cruza", "Padrões verificados por automação, não por comitê"]
]}
/>

A palavra **computacional** no quarto princípio é o detalhe que separa quem
entendeu: as regras comuns — nomenclatura, chave compartilhada, mascaramento de
dado sensível, formato — são **verificadas pela plataforma**, não por revisão
manual. Comitê não escala; automação sim.

<Callout tipo="atencao" titulo="Os quatro se sustentam juntos">
Descentralizar a propriedade sem os outros três não é Mesh: é silo. Cada área
constrói do seu jeito, define os termos do seu jeito, e em seis meses ninguém
consegue cruzar dois domínios. Esse é o cenário que a banca descreve para ver
se você adota a moda ou o diagnóstico.
</Callout>

## Produto de dados: o que muda

<Termo nome="produto de dados">Conjunto de dados publicado por um domínio com dono nomeado, documentação, contrato de esquema e semântica, acordo de nível de serviço, versionamento e presença no catálogo.</Termo>

A diferença entre achar uma tabela `clientes_final_v2` no lake e achar um
produto que declara: _sou a visão oficial de cliente do domínio de cadastro,
atualizo a cada hora, tenho estas garantias, e se eu mudar o esquema você é
avisado antes_.

O checklist que vale decorar: **descobrível, endereçável, confiável, com
semântica própria, interoperável, seguro por padrão, valioso por si só**.
Interoperável é o mais esquecido — e é justamente o que impede o silo.

## Quando Mesh é má ideia

- **Poucos domínios**, com o time central atendendo sem fila relevante. Sem
  gargalo, o custo de plataforma e governança não se paga.
- **Sem gente no domínio.** Propriedade sem capacidade é responsabilidade
  nominal, e o dado apodrece com o nome de alguém.
- **Sem plataforma.** Descentralizar antes de ter autoatendimento transfere o
  gargalo para dentro de cada área.

<Callout tipo="dica" titulo="O que sobra para o time central">
Ele não desaparece: muda de papel. Passa a construir e operar a plataforma,
definir os padrões computáveis e cuidar do transversal — identidade, catálogo,
linhagem e as chaves que ligam os domínios. É trabalho diferente, não menos
trabalho.
</Callout>

## Como responder isso em voz alta

Comece pelo diagnóstico, não pelos princípios: **por que o modelo atual
trava**. Depois apresente os quatro como um conjunto, nomeando a dor de cada
um. Termine com os pré-requisitos e com o que você faria enquanto eles não
existem — é essa última parte que mostra critério em vez de entusiasmo.
