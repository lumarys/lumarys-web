import { localizarTema, todasAsRotasDeTema } from "@/lib/content";
import { OG_TAMANHO, OG_TIPO, imagemOg } from "@/lib/og";
import { formatarMinutos } from "@/lib/utils";

type Params = { trilha: string; modulo: string; tema: string };

export const dynamic = "force-static";
export const size = OG_TAMANHO;
export const contentType = OG_TIPO;

export function generateStaticParams(): Params[] {
  return todasAsRotasDeTema();
}

export default async function Image({ params }: { params: Promise<Params> }) {
  const { trilha, tema } = await params;
  const local = localizarTema(trilha, tema);
  if (!local) {
    return imagemOg({ titulo: "Lumarys" });
  }
  return imagemOg({
    rotulo: `${local.trilha.titulo} · ${local.modulo.titulo}`,
    titulo: local.tema.titulo,
    subtitulo: local.tema.resumo,
    etiquetas: [
      formatarMinutos(local.tema.minutos),
      `${local.tema.videos.length} vídeo${local.tema.videos.length > 1 ? "s" : ""}`,
      `${local.tema.flashcards.length} cards`,
    ],
  });
}
