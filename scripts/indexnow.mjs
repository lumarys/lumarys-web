#!/usr/bin/env node
/**
 * Avisa Bing e Yandex sobre as URLs publicadas. O Google não usa IndexNow;
 * para ele vale o sitemap declarado no robots.txt.
 *   node scripts/indexnow.mjs <chave>
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const chave = process.argv[2];
if (!chave) {
  console.error("uso: node scripts/indexnow.mjs <chave>");
  process.exit(1);
}

const host = "lumarys.com.br";
const sitemap = join(process.cwd(), "out", "sitemap.xml");

if (!existsSync(sitemap)) {
  console.error("out/sitemap.xml não existe; rode o build antes.");
  process.exit(1);
}

const urls = [...readFileSync(sitemap, "utf8").matchAll(/<loc>([^<]+)<\/loc>/g)]
  .map((m) => m[1])
  .slice(0, 10_000);

const resposta = await fetch("https://api.indexnow.org/IndexNow", {
  method: "POST",
  headers: { "content-type": "application/json; charset=utf-8" },
  body: JSON.stringify({
    host,
    key: chave,
    keyLocation: `https://${host}/${chave}.txt`,
    urlList: urls,
  }),
  signal: AbortSignal.timeout(20_000),
});

console.log(`IndexNow: ${resposta.status} para ${urls.length} URL(s).`);
process.exit(resposta.ok || resposta.status === 202 ? 0 : 1);
