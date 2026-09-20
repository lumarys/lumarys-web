# IAM: usuários, grupos, roles e políticas

> Quem é quem no IAM: usuário raiz e o que fazer com ele, MFA, chaves de acesso, grupos, roles com credenciais temporárias, políticas gerenciadas e inline, privilégio mínimo e onde entra o IAM Identity Center.

Fonte: https://lumarys.com.br/trilhas/aws-cloud-practitioner/seguranca/iam-usuarios-grupos-roles-e-politicas/ · Lumarys (marca da Cernyn) · CC BY-NC-SA 4.0

## Em uma frase

O IAM é onde a conta decide **quem pode fazer o quê**, e a prova pede quase
sempre a mesma coisa: dada uma necessidade de acesso em duas linhas, qual dos
quatro componentes do IAM (usuário, grupo, role, política) atende.

## Os quatro componentes e a pista de cada um

<Comparativo
colunas={["Componente", "O que é", "A pista no enunciado"]}
linhas={[
["Usuário", "Identidade permanente, com senha e possivelmente chave de acesso", "Uma pessoa, acesso ao console, conta única"],
["Grupo", "Conjunto de usuários que herdam a mesma política", "Vários funcionários com as mesmas permissões, mudança em um lugar só"],
["Role", "Identidade sem senha, assumida por um tempo, com credencial temporária", "Serviço acessando serviço, acesso entre contas, acesso temporário"],
["Política", "Documento que concede ou nega ações sobre recursos", "Definir o que pode ser feito, reaproveitar permissões"]
]}
/>

<Callout tipo="dica" titulo="A regra que resolve metade das questões">
Se o enunciado diz que **uma aplicação, uma função ou uma instância** precisa
acessar outro serviço da AWS, a resposta é **role**. Nunca é chave de acesso
gravada no servidor, e nunca é o usuário raiz. Esse par aparece na prova em
várias roupagens e a resposta certa não muda.
</Callout>

## O usuário raiz

O raiz é a identidade criada junto com a conta e tem acesso irrestrito, inclusive
ao que nenhuma política consegue limitar. A recomendação da AWS é tratá-lo como
cofre: ative MFA, não gere chave de acesso para ele, não o use no dia a dia e
crie identidades com privilégio mínimo para o trabalho normal. Ele fica
reservado para as poucas tarefas que exigem a conta, como alterar o plano de
suporte ou encerrar a conta.

## Políticas: gerenciada, inline e como a decisão é tomada

Uma política diz quais ações são permitidas sobre quais recursos. A
**gerenciada** é um objeto independente, anexável a vários usuários, grupos e
roles, e existe na variedade publicada pela AWS e na criada pelo cliente. A
**inline** fica embutida em uma única identidade e é apagada junto com ela.

<Callout tipo="atencao" titulo="Negação explícita vence tudo">
O IAM nega por padrão. Uma permissão explícita libera a ação, mas se **qualquer**
política aplicável contiver uma negação explícita, o pedido é recusado, por mais
ampla que seja a permissão concedida em outro lugar. Enunciado que descreve
acesso negado apesar de política permissiva está apontando para isso.
</Callout>

## IAM Identity Center

Quando a empresa tem várias contas, criar um usuário por pessoa em cada conta
não escala. O **IAM Identity Center** conecta o diretório de identidades da
empresa e dá a cada pessoa um login único, com escolha da conta a acessar e
credenciais temporárias. O que a pessoa pode fazer dentro da conta continua
sendo definido por política. Ele resolve **quem entra**; o IAM continua
resolvendo **o que se pode fazer**.

Quando as identidades já existem fora da AWS, o caminho é a **federação**: a
pessoa se autentica no diretório corporativo ou em um provedor externo e recebe
credenciais temporárias na conta, sem usuário do IAM próprio. O Identity Center
é a forma gerenciada de federar; a pista no enunciado é aproveitar o login que a
empresa já tem em vez de criar um novo. Quando o diretório em questão é o Active
Directory da Microsoft, quem o hospeda ou o conecta na AWS é o
**AWS Directory Service**.

## Credenciais: senha, chave e segredo

Três controles completam o desenho e a prova cobra cada um pelo nome. A
**política de senha** da conta define tamanho mínimo, exigência de caracteres,
troca periódica e proibição de reuso para os usuários do IAM. A **chave de
acesso** serve ao acesso programático e não deve existir para o raiz. E segredo
de aplicação, como a senha de um banco, não mora em política do IAM: fica no
**Secrets Manager**, que ainda gira a credencial sozinho, ou no armazenamento de
parâmetros do **Systems Manager**. Credencial dentro do código é o erro que o
enunciado descreve para que a resposta seja um desses dois.

## Como responder o cenário

Localize o sujeito do acesso. Se for um serviço da AWS, é role. Se for um grupo
de pessoas com permissões idênticas, é grupo. Se for uma pessoa com acesso a
muitas contas usando o login corporativo, é IAM Identity Center. Se o enunciado
pedir a prática recomendada, as respostas de sempre são privilégio mínimo, MFA
e credencial temporária no lugar de chave permanente. E desconfie de qualquer
alternativa que proponha usar o raiz, compartilhar credencial ou dar acesso
administrativo por conveniência: na CLF, essas nunca são a resposta certa.
