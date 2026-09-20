# Gestão, monitoramento e as demais categorias

> CloudWatch, CloudTrail, Config, Systems Manager, Trusted Advisor, Health Dashboard, Service Catalog e License Manager; e as categorias restantes no nível de nome e propósito, de ferramentas de desenvolvedor a IoT, usuário final e engajamento.

Fonte: https://lumarys.com.br/trilhas/aws-cloud-practitioner/tecnologia/gestao-monitoramento-e-outros-servicos/ · Lumarys (marca da Cernyn) · CC BY-NC-SA 4.0

## Em uma frase

Este tema recolhe tudo o que o exame cita sem aprofundar, e a questão se decide
pelo **verbo do pedido**: medir, auditar, operar, recomendar ou saber de um
evento da própria AWS. Cada verbo aponta um serviço, e só um.

## Os três que sempre aparecem juntos

O **CloudWatch** mede: coleta métricas e logs dos recursos do cliente e dispara
alarme quando um valor cruza o limite. O **CloudTrail** audita: registra quem
chamou qual API, quando e de onde. O **Config** acompanha configuração: guarda
como cada recurso estava e se ele viola uma regra definida. A comparação
detalhada entre os três, com os pares que a prova monta, está no tema de
conformidade e governança deste mesmo curso; aqui basta a pergunta que cada um
responde.

<Callout tipo="dica" titulo="Uma pergunta para cada um">
**CloudWatch**: está funcionando bem? **CloudTrail**: quem fez isso?
**Config**: como estava configurado e saiu do padrão?
</Callout>

## Operar, recomendar e ser avisado

<Comparativo
colunas={["Serviço", "O que é em uma linha", "A pista no enunciado"]}
linhas={[
["AWS Systems Manager", "Opera a frota: patch, comando, inventário, parâmetros", "Administrar muitas instâncias de um lugar só"],
["AWS Trusted Advisor", "Recomendações contra boas práticas da AWS", "Sugestões de economia, segurança, desempenho, limites"],
["AWS Health Dashboard", "Eventos da própria AWS que afetam a conta", "Saber se o problema é da AWS, não do cliente"],
["AWS Service Catalog", "Catálogo de produtos aprovados para implantar", "Padronizar o que as equipes podem criar"],
["AWS License Manager", "Controle de uso de licenças de fornecedores", "Conformidade de licença, contagem de uso"],
["Service Quotas", "Consulta e pedido de aumento dos limites de cada serviço", "Bati no limite da conta, preciso de mais"]
]}
/>

<Callout tipo="atencao" titulo="Medir não é recomendar">
**CloudWatch** e **Trusted Advisor** aparecem na mesma questão com frequência. O
CloudWatch diz **o que está acontecendo agora** com um recurso. O Trusted
Advisor diz **o que deveria mudar** na conta, comparando com boas práticas.
Alerta sobre métrica é CloudWatch; sugestão de melhoria é Trusted Advisor.
</Callout>

O **AWS Health** aparece de duas formas, e a prova cita as duas. O **Health
Dashboard** é a tela que mostra os eventos da AWS que afetam aquela conta. A
**AWS Health API** entrega os mesmos eventos de forma programática, para quem
quer disparar uma reação automática quando um evento aparece.

## As demais categorias, no nível de nome e propósito

O exame ainda cita serviços de outras categorias sem cobrar detalhe. Basta
reconhecer o propósito de cada um.

<Comparativo
colunas={["Categoria", "Serviços", "Para que servem em uma linha"]}
linhas={[
["Ferramentas de desenvolvedor", "CodeBuild, CodeDeploy, CodePipeline", "Compilar e testar, implantar, e ligar as etapas em uma esteira"],
["Desenvolvimento e diagnóstico", "Cloud9, X-Ray", "Ambiente de desenvolvimento no navegador e rastreamento da requisição entre serviços"],
["Negócio e engajamento", "Amazon Connect, SES, Pinpoint", "Central de atendimento, envio de e-mail em volume e campanhas de comunicação"],
["Computação de usuário final", "WorkSpaces, WorkSpaces Secure Browser, AppStream", "Área de trabalho completa na nuvem, navegador isolado no navegador do usuário e transmissão de uma aplicação isolada"],
["Dispositivos e aplicações", "IoT Core, Amplify, AppSync", "Conectar dispositivos, acelerar aplicações web e móveis e servir APIs GraphQL"]
]}
/>

Dois pares dessa lista costumam trocar de lugar. **SES** e **Pinpoint** tratam
de mensagem para pessoas, mas o SES é o envio de e-mail feito pela aplicação e o
Pinpoint é a campanha de comunicação com clientes. **WorkSpaces** e
**AppStream** entregam software pela rede, mas o primeiro entrega a máquina
inteira e o segundo apenas a aplicação.

## Como responder o cenário

Separe o verbo antes de olhar as alternativas. Medir e alertar é CloudWatch.
Descobrir o autor de uma ação é CloudTrail. Saber como o recurso estava
configurado é Config. Aplicar patch e executar comando na frota é Systems
Manager. Receber sugestão de melhoria é Trusted Advisor. Descobrir se a falha é
da AWS é Health Dashboard. Padronizar o que pode ser implantado é Service
Catalog. Controlar licença é License Manager. E se o nome citado for de
desenvolvimento, atendimento, usuário final ou dispositivo conectado, a resposta
é reconhecer o propósito: a prova não pede mais do que isso.
