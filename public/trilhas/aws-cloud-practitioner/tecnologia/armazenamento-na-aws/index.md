# Armazenamento na AWS

> S3 e suas classes, ciclo de vida e versionamento; EBS, EFS, FSx, Storage Gateway, AWS Backup e a família Snow; e a pergunta que decide tudo no tema: o dado é objeto, bloco ou arquivo?

Fonte: https://lumarys.com.br/trilhas/aws-cloud-practitioner/tecnologia/armazenamento-na-aws/ · Lumarys (marca da Cernyn) · CC BY-NC-SA 4.0

## Em uma frase

Todo serviço de armazenamento da AWS guarda dado, então a questão se decide
antes do serviço: o dado é **objeto**, **bloco** ou **arquivo compartilhado**?
Respondida essa pergunta, sobra apenas uma alternativa plausível.

## Objeto, bloco e arquivo

<Comparativo
colunas={["Serviço", "O que é em uma linha", "A pista no enunciado"]}
linhas={[
["Amazon S3", "Armazenamento de objetos em buckets, acessado por API", "Arquivo, imagem, backup, site estático, acesso pela aplicação"],
["Amazon EBS", "Volume de bloco ligado a uma instância EC2 em uma zona", "Disco da instância, sistema operacional, banco instalado na máquina"],
["Instance store", "Disco preso ao hardware da instância, apagado quando ela para", "Rascunho, cache local, dado que pode ser perdido"],
["Amazon EFS", "Sistema de arquivos montado por várias instâncias ao mesmo tempo", "Compartilhado entre instâncias, pasta comum, capacidade elástica"],
["Amazon FSx", "Sistemas de arquivos de terceiros gerenciados", "Compatível com Windows File Server, computação de alto desempenho"],
["AWS Storage Gateway", "Ponte entre o datacenter local e o armazenamento da AWS", "Ambiente híbrido com acesso contínuo, manter protocolos locais"],
["AWS Backup", "Política central de cópias de segurança de vários serviços", "Backup coordenado, retenção padronizada, várias contas"],
["Família Snow", "Dispositivos físicos para mover grandes volumes de dados", "Transferência única, local remoto, banda insuficiente"]
]}
/>

<Callout tipo="dica" titulo="A frase que separa EBS de EFS">
Conte as instâncias. **Uma** instância com um disco próprio é **EBS**. **Várias**
instâncias lendo e gravando na mesma pasta é **EFS**. Se o enunciado citar
compatibilidade com Windows ou alto desempenho de arquivos, sobe para **FSx**.
O **instance store** também é bloco, mas é efêmero: some quando a instância
para. Dado que precisa sobreviver ao desligamento vai para EBS.
</Callout>

## As classes do S3

A CLF cobra as classes pelo padrão de acesso, não por números. A **Standard**
serve a dado acessado com frequência. A **Standard-IA** e a **One Zone-IA**
servem a dado acessado com pouca frequência, com a segunda guardando em uma
única zona de disponibilidade e, por isso, custando menos e resistindo menos.
A **Intelligent-Tiering** move o objeto entre camadas sozinha quando o padrão de
acesso é imprevisível. As classes do **Glacier** servem ao arquivamento, com
custo de armazenamento menor e recuperação mais lenta conforme a classe.

Duas configurações completam o quadro. O **ciclo de vida** aplica regras por
idade do objeto: mudar de classe depois de tantos dias, expirar depois de
tantos outros. O **versionamento** guarda as versões anteriores no mesmo bucket
e é a proteção contra sobrescrita e exclusão acidental.

<Callout tipo="atencao" titulo="Versionamento não é backup">
Os dois preservam dado e por isso aparecem juntos como alternativas. O
**versionamento** age dentro de um bucket do S3, sobre objetos. O **AWS Backup**
coordena cópias de **vários serviços** sob uma política única. Quando o
enunciado fala em exclusão acidental de objeto, é versionamento; quando fala em
padronizar cópias de serviços diferentes, é AWS Backup.
</Callout>

## Híbrido e migração

Duas opções tratam de dado que ainda não está na nuvem e vivem trocadas nas
alternativas. O **Storage Gateway** é permanente: fica no datacenter e dá ao
ambiente local acesso contínuo ao armazenamento da AWS, com os protocolos que a
equipe já usa. A **família Snow** é pontual: dispositivos físicos que a AWS envia
para mover um grande volume de dados quando a rede não dá conta. Contínuo aponta
Gateway, único aponta Snow.

## Como responder o cenário

Classifique o dado antes de ler as alternativas. Se a aplicação busca por chave e
não monta disco, é S3, e aí a pergunta seguinte é a classe, decidida pela
frequência de acesso. Se é o disco de uma instância, é EBS. Se várias instâncias
compartilham a mesma pasta, é EFS, ou FSx quando aparece compatibilidade de
sistema de arquivos. Se o problema é o datacenter falando com a nuvem todo dia, é
Storage Gateway. Se é uma mudança única de muitos dados, é Snow. E se o pedido é
política de cópia sobre vários serviços, é AWS Backup.
