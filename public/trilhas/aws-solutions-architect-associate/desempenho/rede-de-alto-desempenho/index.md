# Rede de alto desempenho e conectividade híbrida

> As peças que a prova usa quando o gargalo é a rede: Global Accelerator para melhorar o trajeto de tráfego não cacheável, Direct Connect para ligação dedicada ao data center, VPN como alternativa barata, Transit Gateway para muitas VPCs, e os grupos de posicionamento dentro da zona.

Fonte: https://lumarys.com.br/trilhas/aws-solutions-architect-associate/desempenho/rede-de-alto-desempenho/ · Lumarys (marca da Cernyn) · CC BY-NC-SA 4.0

## Em uma frase

Quando o gargalo é rede, a prova separa três perguntas: **melhorar o trajeto**
de quem vem de fora (Global Accelerator, e CloudFront quando há cache),
**ligar o data center** (Direct Connect ou VPN), e **conectar muitas redes**
(Transit Gateway em vez de peering).

## Global Accelerator e CloudFront: o par mais confundido

<Comparativo
colunas={["", "CloudFront", "Global Accelerator"]}
linhas={[
["O que faz", "Guarda conteúdo na borda", "Melhora o caminho até a aplicação"],
["Protocolo", "HTTP e HTTPS", "TCP e UDP"],
["Endereço", "Nome DNS da distribuição", "Dois IPs anycast estáticos"],
["Cacheia?", "Sim, é o ponto", "Não guarda nada"],
["Pista no enunciado", "Conteúdo estático, site, mídia, API cacheável", "UDP, jogo, VoIP, IP fixo global, conteúdo não cacheável"]
]}
/>

Os dois usam a rede da borda da AWS, e é por isso que confundem. A distinção
que decide a questão: **CloudFront guarda uma cópia da resposta**; **Global
Accelerator só melhora a estrada**. Tráfego que não pode ser cacheado —
sessão de jogo, protocolo binário, conteúdo personalizado por usuário — é do
Accelerator.

Ele também comuta entre regiões **mais rápido que o DNS**, porque o IP não
muda: não há TTL para esperar. Essa é a segunda pista, e liga este tema ao
Route 53 do Domínio 2.

## Ligar o data center: Direct Connect e VPN

<Termo nome="Direct Connect">Conexão dedicada entre o data center e a AWS, sem passar pela internet, com banda consistente e latência previsível. Provisão leva semanas ou meses, e não é criptografada por padrão.</Termo>

<Termo nome="VPN site a site">Túnel criptografado sobre a internet. Sobe em horas, custa pouco e herda a variabilidade da internet pública.</Termo>

<Comparativo
colunas={["Requisito do enunciado", "Resposta"]}
linhas={[
["'Em poucos dias', 'rapidamente'", "VPN"],
["'Banda consistente', 'latência previsível', 'terabytes por dia'", "Direct Connect"],
["'Criptografado em trânsito' sobre Direct Connect", "VPN por cima do Direct Connect (ou MACsec)"],
["'Sem ponto único de falha' no enlace", "Duas conexões Direct Connect, ou uma com VPN de contingência"]
]}
/>

<Callout tipo="atencao" titulo="Direct Connect não é criptografado">
É privado, e privado não é o mesmo que cifrado. Quando a política exige
criptografia em trânsito, a alternativa certa acrescenta uma VPN sobre o
enlace. "Confiar na criptografia nativa do Direct Connect" é uma premissa
falsa que aparece como distrator.
</Callout>

## Conectar muitas VPCs

Peering de VPC liga duas redes e **não é transitivo**: A com B e B com C não
faz A falar com C. Com N VPCs, o número de conexões cresce ao quadrado. A
partir de algumas redes, a resposta é **Transit Gateway**: cada VPC anexa uma
vez, o roteamento vira estrela, e tabelas de rotas segmentam quem fala com
quem — inclusive ligando as VPNs e o Direct Connect no mesmo lugar.

**PrivateLink** resolve outro problema: expor **um serviço** por IP privado,
sem conectar as redes. Quando o enunciado fala em consumir um serviço de outra
conta ou de um fornecedor, é PrivateLink; quando fala em redes que precisam se
comunicar, é Transit Gateway.

## Dentro da zona: posicionamento e rede aprimorada

- **Cluster**: instâncias próximas, para latência mínima e vazão máxima entre
  nós do mesmo cálculo.
- **Spread**: instâncias em hardware distinto, para reduzir falha correlacionada.
- **Partition**: grupos isolados, para sistemas distribuídos grandes.

Somados à **rede aprimorada** (ENA, e EFA para computação de alto desempenho),
fecham os cenários de comunicação interna. Cluster e spread respondem a
perguntas opostas: um quer velocidade entre os nós, o outro quer que eles não
caiam juntos.

<Callout tipo="dica" titulo="A rede também é custo">
Transferência entre zonas e saída para a internet são cobradas, e o NAT cobra
por GB. Muita decisão de rede que parece de desempenho reaparece no Domínio 4
como decisão de custo — endpoint de gateway em vez de NAT é o exemplo que
serve aos dois.
</Callout>

## Como responder o cenário

Pergunte se o tráfego **pode ser cacheado**: sim aponta CloudFront, não aponta
Global Accelerator. Para híbrido, leia o **prazo** e a **consistência de
banda**: pressa é VPN, volume e previsibilidade são Direct Connect, e
criptografia exige a VPN por cima. Para muitas redes, conte as VPCs: mais que
um punhado significa Transit Gateway. E dentro da zona, cluster para
aproximar, spread para separar.
