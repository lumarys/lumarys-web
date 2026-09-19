# O valor da nuvem e os modelos de implantação

> Os seis benefícios da computação em nuvem que a AWS publica, a diferença entre nuvem, híbrida e local, e o que separa IaaS, PaaS e SaaS com um exemplo da AWS em cada um. É a tarefa 1.1 do guia da CLF-C02.

Fonte: https://lumarys.com.br/trilhas/aws-cloud-practitioner/conceitos/valor-da-nuvem-e-modelos-de-implantacao/ · Lumarys (marca da Cernyn) · CC BY-NC-SA 4.0

## Em uma frase

A nuvem troca o ativo comprado antes da demanda por um serviço pago conforme o
uso, e a prova cobra isso em três listas curtas: os seis benefícios, os três
modelos de implantação e os três modelos de serviço.

## Os seis benefícios, com a pista de cada um

A AWS publica seis vantagens da computação em nuvem, e o enunciado da CLF
costuma descrever uma delas com uma frase de empresa em vez de nomeá-la.

<Comparativo
colunas={["Benefício", "O que é", "A pista no enunciado"]}
linhas={[
["Despesa variável no lugar de capital", "Pagar pelo consumo em vez de comprar antes", "Parar de comprar servidor, pagar pelo que usar"],
["Economia de escala massiva", "Preço unitário menor pelo volume agregado de muitos clientes", "Preço menor do que a empresa conseguiria sozinha"],
["Parar de adivinhar capacidade", "Escalar para cima e para baixo conforme a demanda real", "Sobrava máquina ociosa, faltou capacidade no pico"],
["Velocidade e agilidade", "Recurso novo em minutos, experimentar fica barato", "Semanas viraram minutos, mais experimentos por trimestre"],
["Parar de operar data center", "Sem rack, energia, refrigeração e manutenção física", "Foco no que diferencia o negócio"],
["Alcance global em minutos", "Implantar em outra região sem abrir instalação lá", "Atender usuários de outro país com menos latência"]
]}
/>

<Callout tipo="atencao" titulo="Agilidade não é elasticidade">
São dois benefícios vizinhos e a prova os separa. **Agilidade** é o tempo até
ter o recurso: semanas viram minutos. **Elasticidade** é o recurso acompanhar a
variação da demanda, que é o benefício de parar de adivinhar capacidade. Se o
enunciado fala de prazo, é agilidade; se fala de pico e ociosidade, é
capacidade.
</Callout>

## Os três modelos de implantação

A pergunta aqui é **onde a carga roda**, e só existem três respostas.

<Passos itens={[
"Nuvem: toda a aplicação e os dados vivem em provedor de nuvem, sem parcela no data center próprio.",
"Híbrido: parte na nuvem, parte no ambiente local, com ligação entre os dois. A pista é sempre um motivo para algo ficar onde está, como regulação, legado ou latência.",
"Local, também chamado de nuvem privada: infraestrutura própria, com virtualização e automação, sem provedor público."
]} />

## Os três modelos de serviço

A pergunta aqui é outra: **quem cuida de qual camada**. Quanto mais para baixo
na tabela, menos sobra para o cliente administrar.

<Comparativo
colunas={["Modelo", "O cliente cuida de", "Exemplo na AWS"]}
linhas={[
["IaaS", "Sistema operacional, atualizações, aplicação e dados", "Amazon EC2"],
["PaaS", "Aplicação e dados; a plataforma provisiona e mantém o resto", "AWS Elastic Beanstalk"],
["SaaS", "Apenas o uso e os próprios dados", "Amazon WorkMail"]
]}
/>

<Callout tipo="dica" titulo="Os dois eixos não se misturam">
Implantação responde **onde** e serviço responde **quem cuida**. Uma questão
que descreve um data center próprio conectado à AWS está no eixo da
implantação; uma que descreve alguém entregando só o código está no eixo do
serviço. Quando as alternativas misturam os dois, metade delas já cai fora só
por isso.
</Callout>

## Como responder o cenário

Descubra primeiro de qual das três listas a questão está falando: benefício,
implantação ou modelo de serviço. Depois procure o verbo. Se a frase é sobre
dinheiro que deixou de ser desembolsado de uma vez, é despesa variável; se é
sobre tempo, é agilidade; se é sobre sobra e falta, é capacidade. E se o
enunciado nomeia alguma coisa que precisa continuar no data center, a resposta
é híbrido, por mais que o resto do texto fale de nuvem.
