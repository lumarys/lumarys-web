# Detecção e auditoria: CloudTrail, Config, GuardDuty e Security Hub

> Quem fez o quê (CloudTrail), como o recurso está configurado e se está conforme (Config), o que parece ameaça (GuardDuty), o que está vulnerável (Inspector) e onde tudo isso se junta (Security Hub). A prova cobra qual serviço responde a cada pergunta e como proteger o próprio registro de auditoria.

Fonte: https://lumarys.com.br/trilhas/aws-solutions-architect-associate/seguras/deteccao-e-auditoria-na-aws/ · Lumarys (marca da Cernyn) · CC BY-NC-SA 4.0

## Em uma frase

Cada serviço responde a uma pergunta: **CloudTrail** diz quem fez o quê,
**Config** diz como o recurso está e se está conforme, **GuardDuty** diz o
que parece ameaça, **Inspector** diz o que está vulnerável e **Security Hub**
mostra tudo junto. Acertar a pergunta é acertar a questão.

## A pergunta de cada serviço

<Comparativo
colunas={["Serviço", "Responde a", "Fonte", "Exemplo de cenário"]}
linhas={[
["CloudTrail", "Quem fez o quê, quando, de onde", "Chamadas de API", "Quem apagou o bucket ontem"],
["Config", "Como o recurso está e esteve; está conforme?", "Configuração dos recursos", "Quais buckets estão sem criptografia; como era o grupo de segurança antes"],
["GuardDuty", "O que parece ameaça", "CloudTrail, VPC Flow Logs, DNS", "Instância minerando cripto; credencial usada de país estranho"],
["Inspector", "O que está vulnerável", "Varredura de EC2, ECR, Lambda", "Instâncias com CVE crítica"],
["Security Hub", "Onde vejo tudo e qual é a nota", "Achados dos outros", "Painel CIS de 25 contas"],
["Detective", "O que aconteceu em volta deste achado", "Os mesmos logs, em grafo", "Investigar o achado do GuardDuty"]
]}
/>

<Termo nome="CloudTrail">Registro de auditoria: cada chamada de API na conta, com identidade, origem, horário e parâmetros. É a resposta para toda pergunta que começa com "quem".</Termo>

<Termo nome="Config">Inventário e histórico de configuração dos recursos, avaliado contra regras (conforme ou não), com remediação automática opcional. É a resposta para "como está" e "está conforme".</Termo>

## CloudTrail: o que a prova cobra além do "quem"

- **Retenção.** O histórico de eventos gratuito guarda 90 dias, só eventos de
  gerenciamento. "Guardar por 7 anos" exige uma **trilha** gravando no S3.
- **Eventos de dados.** GetObject no S3 e Invoke na Lambda não entram por
  padrão; precisam ser ligados e custam. "Saber quem leu o objeto" pede
  eventos de dados.
- **Organização.** Uma trilha por conta é repetição. A **trilha de
  organização**, criada na conta de gerenciamento, cobre todas as contas,
  inclusive as futuras.
- **Proteger o log.** O auditado não pode apagar a auditoria: bucket com
  versionamento e MFA delete, validação de integridade de arquivo, política
  restrita e uma **SCP negando StopLogging e DeleteTrail**.

<Callout tipo="atencao" titulo="Ação ou estado?">
"Quem alterou o grupo de segurança" é CloudTrail. "O grupo de segurança está
com a porta 22 aberta" é Config. A questão que combina os dois ("descubra
quem fez e alerte se voltar a acontecer") tem as duas alternativas certas: uma
de cada. Quem escolhe só CloudTrail ou só Config erra a múltipla resposta.
</Callout>

## Config: regra e remediação

Uma **regra** do Config avalia cada recurso de um tipo contra uma condição
(bucket público, volume sem criptografia, porta 22 aberta) e marca conforme
ou não. A prova cobra o passo seguinte: **remediação** automática, que
executa um documento do Systems Manager para corrigir. "Detectar e corrigir
sozinho" é Config com remediação; "detectar e avisar" é Config com
EventBridge.

## GuardDuty e Inspector: ameaça versus vulnerabilidade

<Termo nome="GuardDuty">Detecção de ameaças: analisa continuamente CloudTrail, VPC Flow Logs e logs de DNS com inteligência de ameaças e aprendizado de máquina. Sem agente.</Termo>

<Termo nome="Inspector">Varredura de vulnerabilidades: procura CVEs conhecidas e exposição de rede em instâncias EC2, imagens no ECR e funções Lambda.</Termo>

A diferença que decide a questão: GuardDuty olha **comportamento** (o que a
instância está fazendo agora); Inspector olha **estado** (que pacote
desatualizado está instalado). "Sem instalar agente" aponta para GuardDuty.
"CVE" ou "vulnerabilidade conhecida" aponta para Inspector.

## Security Hub: o painel, não o detector

O Security Hub **não detecta nada**. Ele agrega achados de GuardDuty,
Inspector, Macie, Config e parceiros, em várias contas, e os avalia contra
padrões como CIS e PCI, com pontuação. Quando o enunciado pede "painel único",
"várias contas" ou "padrão de conformidade", é ele. Quando pede "investigar
este achado em detalhe", é o **Detective**.

<Callout tipo="dica" titulo="Resposta automática">
O padrão que fecha muitos cenários: o achado (GuardDuty, Config, Security
Hub) vira evento no **EventBridge**, que dispara uma Lambda, uma automação do
Systems Manager ou uma notificação SNS. "Isolar a instância automaticamente
ao detectar" é GuardDuty, EventBridge e Lambda trocando o grupo de segurança.
</Callout>

## Como responder o cenário

Encontre o verbo da pergunta da equipe de segurança: **quem** (CloudTrail),
**como está** ou **está conforme** (Config), **parece ameaça** (GuardDuty),
**está vulnerável** (Inspector), **ver tudo junto** (Security Hub),
**investigar** (Detective). Depois aplique o modificador: "todas as contas"
puxa trilha de organização e Security Hub; "automaticamente" puxa EventBridge
e remediação; "sem agente" puxa GuardDuty.
