# Computação na AWS

> EC2 e as famílias de instância, Auto Scaling e balanceadores no nível de conceito, Lambda, containers com ECS, EKS e Fargate, além de Lightsail e Batch: o que cada um é em uma linha e a pista que o denuncia no enunciado.

Fonte: https://lumarys.com.br/trilhas/aws-cloud-practitioner/tecnologia/computacao-na-aws/ · Lumarys (marca da Cernyn) · CC BY-NC-SA 4.0

## Em uma frase

Os serviços de computação da AWS formam uma escala de **quanto do servidor o
cliente administra**, do EC2, onde ele administra tudo, ao Lambda, onde ele só
entrega a função, e a questão se resolve encontrando onde o enunciado quer ficar
nessa escala.

## A escala que decide

<Comparativo
colunas={["Serviço", "O que é em uma linha", "A pista no enunciado"]}
linhas={[
["Amazon EC2", "Servidor virtual com controle do sistema operacional", "Escolher o sistema, instalar software, migrar servidor existente"],
["Amazon ECS", "Orquestrador de contêineres próprio da AWS", "Rodar contêiner sem exigência de Kubernetes"],
["Amazon EKS", "Kubernetes gerenciado pela AWS", "A palavra Kubernetes ou o ecossistema dele"],
["AWS Fargate", "Executa contêineres sem administrar as instâncias", "Contêiner mais a frase sem gerenciar servidores"],
["AWS Lambda", "Função curta disparada por evento, cobrada por execução", "Evento, função, sem provisionar nada, código curto"],
["Amazon Lightsail", "Pacote simples com preço mensal previsível", "Site pequeno, blog, simplicidade, começar rápido"],
["AWS Batch", "Executa lotes de trabalhos em fila", "Muitos trabalhos independentes processados em lote"]
]}
/>

<Callout tipo="dica" titulo="O trio que mais confunde">
**EC2** entrega o servidor inteiro, **Fargate** entrega o contêiner sem servidor
visível e **Lambda** entrega só a execução. Se o enunciado disser contêiner e
disser sem administrar servidor, é Fargate. Se disser função e evento, é Lambda.
Se disser sistema operacional específico ou software instalado na máquina, é
EC2.
</Callout>

## Elasticidade: Auto Scaling e balanceador

Os dois quase sempre aparecem juntos e resolvem coisas diferentes. O **EC2 Auto
Scaling** muda **quantas** instâncias existem, acompanhando picos e vales sem
intervenção humana. O **Elastic Load Balancing** decide **para qual** instância
cada requisição vai e para de enviar tráfego às que falham na verificação de
saúde. Quando o enunciado fala em acompanhar a demanda, é Auto Scaling; quando
fala em distribuir requisições, é balanceador; quando fala nas duas coisas, a
resposta traz os dois.

## As famílias de instância

A CLF cobra as famílias pelo nome e pelo caso, não pela geração nem pelo tamanho.
**Uso geral** equilibra processador e memória e serve a aplicação web comum.
**Computação** atende quem consome processador, como codificação de mídia e
simulação. **Memória** atende quem mantém muito dado em memória, como banco de
dados e análise em memória. **Armazenamento** atende leitura e escrita intensas
em disco local. **Acelerada** atende carga com GPU, como treinamento de modelo e
renderização.

<Callout tipo="atencao" titulo="ECS não é EKS">
Os dois orquestram contêineres e podem rodar sobre EC2 ou sobre Fargate. A
diferença que a prova cobra é uma palavra: se o enunciado cita **Kubernetes**,
padrão aberto ou ferramentas do ecossistema, é **EKS**. Se apenas pede rodar
contêiner na AWS, é **ECS**.
</Callout>

## Como responder o cenário

Comece pela unidade que o enunciado entrega. Função e evento apontam Lambda.
Contêiner aponta ECS ou EKS, e a escolha entre eles depende da palavra
Kubernetes; se o enunciado acrescentar que não quer administrar instâncias,
acrescente Fargate. Servidor com sistema operacional próprio aponta EC2. Lote de
trabalhos aponta Batch. Simplicidade e preço fixo apontam Lightsail. Depois olhe
se há pico de demanda, porque aí entram Auto Scaling e balanceador, e só então
escolha a família de instância pelo recurso que domina a carga.
