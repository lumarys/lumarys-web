# Rede e conectividade na AWS

> VPC, sub-rede pública e privada, internet gateway e NAT, security group contra lista de controle de acesso de rede, VPN site a site, Direct Connect, PrivateLink e endpoints, e o Route 53 como DNS.

Fonte: https://lumarys.com.br/trilhas/aws-cloud-practitioner/tecnologia/rede-e-conectividade-na-aws/ · Lumarys (marca da Cernyn) · CC BY-NC-SA 4.0

## Em uma frase

A rede da AWS é uma **VPC** por região, dividida em sub-redes que são públicas ou
privadas conforme tenham ou não rota para a internet, protegidas por dois
firewalls em níveis diferentes e ligadas ao mundo de fora por três caminhos:
internet, túnel e enlace dedicado.

## Dentro da VPC

A **VPC** é a rede isolada da empresa dentro de uma região. Cada **sub-rede** fica
em uma zona de disponibilidade, e o que a torna pública é ter rota para o
**internet gateway**. Sem essa rota, ela é privada. Para que uma instância
privada consiga iniciar uma saída, sem aceitar conexões de fora, entra o
**gateway NAT**.

<Comparativo
colunas={["Componente", "O que é em uma linha", "A pista no enunciado"]}
linhas={[
["Amazon VPC", "Rede virtual isolada dentro de uma região", "Rede própria, faixa de endereços, isolamento"],
["Internet gateway", "Liga a VPC à internet, com entrada e saída", "Recurso que precisa ser alcançado pela internet"],
["Gateway NAT", "Saída para a internet iniciada de dentro, sem entrada", "Baixar atualização sem expor a instância"],
["Endpoint da VPC", "Acesso privado a serviços da AWS pela rede interna", "Falar com o S3 sem tráfego pela internet"],
["AWS PrivateLink", "Publica um serviço de forma privada dentro da rede", "Consumir serviço de outra conta sem expor à internet"],
["VPN site a site", "Túnel criptografado sobre a internet pública", "Ligar o escritório rápido, custo menor"],
["AWS Direct Connect", "Enlace dedicado até a AWS, fora da internet pública", "Banda consistente, conexão dedicada, tráfego sensível"],
["Amazon Route 53", "DNS gerenciado com roteamento e verificação de saúde", "Registrar domínio, resolver nome, direcionar visitante"]
]}
/>

## Os dois firewalls

<Comparativo
colunas={["Aspecto", "Security group", "Lista de controle de acesso de rede"]}
linhas={[
["Protege", "O recurso, como uma instância", "A sub-rede inteira"],
["Regras", "Só permitir", "Permitir e negar"],
["Avalia estado", "Sim: a resposta volta sem regra extra", "Não: é preciso regra de ida e de volta"],
["A pista", "Liberar porta para uma instância específica", "Bloquear um endereço para toda a sub-rede"]
]}
/>

<Callout tipo="dica" titulo="Duas perguntas prontas">
Para o par de firewalls, pergunte **o controle é do recurso ou da sub-rede**, e
lembre que só a lista sabe negar. Para o par de conectividade, pergunte **o
tráfego pode ir pela internet**: se pode, VPN basta e é mais rápida de montar;
se o enunciado pede dedicado, consistente ou fora da internet, é Direct Connect.
</Callout>

## Sair da VPC sem ir à internet

Duas peças aparecem quando o enunciado insiste em tráfego privado. O **endpoint
da VPC** alcança serviços da AWS pela rede interna, e é a resposta quando uma
instância privada precisa falar com o S3 sem sair para a internet. O
**PrivateLink** publica um serviço, seu ou de terceiro, de forma privada dentro
da rede, sem expor endereço público.

<Callout tipo="atencao" titulo="Route 53 não entrega conteúdo">
Ele traduz o nome em um endereço e pode escolher o destino por latência, por
região ou pela saúde do alvo. Quem entrega o arquivo perto do usuário é o
CloudFront. Enunciado com domínio e resolução aponta Route 53; enunciado com
imagem, vídeo ou site lento para quem está longe aponta CloudFront.
</Callout>

## Como responder o cenário

Localize primeiro a fronteira do problema. Se é dentro da VPC e fala de porta ou
endereço, escolha entre os dois firewalls com a pergunta do nível. Se é uma
instância privada querendo alcançar algo, decida entre NAT, para internet, e
endpoint, para serviço da AWS. Se é o datacenter falando com a AWS, decida entre
VPN e Direct Connect pela exigência de dedicado. E se aparece nome de domínio, a
resposta é Route 53, não CloudFront.
