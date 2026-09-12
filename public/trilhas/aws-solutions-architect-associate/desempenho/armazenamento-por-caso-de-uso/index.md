# Armazenamento por caso de uso: S3, EBS, EFS e FSx

> A primeira decisão do Domínio 3: objeto, bloco ou arquivo. S3 para objeto e suas classes por padrão de acesso, EBS para disco de uma instância e seus tipos, EFS para arquivo compartilhado entre Linux, FSx para Windows e para cargas de alto desempenho.

Fonte: https://lumarys.com.br/trilhas/aws-solutions-architect-associate/desempenho/armazenamento-por-caso-de-uso/ · Lumarys (marca da Cernyn) · CC BY-NC-SA 4.0

## Em uma frase

Antes de falar de desempenho, a prova pergunta **que tipo de armazenamento**:
bloco (EBS) para o disco de uma instância, arquivo (EFS, FSx) para várias
instâncias ao mesmo tempo, objeto (S3) para dado acessado por API. Depois vem a
segunda camada: qual classe e qual tipo.

## Os três tipos, e o que os separa

<Comparativo
colunas={["", "Bloco (EBS)", "Arquivo (EFS, FSx)", "Objeto (S3)"]}
linhas={[
["Como é acessado", "Disco cru, com sistema de arquivos por cima", "Montado por NFS ou SMB", "API por chave"],
["Quantas instâncias", "Uma (Multi-Attach é exceção)", "Muitas, simultâneas", "Ilimitadas, por rede"],
["Escopo", "Zona", "Região (EFS atravessa zonas)", "Região"],
["Cresce sozinho?", "Não: você redimensiona", "Sim, elástico", "Sim, sem limite prático"],
["Caso típico", "Disco de sistema, banco em EC2", "Diretório compartilhado, conteúdo de aplicação", "Mídia, backup, data lake, site estático"]
]}
/>

A pergunta que resolve a maioria dos cenários: **quantas instâncias precisam
escrever ao mesmo tempo?** Uma, é EBS. Várias, é EFS (Linux) ou FSx (Windows).
Nenhuma, porque o acesso é por API, é S3.

<Callout tipo="atencao" titulo="A pista de SMB e Active Directory">
EFS fala **NFS**, ou seja, Linux. Quando o enunciado cita **SMB**, **Windows**
ou **Active Directory**, a resposta é **FSx for Windows File Server**, e a
alternativa com EFS é o distrator. Para alto desempenho de HPC e aprendizado
de máquina com dados no S3, é **FSx for Lustre**.
</Callout>

## EBS: escolher o tipo pelo que o enunciado exige

<Comparativo
colunas={["Tipo", "Mídia", "Para que", "Pista no enunciado"]}
linhas={[
["gp3", "SSD", "Uso geral, com IOPS e vazão configuráveis", "Padrão; 'bom desempenho com custo equilibrado'"],
["io1 e io2", "SSD", "IOPS provisionada alta e latência consistente", "'IOPS sustentadas', banco crítico, durabilidade maior"],
["st1", "HDD", "Vazão sequencial", "Log, big data, varredura, custo por GB baixo"],
["sc1", "HDD", "Acesso raro, o mais barato", "'Dado frio em bloco'"]
]}
/>

O erro comum é subir para io2 sem necessidade: o **gp3** já permite configurar
IOPS e vazão **independentes do tamanho** do volume, o que resolve a maioria
dos casos por menos dinheiro. io2 entra quando o número exigido é alto demais
ou quando o enunciado fala em durabilidade de banco crítico.

<Callout tipo="dica" titulo="O gargalo que muda de lugar">
Um volume io2 com 40.000 IOPS não entrega nada se a instância não tiver banda
até o EBS. Cenários de banco exigente pedem **as duas coisas**: o tipo de
volume certo e um tipo de instância otimizado para EBS. Em múltipla resposta,
essa é a segunda alternativa correta.
</Callout>

## S3: a classe segue o padrão de acesso

<Comparativo
colunas={["Classe", "Acesso", "Custo de armazenamento", "Quando é a resposta"]}
linhas={[
["Standard", "Frequente, imediato", "Maior", "Dado quente"],
["Intelligent-Tiering", "Automático", "Standard, com taxa de monitoramento", "Padrão desconhecido ou variável, sem gestão manual"],
["Standard-IA", "Raro, imediato", "Menor", "Dado raro que ainda precisa responder na hora"],
["One Zone-IA", "Raro, imediato, uma zona", "Menor ainda", "Dado raro e recriável"],
["Glacier Instant", "Raro, milissegundos", "Baixo", "Arquivo que às vezes é consultado na hora"],
["Glacier Flexible", "Minutos a horas", "Muito baixo", "Arquivamento com alguma urgência eventual"],
["Deep Archive", "Horas", "O menor", "Retenção legal de anos, quase nunca lida"]
]}
/>

Três pegadinhas de custo aparecem nas questões: **mínimo de dias faturados**
(30 nas IA, 90 e 180 nas de arquivamento), **tamanho mínimo por objeto** e
**custo de recuperação**. Por isso dado pequeno e volátil sai **mais caro** numa
classe fria — a economia por GB é engolida pelos mínimos.

E a regra que fecha quase todo cenário de custo de armazenamento: **ciclo de
vida**. "Frequente nos primeiros 30 dias e raro depois" nunca é resolvido
escolhendo uma classe só; é resolvido com uma transição automática.

## Como responder o cenário

Comece pelo tipo: **quantas instâncias escrevem juntas**. Depois pelo sistema
operacional, se for arquivo: Linux é EFS, Windows é FSx. Se for S3, leia o
**padrão de acesso** e o **tempo tolerado na recuperação**: os dois juntos
apontam a classe, e "muda com o tempo" aponta ciclo de vida. Se for EBS, leia
o **número de IOPS** e a palavra de custo antes de subir para io2.
