# Cache e entrega de conteúdo: CloudFront, ElastiCache e DAX

> Onde pôr cache para resolver latência e carga: CloudFront na borda para conteúdo que viaja pela internet, ElastiCache (Redis ou Memcached) entre a aplicação e o banco, DAX na frente do DynamoDB. A prova cobra qual camada resolve o sintoma descrito e a diferença entre Redis e Memcached.

Fonte: https://lumarys.com.br/trilhas/aws-solutions-architect-associate/desempenho/cache-e-entrega-de-conteudo/ · Lumarys (marca da Cernyn) · CC BY-NC-SA 4.0

## Em uma frase

Cache resolve latência e carga ao mesmo tempo, e a questão é **em que camada**:
**CloudFront** na borda para o que vai até o cliente, **ElastiCache** entre
aplicação e banco, **DAX** só para o DynamoDB.

## A camada certa para o sintoma

<Comparativo
colunas={["Sintoma no enunciado", "Camada", "Serviço"]}
linhas={[
["Usuários distantes reclamam de lentidão para carregar o site", "Borda", "CloudFront"],
["O banco relacional está com CPU alta por consultas repetidas", "Dados", "ElastiCache"],
["Leituras do DynamoDB precisam ficar em microssegundos", "Banco", "DAX"],
["Tráfego não HTTP precisa de caminho de rede melhor e IP fixo", "Rede", "Global Accelerator (não é cache)"]
]}
/>

O erro que a prova procura é trocar as duas primeiras linhas. CloudFront não
alivia consulta feita por dentro da aplicação; ElastiCache não encurta a
distância física até um usuário do outro lado do mundo.

<Callout tipo="dica" titulo="CloudFront não é só estático">
Ele também acelera conteúdo **dinâmico** e requisições não cacheáveis, porque o
trecho entre a borda e a origem trafega pela rede da AWS, mais estável que a
internet pública. Quando o enunciado diz "API lenta para usuários
internacionais", CloudFront continua sendo resposta plausível.
</Callout>

## Redis ou Memcached

<Comparativo
colunas={["", "Redis", "Memcached"]}
linhas={[
["Estruturas de dados", "Listas, conjuntos, conjuntos ordenados, hash", "Só chave e valor"],
["Persistência", "Sim", "Não"],
["Réplicas e failover", "Sim, com Multi-AZ", "Não"],
["Multithread", "Limitado", "Sim"],
["Pista no enunciado", "Sessão que não pode se perder, ranking, pub/sub, alta disponibilidade", "Cache simples de objeto, escalar horizontalmente, usar vários núcleos"]
]}
/>

A regra prática: se o enunciado mencionar **qualquer** requisito além de
guardar e devolver um valor — persistir, replicar, ordenar, publicar — é Redis.

<Termo nome="DAX">Cache em memória gerenciado, exclusivo do DynamoDB, compatível com a mesma API. Reduz leituras de milissegundos para microssegundos sem alterar o código da aplicação.</Termo>

O "sem alterar o código" é a frase que a prova usa para separar DAX de
ElastiCache num cenário de DynamoDB: com ElastiCache você teria de escrever a
lógica de cache.

## Estratégias, e o dado velho

Cache sem política de validade produz resposta errada, que é pior que resposta
lenta. Duas estratégias caem:

- **Lazy loading** (cache-aside): busca no banco só quando falta no cache. Gasta
  pouco, e o dado pode ficar velho até expirar.
- **Write-through**: escreve no cache a cada escrita no banco. Cache sempre
  atualizado, ao custo de latência e de guardar dado que talvez ninguém leia.

As duas dependem de **TTL**. O cenário "usuários veem informação desatualizada"
tem sempre a mesma resposta: TTL adequado mais invalidação ou atualização nas
escritas críticas. Aumentar o cluster e trocar de motor são distratores.

No CloudFront, o equivalente é **invalidação** de caminho — e a prática melhor,
que a prova reconhece, é **versionar o nome do arquivo**, evitando invalidação e
conteúdo velho de uma vez.

## Como responder o cenário

Pergunte **quem está esperando**: um usuário na internet (borda) ou a própria
aplicação (dados). Depois, **qual banco**: DynamoDB puxa DAX, relacional puxa
ElastiCache. Se for ElastiCache, procure qualquer requisito além de chave e
valor para decidir Redis. E se o sintoma for dado desatualizado, a resposta é
política de validade, não mais infraestrutura.
