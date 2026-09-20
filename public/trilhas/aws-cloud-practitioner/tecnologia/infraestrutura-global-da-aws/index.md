# A infraestrutura global da AWS

> Regiões, zonas de disponibilidade, Local Zones, Wavelength, Outposts e edge locations; CloudFront, Route 53 e Global Accelerator no nível de para que serve; e os quatro critérios que decidem em qual região implantar.

Fonte: https://lumarys.com.br/trilhas/aws-cloud-practitioner/tecnologia/infraestrutura-global-da-aws/ · Lumarys (marca da Cernyn) · CC BY-NC-SA 4.0

## Em uma frase

A infraestrutura global é uma hierarquia de lugares, da **região** à **zona de
disponibilidade** e à **edge location**, e quase toda questão do tema se resolve
identificando em qual desses níveis está o problema descrito.

## Região, zona e borda

A **região** é a área geográfica, isolada das outras, e é onde se decide
residência de dados, preço e quais serviços estão disponíveis. Dentro dela, a
**zona de disponibilidade** é um ou mais datacenters com energia, refrigeração e
rede próprias, separados o bastante para não caírem juntos e perto o bastante
para responderem rápido entre si. A **edge location** não fica nesse mesmo
tabuleiro: é um ponto de presença para entregar conteúdo e resolver DNS perto de
quem acessa.

<Callout tipo="dica" titulo="A regra que resolve metade das questões">
Falha de datacenter se resolve com **mais zonas**. Falha de região inteira se
resolve com **mais regiões**. Lentidão de entrega de arquivo se resolve na
**borda**. Antes de olhar as alternativas, decida em qual desses três níveis
está o problema do enunciado.
</Callout>

## O catálogo da borda e dos lugares especiais

<Comparativo
colunas={["Serviço ou peça", "O que é em uma linha", "A pista no enunciado"]}
linhas={[
["Região", "Área geográfica com várias zonas de disponibilidade", "Residência de dados, país, preço, serviço disponível"],
["Zona de disponibilidade", "Datacenters isolados dentro de uma região", "Resistir à falha de um datacenter sem sair da região"],
["Edge location", "Ponto de presença para conteúdo em cache e DNS", "Entregar arquivo rápido a quem está longe"],
["Amazon CloudFront", "Rede de entrega de conteúdo sobre as edge locations", "Imagem, vídeo, site estático, latência de download"],
["AWS Global Accelerator", "Caminho otimizado pela rede da AWS, com endereços fixos", "TCP e UDP, sem conteúdo para cache, endereço de entrada fixo"],
["Amazon Route 53", "DNS gerenciado com registro de domínio e roteamento", "Resolver nome, rotear por latência, por região ou por saúde"],
["AWS Local Zones", "Extensão da região perto de um grande centro urbano", "Usuários de uma cidade específica, poucos milissegundos"],
["AWS Wavelength", "Infraestrutura da AWS na rede de operadoras móveis", "Aplicação para dispositivos 5G"],
["AWS Outposts", "Rack da AWS instalado no datacenter do cliente", "Dado que não pode sair do prédio, mesmas APIs da AWS"]
]}
/>

## Escolher a região

A prova costuma perguntar por que uma empresa escolheria uma região e não outra,
e a resposta esperada combina quatro critérios: **latência** até os usuários,
**residência de dados** e exigência legal, **preço**, que varia por região, e
**disponibilidade do serviço**, porque nem todo serviço existe em toda região.
Quando o enunciado cita lei ou país, o critério é residência de dados. Quando
cita tempo de resposta, é latência.

Escolher **mais de uma** região é outra pergunta, e o guia lista quatro motivos:
**recuperação de desastre**, **continuidade de negócio**, **latência baixa** para
usuários espalhados por continentes diferentes e **soberania de dados**, quando a
lei obriga a manter o dado dentro de um país. Nenhum desses quatro se resolve
com zonas de disponibilidade a mais dentro da mesma região.

<Callout tipo="atencao" titulo="CloudFront não é Global Accelerator">
Os dois aceleram, e por isso aparecem juntos. O CloudFront **guarda uma cópia**
do conteúdo perto do usuário e brilha com arquivo estático. O Global Accelerator
**encurta o caminho** até a aplicação e brilha com tráfego que não dá para
guardar, como uma API interativa ou um jogo. Sem conteúdo em cache no enunciado,
é Global Accelerator.
</Callout>

## Como responder o cenário

Localize o nível antes do serviço. Se o problema é um datacenter, a resposta tem
zona de disponibilidade. Se é a região inteira, a resposta tem uma segunda
região. Se é lentidão para quem está longe, olhe se há conteúdo a guardar: com
conteúdo é CloudFront, sem conteúdo é Global Accelerator. Se o dado não pode
sair do prédio, é Outposts. Se o usuário está em uma cidade e a exigência é
latência mínima, é Local Zone. E se o enunciado fala em lei ou país, a decisão é
a escolha da região.
