"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { BotaoLink } from "@/components/ui/Botao";
import { Card, Rotulo, RotuloAcento } from "@/components/ui/Card";
import { useProgresso } from "@/features/progresso/useProgresso";
import { PerguntaObjetiva } from "@/features/quiz/PerguntaObjetiva";
import {
  APROVACAO,
  aprovado,
  montarCheckpoint,
  temasParaRevisar,
  type PerguntaDeCheckpoint,
} from "@/lib/checkpoint";
import { registrarCheckpoint } from "@/lib/storage";
import { formatarData, sementeDeTexto } from "@/lib/utils";
import type { Tema } from "@content/types";

export type TemaDoModulo = Pick<Tema, "slug" | "titulo" | "perguntas"> & { href: string };

/**
 * Verificação do módulo inteiro. O quiz do tema pergunta logo depois de ler,
 * quando a resposta ainda está na ponta da língua; o checkpoint pergunta dias
 * depois, misturando temas, que é o que a banca faz.
 *
 * Não bloqueia nada: 70% acende o selo do módulo, abaixo disso a tela diz
 * quais temas voltar a ver. Trancar o conteúdo de quem errou seria punir quem
 * mais precisa dele.
 */
export function Checkpoint({
  trilhaSlug,
  moduloSlug,
  moduloTitulo,
  temas,
  hrefDoModulo,
}: {
  trilhaSlug: string;
  moduloSlug: string;
  moduloTitulo: string;
  temas: TemaDoModulo[];
  hrefDoModulo: string;
}) {
  const { progresso, pronto } = useProgresso();
  const [iniciado, setIniciado] = useState(false);
  const [indice, setIndice] = useState(0);
  const [acertos, setAcertos] = useState(0);
  const [erradas, setErradas] = useState<number[]>([]);
  const [terminou, setTerminou] = useState(false);

  // Semente do slug: o mesmo módulo sorteia o mesmo checkpoint em qualquer
  // aparelho, e refazer não vira loteria de dificuldade.
  const perguntas = useMemo<PerguntaDeCheckpoint[]>(
    () => montarCheckpoint(temas, sementeDeTexto(moduloSlug)),
    [temas, moduloSlug],
  );

  const dados = progresso.trilhas[trilhaSlug];
  const anterior = dados?.checkpoints?.[moduloSlug];
  const concluidosNoModulo = temas.filter((t) => dados?.temasConcluidos[t.slug]).length;
  const href = (slug: string) => temas.find((t) => t.slug === slug)?.href ?? hrefDoModulo;

  if (perguntas.length === 0) {
    return (
      <Card>
        <p className="text-[15px] leading-relaxed">
          Este módulo ainda não tem perguntas objetivas suficientes para um checkpoint.
        </p>
      </Card>
    );
  }

  if (!pronto) {
    return <div className="h-40 animate-pulse rounded-2xl border border-[var(--border)]" />;
  }

  if (terminou) {
    const passou = aprovado(acertos, perguntas.length);
    const revisar = temasParaRevisar(perguntas, erradas);

    return (
      <div className="flex flex-col gap-3.5">
        <Card destaque={passou}>
          <RotuloAcento>{passou ? "Módulo fechado" : "Ainda não"}</RotuloAcento>
          <p className="font-display mt-2 text-3xl font-bold">
            {acertos}
            <span className="text-lg text-[var(--text-2)]">/{perguntas.length}</span>
          </p>
          <p className="mt-1.5 text-[15px] leading-relaxed">
            {passou
              ? "Acima dos 70%. O selo do módulo está aceso na trilha."
              : `Abaixo dos ${Math.round(APROVACAO * 100)}%. Nada fica trancado — o checkpoint só diz onde voltar.`}
          </p>
        </Card>

        {revisar.length > 0 ? (
          <Card>
            <Rotulo className="mb-2">Onde voltar</Rotulo>
            <ul className="flex list-none flex-col gap-2 p-0">
              {revisar.map((slug) => (
                <li key={slug}>
                  <Link
                    href={href(slug)}
                    className="flex min-h-11 items-center rounded-xl border border-[var(--border)] px-3.5 text-sm font-semibold no-underline"
                  >
                    {temas.find((t) => t.slug === slug)?.titulo ?? slug}
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        ) : null}

        <BotaoLink href={hrefDoModulo} variante="secundario">
          Voltar para a trilha
        </BotaoLink>
      </div>
    );
  }

  if (!iniciado) {
    return (
      <div className="flex flex-col gap-3.5">
        <Card destaque>
          <RotuloAcento>Checkpoint · {moduloTitulo}</RotuloAcento>
          <p className="mt-2 text-[15px] leading-relaxed">
            {perguntas.length} perguntas dos temas deste módulo, misturadas. Acertar{" "}
            {Math.round(APROVACAO * 100)}% fecha o módulo.
          </p>
          <p className="mt-2 text-[13px] leading-relaxed text-[var(--muted)]">
            É de propósito que elas venham fora do contexto do tema: responder logo depois de ler
            mede a memória de curto prazo, não o que ficou.
          </p>
        </Card>

        {anterior ? (
          <Card>
            <Rotulo className="mb-1.5">Sua última tentativa</Rotulo>
            <p className="text-[15px] leading-relaxed">
              {anterior.acertos} de {anterior.total}, em {formatarData(anterior.atualizadoEm)}.
              {aprovado(anterior.acertos, anterior.total) ? " Módulo fechado." : ""}
            </p>
          </Card>
        ) : null}

        {concluidosNoModulo < temas.length ? (
          <Card>
            <p className="text-[13px] leading-relaxed text-[var(--text-2)]">
              Você concluiu {concluidosNoModulo} de {temas.length} temas deste módulo. Dá para
              tentar assim mesmo — o checkpoint não checa presença.
            </p>
          </Card>
        ) : null}

        <button
          type="button"
          onClick={() => setIniciado(true)}
          className="min-h-13 rounded-xl bg-[var(--accent)] text-[15px] font-semibold text-[var(--accent-ink)]"
        >
          Começar o checkpoint
        </button>
      </div>
    );
  }

  const pergunta = perguntas[indice];
  if (!pergunta) return null;

  function conferir(certo: boolean) {
    if (certo) setAcertos((a) => a + 1);
    else setErradas((e) => [...e, indice]);
  }

  function avancar() {
    const final = indice + 1 >= perguntas.length;
    if (!final) {
      setIndice((i) => i + 1);
      return;
    }
    registrarCheckpoint(
      trilhaSlug,
      moduloSlug,
      acertos,
      perguntas.length,
      temasParaRevisar(perguntas, erradas),
    );
    setTerminou(true);
  }

  return (
    <PerguntaObjetiva
      key={indice}
      pergunta={pergunta}
      rotulo="Checkpoint"
      numero={indice + 1}
      total={perguntas.length}
      rodape={pergunta.temaTitulo}
      aoConferir={conferir}
      aoAvancar={avancar}
    />
  );
}
