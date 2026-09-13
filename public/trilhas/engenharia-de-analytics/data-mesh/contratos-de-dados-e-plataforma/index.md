# Contratos de dados e plataforma self-serve

> Como o Data Mesh sai do slide: o contrato que declara esquema, semântica e garantias entre quem publica e quem consome, a evolução sem quebrar o consumidor, e a plataforma que entrega ingestão, catálogo, linhagem e qualidade sem cada domínio reinventar.

Fonte: https://lumarys.com.br/trilhas/engenharia-de-analytics/data-mesh/contratos-de-dados-e-plataforma/ · Lumarys (marca da Cernyn) · CC BY-NC-SA 4.0

## Em uma frase

O contrato transforma "a gente combina" em algo **verificado na publicação**, e
a plataforma self-serve transforma princípio em coisa que a pessoa do domínio
consegue usar **sem abrir chamado**. Sem os dois, o Mesh fica no slide.

## O que é um contrato de dados

<Termo nome="contrato de dados">Acordo explícito e versionado entre quem publica e quem consome, declarando esquema, significado de cada campo, granularidade, janela de atualização, garantias de qualidade e quem responde quando algo falha.</Termo>

Repare no que ele tem **além do esquema**: o significado, o grão e a
frequência. Um produto pode manter todas as colunas e ainda assim quebrar
quem consome, se mudar o grão de "uma linha por pedido" para "uma linha por
item" — as somas passam a contar outra coisa.

<Callout tipo="atencao" titulo="Contrato que não barra nada é documento">
O que separa contrato de combinado é a **verificação automática na
publicação**: se a entrega viola o contrato, ela falha antes de chegar ao
consumidor. Documento em wiki envelhece; verificação não deixa passar.
</Callout>

## Evoluir sem quebrar

<Comparativo
colunas={["Mudança", "Compatível?", "O que fazer"]}
linhas={[
["Acrescentar coluna opcional", "Sim", "Publicar; quem não a conhece segue funcionando"],
["Preencher campo que vinha nulo", "Sim", "Publicar; já era previsto"],
["Renomear coluna", "Não", "Nova versão, com convivência"],
["Remover coluna", "Não", "Nova versão, com convivência"],
["Mudar tipo", "Não", "Nova versão"],
["Mudar grão ou semântica", "Não", "Nova versão, e avisar explicitamente: silencioso é o pior caso"]
]}
/>

O processo de versão que a banca espera ouvir:

<Passos itens={[
"Publicar a versão nova em paralelo, sem tirar a antiga do ar.",
"Declarar um prazo de convivência entre as duas.",
"Usar a linhagem para descobrir quem consome e avisar essas pessoas.",
"Descontinuar a versão antiga só depois do prazo, com aviso."
]} />

## A plataforma, e o critério para saber se ela presta

Ela entrega, **em autoatendimento**: ingestão, armazenamento em camadas,
catálogo, linhagem, testes de qualidade, observabilidade, controle de acesso e
o caminho de publicar um produto com contrato.

O teste é uma pergunta só: _uma pessoa do domínio de crédito, que entende do
negócio e não é engenheira de plataforma, consegue publicar um produto novo
sem abrir chamado?_ Se não, a plataforma virou o novo gargalo e o problema só
trocou de nome.

<Callout tipo="dica" titulo="Governança onde ela não cria fila">
Nomenclatura, presença de dono, mascaramento de dado sensível e teste mínimo de
qualidade são checados **no momento de publicar**, por automação. É assim que
se tem padrão sem comitê semanal — e é literalmente o que "governança
computacional" quer dizer.
</Callout>

## Nem todo dado vira produto

Manter um produto custa: contrato, versão, acordo de nível de serviço, alguém
de plantão. Esse compromisso só faz sentido onde há **consumidor declarado**.
Transformar todas as tabelas em produtos é a forma mais rápida de tornar o
Mesh insustentável — e dizer isso em voz alta mostra critério.

## Como responder isso em voz alta

Para a pergunta da quebra: o problema é a mudança **invisível**; a resposta é
contrato verificado, com a distinção entre compatível e incompatível e um
processo de versão com prazo e aviso. Para a pergunta da plataforma: liste
capacidades, dê o critério de autoatendimento e reconheça o custo — é o
reconhecimento do custo que separa a resposta madura da entusiasmada.
