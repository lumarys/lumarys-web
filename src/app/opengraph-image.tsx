import { OG_TAMANHO, OG_TIPO, imagemOg } from "@/lib/og";
import { SITE } from "@/lib/seo";

export const dynamic = "force-static";
export const alt = "Lumarys — trilhas de estudo para provas, sabatinas e certificações";
export const size = OG_TAMANHO;
export const contentType = OG_TIPO;

/** Imagem padrão: vale para a landing e para toda página sem imagem própria. */
export default function Image() {
  return imagemOg({
    rotulo: "Trilhas de estudo",
    titulo: "Estude do jeito que a prova cobra",
    subtitulo: SITE.descricao,
    etiquetas: ["Vídeo em português", "Recall espaçado", "Simulado no formato real"],
  });
}
