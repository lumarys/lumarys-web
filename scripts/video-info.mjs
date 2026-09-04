#!/usr/bin/env node
/**
 * Dados de um vídeo do YouTube para preencher o frontmatter de um tema:
 *   node scripts/video-info.mjs <id> [<id> ...]
 * Imprime "id | canal | minutos | publicadoEm | título" ou "id | INDISPONIVEL".
 * Vídeo que não responder aqui não entra em tema nenhum.
 */
const ids = process.argv.slice(2);
if (ids.length === 0) {
  console.error("uso: node scripts/video-info.mjs <videoId> [...]");
  process.exit(1);
}

let falhas = 0;
for (const id of ids) {
  try {
    const oembed = await fetch(
      `https://www.youtube.com/oembed?url=${encodeURIComponent(
        `https://www.youtube.com/watch?v=${id}`,
      )}&format=json`,
      { signal: AbortSignal.timeout(15_000) },
    );
    if (!oembed.ok) {
      console.log(`${id} | INDISPONIVEL (${oembed.status})`);
      falhas++;
      continue;
    }
    const meta = await oembed.json();

    let minutos = "?";
    let publicadoEm = "?";
    try {
      const pagina = await fetch(`https://www.youtube.com/watch?v=${id}`, {
        headers: { "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)" },
        signal: AbortSignal.timeout(20_000),
      });
      const html = await pagina.text();
      const s = html.match(/"lengthSeconds":"(\d+)"/)?.[1];
      if (s) minutos = String(Math.max(1, Math.round(Number(s) / 60)));
      const data =
        html.match(/<meta itemprop="uploadDate" content="([^"]+)"/)?.[1] ??
        html.match(/"uploadDate":"([^"]+)"/)?.[1];
      if (data) publicadoEm = data.slice(0, 10);
    } catch {
      /* duração e data são conveniência; a existência do vídeo já foi provada acima */
    }

    console.log(`${id} | ${meta.author_name} | ${minutos} | ${publicadoEm} | ${meta.title}`);
  } catch (e) {
    console.log(`${id} | INDISPONIVEL (${e.message})`);
    falhas++;
  }
}
process.exit(falhas > 0 ? 1 : 0);
