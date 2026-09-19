# Conformidade e governança na AWS

> Onde baixar relatório de auditoria, quem responde pela conformidade de cada camada, o que região tem a ver com residência de dados e o papel de Artifact, CloudTrail, Config, Audit Manager e Control Tower no enunciado da prova.

Fonte: https://lumarys.com.br/trilhas/aws-cloud-practitioner/seguranca/conformidade-e-governanca-na-aws/ · Lumarys (marca da Cernyn) · CC BY-NC-SA 4.0

## Em uma frase

Conformidade na AWS tem duas metades: a AWS prova que a infraestrutura dela é
auditada e publica os documentos no **Artifact**, e o cliente prova que o
ambiente dele está correto usando **CloudTrail**, **Config** e **Audit
Manager**.

## O que cada serviço entrega

<Comparativo
colunas={["Serviço", "Responde à pergunta", "A pista no enunciado"]}
linhas={[
["AWS Artifact", "A AWS é certificada? Cadê o documento?", "Auditor externo, relatório ISO, SOC ou PCI, acordo"],
["AWS Audit Manager", "Cadê a evidência do meu ambiente?", "Coletar evidência continuamente, preparar auditoria interna"],
["AWS CloudTrail", "Quem fez isso, quando e de onde?", "Quem apagou, quem criou, histórico de chamada de API"],
["AWS Config", "Como o recurso está configurado e está conforme?", "Verificar continuamente, regra, desvio de configuração"],
["AWS Organizations", "Como limito o que cada conta pode fazer?", "Várias contas, teto de permissão, fatura consolidada"],
["AWS Control Tower", "Como começo um ambiente de várias contas já governado?", "Montar do zero, barreiras prontas, padrão obrigatório"]
]}
/>

<Callout tipo="atencao" titulo="As duas trocas que mais custam ponto">
**Artifact contra Audit Manager**: o primeiro entrega documento que a AWS
escreveu sobre si; o segundo produz documento sobre o ambiente do cliente.
**CloudTrail contra Config**: o primeiro responde *quem fez*, o segundo responde
*como está*. Se o enunciado tem um nome de pessoa ou identidade, é CloudTrail;
se tem a palavra configuração, conformidade contínua ou regra, é Config.
</Callout>

## Conformidade acompanha a responsabilidade compartilhada

A certificação da AWS cobre a camada que ela opera. Ela não estende
automaticamente a conformidade à aplicação do cliente: um ambiente construído
sobre infraestrutura certificada ainda pode estar fora de conformidade por
configuração errada. Por isso as duas metades existem, e por isso o auditor
costuma pedir os dois conjuntos de documento.

## Região, residência de dados e LGPD

O cliente escolhe em qual região colocar os dados, e essa escolha é o que define
o território onde eles ficam. A AWS não move conteúdo do cliente de uma região
para outra por conta própria; replicação entre regiões só acontece quando o
cliente a configura. Exigência de manter dado em determinado país, como as que
regimes de proteção de dados pessoais impõem, se resolve escolhendo a região e
controlando o que sai dela.

<Callout tipo="dica" titulo="Política de controle de serviço é teto, não permissão">
Uma política de controle de serviço no Organizations **não concede nada**. Ela
define o máximo que as contas daquela unidade organizacional podem ter. Quem
concede permissão continua sendo o IAM, e o efetivo é a interseção dos dois. Se
o enunciado fala em impedir que qualquer conta faça algo, mesmo um
administrador, é aí que ele está apontando.
</Callout>

## Como responder o cenário

Pergunte de quem é o ambiente em questão. Documento sobre a AWS vem do Artifact;
evidência sobre o ambiente do cliente vem do Audit Manager. Depois separe as
duas perguntas de rastreabilidade: autoria de uma ação é CloudTrail, estado de
configuração é Config. Quando o enunciado falar em várias contas e padrão que
ninguém pode burlar, pense em Organizations com política de controle de serviço,
e em Control Tower se o pedido for montar o ambiente inteiro já governado. E
quando aparecer exigência de território, a resposta é a escolha da região.
