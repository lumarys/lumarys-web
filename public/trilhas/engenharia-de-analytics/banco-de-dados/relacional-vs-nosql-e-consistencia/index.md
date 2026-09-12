# Relacional e NoSQL: ACID, BASE e a escolha real

> A pergunta de fundamento que a banca usa para testar critério: o que ACID garante e o que se abre mão em BASE, o que o teorema CAP realmente diz, as famílias de NoSQL e por que a resposta quase nunca é 'NoSQL é melhor' nem 'relacional é seguro'.

Fonte: https://lumarys.com.br/trilhas/engenharia-de-analytics/banco-de-dados/relacional-vs-nosql-e-consistencia/ · Lumarys (marca da Cernyn) · CC BY-NC-SA 4.0

## Em uma frase

A escolha não é entre "antigo" e "moderno": é entre **impor correção a cada
instante** (ACID, relacional) e **priorizar disponibilidade aceitando
convergência** (BASE, muitos NoSQL) — e ela se faz por requisito, às vezes por
operação.

## ACID, letra por letra

<Comparativo
colunas={["Letra", "Garante", "Exemplo do que quebra sem ela"]}
linhas={[
["Atomicidade", "Tudo ou nada", "Débito sai e crédito não entra"],
["Consistência", "Estado válido antes e depois, pelas regras do banco", "Pedido apontando para cliente que não existe"],
["Isolamento", "Transações simultâneas não veem estados intermediários", "Dois saques leem o mesmo saldo e ambos passam"],
["Durabilidade", "O confirmado sobrevive a queda", "Servidor cai e a confirmação some"]
]}
/>

<Termo nome="BASE">Basically Available, Soft state, Eventually consistent. Prioriza responder sempre, aceitando que as réplicas fiquem temporariamente diferentes e convirjam depois.</Termo>

Não é ausência de garantia: é **outra** garantia. Para um contador de
visualizações, convergir em segundos é irrelevante. Para uma transferência, é
inaceitável. O critério é o dano que a janela de inconsistência causa.

## O teorema CAP, sem a versão errada

A frase popular — "escolha duas entre consistência, disponibilidade e
tolerância a partição" — engana. Em sistema distribuído, **partição de rede
acontece**: cabo cai, zona fica inalcançável. Tolerância a partição não é
escolha, é condição.

A escolha real aparece **durante** a partição:

<Passos itens={[
"O sistema continua respondendo, arriscando devolver dado desatualizado (prioriza disponibilidade).",
"Ou recusa a operação para não violar a consistência (prioriza consistência).",
"Fora da partição, os dois caminhos podem oferecer consistência forte; a diferença é o comportamento no incidente."
]} />

<Callout tipo="atencao" titulo="A repergunta que derruba">
Se você disser "escolhe duas das três", a banca pergunta: "e um sistema que
abre mão de tolerância a partição, como ele funciona?" A resposta honesta é
que ele não é distribuído. Formular pela partição evita a armadilha e mostra
que você entendeu, não decorou.
</Callout>

## As famílias, e o que cada uma resolve

<Comparativo
colunas={["Família", "Modelo", "Padrão de acesso que ela serve"]}
linhas={[
["Chave-valor", "Chave aponta para um valor opaco", "Buscar por identificador conhecido, em escala e baixa latência"],
["Documento", "JSON com campos indexáveis", "Entidade completa lida junta, com atributos que variam"],
["Colunar largo", "Linhas com colunas dinâmicas por família", "Escrita altíssima com leitura por faixa de chave"],
["Grafo", "Nós e arestas", "Percorrer relacionamentos a várias profundidades"]
]}
/>

O erro de vocabulário mais comum: **"NoSQL não tem esquema"**. O esquema
existe; ele só não é imposto pelo banco. Passa a viver no código e nos dados —
e, sem governança, vira esquema implícito e inconsistente, que é pior que o
declarado.

## Quando trocar de paradigma

Três condições juntas, não uma:

1. **Padrão de acesso conhecido e estável.** Em NoSQL você modela a partir da
   consulta. Sem saber como vai ler, a escolha de chave é chute.
2. **Escala que justifica.** Relacional escala bem verticalmente e com réplicas
   de leitura; nem todo problema de volume exige mudar de família.
3. **Tolerância a consistência eventual** naquele dado específico.

O que se abre mão é o que o relacional **impõe por você**: junção eficiente,
integridade referencial, transação entre entidades, consulta ad hoc que
ninguém previu. Isso não desaparece — migra para a aplicação.

<Callout tipo="dica" titulo="O que isso muda para quem entrega número">
Consistência eventual significa que uma réplica pode estar atrasada. Antes de
afirmar que dois relatórios divergem, confira **de que momento** é cada
leitura. É a mesma conversa de carimbo de corte, agora na camada do banco.
</Callout>

## Como responder isso em voz alta

Comece pelo requisito, não pelo rótulo: **o que precisa ser atômico**, **como
o dado é lido**, **quanto de atraso causa dano**. Dê um exemplo que atende e
um que não atende. E formule o CAP pela partição — é o detalhe que separa quem
entendeu de quem repetiu.
