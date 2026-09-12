# Usuários de aplicação e acesso a APIs: Cognito, API Gateway e acesso privado

> Como a prova espera que uma aplicação autentique pessoas e proteja suas APIs: Cognito user pool para login e identity pool para credenciais temporárias, os autorizadores do API Gateway (Cognito, IAM, Lambda) e o acesso privado entre serviços. O erro clássico é dar usuário IAM a cliente de aplicativo.

Fonte: https://lumarys.com.br/trilhas/aws-solutions-architect-associate/seguras/identidade-de-usuarios-e-acesso-a-apis/ · Lumarys (marca da Cernyn) · CC BY-NC-SA 4.0

## Em uma frase

Pessoas de fora entram pelo **Cognito**: o **user pool** autentica e emite
tokens; o **identity pool** troca o token por credenciais temporárias da AWS.
A API se protege com o **autorizador** certo (Cognito, Lambda ou IAM) e, se
for interna, fica **privada** atrás de um endpoint de interface.

## Duas piscinas, dois trabalhos

O nome atrapalha: os dois "pools" do Cognito fazem coisas diferentes, e a
prova sabe disso.

<Comparativo
colunas={["", "User pool", "Identity pool"]}
linhas={[
["Pergunta que responde", "Quem é você?", "O que você pode usar na AWS?"],
["Entrada", "E-mail e senha, telefone, Google, Facebook, SAML, OIDC", "Um token: do user pool, de rede social, de SAML, ou nada (convidado)"],
["Saída", "Tokens JWT: id, acesso, refresh", "Credenciais temporárias da AWS (STS) com uma role"],
["Recursos", "Cadastro, MFA, recuperação de senha, verificação, grupos, UI hospedada", "Role autenticada e role de convidado"],
["Usado por", "A aplicação e o API Gateway (autorizador)", "O aplicativo, para chamar S3, DynamoDB e outros direto"]
]}
/>

<Termo nome="user pool">Diretório de usuários da aplicação. Faz cadastro, login, MFA e emite tokens JWT. Não dá acesso a serviços da AWS por si.</Termo>

<Termo nome="identity pool">Troca um token de identidade por credenciais temporárias da AWS, com uma role. Aceita usuários autenticados e, opcionalmente, convidados.</Termo>

O cenário-padrão: aplicativo com login e upload direto para o S3. User pool
para o login, identity pool para o upload. Quem responde "só user pool" erra
porque o S3 não aceita JWT; quem responde "usuário IAM" erra porque IAM não é
para público.

<Callout tipo="atencao" titulo="IAM ou Cognito?">
IAM e Identity Center são para quem **opera** a conta: funcionários,
serviços, automações. Cognito é para quem **usa** a aplicação: clientes, o
público. Se o enunciado fala em "usuários do aplicativo" em quantidade
indefinida, IAM está errado por definição.
</Callout>

## Os autorizadores do API Gateway

<Comparativo
colunas={["Autorizador", "Valida", "Quando é a resposta"]}
linhas={[
["Cognito user pool", "JWT emitido pelo pool, sem código", "Os usuários já estão num user pool: menor esforço"],
["Lambda", "O que você programar", "Token de provedor de terceiro, regra de negócio, formato próprio"],
["IAM", "Assinatura SigV4 de credenciais da AWS", "Chamadas de serviços, contas e identidades da AWS, não de público"]
]}
/>

A regra de leitura: "sem manter código" e "usuários no Cognito" apontam para
o autorizador Cognito; "provedor externo" ou "lógica personalizada" apontam
para Lambda; "outro serviço" ou "outra conta" apontam para IAM.

**Chave de API e plano de uso** não autenticam ninguém. Identificam o cliente
(um parceiro comercial) e limitam taxa e cota por cliente. "Cada parceiro com
seu limite" é plano de uso; "cada usuário autenticado" é autorizador.

## API privada e acesso sem internet

Uma API consumida só por serviços internos não precisa existir na internet.
O desenho: API com endpoint do tipo **privado**, um **endpoint de interface**
para o API Gateway na VPC, e a **política de recurso** da API restrita a esse
endpoint. WAF não resolve isso: ele filtra o que já chegou.

O mesmo princípio vale ao contrário: para consumir um serviço de terceiro
exposto via **PrivateLink**, um endpoint de interface na sua VPC aponta para
o serviço do provedor, e o tráfego não sai da rede da AWS.

<Callout tipo="dica" titulo="Ordem das defesas numa API pública">
Throttling do estágio primeiro (é nativo e grátis); planos de uso por cliente
quando há parceiros; autorizador para saber quem chama; WAF anexado ao
estágio para o que chama. Quando o enunciado pede "limitar abuso com o menor
esforço", comece pelo throttling, não pelo WAF.
</Callout>

## Como responder o cenário

Classifique quem acessa: **público** (Cognito), **funcionário** (Identity
Center), **serviço** (role e autorizador IAM). Depois, o que ele precisa:
**provar quem é** (user pool), **usar um serviço da AWS** (identity pool),
**chamar a API** (autorizador). Por fim, a exposição: se ninguém de fora
consome, a API é privada. Com essas três respostas, a alternativa certa sobra
sozinha, e a que tem usuário IAM para cliente de aplicativo cai primeiro.
