"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Botao, classesDeBotao } from "@/components/ui/Botao";
import { Card, Rotulo, RotuloAcento } from "@/components/ui/Card";
import { Dialogo } from "@/components/ui/Dialogo";
import { BarraProgresso } from "@/components/ui/ProgressRing";
import { IconeCheck, IconeFechar } from "@/components/ui/icons";
import { formatarTempo } from "@/lib/cronometro";
import {
  corrigirProva,
  montarProva,
  segundosDeProva,
  type DominioDaProva,
  type QuestaoDeProva,
  type RespostasDaProva,
  type ResultadoDaProva,
} from "@/lib/prova";
import { registrarSimulado } from "@/lib/storage";
import { cx, embaralhar, sementeDeTexto } from "@/lib/utils";
import type { Exame } from "@content/types";

import { HistoricoSimulados } from "./HistoricoSimulados";

type Fase = "entrada" | "andamento" | "resultado";

/**
 * A prova de certificação como ela é: objetiva, cronometrada, sem gabarito
 * até o fim. É o oposto do simulado oral das trilhas de carreira — ali a nota
 * é da própria pessoa, pela rubrica; aqui há resposta certa.
 *
 * O resultado entra no mesmo histórico e na mesma prontidão que o simulado
 * oral: cada domínio do exame é um módulo, e a prova grava acertos por
 * domínio.
 */
