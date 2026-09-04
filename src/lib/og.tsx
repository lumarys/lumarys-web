import { readFileSync } from "node:fs";
import { join } from "node:path";

import { ImageResponse } from "next/og";

import { EMPRESA } from "./company";

/**
 * Imagem de compartilhamento (Open Graph / Twitter) gerada no build, uma por
 * página. Roda só no servidor de build: lê as fontes do disco e devolve um
 * PNG estático que o export copia para `out/`.
 *
 * As fontes moram no repositório de propósito. O next/font baixa Sora e Inter
 * para a página, mas o renderizador de imagem precisa do arquivo bruto, e
 * buscar da internet no build tornaria o deploy dependente do Google Fonts.
 */

export const OG_TAMANHO = { width: 1200, height: 630 } as const;
export const OG_TIPO = "image/png";

const CORES = {
  bg: "#0B1220",
  surface: "#121B2E",
  border: "#26324D",
  accent: "#F5B83D",
  text: "#F4F1EA",
  text2: "#B8B3A7",
  muted: "#8F8B80",
} as const;

function fonte(arquivo: string): Buffer {
  return readFileSync(join(process.cwd(), "src", "assets", "fonts", arquivo));
}

/** Corta no limite sem partir palavra, para o título não vazar do quadro. */
export function encurtar(texto: string, limite: number): string {
  if (texto.length <= limite) return texto;
  const corte = texto.slice(0, limite);
  const ultimoEspaco = corte.lastIndexOf(" ");
  return `${corte.slice(0, ultimoEspaco > limite * 0.6 ? ultimoEspaco : limite).trimEnd()}…`;
}

export type ConteudoOg = {
  /** Linha pequena em caixa alta acima do título: origem da ementa, módulo… */
  rotulo?: string;
  titulo: string;
  subtitulo?: string;
  /** Etiquetas no rodapé: tempo, quantidade de temas, formato da prova. */
  etiquetas?: string[];
};

export function imagemOg({ rotulo, titulo, subtitulo, etiquetas = [] }: ConteudoOg) {
  const tituloCurto = encurtar(titulo, 70);
  const tamanhoTitulo = tituloCurto.length > 44 ? 56 : tituloCurto.length > 28 ? 66 : 76;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "64px 72px",
        background: CORES.bg,
        color: CORES.text,
        fontFamily: "Inter",
      }}
    >
      {/* Marca: o ponto de luz e o arco da trajetória, como no ícone. */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
          <path
            d="M10 40 C 14 20, 32 10, 48 14"
            stroke={CORES.accent}
            strokeWidth="5"
            strokeLinecap="round"
          />
          <circle cx="46" cy="14" r="8" fill={CORES.accent} />
          <circle cx="11" cy="42" r="3" fill={CORES.text} />
        </svg>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontFamily: "Sora", fontSize: 30, fontWeight: 700 }}>Lumarys</span>
          <span
            style={{
              fontSize: 14,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: CORES.muted,
            }}
          >
            {EMPRESA.tagline}
          </span>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {rotulo ? (
          <span
            style={{
              fontSize: 20,
              fontWeight: 600,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: CORES.accent,
            }}
          >
            {encurtar(rotulo, 60)}
          </span>
        ) : null}
        <span
          style={{
            fontFamily: "Sora",
            fontSize: tamanhoTitulo,
            fontWeight: 700,
            lineHeight: 1.1,
            letterSpacing: "-0.01em",
          }}
        >
          {tituloCurto}
        </span>
        {subtitulo ? (
          <span style={{ fontSize: 26, lineHeight: 1.4, color: CORES.text2 }}>
            {encurtar(subtitulo, 150)}
          </span>
        ) : null}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        <div style={{ display: "flex", gap: 10 }}>
          {etiquetas.slice(0, 4).map((e) => (
            <span
              key={e}
              style={{
                fontSize: 20,
                fontWeight: 600,
                padding: "10px 18px",
                borderRadius: 999,
                background: CORES.surface,
                border: `1px solid ${CORES.border}`,
                color: CORES.text2,
              }}
            >
              {e}
            </span>
          ))}
        </div>
        <span style={{ fontSize: 22, color: CORES.muted }}>lumarys.com.br</span>
      </div>
    </div>,
    {
      ...OG_TAMANHO,
      fonts: [
        { name: "Sora", data: fonte("sora-700.woff"), weight: 700, style: "normal" },
        { name: "Inter", data: fonte("inter-400.woff"), weight: 400, style: "normal" },
        { name: "Inter", data: fonte("inter-600.woff"), weight: 600, style: "normal" },
      ],
    },
  );
}
