# Estratégias de recuperação de desastres: RTO, RPO e as quatro opções

> O eixo que organiza o fim do Domínio 2: RTO é quanto tempo você pode ficar parado, RPO é quanto dado pode perder, e as quatro estratégias (backup e restauração, luz-piloto, espera morna e multissítio) são pontos numa reta entre custo baixo e recuperação rápida. A prova dá os números e espera a escolha.

Fonte: https://lumarys.com.br/trilhas/aws-solutions-architect-associate/resilientes/estrategias-de-recuperacao-de-desastres/ · Lumarys (marca da Cernyn) · CC BY-NC-SA 4.0

## Em uma frase

**RTO** é quanto tempo você aceita ficar parado; **RPO** é quanto dado aceita
perder. As quatro estratégias são pontos numa reta: quanto menores os dois
números, mais caro. A questão dá os números e espera a opção **mais barata que
os atende**.

## Os dois números, sem trocar um pelo outro

<Termo nome="RTO">Recovery Time Objective: o tempo máximo aceitável entre o desastre e o serviço de volta. Olha para a frente.</Termo>

<Termo nome="RPO">Recovery Point Objective: o ponto no passado a que se volta — na prática, quanto trabalho se perde. Olha para trás.</Termo>

Uma forma de nunca trocar: RPO é definido pela **frequência da cópia** (backup
de hora em hora dá RPO de uma hora; replicação contínua dá RPO de segundos).
RTO é definido pelo **quanto já está de pé** na região secundária.

## As quatro estratégias

<Comparativo
colunas={["Estratégia", "O que fica na secundária", "RTO típico", "RPO típico", "Custo"]}
linhas={[
["Backup e restauração", "Só cópias: backups e imagens", "Horas", "Horas", "O menor"],
["Luz-piloto", "O núcleo de dados replicado; aplicação desligada", "Dezenas de minutos", "Minutos", "Baixo"],
["Espera morna", "Ambiente reduzido rodando de verdade", "Minutos", "Segundos a minutos", "Médio"],
["Multissítio", "Ambiente completo atendendo tráfego", "Perto de zero", "Perto de zero", "O maior"]
]}
/>

A distinção que mais confunde é entre as duas do meio:

- **Luz-piloto**: o dado está replicado e vivo; a aplicação **não está
  rodando**. No desastre, você liga a partir de imagens e modelos prontos.
- **Espera morna**: existe um ambiente **funcionando**, menor que o de
  produção, que talvez já receba uma fatia do tráfego. No desastre, você
  **escala** o que já está lá.

Ligar leva mais tempo que escalar; daí a diferença de RTO e de custo.

<Callout tipo="atencao" titulo="A prova pune resposta acima do requisito">
Quando o enunciado diz "RTO de 4 horas" e pede o **menor custo**, multissítio
está errado mesmo atendendo. O padrão da questão é dar dois números e várias
alternativas que funcionam; a certa é a mais barata que cabe nos dois.
</Callout>

## O que mais precisa existir na outra região

Replicar o banco é a parte visível. O RTO estoura no teste por causa do resto:

<Passos itens={[
"Imagens (AMI) e modelos de lançamento atualizados, não os de seis meses atrás.",
"Rede pronta: VPC, sub-redes em mais de uma zona, grupos de segurança, endpoints.",
"Identidade e configuração: papéis do IAM, segredos no Secrets Manager, parâmetros.",
"Limites de serviço suficientes na região secundária para subir a capacidade inteira.",
"O caminho do tráfego: zona do Route 53 com failover e verificações prontas, ou Global Accelerator."
]} />

## As peças de replicação

- **AWS Backup**: plano central com agendamento, retenção e **cópia entre
  regiões e contas**, cobrindo EBS, RDS, DynamoDB, EFS, S3 e FSx. É a resposta
  de "menor esforço" quando o cenário tem vários tipos de recurso.
- **S3 com replicação entre regiões**: assíncrona, exige versionamento nos dois
  buckets.
- **Banco**: cópia de snapshot entre regiões para RPO de horas; réplica de
  leitura ou Aurora Global Database para RPO de minutos ou menos; tabela global
  do DynamoDB para ativo em várias regiões.
- **Comutação**: Route 53 com failover e verificação de integridade, lembrando
  que o **TTL** entra no RTO; Global Accelerator quando a comutação precisa ser
  mais rápida que o DNS permite.

<Callout tipo="dica" titulo="Disponibilidade não é DR">
Multi-AZ, Auto Scaling entre zonas e réplicas na mesma região protegem contra
falhas **dentro** da região. Nenhum deles ajuda se a região inteira cair. Quando
a alternativa oferece Multi-AZ para um requisito de desastre regional, ela está
trocando de problema — e é o distrator mais comum deste tema.
</Callout>

## Como responder o cenário

Extraia os dois números do enunciado. Use o RPO para decidir o **mecanismo de
dados** (backup periódico, réplica contínua, ativo em várias regiões) e o RTO
para decidir **quanto fica ligado** na secundária. Depois aplique a palavra:
com "menor custo", desça a reta até a última opção que ainda cabe nos dois
números. E confira se a alternativa fala em falha de **região**: se ela oferece
Multi-AZ, está respondendo outra pergunta.
