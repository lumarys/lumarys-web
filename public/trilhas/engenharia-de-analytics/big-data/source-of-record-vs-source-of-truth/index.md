# Source of Record vs Source of Truth

> Source of Record é o sistema onde o dado nasce e que responde pelo fato original; Source of Truth é a visão consolidada e governada que a organização usa para decidir. Saber qual é qual é o que resolve a briga de dois relatórios com números diferentes.

Fonte: https://lumarys.com.br/trilhas/engenharia-de-analytics/big-data/source-of-record-vs-source-of-truth/ · Lumarys (marca da Cernyn) · CC BY-NC-SA 4.0

## Em uma frase

**Source of Record** é o sistema onde o dado nasce e que responde pelo fato
original; **Source of Truth** é a visão consolidada e governada que a
organização declara como oficial para decidir. Quase nunca são o mesmo lugar, e
isso é por desenho.

## O problema que este tema resolve

Toda instituição grande vive a mesma reunião: duas áreas trazem números
diferentes para o mesmo indicador, cada uma jura pelo seu relatório, e a
discussão termina sem ninguém saber qual usar. O sintoma parece técnico, mas a
causa é de governança. Não há regra escrita de **qual fonte vale para qual
pergunta**.

Este tema dá o vocabulário para transformar essa reunião numa investigação de
dez minutos. E é o que a banca de Analytics cobra: não a definição dos termos,
mas o que você faz diante da divergência.

## Os dois papéis

<Termo nome="Source of Record">O sistema autoritativo sobre o fato no momento em que ele acontece: o core bancário para a transação, o CRM para o cadastro, o sistema de crédito para o contrato.</Termo>

O Source of Record é otimizado para **registrar**. Ele precisa aceitar a
transação em milissegundos, garantir consistência naquele instante e nunca
perder um lançamento. Ele não foi feito para responder "qual é a inadimplência
da carteira": essa pergunta exige juntar contratos, aplicar uma definição de
atraso, excluir renegociações e olhar para um fechamento.

<Termo nome="Source of Truth">A visão consolidada, tratada e governada que a organização usa para decidir: a tabela certificada de onde sai o KPI, com dono, definição escrita e regra de cálculo.</Termo>

O Source of Truth é otimizado para **responder**. Ele nasce da origem, mas
passa por transformação, consolidação e regra de negócio. Num lake com zonas, é
a refined ou a gold. Num MDM, é o golden record do cliente.

<Comparativo
colunas={["", "Source of Record", "Source of Truth"]}
linhas={[
["Autoritativo sobre", "O fato bruto, no instante", "A versão consolidada, para a decisão"],
["Otimizado para", "Registrar transação", "Responder pergunta de negócio"],
["Exemplo no banco", "Core, CRM, sistema de crédito", "Tabela certificada de inadimplência; golden record de cliente"],
["Onde mora no lake", "Fora dele; a raw é só uma cópia", "Refined ou gold"],
["Quantos existem", "Um por sistema de origem", "Um por domínio ou por KPI"],
["Quem responde por ele", "O time do sistema", "Um dono de negócio, com definição escrita"]
]}
/>

## Por que separar é desejável

A tentação é juntar: "se o dashboard ler direto do core, acaba a divergência".
Acaba a defasagem e nasce um problema maior. Cada consumidor passa a aplicar a
própria regra sobre o dado cru, e a divergência volta multiplicada, agora sem
ninguém conseguir explicar.

Separar é o que permite:

- **Aplicar a regra uma vez.** A definição de inadimplência vive num lugar e
  todo relatório herda a mesma.
- **Governar.** Dono, catálogo, controle de acesso e mascaramento de dado
  sensível acontecem na camada consolidada, não em cada consulta.
- **Reprocessar.** Quando a regra muda, a raw preserva a origem e a
  consolidação é refeita. Se o dashboard lesse o core, a história se perderia.

<Callout tipo="atencao" titulo="Onde a banca aperta">
Depois que você separa os dois, o entrevistador pergunta: "e quando eles
divergem, qual vale?". A resposta não é "a origem" nem "a consolidada". É:
**depende da pergunta, e isso tem que estar escrito**. Para o saldo que o
cliente vê no app, vale o core. Para a inadimplência que a diretoria decide,
vale a tabela certificada. Quem não tem essa regra escrita não tem Source of
Truth, tem opinião.
</Callout>

## Como reconciliar dois números

<Termo nome="reconciliação">O processo que compara a origem com a visão consolidada, explica cada diferença e prova que o número oficial fecha com o fato.</Termo>

A ordem importa, porque cada passo descarta a causa mais barata antes da mais
cara:

<Passos itens={[
"Comparar no mesmo carimbo de corte. A maioria das divergências é tempo: o core já processou, o lote da noite ainda não chegou. Sem o mesmo corte, os números são incomparáveis, não errados.",
"Confrontar a regra de cálculo. O que cada lado chama de saldo, de ativo, de inadimplente. Aqui aparecem as renegociações que um exclui e o outro não.",
"Percorrer a linhagem do número oficial de volta ao Source of Record. Só quando corte e regra não explicam a diferença é que existe erro de pipeline, e a linhagem diz em qual passo.",
"Registrar a causa e criar um teste. Diferença explicada vira documentação; erro corrigido vira teste de dados, para não voltar."
]} />

O que fica de fora da lista é escolher o número que agrada. Conservadorismo não
é critério de reconciliação.

## Vários Sources of Truth é o normal

Uma instituição não tem **um** Source of Truth, tem um por domínio: cliente,
contrato, transação, produto. Tentar reduzir tudo a um banco único é o sonho
que gera o pântano.

O que precisa ser único é a **regra de precedência** e o que a sustenta:

- chave compartilhada entre domínios, para o cliente do MDM e o contrato do
  crédito apontarem para a mesma pessoa;
- linhagem que atravessa as fronteiras, para o KPI de carteira voltar até o
  core;
- catálogo que diz qual tabela é a certificada para cada entidade.

Em Data Mesh isso fica explícito: cada domínio publica o próprio produto de
dados como verdade daquele domínio, e a governança federada cuida de os
produtos conversarem.

<Callout tipo="dica" titulo="O que o engenheiro de analytics faz com isso">
Você consome a zona refined, define métricas e garante que o mesmo número saia
igual em todo dashboard. Na prática, três hábitos: todo KPI tem dono e definição
escrita; todo painel mostra de que corte é o número; e toda divergência
reportada vira uma reconciliação registrada, não uma discussão.
</Callout>

## Como responder isso em voz alta

Quando vier o cenário dos dois números, estruture assim: **os dois podem estar
certos** (Record e Truth respondem a perguntas diferentes); **comparo no mesmo
corte** (defasagem); **comparo a regra** (definição); **sigo a linhagem** (erro
real); e **recuso ler da origem no dashboard**, com o motivo. Quem dá essa
resposta em ordem mostra que já viveu a reunião, não que decorou o termo.
