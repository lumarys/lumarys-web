# CI/CD para dados e dashboards

> Por que pipeline de dados também merece integração e entrega contínuas: o que roda na verificação (lint de SQL, teste de transformação, dado de amostra), como promover uma mudança entre ambientes sem quebrar relatório, e o que fazer quando o que quebra não é o código, é o dado.

Fonte: https://lumarys.com.br/trilhas/engenharia-de-analytics/devops/cicd-para-dados-e-dashboards/ · Lumarys (marca da Cernyn) · CC BY-NC-SA 4.0

## Em uma frase

Mudança em modelo de dados é mudança em produção: precisa ser **construída
isolada**, **testada no código e no dado**, **promovida com o mesmo artefato**
e ter **caminho de volta** — que em dados significa reprocessar, não só
reverter.

## O que roda antes de aprovar

<Passos itens={[
"Construir os modelos num esquema isolado daquela mudança, com dado de amostra. Ninguém consome; falha não atinge consumidor.",
"Rodar os testes de dados: unicidade de chave, não nulo, conjunto de valores aceito, integridade entre modelos.",
"Rodar pelo menos um teste de negócio: o total do modelo bate com o total da origem.",
"Revisão por par, porque erro de regra de negócio nenhuma automação pega.",
"Quando o modelo alimenta um indicador, aprovação do dono daquele indicador."
]} />

<Callout tipo="atencao" titulo="O que diferencia dados de software comum">
No software, o código muda e o comportamento muda. Em dados, **o dado de
entrada muda sem uma linha sua mudar** — a coluna passa a vir nula, aparece
uma categoria nova, surge duplicata. Por isso a suíte tem duas metades: testes
de código e **testes de dado**. Sem a segunda, tudo fica verde e o relatório
fica errado.
</Callout>

## Promover entre ambientes

O mesmo artefato versionado avança: desenvolvimento, homologação, produção.
Cada ambiente com o próprio dado e as próprias credenciais. Não se reescreve
nada no caminho — reescrever é perder a garantia de que o que foi testado é o
que subiu.

<Callout tipo="dica" titulo="Dado de produção para desenvolver">
Só **mascarado ou amostrado**, com o mesmo controle de acesso do original.
Cópia crua de produção no ambiente de desenvolvimento é o vazamento mais
comum em times de dados, e a banca costuma cutucar exatamente isso.
</Callout>

## O dashboard faz parte do fluxo

Renomear uma coluna **passa** em todos os testes do modelo e **quebra** o
painel que referenciava o nome antigo. Por isso o fluxo inclui:

- **Linhagem** para descobrir quem consome antes de mudar.
- **Publicação em paralelo** com prazo, quando a mudança é incompatível, em vez
  de renomear em cima.
- **Aviso aos donos** dos painéis afetados, que a linhagem identificou.

É a mesma lógica dos contratos de dados, aplicada ao consumo final.

## Voltar atrás em dados

Reverter o código não conserta a tabela: o resultado errado **já está
gravado**. O caminho de volta em dados tem duas partes, e as duas precisam
existir antes de subir:

1. **Versionamento** da transformação, para saber ao que voltar.
2. **Capacidade de reprocessar** a partir da origem, para regravar o certo.

É por isso que preservar o dado cru na camada de entrada não é preciosismo: é
o que torna o rollback possível.

## Como responder isso em voz alta

Estruture pelo caminho da mudança: **impacto** (linhagem), **verificação**
(isolado, testes de código e de dado, teste de negócio), **aprovação** (par e
dono do indicador), **promoção** (mesmo artefato), **compatibilidade**
(paralelo com prazo) e **volta** (reprocessar). Quem cita o reprocessamento
mostra que já viu dado errado publicado.
