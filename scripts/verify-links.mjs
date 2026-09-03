#!/usr/bin/env node
/**
 * Confere que os artigos citados respondem. Domínios fora da allowlist são
 * recusados: conteúdo de terceiro entra por curadoria, não por acaso.
 */
import { lerTemas, sair } from "./_temas.mjs";

const PERMITIDOS = [
  "learn.microsoft.com",
  "docs.databricks.com",
  "www.databricks.com",
  "docs.aws.amazon.com",
  "aws.amazon.com",
  "spark.apache.org",
  "hadoop.apache.org",
  "delta.io",
  "iceberg.apache.org",
  "kafka.apache.org",
  "airflow.apache.org",
  "docs.getdbt.com",
  "www.devmedia.com.br",
  "medium.com",
  "www.alura.com.br",
  "blog.dsacademy.com.br",
  "cetax.com.br",
  "www.ibm.com",
  "cloud.google.com",
  "www.gov.br",
  "www.planalto.gov.br",
  "en.wikipedia.org",
  "pt.wikipedia.org",
  "www.oreilly.com",
  "martinfowler.com",
  "www.datamesh-architecture.com",
  "brains.dev",
  "www.sas.com",
  "www.datacamp.com",
  "learn.microsoft.com",
  "azure.microsoft.com",
  "www.redhat.com",
  "www.snowflake.com",
  "estuary.dev",
  "www.confluent.io",
  "debezium.io",
  "greatexpectations.io",
  "www.montecarlodata.com",
  "openlineage.io",
];

const temas = lerTemas();
const erros = [];
const avisos = [];
let checados = 0;

for (const { arquivo, dados } of temas) {
  for (const artigo of dados.artigos ?? []) {
    checados++;
    let host;
    try {
      host = new URL(artigo.url).hostname;
    } catch {
      erros.push(`${arquivo}: URL inválida "${artigo.url}".`);
      continue;
    }
    const permitido = PERMITIDOS.some((d) => host === d || host.endsWith(`.${d}`));
    if (!permitido) {
      erros.push(`${arquivo}: domínio ${host} não está na allowlist de artigos.`);
      continue;
    }
    try {
      const resp = await fetch(artigo.url, {
        method: "GET",
        redirect: "follow",
        headers: { "user-agent": "Mozilla/5.0 (compatible; LumarysLinkCheck/1.0)" },
        signal: AbortSignal.timeout(20_000),
      });
      if (resp.status >= 400) avisos.push(`${arquivo}: ${artigo.url} respondeu ${resp.status}.`);
    } catch (e) {
      avisos.push(`${arquivo}: ${artigo.url} não respondeu (${e.message}).`);
    }
  }
}

sair(erros, avisos, `verify-links (${checados} artigo(s))`);
