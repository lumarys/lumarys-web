import { contarTemas, listarTrilhas, minutosDaTrilha, obterTrilha } from "@/lib/content";
import { OG_TAMANHO, OG_TIPO, imagemOg } from "@/lib/og";
import { formatarMinutos } from "@/lib/utils";

type Params = { trilha: string };

export const dynamic = "force-static";
export const size = OG_TAMANHO;
export const contentType = OG_TIPO;

export function generateStaticParams(): Params[] {
  return listarTrilhas().map((t) => ({ trilha: t.slug }));
}

export default async function Image({ params }: { params: Promise<Params> }) {
  const { trilha: slug } = await params;
  const trilha = obterTrilha(slug);
  if (!trilha) {
    return imagemOg({ titulo: "Lumarys" });
  }
  return imagemOg({
    rotulo: trilha.origem,
    titulo: trilha.titulo,
    subtitulo: trilha.resumo,
    etiquetas: [
      `${contarTemas(trilha)} temas`,
      formatarMinutos(minutosDaTrilha(trilha)),
      trilha.formatoProva,
    ],
  });
}
