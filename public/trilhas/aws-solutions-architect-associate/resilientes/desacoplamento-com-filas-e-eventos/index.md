# Desacoplamento: SQS, SNS e EventBridge

> Como a prova transforma 'o sistema caiu junto' em arquitetura resiliente: fila do SQS para absorver pico e tolerar consumidor fora do ar, tópico do SNS para entregar a vários assinantes, EventBridge para rotear eventos por regra. Mais fila FIFO, fila de mensagens mortas e o padrão de leque.

Fonte: https://lumarys.com.br/trilhas/aws-solutions-architect-associate/resilientes/desacoplamento-com-filas-e-eventos/ · Lumarys (marca da Cernyn) · CC BY-NC-SA 4.0

## Em uma frase

Desacoplar é pôr algo entre dois componentes para que a falha ou a lentidão de
um não derrube o outro: **fila** quando é preciso reter e processar depois,
**tópico** quando é preciso avisar vários, **barramento** quando a decisão
depende do conteúdo do evento.

## Os três, e a pista de cada um

<Comparativo
colunas={["", "SQS", "SNS", "EventBridge"]}
linhas={[
["Modelo", "Fila: um consumidor por mensagem", "Tópico: todos os assinantes recebem", "Barramento: regras roteiam por conteúdo"],
["Retenção", "Até 14 dias", "Nenhuma: entrega e esquece", "Nenhuma (arquivamento é opcional e à parte)"],
["Se o destino está fora", "A mensagem espera na fila", "A entrega falha ou tenta de novo conforme a política", "A regra tenta de novo e pode ir para DLQ"],
["Pista no enunciado", "'Absorver pico', 'processar depois', 'não perder'", "'Avisar vários sistemas', 'notificar por e-mail e SMS'", "'Conforme o tipo do evento', 'reagir a um serviço da AWS', 'agendar'"]
]}
/>

<Termo nome="SQS">Fila gerenciada. O produtor publica, a mensagem fica retida, o consumidor lê, processa e apaga. Absorve picos e isola ritmos.</Termo>

<Termo nome="SNS">Tópico de publicação e assinatura. Uma mensagem chega a todos os assinantes: filas, funções, endpoints HTTP, e-mail, SMS.</Termo>

## O mecanismo da fila que vira questão

Ler uma mensagem **não a remove**. O que acontece é:

<Passos itens={[
"O consumidor lê a mensagem, que fica invisível para os outros durante o tempo de visibilidade.",
"Se o processamento termina, o consumidor APAGA a mensagem. Só aí ela deixa a fila.",
"Se o consumidor falha ou morre antes de apagar, o tempo expira e a mensagem volta a ficar visível, para outro consumidor tentar.",
"Se ela falhar N vezes, a fila de mensagens mortas a recebe, tirando-a do ciclo."
]} />

Esse desenho é o que dá tolerância a falha do consumidor — e é também a origem
do sintoma mais cobrado: "a mesma mensagem é processada repetidas vezes e nunca
sai". As duas causas são não apagar a mensagem e não ter DLQ configurada.

<Callout tipo="atencao" titulo="Padrão ou FIFO?">
Fila **padrão**: vazão praticamente ilimitada, ordem de melhor esforço, entrega
**pelo menos uma vez** (o consumidor precisa ser idempotente). Fila **FIFO**:
ordem estrita dentro do grupo de mensagens e **exatamente uma** entrega, com
vazão menor. "Na ordem exata" e "sem duplicar" são as frases que pedem FIFO; o
identificador de grupo costuma ser a chave do negócio, como o cliente.
</Callout>

## Leque: tópico com filas

Quando o mesmo evento precisa alimentar vários sistemas, e cada um tem ritmo e
tolerância a falha diferentes, nem fila nem tópico sozinhos bastam:

- Fila sozinha entrega a **um** consumidor: os outros não veem.
- Tópico sozinho entrega e esquece: o sistema que estava fora **perde**.

O desenho que a prova espera é o **leque**: um tópico SNS com uma fila SQS
assinando para cada destino. O tópico multiplica; cada fila retém e isola. Se o
faturamento cair, a fila dele acumula e os outros dois seguem.

## Escalar pela fila, não pela CPU

Um grupo de Auto Scaling que consome fila deve escalar pela **profundidade da
fila** — `ApproximateNumberOfMessagesVisible`, ou a razão de mensagens por
instância. A CPU do consumidor não representa o trabalho pendente: uma fila com
dez mil mensagens e um consumidor ocioso aguardando entrada de rede tem CPU
baixa. Nas questões, CPU é o distrator e profundidade da fila é a resposta.

<Callout tipo="dica" titulo="EventBridge não é fila">
Ele roteia por regra e tem destinos, mas não guarda para consumo posterior nem
tem tempo de visibilidade. Quando a questão pede **retenção**, a resposta
envolve SQS — inclusive como destino de uma regra do EventBridge.
</Callout>

## Como responder o cenário

Pergunte primeiro **quantos destinos**: um (fila), vários (tópico, ou leque se
cada um precisa reter). Depois, **o que acontece se o destino estiver fora**: se
a resposta aceitável for "espera", é fila. Por fim, **quem decide o destino**: se
for o conteúdo do evento ou um serviço da AWS que o emitiu, é EventBridge. E
quando o enunciado citar ordem ou duplicidade, vá direto para FIFO.
