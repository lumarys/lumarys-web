"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { Card, Rotulo, RotuloAcento } from "@/components/ui/Card";
import { BarraProgresso } from "@/components/ui/ProgressRing";
import { IconeFechar } from "@/components/ui/icons";
import { Gravador } from "./Gravador";
import { registrarSimulado } from "@/lib/storage";
import { cx, embaralhar } from "@/lib/utils";

export type PerguntaSimulado = {
  id: string;
  moduloSlug: string;
  moduloTitulo: string;
  temaSlug: string;
  temaTitulo: string;
  href: string;
  enunciado: string;
  respostaModelo: string;
  rubrica: string[];
};

const NOTA_MAXIMA = 5;

/**
 * Sabatina simulada: uma pergunta por vez, resposta em voz alta, resposta-modelo
 * depois e autoavaliação por rubrica. A nota é do próprio aluno de propósito —
 * ler a rubrica e comparar com o que você falou é onde o aprendizado acontece.
 */
export function Simulado({
  trilhaSlug,
  trilhaTitulo,
  perguntas,
  moduloInicial,
  quantidadePadrao = 8,
}: {
  trilhaSlug: string;
  trilhaTitulo: string;
  perguntas: PerguntaSimulado[];
  moduloInicial?: string;
  quantidadePadrao?: number;
}) {
  const [modulo, setModulo] = useState<string>(moduloInicial ?? "todos");
  const [iniciado, setIniciado] = useState(false);
  // Semente fixa por montagem: o mesmo simulado não reembaralha a cada render.
  const [semente] = useState(() => Math.floor(Math.random() * 2 ** 31));
  const [indice, setIndice] = useState(0);
  const [revelado, setRevelado] = useState(false);
  const [notas, setNotas] = useState<Record<string, number>>({});
  const [terminou, setTerminou] = useState(false);

  const modulos = useMemo(() => {
    const mapa = new Map<string, string>();
    for (const p of perguntas) mapa.set(p.moduloSlug, p.moduloTitulo);
    return [...mapa.entries()].map(([slug, titulo]) => ({ slug, titulo }));
  }, [perguntas]);

  const selecionadas = useMemo(() => {
    const base = modulo === "todos" ? perguntas : perguntas.filter((p) => p.moduloSlug === modulo);
    return embaralhar(base, semente).slice(0, quantidadePadrao);
  }, [modulo, perguntas, semente, quantidadePadrao]);

  if (perguntas.length === 0) {
    return (
      <div className="px-5">
        <Card>
          <p className="text-[15px] leading-relaxed">
            Ainda não há perguntas de sabatina publicadas nesta trilha.
          </p>
        </Card>
      </div>
    );
  }

  if (!iniciado) {
    return (
      <div className="flex flex-col gap-3.5 px-5">
        <Card destaque>
          <RotuloAcento>Sabatina simulada</RotuloAcento>
          <p className="mt-2 text-[15px] leading-relaxed">
            {selecionadas.length} perguntas, uma por vez. Responda <strong>em voz alta</strong>,
            como faria na sala. Depois compare com a resposta-modelo e se avalie pela rubrica.
          </p>
          <p className="mt-2 text-[13px] leading-relaxed text-[var(--muted)]">
            Estruture assim: contexto, opções, trade-offs, recomendação.
          </p>
        </Card>

        <div>
          <Rotulo className="mb-2">Escopo</Rotulo>
          <div className="flex flex-wrap gap-2">
            <BotaoEscopo ativo={modulo === "todos"} onClick={() => setModulo("todos")}>
              Trilha inteira
            </BotaoEscopo>
            {modulos.map((m) => (
              <BotaoEscopo key={m.slug} ativo={modulo === m.slug} onClick={() => setModulo(m.slug)}>
                {m.titulo}
              </BotaoEscopo>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIniciado(true)}
          className="min-h-13 rounded-xl bg-[var(--accent)] text-[15px] font-semibold text-[var(--accent-ink)]"
        >
          Começar simulado
        </button>
      </div>
    );
  }

  const pergunta = selecionadas[indice];

  if (terminou || !pergunta) {
    const porModulo = new Map<string, { titulo: string; nota: number; maximo: number }>();
    for (const p of selecionadas) {
      const atual = porModulo.get(p.moduloSlug) ?? { titulo: p.moduloTitulo, nota: 0, maximo: 0 };
      atual.nota += notas[p.id] ?? 0;
      atual.maximo += NOTA_MAXIMA;
      porModulo.set(p.moduloSlug, atual);
    }
    const somaNota = [...porModulo.values()].reduce((a, m) => a + m.nota, 0);
    const somaMax = [...porModulo.values()].reduce((a, m) => a + m.maximo, 0);

    return (
      <div className="flex flex-col gap-3.5 px-5">
        <Card destaque>
          <RotuloAcento>Resultado</RotuloAcento>
          <p className="font-display mt-2 text-3xl font-bold">
            {somaNota}
            <span className="text-lg text-[var(--text-2)]">/{somaMax}</span>
          </p>
          <p className="mt-1.5 text-[13px] leading-relaxed text-[var(--text-2)]">
            Autoavaliação por rubrica. O número importa menos que os critérios que você não
            cumpriu.
          </p>
        </Card>

        <Card>
          <Rotulo className="mb-2.5">Por módulo</Rotulo>
          <div className="flex flex-col gap-2">
            {[...porModulo.entries()].map(([slug, m]) => {
              const pct = m.maximo ? Math.round((m.nota / m.maximo) * 100) : 0;
              return (
                <div key={slug} className="flex items-center gap-2.5">
                  <span className="w-28 shrink-0 truncate text-xs text-[var(--text-2)]">
                    {m.titulo}
                  </span>
                  <BarraProgresso
                    valor={pct}
                    cor={pct >= 70 ? "var(--color-success)" : pct >= 40 ? "var(--accent)" : "var(--color-danger)"}
                    className="flex-1"
                  />
                  <span className="w-8 shrink-0 text-right text-xs text-[var(--text-2)]">{pct}%</span>
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <Rotulo className="mb-2">Temas a revisar</Rotulo>
          <ul className="flex list-none flex-col gap-1.5 p-0">
            {selecionadas
              .filter((p) => (notas[p.id] ?? 0) < 4)
              .map((p) => (
                <li key={p.id}>
                  <Link href={p.href} className="text-sm no-underline">
                    {p.temaTitulo}
                  </Link>
                </li>
              ))}
            {selecionadas.every((p) => (notas[p.id] ?? 0) >= 4) ? (
              <li className="text-sm text-[var(--text-2)]">
                Nada abaixo de 4. Refaça em outro dia com escopo maior.
              </li>
            ) : null}
          </ul>
        </Card>

        <Link
          href={`/trilhas/${trilhaSlug}/`}
          className="flex min-h-12 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-sm font-semibold no-underline"
        >
          Voltar para a trilha
        </Link>
      </div>
    );
  }

  function avaliar(nota: number) {
    if (!pergunta) return;
    const atualizadas = { ...notas, [pergunta.id]: nota };
    setNotas(atualizadas);

    if (indice + 1 >= selecionadas.length) {
      const porModulo: Record<string, { nota: number; maximo: number }> = {};
      for (const p of selecionadas) {
        const atual = porModulo[p.moduloSlug] ?? { nota: 0, maximo: 0 };
        porModulo[p.moduloSlug] = {
          nota: atual.nota + (atualizadas[p.id] ?? 0),
          maximo: atual.maximo + NOTA_MAXIMA,
        };
      }
      registrarSimulado(trilhaSlug, { porModulo });
      setTerminou(true);
      return;
    }
    setIndice((i) => i + 1);
    setRevelado(false);
  }

  return (
    <div className="flex flex-col gap-3.5 px-5">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setTerminou(true)}
          className="inline-flex min-h-11 items-center gap-2 pr-2 text-xs text-[var(--muted)]"
        >
          <IconeFechar size={20} /> Encerrar
        </button>
        <span className="text-xs text-[var(--muted)]">
          {indice + 1} de {selecionadas.length} · {trilhaTitulo}
        </span>
      </div>

      <div className="flex gap-1">
        {selecionadas.map((p, i) => (
          <span
            key={p.id}
            className={cx(
              "h-1 flex-1 rounded-full",
              i < indice
                ? (notas[p.id] ?? 0) >= 4
                  ? "bg-[var(--color-success)]"
                  : "bg-[var(--accent)]"
                : i === indice
                  ? "bg-[var(--accent)]"
                  : "bg-[var(--elevated)]",
            )}
          />
        ))}
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-gradient-to-b from-[var(--elevated)] to-[var(--surface)] p-5">
        <RotuloAcento>Entrevistador · {pergunta.moduloTitulo}</RotuloAcento>
        <p className="font-display mt-2.5 text-xl font-semibold leading-snug">
          {pergunta.enunciado}
        </p>
      </div>

      <Gravador key={pergunta.id} />

      {!revelado ? (
        <button
          type="button"
          onClick={() => setRevelado(true)}
          className="min-h-13 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[15px] font-semibold"
        >
          Já respondi. Ver resposta-modelo
        </button>
      ) : (
        <>
          <Card>
            <Rotulo className="mb-1.5">Resposta-modelo</Rotulo>
            <p className="text-[15px] leading-relaxed">{pergunta.respostaModelo}</p>
            <Link href={pergunta.href} className="mt-2.5 block text-[13px] no-underline">
              Rever o tema: {pergunta.temaTitulo}
            </Link>
          </Card>

          <Card>
            <div className="flex items-baseline justify-between">
              <p className="text-[13px] font-semibold">O que a resposta precisava ter</p>
              <span className="text-xs text-[var(--muted)]">rubrica 0 a 5</span>
            </div>
            <ul className="mt-2.5 flex list-none flex-col gap-1.5 p-0">
              {pergunta.rubrica.map((criterio, i) => (
                <li key={i} className="flex gap-2 text-[13px] leading-snug text-[var(--text-2)]">
                  <span className="font-semibold text-[var(--accent)]">{i + 1}</span>
                  <span>{criterio}</span>
                </li>
              ))}
            </ul>
            <div className="mt-3.5 flex gap-1.5">
              {[0, 1, 2, 3, 4, 5].map((nota) => (
                <button
                  key={nota}
                  type="button"
                  onClick={() => avaliar(nota)}
                  className="min-h-12 flex-1 rounded-lg bg-[var(--elevated)] text-sm font-semibold hover:bg-[var(--accent)] hover:text-[var(--accent-ink)]"
                >
                  {nota}
                </button>
              ))}
            </div>
            <p className="mt-2 text-center text-[11px] text-[var(--muted)]">
              Quantos critérios você cumpriu de verdade?
            </p>
          </Card>
        </>
      )}
    </div>
  );
}

function BotaoEscopo({
  ativo,
  onClick,
  children,
}: {
  ativo: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        "min-h-11 rounded-full px-4 text-sm font-semibold",
        ativo ? "bg-[var(--accent)] text-[var(--accent-ink)]" : "bg-[var(--elevated)] text-[var(--text-2)]",
      )}
    >
      {children}
    </button>
  );
}
