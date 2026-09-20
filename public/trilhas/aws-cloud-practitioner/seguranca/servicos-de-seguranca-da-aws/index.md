# Os serviços de segurança e o que cada um detecta

> GuardDuty, Inspector, Macie, Security Hub, Detective, Shield, WAF, Firewall Manager, Network Firewall e Trusted Advisor: o que cada serviço detecta ou bloqueia, e a palavra do enunciado que aponta para ele.

Fonte: https://lumarys.com.br/trilhas/aws-cloud-practitioner/seguranca/servicos-de-seguranca-da-aws/ · Lumarys (marca da Cernyn) · CC BY-NC-SA 4.0

## Em uma frase

Todo serviço de segurança da AWS diz que protege, então o que resolve a questão
é **o objeto que cada um observa**: ameaça em curso, vulnerabilidade
conhecida, dado sensível, requisição maliciosa ou volume de tráfego.

## O mapa de reconhecimento

<Comparativo
colunas={["Serviço", "O que observa", "A palavra no enunciado"]}
linhas={[
["Amazon GuardDuty", "Atividade maliciosa e comportamento anômalo na conta", "Ameaça, atividade suspeita, comportamento fora do normal"],
["Amazon Inspector", "Vulnerabilidade conhecida em instâncias, imagens e funções", "Vulnerabilidade, correção pendente, exposição não intencional"],
["Amazon Macie", "Dado sensível armazenado no S3", "Dado pessoal, informação sigilosa, classificar conteúdo"],
["AWS Security Hub", "Achados dos outros serviços, agregados e priorizados", "Visão única, consolidar alertas, postura de segurança"],
["Amazon Detective", "A origem e o encadeamento de um achado", "Investigar, analisar a causa depois do alerta"],
["AWS Shield", "Volume de tráfego de negação de serviço", "Ataque de negação de serviço, tráfego derrubando o site"],
["AWS WAF", "Conteúdo das requisições web", "Injeção de SQL, cross-site scripting, bloquear requisição"],
["AWS Network Firewall", "Tráfego de rede entrando e saindo da VPC", "Inspecionar tráfego na borda da VPC"],
["AWS Firewall Manager", "As regras de firewall de várias contas", "Aplicar a mesma regra em toda a organização"]
]}
/>

<Callout tipo="dica" titulo="O trio que decide o domínio">
Guarde os três como uma cena: **GuardDuty** procura quem está atacando,
**Inspector** procura a porta mal fechada e **Macie** procura o documento
sigiloso guardado no lugar errado. Praticamente toda questão sobre detecção na
CLF cai em um desses três papéis.
</Callout>

## Proteger o tráfego: Shield, WAF e os firewalls

Shield e WAF resolvem problemas diferentes e aparecem juntos como alternativas
de propósito. O **Shield** trata de **volume**: muitas origens mandando tráfego
para tirar o serviço do ar. O **WAF** trata de **conteúdo**: uma requisição que
parece legítima mas carrega um padrão de ataque. Quando o enunciado descreve
injeção de SQL ou cross-site scripting, é WAF; quando descreve o site caindo
por excesso de requisições, é Shield.

Para a organização inteira, o **Firewall Manager** distribui e mantém essas
regras em várias contas, e o **Network Firewall** inspeciona o tráfego na borda
da VPC.

## Dentro da VPC: security group e lista de controle de acesso

O guia cita os dois pelo nome em inglês, **security group** e **network ACL**,
esta última abreviada como NACL. A prova mistura os dois idiomas, então vale
reconhecer a sigla junto da tradução.

<Comparativo
colunas={["Aspecto", "Security group", "Lista de controle de acesso de rede"]}
linhas={[
["Protege", "O recurso, como uma instância", "A sub-rede inteira"],
["Regras", "Só permitir", "Permitir e negar"],
["Avalia estado", "Sim: resposta de conexão permitida volta sozinha", "Não: é preciso regra para ida e para volta"],
["A pista", "Liberar porta para uma instância específica", "Bloquear um endereço para toda a sub-rede"]
]}
/>

<Callout tipo="atencao" titulo="Security Hub não detecta">
Ele **agrega**. Se o enunciado pede descobrir algo, procure quem detecta. Se
pede ver tudo em um lugar só, com prioridade e pontuação de postura, é o
Security Hub. A mesma lógica vale para o **Detective**: ele entra depois do
achado, para entender como aquilo aconteceu.
</Callout>

## Onde a AWS publica informação de segurança

Parte do domínio não pergunta qual serviço ativar, e sim onde procurar
orientação. O **AWS Security Center** reúne a postura de segurança da AWS, as
boas práticas recomendadas e o material de conformidade. O **AWS Security Blog**
publica anúncios, análises de incidente e orientação nova. O **Knowledge
Center** responde às dúvidas mais frequentes que chegam ao suporte. E produtos
de segurança de terceiros se contratam no **AWS Marketplace**, não com a AWS
diretamente. Quando o enunciado pede onde se informar, e não o que ligar, a
resposta está nesse grupo.

## Como responder o cenário

Sublinhe o substantivo do problema antes de olhar as alternativas. Ameaça aponta
GuardDuty. Vulnerabilidade aponta Inspector. Dado sensível aponta Macie. Volume
aponta Shield. Requisição maliciosa aponta WAF. Consolidação aponta Security
Hub. Investigação posterior aponta Detective. Credencial no código aponta
Secrets Manager. Boas práticas da conta apontam Trusted Advisor. Se duas
alternativas parecerem servir, escolha a que age sobre o objeto que o enunciado
nomeou, não a que soa mais completa.