export function ProvaSimulada({
  trilhaSlug,
  exame,
  dominios,
  banco,
}: {
  trilhaSlug: string;
  exame: Exame;
  dominios: DominioDaProva[];
  banco: QuestaoDeProva[];
}) {
  const [fase, setFase] = useState<Fase>("entrada");
  const [semente, setSemente] = useState(0);
  const [indice, setIndice] = useState(0);
  const [respostas, setRespostas] = useState<RespostasDaProva>({});
  const [marcadas, setMarcadas] = useState<Set<string>>(new Set());
  const [inicio, setInicio] = useState(0);
  const [agora, setAgora] = useState(0);
  const [confirmando, setConfirmando] = useState(false);
  const [resultado, setResultado] = useState<ResultadoDaProva | null>(null);

  const prova = useMemo(
    () => (semente ? montarProva(banco, dominios, exame.questoes, semente) : []),
    [banco, dominios, exame.questoes, semente],
  );
  const duracao = segundosDeProva(prova.length, exame.minutos, exame.questoes);
  const restante = Math.max(0, duracao - Math.floor((agora - inicio) / 1000));

  const entregar = useCallback(() => {
    const r = corrigirProva(prova, respostas, dominios, exame.notaCorte);
    setResultado(r);
    setFase("resultado");
    setConfirmando(false);
    // Só domínios que tiveram questão: os "em breve" não entram na prontidão
    // com zero de zero.
    const porModulo = Object.fromEntries(
      r.porDominio
        .filter((d) => d.total > 0)
        .map((d) => [d.slug, { nota: d.acertos, maximo: d.total }]),
    );
    if (Object.keys(porModulo).length > 0) registrarSimulado(trilhaSlug, { porModulo });
  }, [prova, respostas, dominios, exame.notaCorte, trilhaSlug]);

  // Relógio: um intervalo, e o tempo vem de Date.now — aba em segundo plano
  // não "ganha" segundos. Zerou, entrega sozinha: é assim na prova.
  //
  // A entrega automática mora dentro do tick, por uma ref, e não num efeito
  // que observa `restante`: chamar setState no corpo de um efeito dispara
  // renderização em cascata, e o compilador do React barra.
  const entregarRef = useRef(entregar);
  useEffect(() => {
    entregarRef.current = entregar;
  }, [entregar]);
  useEffect(() => {
    if (fase !== "andamento") return;
    const id = window.setInterval(() => {
      const t = Date.now();
      setAgora(t);
      if (duracao > 0 && t - inicio >= duracao * 1000) entregarRef.current();
    }, 1000);
    return () => window.clearInterval(id);
  }, [fase, inicio, duracao]);

  function comecar(instante: number) {
    setSemente(1 + Math.floor(Math.random() * 2 ** 30));
    setIndice(0);
    setRespostas({});
    setMarcadas(new Set());
    setInicio(instante);
    setAgora(instante);
    setResultado(null);
    setFase("andamento");
  }

  if (banco.length === 0) {
    return (
      <div className="px-5">
        <Card>
          <p className="text-[15px] leading-relaxed">
            Ainda não há questões publicadas para esta prova.
          </p>
        </Card>
      </div>
    );
  }

  if (fase === "entrada") {
    const tamanho = Math.min(
      exame.questoes,
      montarProva(banco, dominios, exame.questoes, 1).length,
    );
    return (
      <div className="flex flex-col gap-3.5 px-5">
        <Card destaque>
          <RotuloAcento>Prova simulada · {exame.codigo}</RotuloAcento>
          <p className="mt-2 text-[15px] leading-relaxed">
            {exame.questoes} questões em {exame.minutos} minutos, escolha única ou múltipla, sem
            gabarito até o fim. Nota na escala da AWS, de 100 a 1000; passa com {exame.notaCorte}.
          </p>
          {tamanho < exame.questoes ? (
            <p className="mt-2 text-[13px] leading-relaxed text-[var(--muted)]">
              O banco de hoje dá para {tamanho} questões, sorteadas pelo peso de cada domínio, com o
              tempo na mesma proporção:{" "}
              {Math.round(segundosDeProva(tamanho, exame.minutos, exame.questoes) / 60)} minutos. A
              prova cresce conforme os domínios são publicados.
            </p>
          ) : null}
          <p className="mt-2 text-[13px] leading-relaxed text-[var(--muted)]">
            Múltipla resposta só vale com o conjunto exato, sem crédito parcial. Em branco conta
            errada, e não há penalidade além dessa — na dúvida, marque.
          </p>
        </Card>

        <Botao onClick={() => comecar(Date.now())}>Começar a prova</Botao>

        <HistoricoSimulados
          trilhaSlug={trilhaSlug}
          titulosDeModulo={Object.fromEntries(dominios.map((d) => [d.slug, d.titulo]))}
        />
      </div>
    );
  }

  if (fase === "resultado" && resultado) {
    const erradas = prova.filter((q) => resultado.erradas.includes(q.id));
    return (
      <div className="flex flex-col gap-3.5 px-5">
        <Card destaque={resultado.aprovado}>
          <RotuloAcento>{resultado.aprovado ? "Aprovado" : "Abaixo do corte"}</RotuloAcento>
          <p className="font-display mt-2 text-4xl font-bold">
            {resultado.pontuacao}
            <span className="text-lg text-[var(--text-2)]">/1000</span>
          </p>
          <p className="mt-1.5 text-[13px] leading-relaxed text-[var(--text-2)]">
            {resultado.acertos} de {resultado.total} questões, {resultado.respondidas} respondidas.
            Corte em {exame.notaCorte}. A escala é uma aproximação linear — a AWS equaliza entre
            versões da prova e não publica a conta.
          </p>
        </Card>

        <Card>
          <Rotulo className="mb-2.5">Por domínio</Rotulo>
          <div className="flex flex-col gap-2.5">
            {resultado.porDominio
              .filter((d) => d.total > 0)
              .map((d) => (
                <div key={d.slug}>
                  <div className="flex items-baseline justify-between text-[13px]">
                    <span>{d.titulo}</span>
                    <span className="tabular-nums text-[var(--text-2)]">
                      {d.acertos}/{d.total}
                    </span>
                  </div>
                  <BarraProgresso
                    valor={Math.round((100 * d.acertos) / d.total)}
                    className="mt-1"
                  />
                </div>
              ))}
          </div>
        </Card>

        {erradas.length > 0 ? (
          <Card>
            <Rotulo className="mb-2.5">Revisar as {erradas.length} erradas</Rotulo>
            <ol className="flex list-none flex-col gap-4 p-0">
              {erradas.map((q) => (
                <li key={q.id} className="border-t border-[var(--border)] pt-3">
                  <p className="text-[14px] font-medium leading-snug">{q.enunciado}</p>
                  <ul className="mt-2 flex list-none flex-col gap-1.5 p-0">
                    {alternativasDe(q).map((alt, i) => {
                      const marcou = (respostas[q.id] ?? []).includes(i);
                      return (
                        <li
                          key={i}
                          className={cx(
                            "flex gap-2 rounded-lg px-2.5 py-1.5 text-[13px] leading-snug",
                            alt.correta && "bg-[var(--color-success)]/10",
                            !alt.correta && marcou && "bg-[var(--color-danger)]/10",
                          )}
                        >
                          <span className="mt-0.5 shrink-0">
                            {alt.correta ? (
                              <IconeCheck size={14} className="text-[var(--color-success)]" />
                            ) : marcou ? (
                              <IconeFechar size={14} className="text-[var(--color-danger)]" />
                            ) : (
                              <span className="block size-3.5" />
                            )}
                          </span>
                          <span>
                            {alt.texto}
                            <span className="mt-0.5 block text-[12px] text-[var(--text-2)]">
                              {alt.explicacao}
                            </span>
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                  <Link href={q.href} className="mt-2 inline-block text-[13px] no-underline">
                    Rever o tema: {q.temaTitulo}
                  </Link>
                </li>
              ))}
            </ol>
          </Card>
        ) : null}

        <Botao variante="secundario" onClick={() => setFase("entrada")}>
          Voltar ao início
        </Botao>
      </div>
    );
  }

  const q = prova[indice];
  if (!q) return null;
  const alternativas = alternativasDe(q);
  const marcadasNesta = respostas[q.id] ?? [];
  const quantasCorretas = q.alternativas.filter((a) => a.correta).length;
  const semResposta = prova.filter((p) => (respostas[p.id] ?? []).length === 0).length;

  function alternar(i: number) {
    setRespostas((r) => {
      const atual = r[q!.id] ?? [];
      if (q!.tipo === "unica") return { ...r, [q!.id]: [i] };
      return { ...r, [q!.id]: atual.includes(i) ? atual.filter((x) => x !== i) : [...atual, i] };
    });
  }

  return (
    <div className="flex flex-col gap-3.5 px-5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs text-[var(--muted)]">
          Questão {indice + 1} de {prova.length}
          {marcadas.has(q.id) ? " · marcada" : ""}
        </span>
        <span
          aria-label={`Tempo restante: ${formatarTempo(restante)}`}
          className={cx(
            "font-display text-sm font-semibold tabular-nums",
            restante < 300 ? "text-[var(--color-danger)]" : "text-[var(--text)]",
          )}
        >
          {formatarTempo(restante)}
        </span>
      </div>

      <div className="flex gap-0.5">
        {prova.map((p, i) => (
          <span
            key={p.id}
            className={cx(
              "h-1 flex-1 rounded-full",
              i === indice
                ? "bg-[var(--accent)]"
                : (respostas[p.id] ?? []).length > 0
                  ? "bg-[var(--text-2)]"
                  : "bg-[var(--elevated)]",
            )}
          />
        ))}
      </div>

      <Card>
        <p className="text-[15px] font-medium leading-snug">{q.enunciado}</p>
        <p className="mt-1.5 text-xs text-[var(--muted)]">
          {q.tipo === "multipla" ? `Escolha ${quantasCorretas}.` : "Escolha uma."}
        </p>
        <div className="mt-3 flex flex-col gap-2">
          {alternativas.map((alt, i) => {
            const marcada = marcadasNesta.includes(i);
            return (
              <button
                key={i}
                type="button"
                role={q.tipo === "multipla" ? "checkbox" : "radio"}
                aria-checked={marcada}
                onClick={() => alternar(i)}
                className={cx(
                  "min-h-11 rounded-xl border px-3.5 py-3 text-left text-sm leading-relaxed",
                  marcada
                    ? "border-[var(--accent)] bg-[var(--accent)]/10"
                    : "border-[var(--border)]",
                )}
              >
                {alt.texto}
              </button>
            );
          })}
        </div>
      </Card>

      <div className="flex gap-2">
        <Botao
          variante="secundario"
          className="flex-1"
          disabled={indice === 0}
          onClick={() => setIndice((i) => Math.max(0, i - 1))}
        >
          Anterior
        </Botao>
        <Botao
          variante="secundario"
          className="flex-1"
          onClick={() =>
            setMarcadas((m) => {
              const n = new Set(m);
              if (n.has(q.id)) n.delete(q.id);
              else n.add(q.id);
              return n;
            })
          }
        >
          {marcadas.has(q.id) ? "Desmarcar" : "Marcar"}
        </Botao>
        {indice + 1 < prova.length ? (
          <Botao className="flex-1" onClick={() => setIndice((i) => i + 1)}>
            Próxima
          </Botao>
        ) : (
          <Botao className="flex-1" onClick={() => setConfirmando(true)}>
            Entregar
          </Botao>
        )}
      </div>

      {indice + 1 < prova.length ? (
        <button
          type="button"
          onClick={() => setConfirmando(true)}
          className={classesDeBotao("fantasma", "min-h-11 self-center text-sm")}
        >
          Entregar agora
        </button>
      ) : null}

      <Dialogo
        aberto={confirmando}
        aoFechar={() => setConfirmando(false)}
        titulo="Entregar a prova"
      >
        <h2 className="font-display text-lg font-bold">Entregar a prova?</h2>
        <p className="mt-2 text-[15px] leading-relaxed text-[var(--text-2)]">
          {semResposta > 0
            ? `${semResposta} ${semResposta === 1 ? "questão está" : "questões estão"} em branco e ${semResposta === 1 ? "conta" : "contam"} como errada${semResposta === 1 ? "" : "s"}. Na prova real, chute vale mais que branco.`
            : "Todas respondidas. Depois de entregar não dá para voltar."}
        </p>
        <div className="mt-5 flex flex-col gap-2">
          <Botao onClick={entregar}>Entregar</Botao>
          <button
            type="button"
            onClick={() => setConfirmando(false)}
            className={classesDeBotao("fantasma")}
          >
            Continuar a prova
          </button>
        </div>
      </Dialogo>
    </div>
  );
}

/** A ordem de escrita vaza a resposta; embaralha por questão, estável. */
function alternativasDe(q: QuestaoDeProva) {
  return embaralhar(q.alternativas, sementeDeTexto(q.enunciado));
}
