# Dimensionamento correto e custo de armazenamento

> Onde o dinheiro vaza sem ninguém notar: instância maior do que precisa, recurso ocioso que ninguém desligou, volume EBS órfão, snapshot antigo acumulando e objeto no S3 na classe errada. As ferramentas e as regras automáticas que a prova espera como resposta.

Fonte: https://lumarys.com.br/trilhas/aws-solutions-architect-associate/custo/dimensionamento-e-custo-de-armazenamento/ · Lumarys (marca da Cernyn) · CC BY-NC-SA 4.0

## Em uma frase

Há duas economias diferentes: **comprar melhor** (modelos de compra) e
**consumir menos** (dimensionar certo, desligar ocioso, arquivar o frio). Este
tema é a segunda, e cada tipo de desperdício tem um serviço que o aponta.

## Onde o dinheiro vaza

<Comparativo
colunas={["Desperdício", "Sintoma", "Correção esperada"]}
linhas={[
["Superdimensionamento", "CPU e memória baixas há semanas", "Compute Optimizer e redimensionar"],
["Ocioso", "Ambiente ligado fora do horário de uso", "Parar por agendamento"],
["Órfão", "Volume EBS não anexado, IP elástico não associado, balanceador sem alvo", "Trusted Advisor e apagar"],
["Snapshot acumulado", "Conjunto crescendo sem limite", "Política de retenção (AWS Backup ou ciclo de vida)"],
["Classe errada no S3", "Dado frio em classe quente", "Regra de ciclo de vida ou Intelligent-Tiering"],
["Escala vertical permanente", "Máquina grande o tempo todo para o pico", "Escala horizontal com Auto Scaling"]
]}
/>

<Termo nome="Compute Optimizer">Serviço que analisa métricas reais de uso e recomenda tipo e tamanho para instâncias EC2, grupos de Auto Scaling, volumes EBS e funções Lambda.</Termo>

<Termo nome="Trusted Advisor">Conjunto de checagens automáticas sobre a conta, entre elas as de otimização de custo, que apontam recursos ociosos e órfãos.</Termo>

A distinção que a prova cobra: **Compute Optimizer** diz que a instância está
**grande demais**; **Trusted Advisor** diz que ela está **parada sem uso** ou
que existe um recurso pendurado. Cost Explorer e Budgets, que vêm no próximo
tema, mostram o gasto e alertam sobre ele — mas não apontam o recurso.

<Callout tipo="atencao" titulo="Recurso órfão continua cobrando">
Um volume EBS existe independentemente da instância. Se a opção de excluir na
terminação estiver desligada, ele fica lá, provisionado e faturado. O mesmo
vale para IP elástico não associado e balanceador sem alvo. É o cenário de
"apaguei as instâncias e a conta não caiu".
</Callout>

## Ciclo de vida: a economia que roda sozinha

A regra que resolve quase todo cenário de custo de armazenamento tem três
partes, e o enunciado costuma dar as três:

<Passos itens={[
"Transição para uma classe de acesso infrequente quando o acesso frequente termina.",
"Transição para arquivamento quando o acesso vira exceção e a espera é tolerável.",
"Expiração no fim do prazo de retenção, para o dado não ficar cobrando para sempre."
]} />

Faltar a **expiração** é o erro sutil: a alternativa faz as transições certas e
deixa o objeto vivo além do prazo exigido.

**Intelligent-Tiering** substitui as duas primeiras partes quando o padrão é
desconhecido — mas cobra uma taxa de monitoramento por objeto, o que o torna
ruim para muitos objetos pequenos.

<Callout tipo="dica" titulo="Parar não é terminar">
Instância **parada** não paga computação, mas continua pagando o volume EBS.
Instância **terminada** some, e o volume só some junto se a exclusão na
terminação estiver ligada. Para ambiente de desenvolvimento, parar é o certo:
o estado é preservado e a computação não é cobrada.
</Callout>

## Como responder o cenário

Classifique o desperdício antes de olhar as ferramentas: **grande demais**
(Compute Optimizer), **ligado sem uso** (agendamento), **pendurado**
(Trusted Advisor e apagar), **frio na classe quente** (ciclo de vida). E
confira se a alternativa de armazenamento inclui **expiração** quando o
enunciado dá um prazo de retenção.
