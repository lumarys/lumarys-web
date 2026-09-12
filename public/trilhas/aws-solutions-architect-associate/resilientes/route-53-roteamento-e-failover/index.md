# Route 53: políticas de roteamento e failover

> Como o DNS vira mecanismo de resiliência e de desempenho na prova: as políticas de roteamento (simples, failover, ponderada, latência, geolocalização, geoproximidade, multivalor), as verificações de integridade que as alimentam, e o registro de alias que aponta para recursos da AWS sem custo.

Fonte: https://lumarys.com.br/trilhas/aws-solutions-architect-associate/resilientes/route-53-roteamento-e-failover/ · Lumarys (marca da Cernyn) · CC BY-NC-SA 4.0

## Em uma frase

O Route 53 decide **para onde** o nome resolve, e essa decisão vira desempenho
(latência, geolocalização) ou resiliência (failover, verificação de
integridade). A pista da questão está sempre numa frase do enunciado.

## As sete políticas, pela frase que as denuncia

<Comparativo
colunas={["Política", "Decide por", "Frase típica do enunciado"]}
linhas={[
["Simples", "Nada: devolve o que está lá", "'Apenas apontar o domínio'"],
["Failover", "Saúde do primário", "'Se o principal falhar, usar o de contingência'"],
["Ponderada", "Proporção configurada", "'Enviar 10% para a nova versão'"],
["Latência", "Latência medida por usuário", "'A região que responder mais rápido'"],
["Geolocalização", "Origem geográfica da consulta", "'Usuários do Brasil veem o site em português'"],
["Geoproximidade", "Distância, com viés ajustável", "'Deslocar parte do tráfego de uma região para outra'"],
["Multivalor", "Vários registros saudáveis", "'Devolver vários endereços, checando cada um'"]
]}
/>

Os pares que a prova confunde de propósito:

- **Latência × geolocalização.** A primeira é desempenho medido; a segunda é
  regra por território. Um usuário no Chile pode ter latência menor para a
  região dos Estados Unidos que para a do Brasil, e a política de latência vai
  mandá-lo para lá. A de geolocalização, não.
- **Geolocalização × geoproximidade.** A primeira responde "de onde você vem";
  a segunda calcula distância até os recursos e deixa você **deslocar** o
  limite com um viés, para tirar carga de uma região.
- **Ponderada × failover.** Peso divide tráfego o tempo todo; failover manda
  tudo para um lado até ele cair.

## Verificação de integridade: o que torna DNS resiliente

<Termo nome="verificação de integridade do Route 53">Teste periódico, feito de vários pontos do mundo, contra um endereço, um alarme do CloudWatch ou outras verificações combinadas. Registros associados a uma verificação que falha deixam de ser devolvidos.</Termo>

Três tipos caem:

- **De endpoint**: testa um IP ou nome, com protocolo e caminho configuráveis.
- **De alarme do CloudWatch**: usa o estado de um alarme, útil quando a saúde é
  uma métrica interna e não uma porta aberta.
- **Calculada**: combina outras verificações com lógica ("saudável se pelo menos
  duas das três estiverem"), para representar a saúde de um sistema composto.

<Callout tipo="atencao" titulo="Failover sem verificação não é failover">
A política de failover só age porque uma verificação de integridade reprovou o
primário. Alternativa que configura failover e não menciona verificação
descreve algo que nunca vai comutar. O mesmo vale para latência e ponderada
"com queda automática": é a verificação associada a cada registro que produz a
queda.
</Callout>

## O TTL manda no tempo de recuperação

Resolvedores guardam a resposta pelo tempo do **TTL**. Enquanto ele não expira,
o cliente vai ao destino antigo, mesmo que o Route 53 já tenha mudado de
opinião. O tempo total de um failover de DNS é, portanto:

<Passos itens={[
"Detecção: intervalo da verificação de integridade vezes o número de falhas exigidas.",
"Troca: o Route 53 passa a devolver o secundário, quase imediatamente.",
"Propagação: cada resolvedor só pergunta de novo quando o TTL da resposta em cache expira."
]} />

Por isso a dupla de respostas para "demorou demais a comutar": **baixar o TTL**
e **apertar a verificação de integridade**. Aumentar o TTL é o distrator, e ele
aparece com frequência.

## Alias: o registro que resolve a raiz

<Termo nome="registro de alias">Registro exclusivo do Route 53 que aponta para um recurso da AWS (ELB, CloudFront, site em S3, API Gateway) pelo nome do serviço, funciona na raiz da zona e não é cobrado por consulta.</Termo>

O padrão DNS proíbe CNAME no ápice da zona, e o IP de um balanceador muda. A
combinação dessas duas restrições é o que torna o alias a única resposta para
"apontar exemplo.com.br diretamente para o balanceador".

<Callout tipo="dica" titulo="DNS não é balanceador">
Roteamento multivalor devolve até oito endereços saudáveis e deixa o cliente
escolher. Não conhece carga, não conhece capacidade e não repõe nada. Quando a
questão pede distribuição de carga de verdade, a resposta é um balanceador; o
Route 53 entra para escolher a **região**, não a instância.
</Callout>

## Como responder o cenário

Ache a frase que descreve a intenção: **proporção** (ponderada), **mais
rápido** (latência), **de onde vem** (geolocalização), **se cair** (failover).
Depois confirme que a alternativa cita a **verificação de integridade** quando
há queda automática, e cheque o **TTL** se a questão falar em tempo. Por fim,
se o alvo é um recurso da AWS e o nome é a raiz do domínio, é **alias**.
