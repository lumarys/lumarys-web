#!/usr/bin/env node
/**
 * Confere no oEmbed do YouTube que todo vídeo citado ainda existe e é público.
 * Roda no CI: vídeo removido derruba o build antes de o aluno achar um player
 * quebrado no meio do tema.
 */
import { lerTemas, sair } from "./_temas.mjs";

const temas = lerTemas();
const erros = [];
const avisos = [];
let checados = 0;

for (const { arquivo, dados } of temas) {
  for (const video of dados.videos ?? []) {
    checados++;
    const url = `https://www.youtube.com/oembed?url=${encodeURIComponent(
      `https://www.youtube.com/watch?v=${video.id}`,
    )}&format=json`;
    try {
      const resp = await fetch(url, { signal: AbortSignal.timeout(15_000) });
      if (!resp.ok) {
        erros.push(`${arquivo}: vídeo ${video.id} respondeu ${resp.status} (removido ou privado).`);
        continue;
      }
      const dado = await resp.json();
      if (video.canal && dado.author_name && !igual(dado.author_name, video.canal)) {
        avisos.push(
          `${arquivo}: canal de ${video.id} é "${dado.author_name}", o tema diz "${video.canal}".`,
        );
      }
    } catch (e) {
      erros.push(`${arquivo}: não consegui checar ${video.id} (${e.message}).`);
    }
  }
}

function igual(a, b) {
  const n = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
  return n(a) === n(b) || n(a).includes(n(b)) || n(b).includes(n(a));
}

sair(erros, avisos, `verify-videos (${checados} vídeo(s) em ${temas.length} tema(s))`);
