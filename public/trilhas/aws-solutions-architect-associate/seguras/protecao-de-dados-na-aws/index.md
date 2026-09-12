# Proteção de dados: KMS, criptografia e segredos

> Criptografia em repouso e em trânsito na AWS como a prova cobra: os tipos de chave do KMS, as opções de criptografia do S3, EBS e RDS, Secrets Manager contra Parameter Store, certificados no ACM e descoberta de dados sensíveis com o Macie.

Fonte: https://lumarys.com.br/trilhas/aws-solutions-architect-associate/seguras/protecao-de-dados-na-aws/ · Lumarys (marca da Cernyn) · CC BY-NC-SA 4.0

## Em uma frase

Na prova, "proteger dados" é escolher **quem controla a chave** (a AWS, o KMS
com chave sua, ou você fora da AWS), garantir criptografia em repouso e em
trânsito, e guardar segredo em serviço de segredo — com o mínimo de esforço que
ainda cumpre o requisito.

## O KMS e os três tipos de chave

<Termo nome="KMS">AWS Key Management Service: cria e guarda chaves de criptografia e registra cada uso delas. Os serviços da AWS usam o KMS para criptografar em repouso.</Termo>

O que a prova cobra não é o KMS em si, e sim **qual tipo de chave** atende ao
cenário:

<Comparativo
colunas={["Tipo", "Quem controla a política", "Rotação", "Auditoria por uso", "Uso entre contas"]}
linhas={[
["Gerenciada pelo cliente", "Você", "Configurável; pode desabilitar a chave", "Sim, no CloudTrail", "Sim"],
["Gerenciada pela AWS", "O serviço da AWS", "Automática", "Sim, no CloudTrail", "Não"],
["De propriedade da AWS", "A AWS, invisível para você", "Automática", "Não aparece na sua conta", "Não"]
]}
/>

A regra de leitura: "a empresa controla", "pode revogar", "compartilha com
outra conta" apontam para chave gerenciada pelo cliente. "Só precisa estar
criptografado" aceita qualquer uma, e a mais simples ganha.

<Termo nome="criptografia de envelope">A chave do KMS não cifra o dado; cifra uma chave de dados, que cifra o dado. O KMS só manipula chaves pequenas, e o dado grande nunca sai do serviço onde está.</Termo>

## S3: as opções de criptografia no servidor

<Comparativo
colunas={["Opção", "Chave", "Controle e auditoria", "Quando é a resposta"]}
linhas={[
["SSE-S3", "Da AWS", "Nenhum; é o padrão", "Sem exigência de controle de chave"],
["SSE-KMS", "No KMS", "Política, rotação, CloudTrail por uso", "Controle, auditoria, revogação, acesso entre contas"],
["SSE-C", "Sua, enviada a cada chamada", "A AWS não guarda a chave", "Exigência de que a AWS nunca armazene a chave"],
["Cliente", "Sua, fora da AWS", "Total, e todo o trabalho é seu", "Dado precisa chegar já cifrado à AWS"]
]}
/>

<Callout tipo="dica" titulo="O custo escondido do SSE-KMS">
Cada leitura e gravação chama o KMS, e o KMS cobra por chamada. Num bucket com
milhões de objetos pequenos, a fatura do KMS supera a do S3. A resposta da
prova para "SSE-KMS com menor custo" é **S3 Bucket Keys**, que deriva uma chave
por bucket e corta a maior parte das chamadas.
</Callout>

Em trânsito, a prova cobra uma coisa só: bucket policy com Deny quando
`aws:SecureTransport` é `false`. Criptografia em trânsito no S3 é política, não
configuração.

## EBS e RDS: a decisão é na criação

Criptografia de volume EBS e de instância RDS é escolhida quando o recurso
nasce. Não existe "ligar depois". Para um recurso existente, o caminho é
sempre o mesmo: snapshot, cópia do snapshot com criptografia habilitada, novo
recurso a partir da cópia. A prova gosta de oferecer a alternativa "habilitar
nas configurações do volume", que não existe.

## Segredos: Secrets Manager ou Parameter Store

Os dois guardam valores criptografados com o KMS. A diferença que decide a
questão é **rotação**:

- **Secrets Manager**: rotação automática integrada com RDS, Redshift e
  DocumentDB, e rotação por Lambda para o resto. Custa por segredo. É a
  resposta para "credencial de banco com troca automática".
- **Parameter Store**: configuração e segredos (SecureString), hierárquico, sem
  rotação nativa, nível padrão sem custo. É a resposta para "configuração
  compartilhada" e para "menor custo" quando rotação não foi pedida.

<Callout tipo="atencao" titulo="A alternativa que parece certa">
"Parameter Store com uma Lambda que rotaciona" funciona. Mas é código seu para
manter, e o enunciado que pede rotação quase sempre pede também "menor esforço
operacional". O Secrets Manager já faz; a alternativa com Lambda é o distrator.
</Callout>

## Certificados e descoberta

- **ACM** emite e renova certificados TLS públicos de graça, para usar em ELB,
  CloudFront e API Gateway. Não dá para exportar a chave privada de
  certificado público; se o cenário exige o certificado numa instância EC2, o
  ACM público não serve.
- **Macie** descobre e classifica dados sensíveis em buckets S3. Ele diz _onde_
  há PII; não criptografa, não bloqueia, não move. A ação depois é sua.
- **CloudHSM** é hardware dedicado. Só é a resposta quando o enunciado exige
  isso explicitamente; do contrário, é o distrator caro que faz mais do que
  foi pedido.

## Como responder o cenário

Classifique o pedido em três perguntas: **quem controla a chave** (AWS, KMS
com chave sua, você fora), **precisa auditar ou revogar** (então KMS com chave
do cliente), **é segredo com rotação** (Secrets Manager) ou **configuração**
(Parameter Store). Com isso, sobra uma alternativa — e ela costuma ser a mais
simples que ainda cumpre o requisito.
