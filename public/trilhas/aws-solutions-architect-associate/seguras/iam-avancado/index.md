# IAM além do básico

> Como o IAM decide se uma chamada passa: a lógica de avaliação com negação explícita, políticas de identidade e de recurso, condições, roles entre contas, limites de permissão, SCPs do Organizations e federação com o Identity Center. É o que a SAA cobra em quase todo cenário de segurança.

Fonte: https://lumarys.com.br/trilhas/aws-solutions-architect-associate/seguras/iam-avancado/ · Lumarys (marca da Cernyn) · CC BY-NC-SA 4.0

## Em uma frase

O IAM decide cada chamada assim: **negação explícita vence tudo**; sem ela, é
preciso um Allow explícito; sem Allow, nega. Todo cenário de segurança da
prova é uma variação de quem concede, quem limita e por qual mecanismo.

## A lógica de avaliação, que resolve metade das questões

Quando uma chamada chega, a AWS junta todas as políticas aplicáveis — de
identidade, de recurso, SCPs, limites de permissão, políticas de sessão — e
avalia:

<Passos itens={[
"Há um Deny explícito em qualquer uma delas? Então nega, e acabou. Não importa quantos Allow existam.",
"Não há Deny. Há um Allow explícito que cubra a ação e o recurso? Então permite.",
"Não há Allow. Nega, por padrão. É o 'implicit deny': tudo que não foi permitido está proibido."
]} />

Isso explica o cenário favorito da prova: um administrador com
AdministratorAccess barrado de um serviço por um Deny numa SCP ou numa
política de grupo. Não é bug; é a regra.

## Quem concede e quem limita

<Comparativo
colunas={["Mecanismo", "Concede?", "Limita?", "Onde mora"]}
linhas={[
["Política de identidade", "Sim", "Sim (com Deny)", "Usuário, grupo, role"],
["Política de recurso", "Sim", "Sim (com Deny)", "Bucket, fila, tópico, chave KMS"],
["SCP", "Não", "Sim", "Organizations: raiz, OU, conta"],
["Limite de permissão", "Não", "Sim", "Usuário ou role"],
["Política de sessão", "Não", "Sim", "A sessão de uma role assumida"]
]}
/>

A coluna "Concede?" é a que a prova testa. A alternativa que usa SCP para
**dar** acesso está sempre errada. A alternativa que usa boundary para dar
acesso também. Esses dois só definem tetos.

<Termo nome="SCP">Service control policy: política do Organizations que define o máximo que qualquer identidade de uma conta pode fazer, inclusive o root. Não concede nada; só limita.</Termo>

<Termo nome="limite de permissão">Permissions boundary: política anexada a um usuário ou role que define o teto do que ele pode receber. A permissão efetiva é a interseção com a política de identidade.</Termo>

## Roles: o mecanismo que a prova mais espera

Uma role é uma identidade que se **assume**, com credencial temporária. É a
resposta para três famílias de cenário:

- **Serviço da AWS agindo por você.** EC2, Lambda, ECS acessando S3, DynamoDB,
  SQS. A role é anexada ao serviço (perfil de instância no EC2). Nunca chave
  de acesso no código: esse é o distrator mais repetido da SAA.
- **Acesso entre contas.** A conta dona do recurso cria a role com as
  permissões e uma **política de confiança** para a conta de origem. A
  identidade de origem precisa de `sts:AssumeRole`. Duas metades; a prova
  costuma perguntar as duas.
- **Federação.** Pessoas de um diretório corporativo entram via IAM Identity
  Center; usuários de app entram via Cognito. Ninguém vira usuário IAM.

<Callout tipo="atencao" titulo="Role ou política de recurso?">
Para acesso cross-account em S3, SNS, SQS e KMS, a política de recurso também
resolve: o bucket concede direto ao principal da outra conta. A prova aceita
os dois desenhos; o que ela não aceita é usuário IAM com chave compartilhada.
Quando o enunciado fala em "aplicação" ou "instância" acessando, a role é a
resposta esperada.
</Callout>

## Condições: onde o menor privilégio fica preciso

A prova cobra três chaves de condição com nome:

- `aws:SourceVpce` e `aws:SourceVpc`: bucket policy que só permite acesso
  vindo do endpoint da VPC. É o par de "tráfego privado para o S3".
- `aws:SecureTransport`: negar quando for `false`, para exigir HTTPS.
- `aws:MultiFactorAuthPresent`: exigir MFA para ações destrutivas.

<Callout tipo="dica" titulo="Como responder o cenário de dois números">
A questão descreve o cenário e pergunta "o que fazer". Antes de olhar as
alternativas, classifique: é **conceder** (role, política de recurso) ou
**limitar** (SCP, boundary, Deny)? É **serviço**, **conta** ou **pessoa**
acessando? Com essas duas respostas, três alternativas caem sozinhas.
</Callout>
