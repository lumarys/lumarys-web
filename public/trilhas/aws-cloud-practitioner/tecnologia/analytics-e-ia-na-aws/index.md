# Analytics, IA e machine learning

> Athena, Glue, QuickSight, Kinesis, EMR, OpenSearch e Data Exchange no lado de dados; SageMaker, Rekognition, Lex, Polly, Transcribe, Translate, Comprehend, Textract, Bedrock e Q no lado de IA; cada um posicionado pelo caso de uso.

Fonte: https://lumarys.com.br/trilhas/aws-cloud-practitioner/tecnologia/analytics-e-ia-na-aws/ · Lumarys (marca da Cernyn) · CC BY-NC-SA 4.0

## Em uma frase

Este tema tem muitos nomes e pouca profundidade: a prova pede **qual serviço
faz aquilo**, e as alternativas erradas são sempre o serviço vizinho. A saída é
decorar cada um por uma linha de função e pela palavra do enunciado que o chama.

## O lado dos dados

<Comparativo
colunas={["Serviço", "O que é em uma linha", "A pista no enunciado"]}
linhas={[
["Amazon Athena", "Consulta em SQL sobre dados no Amazon S3", "Consultar o arquivo onde ele está, sem carregar em banco"],
["AWS Glue", "Prepara, transforma e cataloga dados em lote", "Extrair, transformar, carregar, catálogo de dados"],
["Amazon QuickSight", "Painéis e visualização para a área de negócio", "Painel, gráfico, relatório visual para a diretoria"],
["Amazon Kinesis", "Coleta e processa dados em tempo real", "Streaming, clique, sensor, evento conforme acontece"],
["Amazon EMR", "Big data com ferramentas como Spark e Hadoop", "Citar essas ferramentas ou processamento distribuído"],
["Amazon OpenSearch", "Busca e análise sobre logs e texto", "Pesquisar dentro de logs, painel de busca"],
["AWS Data Exchange", "Catálogo de conjuntos de dados de terceiros", "Obter dado de fora da empresa"]
]}
/>

<Callout tipo="dica" titulo="Athena, Glue e QuickSight na mesma frase">
Os três aparecem juntos porque formam uma sequência. O **Glue** arruma e
cataloga o dado, o **Athena** consulta, o **QuickSight** mostra. Se o verbo do
enunciado é **preparar**, é Glue; se é **consultar com SQL**, é Athena; se é
**mostrar em painel**, é QuickSight.
</Callout>

## O lado da inteligência artificial

Aqui a regra é simples: se existe um serviço pronto para o pedido, a resposta é
ele, e não o SageMaker. O **SageMaker** entra quando a empresa quer construir e
treinar um modelo próprio com dados dela.

<Comparativo
colunas={["Serviço", "O que faz em uma linha", "A pista no enunciado"]}
linhas={[
["Amazon SageMaker", "Construir, treinar e implantar modelos próprios", "Modelo próprio, treinar com os dados da empresa"],
["Amazon Rekognition", "Analisa imagem e vídeo", "Foto, vídeo, reconhecer objeto, cena ou rosto"],
["Amazon Textract", "Extrai texto e campos de documentos digitalizados", "Documento escaneado, formulário, nota, apólice"],
["Amazon Comprehend", "Entende texto: sentimento, entidades, assunto", "Avaliar comentários, classificar texto, satisfação"],
["Amazon Transcribe", "Transforma voz em texto", "Transcrever ligação, gerar legenda de áudio"],
["Amazon Polly", "Transforma texto em voz", "Ler em voz alta, narrar conteúdo"],
["Amazon Translate", "Traduz texto entre idiomas", "Publicar conteúdo em outro idioma"],
["Amazon Lex", "Constrói interfaces de conversa", "Chatbot, assistente de voz, atendimento automático"],
["Amazon Bedrock", "Acesso a modelos de base para IA generativa", "Construir aplicação de IA generativa sobre modelos prontos"],
["Amazon Q", "Assistente pronto para o trabalho do dia a dia", "Assistente que responde sobre o ambiente ou o código"]
]}
/>

<Callout tipo="atencao" titulo="O trio que mais troca de lugar">
**Rekognition**, **Textract** e **Comprehend** vivem juntos nas alternativas
porque os três analisam alguma coisa. Fixe a entrada de cada um: Rekognition
olha **imagem e vídeo**, Textract lê **documento digitalizado**, Comprehend
interpreta **texto que já é texto**.
</Callout>

## Como responder o cenário

Primeiro decida o lado: o pedido é sobre **dados** ou sobre **inteligência
artificial**. No lado dos dados, identifique a etapa pelo verbo: preparar é
Glue, consultar é Athena, mostrar é QuickSight, receber em tempo real é Kinesis,
processar com Spark ou Hadoop é EMR, procurar dentro de log é OpenSearch. No
lado da inteligência artificial, identifique a entrada: imagem e vídeo é
Rekognition, documento digitalizado é Textract, texto é Comprehend, voz virando
texto é Transcribe, texto virando voz é Polly, idioma é Translate, conversa é
Lex. E só escolha SageMaker quando o enunciado disser, com todas as letras, que
a empresa vai treinar um modelo próprio.
