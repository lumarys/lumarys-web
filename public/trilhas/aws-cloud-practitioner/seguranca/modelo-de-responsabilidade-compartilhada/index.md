# O modelo de responsabilidade compartilhada

> Segurança da nuvem é da AWS, segurança na nuvem é do cliente: onde a linha cai em EC2, RDS, Lambda e S3, o que a AWS nunca faz pelo cliente e como reconhecer o lado certo num enunciado de duas linhas.

Fonte: https://lumarys.com.br/trilhas/aws-cloud-practitioner/seguranca/modelo-de-responsabilidade-compartilhada/ · Lumarys (marca da Cernyn) · CC BY-NC-SA 4.0

## Em uma frase

A AWS responde pela segurança **da** nuvem, que é a infraestrutura que ela
opera, e o cliente responde pela segurança **na** nuvem, que é tudo o que ele
coloca em cima dela; a prova só quer saber de que lado da linha uma atividade
cai.

## A linha se move com o serviço

Este é o ponto que mais derruba candidato. A divisão não é fixa: quanto mais
gerenciado o serviço, mais camadas a AWS assume e menos sobra para o cliente na
infraestrutura.

<Comparativo
colunas={["Serviço", "A AWS cuida de", "O cliente cuida de"]}
linhas={[
["EC2", "Hipervisor, hardware, rede física, instalações", "Sistema operacional convidado e suas correções, firewall da instância, aplicação, dados"],
["RDS", "Sistema operacional, motor do banco, correções, backup automatizado", "Usuários e permissões do banco, configuração de rede, ativar criptografia, os dados"],
["S3", "Durabilidade, infraestrutura de armazenamento, correção dos servidores", "Quem acessa o bucket, versionamento, escolha de criptografia, os objetos"],
["Lambda", "Ambiente de execução, escala, correção da plataforma", "Código, dependências, role de execução, os dados que a função manipula"]
]}
/>

<Callout tipo="dica" titulo="A pergunta que resolve qualquer item">
Antes de responder, pergunte: **o cliente consegue mexer nisso pelo console, pela
CLI ou pela API?** Se consegue, a responsabilidade é dele. Se não existe onde
configurar, é da AWS. Correção do hipervisor não tem botão; permissão de bucket
tem.
</Callout>

## O que nunca sai do cliente

Três coisas ficam com o cliente em qualquer serviço, do EC2 ao Lambda:

<Passos itens={[
"Os dados: o que são, quão sensíveis são e por quanto tempo ficam guardados. A AWS não olha o conteúdo do cliente.",
"As identidades e permissões: quem pode fazer o quê. Criar usuário, role e política é sempre ato do cliente.",
"As credenciais de acesso e a configuração de quem alcança o recurso, incluindo a decisão de criptografar."
]} />

A recíproca também é absoluta. Segurança física das instalações, hardware,
rede física, descarte de mídia e a camada de virtualização são exclusivas da
AWS, e o cliente não tem como participar nem como auditar diretamente: ele
recebe isso na forma de relatório de conformidade.

## Controles herdados e controles compartilhados

O modelo tem três categorias, e a prova costuma citar as duas primeiras pelo
nome.

<Comparativo
colunas={["Categoria", "Quem executa", "Exemplo"]}
linhas={[
["Herdado", "AWS inteira", "Segurança física e ambiental dos data centers"],
["Compartilhado", "Os dois, em camadas diferentes", "Gestão de correções, gestão de configuração, conscientização e treinamento"],
["Específico do cliente", "Cliente inteiro", "Proteção do dado, comunicação e zoneamento de rede da aplicação"]
]}
/>

<Callout tipo="atencao" titulo="Compartilhado não é metade e metade">
Gestão de correções aparece como controle compartilhado, mas isso não significa
que a AWS corrige metade do sistema operacional da sua instância. Significa que
**cada parte corrige a sua camada**: a AWS a infraestrutura, o cliente o que ele
instalou. A palavra compartilhado descreve o controle, não a tarefa.
</Callout>

## Como responder o cenário

Leia o serviço citado primeiro, porque é ele que posiciona a linha. Depois
classifique a atividade em uma das três faixas: infraestrutura física e
virtualização apontam AWS; dado, identidade e permissão apontam cliente; sistema
operacional e motor de banco dependem do serviço, e é aí que a questão mora. Se
o enunciado disser EC2, o sistema operacional é do cliente; se disser RDS,
Lambda ou qualquer serviço descrito como gerenciado, o sistema operacional é da
AWS. Quando aparecer conformidade, lembre que ela é das duas partes: a AWS
certifica a infraestrutura e o cliente responde pelo que construiu sobre ela.
