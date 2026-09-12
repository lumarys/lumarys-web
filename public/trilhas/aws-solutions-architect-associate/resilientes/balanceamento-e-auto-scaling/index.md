# Balanceamento de carga e Auto Scaling

> Os dois mecanismos que sustentam quase toda arquitetura resiliente da prova: qual balanceador para cada caso (ALB, NLB e Gateway Load Balancer), como a verificação de integridade tira um alvo doente da rotação, e como o Auto Scaling repõe capacidade, escala por métrica e distribui entre zonas.

Fonte: https://lumarys.com.br/trilhas/aws-solutions-architect-associate/resilientes/balanceamento-e-auto-scaling/ · Lumarys (marca da Cernyn) · CC BY-NC-SA 4.0

## Em uma frase

O **balanceador** tira o alvo doente da rotação e distribui a carga; o **Auto
Scaling** repõe o que morreu e ajusta a quantidade. Sem os dois, não há
arquitetura resiliente na prova — e o par certo depende do protocolo e do tipo
de variação da carga.

## Os três balanceadores

<Comparativo
colunas={["", "ALB", "NLB", "Gateway Load Balancer"]}
linhas={[
["Camada", "7 (HTTP e HTTPS)", "4 (TCP, UDP, TLS)", "3 (GENEVE, porta 6081)"],
["Roteia por", "Caminho, host, cabeçalho, método, consulta", "IP e porta", "Não roteia: insere appliance no caminho"],
["Endereço", "Nome DNS (IP muda)", "IP estático por zona, aceita Elastic IP", "Endpoint na VPC"],
["Alvos", "Instância, IP, Lambda, outro ALB", "Instância, IP, ALB", "Appliances de rede"],
["Pista no enunciado", "Microsserviços, caminho, redirecionamento, autenticação", "IP fixo, UDP, latência mínima, milhões de conexões, IP de origem preservado", "Firewall de terceiro, inspeção transparente"]
]}
/>

A decisão quase nunca é de gosto: o enunciado entrega a pista. "Rotear /api" só
existe no ALB. "IP fixo para liberar no firewall do cliente" só existe no NLB.
"Passar o tráfego por um appliance de inspeção" é o GWLB, que aparece pouco e
com essa descrição exata.

<Callout tipo="dica" titulo="O balanceador não é a resiliência">
Um ALB com todas as instâncias na mesma zona não protege contra a falha
daquela zona. O balanceador entrega a **distribuição**; a resiliência vem de
ter alvos em mais de uma zona. Nas questões, a alternativa completa cita as
duas coisas.
</Callout>

## Verificação de integridade: duas, e elas não são a mesma

<Termo nome="verificação de integridade">Teste periódico que o balanceador faz em cada alvo. Ao falhar o limiar configurado, o alvo sai da rotação e deixa de receber tráfego.</Termo>

O ponto que a prova adora: o **grupo de Auto Scaling** tem a própria noção de
saúde, e ela é configurável:

- **Tipo EC2** (padrão): olha só o estado da instância e as checagens do
  hipervisor. Aplicação travada numa instância ligada continua "saudável".
- **Tipo ELB**: adota o resultado da verificação do balanceador. Aí sim, uma
  aplicação que devolve erro faz o grupo **substituir** a instância.

O sintoma clássico da questão: "o balanceador tirou a instância da rotação, mas
ela nunca é substituída". A resposta é mudar o tipo de verificação para ELB.

## Auto Scaling: repor e ajustar

<Termo nome="grupo de Auto Scaling">Conjunto de instâncias criado a partir de um modelo de lançamento, com capacidade mínima, desejada e máxima, distribuído pelas sub-redes informadas.</Termo>

Ele faz duas coisas diferentes, e a prova separa:

- **Repor**: se uma instância falha, o grupo cria outra para voltar à
  capacidade desejada. Isso acontece mesmo sem nenhuma política de escala.
- **Ajustar**: mudar a capacidade desejada conforme a demanda. Isso é
  **política de escala**.

<Comparativo
colunas={["Política", "Como funciona", "Quando é a resposta"]}
linhas={[
["Rastreamento de alvo", "Mantém uma métrica num valor (CPU em 50%)", "Carga variável e imprevisível; menor esforço"],
["Por etapas", "Degraus diferentes por faixa de alarme", "Reação proporcional ao tamanho do desvio"],
["Simples", "Um ajuste por alarme, com cooldown", "Legado; raramente a melhor resposta"],
["Agendada", "Muda a capacidade em horário definido", "Pico conhecido: campanha, fechamento, horário comercial"],
["Preditiva", "Aprende o padrão histórico e antecipa", "Padrão recorrente que você não quer agendar à mão"]
]}
/>

<Callout tipo="atencao" titulo="Imprevisível ou conhecido?">
Essa é a palavra que decide entre as políticas. "Picos imprevisíveis" →
rastreamento de alvo. "Toda sexta às 18h" → agendada. Um cenário com os dois
pede as duas, e é aí que a múltipla resposta aparece: marcar só uma perde a
questão.
</Callout>

## Distribuir entre zonas

O grupo equilibra a capacidade entre as sub-redes que você informar, uma por
zona. Depois de uma falha, ele reequilibra. É por isso que "adicionar sub-redes
de uma segunda zona ao grupo de Auto Scaling" é uma resposta tão frequente: ela
resolve falha de instância e de zona com uma mudança de configuração, sem
arquitetura nova.

Os limites importam na leitura: a **capacidade mínima** é o piso que o grupo
repõe; a **máxima** é o teto que protege a fatura quando algo dispara a escala
— inclusive um ataque, o que liga este tema ao Shield Advanced.

## Como responder o cenário

Leia o protocolo e o tipo de roteamento para escolher o balanceador. Leia o
tipo de variação da carga para escolher a política. Confirme que a alternativa
menciona **mais de uma zona** — sem isso, ela resolve metade do problema. E
quando o sintoma for "a instância doente não é substituída", olhe o tipo de
verificação de integridade do grupo antes de qualquer outra coisa.
