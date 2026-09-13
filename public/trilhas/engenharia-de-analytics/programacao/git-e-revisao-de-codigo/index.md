# Git e revisão de código para quem trabalha com dados

> O fluxo que transforma consulta solta em trabalho de equipe: branch por mudança, commit que explica a intenção, pedido de revisão com contexto, e o que um revisor deve olhar quando o que mudou é SQL e não aplicação.

Fonte: https://lumarys.com.br/trilhas/engenharia-de-analytics/programacao/git-e-revisao-de-codigo/ · Lumarys (marca da Cernyn) · CC BY-NC-SA 4.0

## Em uma frase

O fluxo existe para que a sua mudança seja **revisável, repetível e
reversível** — e, em dados, o revisor humano cuida do que nenhuma automação
pega: **grão, regra de negócio e impacto em quem consome**.

## O fluxo, e o porquê de cada passo

<Comparativo
colunas={["Passo", "Para que serve"]}
linhas={[
["Branch por mudança", "Isolar o trabalho e permitir reverter só aquilo depois"],
["Commits pequenos com intenção", "Explicar o porquê, que o diff não mostra"],
["Pedido de revisão com contexto", "Dar ao revisor o que ele precisa para avaliar impacto"],
["Verificação automática", "Sintaxe, construção isolada, testes de dado"],
["Revisão humana", "Grão, regra de negócio, impacto, cobertura de teste"],
["Integração e promoção", "Mesmo artefato avançando entre ambientes"]
]}
/>

<Callout tipo="atencao" titulo="A mensagem de commit não descreve o diff">
"Altera consulta" não informa nada: o diff já mostra o que mudou. A mensagem
existe para a pergunta que o diff **não** responde — por que mudou. É o que
salva alguém daqui a seis meses, inclusive você.
</Callout>

## O que escrever num pedido de revisão de dados

Três perguntas, e elas são diferentes das de um projeto de aplicação:

1. **O que muda no número?** Se a definição de um indicador mudou, isso é a
   informação mais importante do pedido.
2. **Quem consome o modelo afetado?** Vem da linhagem, e define quem precisa
   ser avisado.
3. **Como você validou?** Testes que rodaram, comparação do total com a origem,
   o que mais você conferiu.

## Automação e pessoa: dividir por competência

<Comparativo
colunas={["Quem pega", "O quê"]}
linhas={[
["Ferramenta", "Sintaxe, formatação, construção isolada, testes de dado, cobertura"],
["Pessoa", "Grão mudou? Regra bate com a definição do negócio? Quem quebra? Falta teste?"]
]}
/>

<Callout tipo="dica" titulo="Onde a revisão humana realmente rende">
O erro caro em dados é o **SQL que roda perfeitamente e devolve o número
errado**. Nenhum linter pega isso. Gastar a revisão com indentação é o jeito
mais eficiente de deixar esse erro passar.
</Callout>

## Duas armadilhas específicas de dados

**Credencial no repositório.** O histórico é permanente: apagar num commit
posterior não remove do histórico, e quem clonou antes já tem. Segredo vai
para cofre, sempre.

**Notebook versionado sem cuidado.** Ele guarda saídas e a ordem em que as
células foram executadas, o que polui o diff e esconde estado. Limpe as saídas
antes de commitar, ou promova a lógica estável para um módulo e deixe o
notebook como exploração.

## Como responder isso em voz alta

Descreva o **fluxo**, não os comandos. Diga o que vai na descrição do pedido de
revisão em contexto de dados. E separe explicitamente o que a automação
verifica do que a pessoa revisa — é essa separação que mostra que você já
revisou o trabalho de alguém, e não só leu sobre o assunto.
