# Computação: famílias EC2, containers e serverless

> A segunda decisão do Domínio 3: em que rodar. As famílias de instância EC2 e o que cada letra significa, quando Lambda e seus limites, e a escolha entre ECS e EKS com EC2 ou Fargate. A prova dá a pista no perfil da carga e na palavra sobre esforço operacional.

Fonte: https://lumarys.com.br/trilhas/aws-solutions-architect-associate/desempenho/computacao-ec2-containers-e-serverless/ · Lumarys (marca da Cernyn) · CC BY-NC-SA 4.0

## Em uma frase

A escolha de computação sai de duas leituras: o **perfil da carga** (CPU,
memória, GPU, armazenamento local) aponta a família da instância; a **forma da
carga** (intermitente ou contínua, curta ou longa) e a palavra sobre **esforço
operacional** decidem entre instância, container e serverless.

## As famílias, pela letra

<Comparativo
colunas={["Letra", "Privilegia", "Pista no enunciado"]}
linhas={[
["T", "Carga intermitente, com créditos de CPU", "'Baixo uso a maior parte do tempo', desenvolvimento, site pequeno"],
["M", "Equilíbrio entre CPU e memória", "Aplicação de propósito geral, servidor de aplicação"],
["C", "CPU", "Cálculo, codificação de mídia, jogo, lote intensivo"],
["R e X", "Memória", "Banco em memória, cache grande, análise que carrega tudo na RAM"],
["I e D", "Armazenamento local rápido", "Banco NoSQL de alta IOPS, data warehouse local"],
["G e P", "GPU", "Aprendizado de máquina, renderização, inferência"]
]}
/>

<Callout tipo="atencao" titulo="O crédito da família T">
Instâncias T acumulam crédito de CPU quando ociosas e gastam quando precisam de
mais. Sob carga **sustentada**, o crédito acaba e a instância é limitada — ou
cobra excedente no modo ilimitado. Quando o cenário descreve carga constante e
a alternativa oferece T pelo preço baixo, é distrator.
</Callout>

## Instância, container ou função

<Comparativo
colunas={["", "EC2", "Containers (ECS/EKS)", "Lambda"]}
linhas={[
["Você gerencia", "Sistema operacional e tudo acima", "A imagem e a definição da tarefa", "Só o código"],
["Duração", "Ilimitada", "Ilimitada", "Até 15 minutos"],
["Cobrança", "Por tempo ligado", "Por tarefa (Fargate) ou pela instância", "Por invocação e duração"],
["Escala", "Auto Scaling", "Serviço e Auto Scaling de tarefas", "Concorrência automática"],
["Pista", "Acesso ao SO, driver, licença, legado", "Já está em contêiner, microsserviços", "Evento, curto, intermitente, 'menor esforço'"]
]}
/>

O limite de **15 minutos** da Lambda é o detalhe que a prova usa para eliminar
a alternativa mais óbvia: o cenário descreve "sem servidor" e a duração passa do
teto, então a resposta é **Fargate**, não Lambda.

<Termo nome="Fargate">Modo de execução sem servidor para containers. Não é orquestrador: tanto o ECS quanto o EKS podem rodar suas tarefas em Fargate, deixando de gerenciar as instâncias que as hospedam.</Termo>

## ECS ou EKS

- **ECS**: orquestrador da própria AWS, mais simples, integrado a IAM,
  balanceador e CloudWatch sem tradução. É a resposta de **menor esforço**.
- **EKS**: Kubernetes gerenciado. Entra quando o enunciado cita **Kubernetes**,
  manifestos existentes, operadores ou portabilidade entre nuvens.

Sem menção a Kubernetes, escolher EKS é pagar complexidade que ninguém pediu —
e a prova trata isso como erro.

<Callout tipo="dica" titulo="Início a frio">
"A primeira chamada depois de um tempo parado é lenta" é o sintoma de **início
a frio** da Lambda, e a resposta é **concorrência provisionada**. Aumentar
memória reduz a duração, não o início a frio; migrar para EC2 resolve com
esforço que o enunciado não autorizou.
</Callout>

## Grupos de posicionamento

Aparecem pouco, mas quando aparecem são decisivos:

- **Cluster**: instâncias juntas na mesma zona, para latência mínima entre elas.
  É a resposta de computação de alto desempenho com nós conversando.
- **Spread**: instâncias em hardware distinto, para reduzir falha correlacionada.
  É resiliência, não desempenho.
- **Partition**: grupos isolados, para sistemas distribuídos grandes como HDFS
  e Cassandra.

Cluster e spread são opostos: um aproxima, o outro separa. O enunciado escolhe
pelo que pede, latência ou tolerância a falha.

## Como responder o cenário

Leia o **perfil** para a família e a **forma** para o modelo. Depois confira
dois tetos que eliminam alternativas sozinhos: 15 minutos na Lambda e créditos
na família T. Por fim, aplique a palavra: "menor esforço operacional" empurra
para Fargate e Lambda; "acesso ao sistema operacional" e "licença" puxam de
volta para EC2.
