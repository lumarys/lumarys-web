import Link from "next/link";

import { Rotulo } from "@/components/ui/Card";
import { Recolhivel } from "@/components/ui/Recolhivel";

export type PerguntaDeAmostra = {
  moduloSlug: string;
  moduloTitulo: string;
  temaTitulo: string;
  href: string;
  enunciado: string;
  respostaModelo: string;
  rubrica: string[];
};

/**
 * Uma pergunta real de cada módulo, no HTML da página.
 *
 * O simulado é o diferencial anunciado na home e era invisível para quem
 * chegava de busca: a rota inteira estava fora do índice, e quem quisesse
 * decidir em dez minutos não via uma pergunta sequer. Isto é conteúdo
 * estático, renderizado no servidor — ler não cria progresso nenhum no
 * navegador, e é o que um buscador ou um agente consegue citar.
 */
export function AmostraPublica({ perguntas }: { perguntas: PerguntaDeAmostra[] }) {
  if (perguntas.length === 0) return null;

  return (
    <section aria-labelledby="amostra-simulado" className="flex flex-col gap-2.5">
      <div>
        <Rotulo>Amostra</Rotulo>
        <h2 id="amostra-simulado" className="font-display mt-1 text-lg font-semibold">
          Uma pergunta de cada módulo
        </h2>
        <p className="mt-1.5 text-[13px] leading-relaxed text-[var(--text-2)]">
          São perguntas do simulado, com a resposta-modelo e a rubrica de avaliação. Ler aqui não
          registra nada.
        </p>
      </div>

      {perguntas.map((p) => (
        <Recolhivel key={p.moduloSlug} titulo={p.enunciado} nota={p.moduloTitulo}>
          <Rotulo className="mb-1.5">Resposta-modelo</Rotulo>
          <p className="text-[15px] leading-relaxed">{p.respostaModelo}</p>

          <p className="mt-3.5 text-[13px] font-semibold">O que o avaliador espera</p>
          <ul className="mt-1.5 flex list-none flex-col gap-1.5 p-0">
            {p.rubrica.map((criterio, i) => (
              <li key={i} className="flex gap-2 text-[13px] leading-snug text-[var(--text-2)]">
                <span className="font-semibold text-[var(--accent)]">{i + 1}</span>
                <span>{criterio}</span>
              </li>
            ))}
          </ul>

          <Link href={p.href} className="mt-3 block text-[13px] no-underline">
            Estudar o tema: {p.temaTitulo}
          </Link>
        </Recolhivel>
      ))}
    </section>
  );
}
