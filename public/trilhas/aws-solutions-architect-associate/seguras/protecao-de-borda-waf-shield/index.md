# Proteção de borda: WAF, Shield e Firewall Manager

> O que protege a aplicação na borda e contra o quê: WAF filtra requisições HTTP por regra (injeção, bots, taxa por IP), Shield absorve DDoS na rede (Standard grátis, Advanced com resposta e proteção de custo) e Firewall Manager aplica os dois em várias contas. A prova cobra qual serviço para qual ataque.

Fonte: https://lumarys.com.br/trilhas/aws-solutions-architect-associate/seguras/protecao-de-borda-waf-shield/ · Lumarys (marca da Cernyn) · CC BY-NC-SA 4.0

## Em uma frase

**WAF** lê a requisição HTTP e bloqueia por regra; **Shield** absorve DDoS por
volume na rede (Standard grátis, Advanced com equipe e proteção de custo);
**Firewall Manager** aplica os dois em todas as contas. A prova pergunta qual
serviço para qual ataque e onde cada um se anexa.

## Dois ataques, dois serviços

A confusão que a prova explora é tratar WAF e Shield como a mesma coisa. Não
são, e a diferença está na **camada**:

<Comparativo
colunas={["", "WAF", "Shield Standard", "Shield Advanced"]}
linhas={[
["Camada", "7: conteúdo HTTP", "3 e 4: rede e transporte", "3, 4 e 7 com detecção avançada"],
["Contra o quê", "Injeção, XSS, bots, abuso por IP, geografia", "DDoS volumétrico comum (SYN flood, reflexão)", "DDoS grande e sofisticado"],
["Custo", "Por Web ACL, regra e requisição", "Gratuito, ativo em toda conta", "Assinatura mensal com compromisso"],
["Extras", "Regras gerenciadas, regra de taxa", "Nenhum", "Equipe de resposta 24x7, proteção contra custo do ataque, relatórios"],
["Quando é a resposta", "Enunciado fala em requisição, formulário, padrão, IP abusivo", "Nunca precisa ser 'escolhido': já está lá", "Enunciado exige equipe, reembolso ou proteção de EIP e Global Accelerator"]
]}
/>

<Termo nome="WAF">Web Application Firewall: inspeciona requisições HTTP e HTTPS e aplica regras de permitir, bloquear ou contar. Trabalha com Web ACLs anexadas a CloudFront, ALB, API Gateway, AppSync ou Cognito.</Termo>

<Termo nome="Shield">Proteção contra DDoS. O Standard é automático e gratuito; o Advanced acrescenta equipe de resposta, proteção contra o custo gerado pelo ataque e detecção mais fina.</Termo>

## Onde o WAF se anexa, e onde não

A segunda armadilha é de topologia. O WAF **não** vai em instância EC2 nem
em Network Load Balancer. Ele se anexa a:

- **CloudFront**, o ponto mais comum: protege na borda, antes de o tráfego
  chegar à região.
- **Application Load Balancer**.
- **API Gateway** (REST e HTTP).
- **AppSync** e **Cognito** (user pool).

Se o enunciado tem EC2 direto na internet e pede WAF, a resposta envolve pôr um
ALB ou um CloudFront na frente primeiro.

<Callout tipo="dica" titulo="Regra de taxa: o cenário mais repetido">
"Um mesmo IP faz milhares de requisições" não é DDoS de rede; é abuso na
camada 7. A resposta é a **regra de taxa** (rate-based) do WAF: bloqueia
sozinha quem passa de N requisições em 5 minutos e libera quando o volume cai.
Nada de NACL com lista de IPs, que é manual e envelhece.
</Callout>

## Regras gerenciadas: onde mora o "menor esforço"

O WAF aceita regras escritas à mão, mas a prova prefere os **grupos de regras
gerenciadas**: conjuntos mantidos pela AWS ou por parceiros para injeção de
SQL, XSS, bots conhecidos, IPs de má reputação e regras por linguagem ou
framework. Quando o enunciado diz "menor esforço operacional", a alternativa
com regras gerenciadas vence a alternativa com regras próprias.

## Firewall Manager: os dois em escala

<Termo nome="Firewall Manager">Serviço que aplica políticas de WAF, Shield Advanced, grupos de segurança e Network Firewall em todas as contas do Organizations, inclusive nas criadas depois.</Termo>

Cenário: "40 contas, todas as aplicações expostas precisam da mesma Web ACL,
inclusive as futuras". Config detecta; SCP não sabe o que é WAF; StackSets
cria mas não associa a recurso novo. O Firewall Manager faz os dois: cria e
associa, hoje e nas contas de amanhã.

<Callout tipo="atencao" titulo="O que a prova espera para 'DDoS com menor esforço'">
CloudFront na frente da aplicação. Ele já absorve tráfego na borda, esconde a
origem, e é onde WAF e Shield se aplicam no mesmo ponto. Muitos cenários de
proteção terminam com "colocar CloudFront na frente" como a alternativa que
resolve segurança e desempenho juntos.
</Callout>

## Como responder o cenário

Primeiro, **que tipo de ataque**: conteúdo de requisição (WAF), volume de
rede (Shield) ou abuso por cliente (regra de taxa no WAF)? Segundo, **onde o
serviço se anexa**: se não há CloudFront, ALB ou API Gateway, a alternativa
precisa criar um. Terceiro, **escala**: várias contas é Firewall Manager. E
lembre: grupo de segurança e NACL não leem HTTP; quando aparecem como resposta
para ataque de aplicação, são o distrator.
