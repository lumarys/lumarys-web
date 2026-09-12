# Segurança de rede na VPC

> O perímetro que a prova cobra em quase todo cenário de rede: grupos de segurança e NACLs, sub-redes públicas e privadas, NAT Gateway, VPC endpoints de gateway e de interface (PrivateLink), e o custo de cada escolha. Quem vem de dados erra aqui; é o módulo que mais vale estudar de propósito.

Fonte: https://lumarys.com.br/trilhas/aws-solutions-architect-associate/seguras/seguranca-de-rede-na-vpc/ · Lumarys (marca da Cernyn) · CC BY-NC-SA 4.0

## Em uma frase

Na VPC, a prova cobra três decisões: **quem filtra** (grupo de segurança na
instância, com estado; NACL na sub-rede, sem estado), **por onde sai** (Internet
Gateway para pública, NAT Gateway para privada, um por zona) e **como chega aos
serviços da AWS sem internet** (endpoint de gateway para S3 e DynamoDB, de
graça; endpoint de interface para o resto, pago).

## Grupo de segurança e NACL

<Termo nome="grupo de segurança">Firewall da instância (na verdade, da interface de rede): só regras de permitir, com estado, todas as regras avaliadas. É o controle padrão da prova.</Termo>

<Termo nome="NACL">Network ACL: firewall da sub-rede, sem estado, com regras de permitir e negar avaliadas em ordem numérica. É a resposta para bloquear IP e para defesa em profundidade.</Termo>

<Comparativo
colunas={["", "Grupo de segurança", "NACL"]}
linhas={[
["Onde atua", "Instância (ENI)", "Sub-rede"],
["Estado", "Com estado: resposta volta sozinha", "Sem estado: resposta precisa de regra"],
["Regras", "Só permitir", "Permitir e negar"],
["Avaliação", "Todas, qualquer uma que permita basta", "Em ordem, para na primeira que casa"],
["Origem por referência", "Sim: outro grupo de segurança", "Não: só CIDR"],
["Padrão", "Nega entrada, permite saída", "A padrão permite tudo; a personalizada nega tudo"]
]}
/>

A pegadinha que decide questão: **portas efêmeras**. Como a NACL não tem
estado, uma conexão que entra na 443 responde por uma porta alta aleatória.
Sem regra de saída para 1024–65535, a conexão abre e a resposta morre. O
grupo de segurança não tem esse problema.

<Callout tipo="dica" titulo="Referenciar grupo, não IP">
Para "a camada web pode falar com o banco", a resposta é uma regra no grupo do
banco cuja origem é o **grupo da camada web**. Não é faixa de IP. Sobrevive a
Auto Scaling e a troca de instância, e é o desenho que a prova espera.
</Callout>

## Pública, privada e por onde o tráfego sai

O que torna uma sub-rede pública não é o nome: é uma rota na tabela dela para
um **Internet Gateway**. Sub-rede sem essa rota é privada, e instância privada
não alcança a internet por si.

<Passos itens={[
"Sub-rede pública: rota 0.0.0.0/0 para o Internet Gateway. Instâncias com IP público entram e saem.",
"Sub-rede privada: rota 0.0.0.0/0 para um NAT Gateway. Instâncias saem (atualização, API externa) e ninguém de fora entra.",
"O NAT Gateway mora numa sub-rede PÚBLICA, é por zona de disponibilidade e cobra por hora e por GB.",
"Resiliência: um NAT por zona, cada sub-rede privada apontando para o da própria zona. Um NAT só é ponto único de falha."
]} />

<Callout tipo="atencao" titulo="O custo escondido do NAT">
Tráfego para o **S3** e o **DynamoDB** não deveria passar pelo NAT: os dois
têm **endpoint de gateway**, sem custo, que é uma rota na tabela da sub-rede.
A questão "a fatura do NAT cresceu" tem sempre essa resposta. Para os outros
serviços, o **endpoint de interface** (PrivateLink) resolve o "sem internet",
mas cobra por hora e por GB — é a alternativa certa quando o requisito é
privacidade e errada quando é só custo.
</Callout>

## Acesso administrativo e observação

- **Session Manager** substitui o bastion: acesso à instância privada sem
  porta 22, sem IP público, com sessão registrada. É a resposta de "menor
  risco" e "menor esforço" para administração.
- **VPC Flow Logs** mostram o que foi aceito e rejeitado por interface,
  sub-rede ou VPC. É por onde se descobre uma NACL sem regra de efêmeras.
- **Peering** não é transitivo: para várias VPCs, **Transit Gateway**.
- **WAF** protege aplicação (camada 7, em ALB, CloudFront, API Gateway);
  **Shield** protege contra DDoS na borda. Nenhum dos dois substitui grupo
  de segurança.

## Como responder o cenário

Pergunte ao enunciado: o problema é **filtro** (SG ou NACL — com estado ou
sem?), **saída** (pública com IGW, privada com NAT por zona) ou **acesso a
serviço da AWS** (gateway grátis para S3 e DynamoDB, interface pago para o
resto)? Depois aplique a palavra: **menor custo** favorece endpoint de gateway
e evita NAT; **mais resiliente** exige um NAT por zona; **mais seguro** tira o
IP público e a porta 22.
