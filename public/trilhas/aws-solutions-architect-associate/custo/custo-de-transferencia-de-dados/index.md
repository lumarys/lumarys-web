# Custo de transferência de dados

> A linha da fatura que ninguém prevê e a prova adora: entrada é grátis, saída para a internet é cobrada, tráfego entre zonas é cobrado nos dois sentidos, e o NAT Gateway cobra por GB além da hora. Endpoints, CloudFront e desenho por zona são as saídas.

Fonte: https://lumarys.com.br/trilhas/aws-solutions-architect-associate/custo/custo-de-transferencia-de-dados/ · Lumarys (marca da Cernyn) · CC BY-NC-SA 4.0

## Em uma frase

Entrada é grátis, **saída custa**, e tudo que atravessa zona, região ou NAT é
cobrado por GB. Em cenários de custo, a resposta costuma ser **mudar o caminho
do tráfego**, não o serviço.

## O mapa da cobrança

<Comparativo
colunas={["Fluxo", "Cobrança"]}
linhas={[
["Internet para a AWS (entrada)", "Grátis"],
["AWS para a internet (saída)", "Por GB, com faixas decrescentes e uma franquia mensal"],
["Entre zonas da mesma região", "Por GB, nos dois sentidos"],
["Dentro da mesma zona, por IP privado", "Grátis"],
["Dentro da mesma zona, por IP público ou elástico", "Cobrado: o tráfego sai e volta"],
["Entre regiões", "Por GB"],
["Através do NAT Gateway", "Por hora ligado MAIS por GB processado"],
["Endpoint de gateway (S3, DynamoDB)", "Grátis"],
["Endpoint de interface (PrivateLink)", "Por hora MAIS por GB"]
]}
/>

<Callout tipo="atencao" titulo="O NAT é a armadilha favorita">
Ele cobra **duas** vezes: a hora ligada e cada GB processado. Quando uma carga
privada conversa muito com S3 ou DynamoDB, o volume passa pelo NAT sem
necessidade. A correção é **endpoint de gateway**, que é uma rota na tabela e
não custa nada. É a questão de custo mais repetida da prova.
</Callout>

## CloudFront como redutor de custo

Costuma ser apresentado como melhoria de desempenho, e é também economia: a
saída pelo **CloudFront** tem preço por GB menor que a saída direta do S3 ou de
um balanceador, e o **cache** reduz o número de requisições que chegam à
origem. Por isso, num cenário de "reduzir custo de saída e melhorar
desempenho", ele responde aos dois de uma vez.

## Resiliência custa transferência

Multi-AZ, réplicas e balanceamento atravessam zonas — e isso é cobrado. A prova
não considera isso um erro: é o preço da disponibilidade que o requisito pediu.
O que ela cobra é **não desperdiçar**: manter conversas de alta frequência
dentro da zona quando possível, usar IP privado em vez de público, e não
atravessar região sem necessidade.

<Callout tipo="dica" titulo="Quando a rede não dá conta">
Volume muito grande com enlace insuficiente não se resolve com otimização de
transferência: se resolve com **transporte físico**. A família **Snow** leva
os dados em um dispositivo, e é a resposta quando o enunciado diz que a
transferência pela rede levaria meses. **DataSync** otimiza o que passa pela
rede, mas não cria banda.
</Callout>

## Como responder o cenário

Ache **por onde o tráfego passa** hoje e pergunte se existe caminho mais curto:
endpoint em vez de NAT, IP privado em vez de público, borda em vez de origem,
mesma zona em vez de atravessar. Depois confira se o volume justifica mudar de
meio: centenas de terabytes com rede insuficiente é Snow, não otimização.
