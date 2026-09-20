# Modelos de preço e o nível gratuito

> Sob demanda, Savings Plans, instâncias reservadas, Spot, hosts e instâncias dedicadas; os três tipos de nível gratuito; e o que a AWS cobra na transferência de dados, no nível de conceito que o exame pede.

Fonte: https://lumarys.com.br/trilhas/aws-cloud-practitioner/cobranca/modelos-de-preco-e-free-tier/ · Lumarys (marca da Cernyn) · CC BY-NC-SA 4.0

## Em uma frase

Na CLF a questão de preço quase sempre se decide por **uma palavra do
enunciado**: imprevisível, compromisso, interrupção ou licença. Cada palavra
aponta um modelo de compra, e os demais viram distratores.

## Os modelos de compra, lado a lado

<Comparativo
colunas={["Modelo", "O que é em uma linha", "A pista no enunciado"]}
linhas={[
["Sob demanda", "Paga pelo uso, sem compromisso e sem desconto", "Carga nova, curta ou imprevisível"],
["Savings Plans", "Compromisso de valor por hora por 1 ou 3 anos, com flexibilidade", "Uso estável, mas a configuração pode mudar"],
["Instância reservada", "Compromisso de uma configuração por 1 ou 3 anos", "Carga estável na mesma família, tamanho e região"],
["Instância Spot", "Capacidade ociosa a preço reduzido, recuperável pela AWS", "Trabalho tolerante a interrupção"],
["Host dedicado", "O servidor físico inteiro, com soquetes e núcleos visíveis", "Licença de software amarrada ao hardware"],
["Instância dedicada", "Hardware não compartilhado com outra conta", "Exigência de isolamento, sem licença por hardware"]
]}
/>

Os dois primeiros com desconto são o par que mais troca de lugar. A **reserva**
prende a configuração: o desconto vale para aquela família, aquele tamanho e
aquela região. O **Savings Plans** prende o valor por hora: enquanto a conta
gastar o que prometeu, a configuração pode mudar ao longo do contrato. Quando
o enunciado cita evolução da aplicação ou troca de família, a resposta é
Savings Plans; quando descreve uma configuração que vai ficar parada onde
está, é reserva.

<Callout tipo="atencao" titulo="Spot não é desconto por prazo">
O Spot **não pede compromisso nenhum**. O que ele pede é tolerância à
interrupção, porque a AWS pode recuperar aquela capacidade. Se o enunciado diz
que o serviço não pode parar, Spot está fora, por mais barato que seja.
</Callout>

## Os três tipos de nível gratuito

O exame cobra que o candidato saiba que o nível gratuito não é uma coisa só.
São três formas de oferta. A primeira é o **teste por tempo limitado**, em que
um serviço fica liberado por um período curto a partir do momento em que é
ativado. A segunda é a oferta de **doze meses grátis**, contados da criação da
conta, dentro de limites definidos por serviço. A terceira é a oferta
**sempre gratuita**, que não expira e vale enquanto o uso ficar abaixo do
limite mensal publicado.

Nenhuma delas cobre uso acima do limite: passar do teto gera cobrança normal.
Por isso as questões costumam emendar nível gratuito com orçamento e alerta de
custo, assunto do próximo tema.

## Transferência de dados, no nível que a prova pede

A prova não pede tabela de preço, pede o princípio: **entrar dados na AWS em
geral não é cobrado; sair para a internet é**. Tráfego entre recursos dentro da
mesma zona de disponibilidade tende a custar menos do que tráfego que cruza
zonas ou regiões, e o item mais caro costuma ser a saída para fora da nuvem.
Guardar essa direção resolve as questões do tema sem decorar um único número.

<Callout tipo="dica" titulo="A direção é o que importa">
Entrada barata ou gratuita, saída para a internet cobrada. Sempre que o
enunciado falar em custo de rede, verifique **para onde** os dados estão indo
antes de olhar as alternativas.
</Callout>

## Como responder o cenário

Leia o enunciado procurando a palavra que classifica a carga. Se ela é nova,
curta ou de volume desconhecido, a resposta é sob demanda. Se é estável e o
texto aceita compromisso de um ou três anos, decida entre Savings Plans e
reserva pela presença de flexibilidade: se a configuração pode mudar, Savings
Plans; se está congelada, reserva. Se o texto diz que o trabalho pode ser
interrompido e retomado, é Spot. Se aparece licença presa ao hardware, é host
dedicado; se aparece apenas exigência de não dividir o servidor com outra
conta, é instância dedicada. E se o pedido é experimentar sem pagar, é nível
gratuito, lembrando que ele tem limite e que o limite, uma vez ultrapassado,
vira fatura.
