# Modelos de preço: sob demanda, reservada, Savings Plans e Spot

> A decisão de custo que mais cai: sob demanda para carga imprevisível e curta, Savings Plans ou instâncias reservadas para uso previsível de um a três anos, Spot para carga tolerante a interrupção, e host dedicado só quando a licença exige. O enunciado descreve o padrão de uso e espera o modelo.

Fonte: https://lumarys.com.br/trilhas/aws-solutions-architect-associate/custo/modelos-de-preco-da-computacao/ · Lumarys (marca da Cernyn) · CC BY-NC-SA 4.0

## Em uma frase

O enunciado descreve o **padrão de uso** e a prova espera o modelo: incerto e
curto é **sob demanda**; previsível por um a três anos é **Savings Plans ou
reservada**; tolerante a interrupção é **Spot**; licença por hardware é **host
dedicado**.

## Os quatro modelos

<Comparativo
colunas={["Modelo", "Compromisso", "Desconto", "Pista no enunciado"]}
linhas={[
["Sob demanda", "Nenhum", "Nenhum", "Imprevisível, curto, prova de conceito, lançamento novo"],
["Savings Plans", "Gasto por hora, 1 ou 3 anos", "Grande", "Uso contínuo e previsível, com possível mudança de família ou serviço"],
["Instância reservada", "Configuração, 1 ou 3 anos", "Grande", "Uso estável na mesma família; zonal quando quer garantir capacidade"],
["Spot", "Nenhum, mas pode ser retomada", "O maior", "Lote, renderização, teste, 'pode ser interrompido e retomado'"],
["Host dedicado", "Hardware dedicado", "Negativo (custa mais)", "Licença por soquete ou núcleo físico, auditoria de hardware"]
]}
/>

## Savings Plans ou instância reservada

Os dois dão desconto por compromisso de um ou três anos. A diferença é **o que
você trava**:

- **Savings Plans**: um valor de **gasto por hora**. O _Compute Savings Plans_
  é flexível entre famílias, tamanhos, regiões e até entre EC2, Fargate e
  Lambda. O _EC2 Instance Savings Plans_ prende família e região, com desconto
  um pouco maior.
- **Instância reservada**: uma **configuração** de instância. A variante
  **regional** dá flexibilidade de zona e de tamanho dentro da família;
  a **zonal** é a única que **garante capacidade** naquela zona.

A frase que decide: "a família pode mudar" aponta Savings Plans; "precisamos
garantir capacidade nesta zona" aponta reserva zonal.

<Callout tipo="atencao" titulo="Reserva não é garantia de capacidade">
Só a **zonal** garante. A regional é desconto com flexibilidade, e a prova usa
essa distinção quando o cenário fala em assegurar capacidade para um evento.
</Callout>

## Spot: barato porque pode ser tirado

<Termo nome="Spot">Capacidade ociosa vendida com desconto alto, que a AWS pode retomar avisando dois minutos antes. Serve carga que pode ser interrompida e retomada.</Termo>

A pergunta que a questão faz sem escrever: **o que acontece se esta instância
sumir agora?** Se a resposta for "o trabalho continua de onde parou", Spot é a
escolha. Se for "o cliente vê erro", não é.

O desenho que a prova gosta é a **frota mista**: base em sob demanda (ou com
compromisso) e o excedente em Spot, com tipos de instância diversificados para
reduzir a chance de perder tudo ao mesmo tempo. É a resposta para "economia
sem arriscar o progresso".

<Callout tipo="dica" titulo="Compromisso cobre serverless">
O Compute Savings Plans também cobre **Fargate** e **Lambda**. Quando o cenário
tem carga serverless previsível e alta, a alternativa que sugere compromisso
não está errada por ser serverless.
</Callout>

## Como responder o cenário

Leia três coisas: **por quanto tempo** (semanas é sob demanda, anos é
compromisso), **se pode parar** (pode é Spot), e **se há licença por
hardware** (há é host dedicado). Depois aplique a palavra de custo. E
desconfie da alternativa que assume compromisso de três anos sobre uso que o
próprio enunciado descreve como desconhecido: otimizar antes de medir é erro,
não economia.
