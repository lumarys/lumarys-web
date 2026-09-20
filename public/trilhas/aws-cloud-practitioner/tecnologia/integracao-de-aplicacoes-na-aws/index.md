# Integração de aplicações

> SQS, SNS, EventBridge, Step Functions, API Gateway, AppSync e Amazon MQ; fila contra tópico contra barramento de eventos em uma frase cada, e a pista que aponta cada um no enunciado da prova.

Fonte: https://lumarys.com.br/trilhas/aws-cloud-practitioner/tecnologia/integracao-de-aplicacoes-na-aws/ · Lumarys (marca da Cernyn) · CC BY-NC-SA 4.0

## Em uma frase

Todos os serviços deste tema existem para **desacoplar**: fazer dois
componentes trabalharem sem depender de o outro estar de pé no mesmo instante.
O que decide a questão é **para quem a mensagem vai**: um, muitos, ou quem a
regra mandar.

## Fila, tópico e barramento

<Comparativo
colunas={["Serviço", "O que é em uma linha", "A pista no enunciado"]}
linhas={[
["Amazon SQS", "Fila: a mensagem espera até um consumidor buscar", "Processar depois, absorver rajada, não perder pedido"],
["Amazon SNS", "Tópico: publica de uma vez para todos os inscritos", "Avisar vários sistemas ao mesmo tempo, notificação"],
["Amazon EventBridge", "Barramento: roteia o evento por regra de conteúdo", "Filtrar, encaminhar conforme o tipo, integrar com terceiro"],
["AWS Step Functions", "Coordena as etapas de um fluxo de trabalho", "Várias etapas, ordem, condição, nova tentativa"],
["Amazon API Gateway", "Porta de entrada de APIs", "Expor API, controle de acesso, limite de chamadas"],
["AWS AppSync", "APIs GraphQL para web e móvel", "GraphQL, aplicação móvel lendo várias fontes"],
["Amazon MQ", "Agente de mensagens gerenciado compatível", "Migrar agente já em uso sem reescrever a aplicação"]
]}
/>

<Callout tipo="dica" titulo="A pergunta de desempate entre SQS, SNS e EventBridge">
Conte os destinos. **Um** consumidor que vem buscar o trabalho é **SQS**.
**Vários** inscritos recebendo a mesma mensagem de uma vez é **SNS**. Destino
que **depende de uma regra** sobre o conteúdo do evento é **EventBridge**.
</Callout>

## Por que a fila resolve pico

O caso mais cobrado do SQS é a rajada. Quando chegam mais pedidos do que o
consumidor processa, sem fila o excedente se perde ou derruba o sistema. Com
fila, o excedente fica guardado e o consumidor segue no ritmo que consegue. É
por isso que o enunciado costuma trazer as palavras pico, rajada ou não perder
pedido quando a resposta é SQS.

## Orquestração e portas de entrada

Três serviços do tema não movem mensagem entre componentes e por isso são
distratores fáceis de descartar quando o pedido é assíncrono. O **Step
Functions** coordena um processo: ele sabe a ordem das etapas, o que fazer em
cada condição e como repetir uma etapa que falhou. O **API Gateway** é a porta:
recebe a chamada de um cliente, aplica controle de acesso e limite de uso, e
encaminha. O **AppSync** faz o mesmo papel de porta, mas para APIs GraphQL de
aplicações web e móveis.

<Callout tipo="atencao" titulo="Amazon MQ tem uma pista própria">
O **Amazon MQ** só é a resposta certa quando o enunciado diz que a empresa **já
usa** um agente de mensagens e quer migrá-lo **sem reescrever** a aplicação. Sem
essa frase no texto, a fila nativa da AWS é o SQS.
</Callout>

## Como responder o cenário

Ache primeiro o verbo do pedido. Se é **guardar** trabalho para processar
depois, é SQS. Se é **avisar** vários destinos ao mesmo tempo, é SNS. Se é
**rotear** conforme o conteúdo, é EventBridge. Se é **coordenar** etapas com
ordem e condição, é Step Functions. Se é **expor** uma API, é API Gateway, ou
AppSync quando GraphQL aparecer no texto. E se é **manter** um agente de
mensagens que já existe, é Amazon MQ.
