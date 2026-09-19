# Criptografia em repouso e em trânsito

> KMS e CloudHSM, chaves gerenciadas pela AWS e pelo cliente, criptografia padrão de S3, EBS e RDS, certificados do ACM para TLS e a escolha entre Secrets Manager e Parameter Store, com a pergunta que resolve cada questão: quem tem a chave.

Fonte: https://lumarys.com.br/trilhas/aws-cloud-practitioner/seguranca/criptografia-em-repouso-e-em-transito/ · Lumarys (marca da Cernyn) · CC BY-NC-SA 4.0

## Em uma frase

A prova separa dois estados do dado, **em repouso** e **em trânsito**, e para
cada um pergunta qual serviço protege e **quem tem a chave**.

## Os dois estados e quem cuida de cada um

<Comparativo
colunas={["Estado", "O que protege", "Serviço típico", "A pista no enunciado"]}
linhas={[
["Em repouso", "Dado gravado: objeto, volume, banco, backup", "KMS, criptografia integrada do S3, EBS e RDS", "Armazenado, gravado, disco, bucket, snapshot"],
["Em trânsito", "Dado viajando pela rede", "TLS com certificado do ACM", "Conexão, navegador, entre o cliente e o serviço, rede"]
]}
/>

## KMS, CloudHSM e a pergunta que separa os dois

O **KMS** é o serviço padrão de chaves: gerenciado, integrado a praticamente
todos os serviços de armazenamento e banco, com política por chave e registro
de uso. Ele resolve a grande maioria dos cenários da prova.

O **CloudHSM** entrega módulos criptográficos de hardware dedicados, que o
cliente administra sozinho. Ele só é a resposta quando o enunciado pede
explicitamente **controle exclusivo** do módulo, em geral por exigência
regulatória.

<Callout tipo="dica" titulo="Duas palavras decidem">
Se o enunciado disser gerenciar chaves, controlar o uso e auditar, é **KMS**. Se
disser hardware dedicado, módulo sob controle exclusivo ou exigência
regulatória sobre a custódia da chave, é **CloudHSM**. Na dúvida, o KMS é o
caminho comum e o CloudHSM é a exceção justificada.
</Callout>

## Chave da AWS ou chave do cliente

<Comparativo
colunas={["Aspecto", "Chave gerenciada pela AWS", "Chave gerenciada pelo cliente"]}
linhas={[
["Quem cria", "O serviço, automaticamente", "O cliente, no KMS"],
["Política de uso", "Não é definida pelo cliente", "Definida pelo cliente, por chave"],
["Rotação", "Controlada pelo serviço", "Configurável pelo cliente"],
["Quando escolher", "Proteção básica sem exigência de controle", "Quando o enunciado pede controle, auditoria ou rotação própria"]
]}
/>

## Criptografia já ligada e o que ainda é do cliente

O S3 aplica criptografia do lado do servidor aos novos objetos por padrão, e o
cliente escolhe se usa a chave do próprio serviço ou uma chave do KMS. EBS e RDS
oferecem criptografia integrada com o KMS, que se estende a snapshots e
réplicas.

<Callout tipo="atencao" titulo="Criptografia não é controle de acesso">
Um volume criptografado continua legível para quem tem permissão de usar a
chave. Se o enunciado descreve alguém lendo dado que não deveria, o problema é
de permissão do IAM, não de criptografia. Os dois controles se somam; nenhum
substitui o outro.
</Callout>

## Segredo de aplicação: Secrets Manager ou Parameter Store

O **Secrets Manager** guarda senha, chave de API e outros segredos, com rotação
automática integrada. O **Parameter Store**, do Systems Manager, guarda
parâmetros de configuração e também aceita valor cifrado, mas sem a rotação
automática que caracteriza o outro. Quando o enunciado cita rotação de senha, a
resposta é Secrets Manager; quando cita guardar configuração da aplicação, é
Parameter Store.

## Como responder o cenário

Classifique primeiro o estado do dado: gravado ou viajando. Se estiver viajando,
pense em TLS e ACM e descarte tudo que fale de disco. Se estiver gravado, veja o
que o enunciado pede sobre a chave: uso comum aponta KMS, controle exclusivo do
hardware aponta CloudHSM, política e auditoria próprias apontam chave gerenciada
pelo cliente. Se o objeto do enunciado não for a chave e sim uma senha de
aplicação, saia da família de criptografia e vá para o Secrets Manager.
