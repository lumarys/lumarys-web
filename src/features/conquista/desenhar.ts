import type { Conquista } from "@/lib/conquista";

/**
 * Desenha o cartão de conquista num canvas, no navegador.
 *
 * Não dá para reaproveitar `lib/og.tsx` aqui: aquele gerador roda no build,
 * com Satori, e o que a conquista mostra só existe no aparelho da pessoa. O
 * canvas é o único jeito de virar imagem no cliente sem carregar biblioteca —
 * e a política de conteúdo do site não admite script de terceiro.
 *
 * As cores são as da marca (design/marca/README.md): fundo #0B1220, âmbar
 * #F5B83D, texto #F4F1EA. O cartão é sempre escuro, mesmo no tema claro: ele
 * sai do site e vai para uma linha do tempo, onde precisa parecer a marca.
 */

const LARGURA = 1200;
const ALTURA = 630;

const FUNDO = "#0B1220";
const AMBAR = "#F5B83D";
const TEXTO = "#F4F1EA";
const APAGADO = "#B8B3A7";
const BORDA = "#26324D";

export type DadosDoCartao = {
  trilhaTitulo: string;
  conquista: Conquista;
  /** "conquista" mostra o progresso; "certificado" só sai com os dois critérios. */
  tipo: "conquista" | "certificado";
  data: Date;
};

export async function desenharCartao(
  canvas: HTMLCanvasElement,
  dados: DadosDoCartao,
): Promise<void> {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  canvas.width = LARGURA;
  canvas.height = ALTURA;

  // Sem esperar as fontes, o primeiro desenho sai em serifada do sistema.
  await document.fonts.ready.catch(() => null);

  ctx.fillStyle = FUNDO;
  ctx.fillRect(0, 0, LARGURA, ALTURA);

  ctx.strokeStyle = BORDA;
  ctx.lineWidth = 2;
  ctx.strokeRect(32, 32, LARGURA - 64, ALTURA - 64);

  desenharMarca(ctx);

  const { conquista: c, tipo } = dados;
  const ehCertificado = tipo === "certificado";

  ctx.fillStyle = AMBAR;
  ctx.font = "600 22px Sora, system-ui, sans-serif";
  ctx.fillText(ehCertificado ? "CERTIFICADO DE CONCLUSÃO" : "MEU PROGRESSO", 72, 210);

  ctx.fillStyle = TEXTO;
  ctx.font = "700 58px Sora, system-ui, sans-serif";
  quebrar(ctx, dados.trilhaTitulo, 72, 285, LARGURA - 200, 66);

  // Uma linha aqui, e não um vazio: sem ela o cartão tinha um buraco de 150px
  // entre o título e os números.
  ctx.fillStyle = APAGADO;
  ctx.font = "400 26px Inter, system-ui, sans-serif";
  ctx.fillText(
    ehCertificado
      ? "Trilha concluída com simulado oral aprovado"
      : "Estudo ativo: ler, responder, revisar e simular",
    72,
    390,
  );

  const numeros: [string, string][] = ehCertificado
    ? [
        [`${c.totalTemas}`, "temas concluídos"],
        [`${c.notaSimulado ?? 0}%`, "no simulado oral"],
        [`${c.prontidao}%`, "de prontidão"],
      ]
    : [
        [`${c.temasConcluidos}/${c.totalTemas}`, "temas"],
        [`${c.prontidao}%`, "de prontidão"],
        [`${c.sequencia}`, c.sequencia === 1 ? "dia seguido" : "dias seguidos"],
      ];

  numeros.forEach(([valor, rotulo], i) => {
    const x = 72 + i * 360;
    ctx.fillStyle = AMBAR;
    ctx.font = "700 64px Sora, system-ui, sans-serif";
    ctx.fillText(valor, x, 490);
    ctx.fillStyle = APAGADO;
    ctx.font = "400 22px Inter, system-ui, sans-serif";
    ctx.fillText(rotulo, x, 526);
  });

  ctx.fillStyle = APAGADO;
  ctx.font = "400 20px Inter, system-ui, sans-serif";
  const data = new Intl.DateTimeFormat("pt-BR", { dateStyle: "long" }).format(dados.data);
  ctx.fillText(data, 72, 568);

  ctx.textAlign = "right";
  ctx.fillText("lumarys.com.br", LARGURA - 72, 568);
  ctx.textAlign = "left";
}

/** O símbolo da marca: o arco e o ponto de luz, nas proporções do SVG. */
function desenharMarca(ctx: CanvasRenderingContext2D) {
  ctx.save();
  ctx.translate(72, 84);
  ctx.scale(1.1, 1.1);

  ctx.strokeStyle = AMBAR;
  ctx.lineWidth = 5;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(10, 40);
  ctx.bezierCurveTo(14, 20, 32, 10, 48, 14);
  ctx.stroke();

  ctx.fillStyle = AMBAR;
  ctx.beginPath();
  ctx.arc(46, 14, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.fillStyle = TEXTO;
  ctx.font = "600 34px Sora, system-ui, sans-serif";
  ctx.fillText("Lumarys", 150, 122);
}

/** Quebra o título em linhas para não vazar do cartão. */
function quebrar(
  ctx: CanvasRenderingContext2D,
  texto: string,
  x: number,
  y: number,
  largura: number,
  entrelinha: number,
) {
  const palavras = texto.split(" ");
  let linha = "";
  let altura = y;

  for (const palavra of palavras) {
    const teste = linha ? `${linha} ${palavra}` : palavra;
    if (ctx.measureText(teste).width > largura && linha) {
      ctx.fillText(linha, x, altura);
      linha = palavra;
      altura += entrelinha;
    } else {
      linha = teste;
    }
  }
  if (linha) ctx.fillText(linha, x, altura);
}

/** O canvas vira PNG. Devolve null quando o navegador recusa. */
export function paraArquivo(canvas: HTMLCanvasElement, nome: string): Promise<File | null> {
  return new Promise((resolver) => {
    canvas.toBlob((blob) => {
      resolver(blob ? new File([blob], nome, { type: "image/png" }) : null);
    }, "image/png");
  });
}
