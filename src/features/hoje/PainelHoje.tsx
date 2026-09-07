"use client";

import Link from "next/link";

import { Card, Rotulo, RotuloAcento } from "@/components/ui/Card";
import { BarraProgresso } from "@/components/ui/ProgressRing";
import { IconeCards, IconeDrill, IconeRelogio, IconeSeta } from "@/components/ui/icons";
import { useProgresso } from "@/features/progresso/useProgresso";
import { estadoDoPlano } from "@/lib/plano";
import { proximaAcao } from "@/lib/proximaAcao";
import { PESOS, prontidaoDaTrilha, rotuloProntidao } from "@/lib/readiness";
import { filaDoDia, hojeISO, somarDias } from "@/lib/srs";

export type TemaHoje = {
  slug: string;
  titulo: string;
  minutos: number;
  modulo: string;
  moduloTitulo: string;
};

export type DadosHoje = {
  trilhaSlug: string;
  trilhaTitulo: string;
  temas: TemaHoje[];
  modulos: { slug: string; titulo: string; temas: string[] }[];
  prazoDias: number;
};

/**
 * A tela Hoje resolve uma pergunta só: o que eu faço agora. Uma ação principal,
 * nunca um menu. Cards vencidos ganham da sequência da trilha porque revisão
 * atrasada é o que mais custa perto da prova.
 */
export function PainelHoje({ dados }: { dados: DadosHoje }) {
  const { progresso, pronto } = useProgresso();

  if (!pronto) {
    return <div className="mx-5 h-64 animate-pulse rounded-2xl border border-[var(--border)]" />;
  }

  const trilha = progresso.trilhas[dados.trilhaSlug];
  const concluidos = trilha?.temasConcluidos ?? {};
  // Só os cards desta trilha, e estreia só de tema já concluído: o painel fala
  // de uma trilha só, e card de tema não estudado não é revisão atrasada.
  const temasDaTrilha = new Set(dados.temas.map((t) => t.slug));
  const vencidos = filaDoDia(
    Object.values(progresso.cards).filter((c) => temasDaTrilha.has(c.temaSlug)),
    new Date(),
    40,
    { temasElegiveis: Object.keys(concluidos) },
  );
  const { geral, porModulo, pontoFraco, componentes } = prontidaoDaTrilha(
    dados.modulos,
    progresso,
    dados.trilhaSlug,
  );

  const minutosHoje = progresso.minutosPorDia[hojeISO()] ?? 0;
  const meta = trilha?.minutosPorDia ?? 30;
  const estado = estadoDoPlano(trilha?.dataProva, dados.prazoDias);
  const emManutencao = trilha?.modo === "manutencao";
  const nomePontoFraco = dados.modulos.find((m) => m.slug === pontoFraco?.moduloSlug)?.titulo;
  const feitos = Object.keys(concluidos).length;

  const acao = proximaAcao({
    temas: dados.temas,
    concluidos,
    ultimoTema: trilha?.ultimoTema,
    vencidos: vencidos.length,
  });

  const semanaDeMinutos = ultimosDias(progresso.minutosPorDia, 7);
  const maiorDaSemana = Math.max(...semanaDeMinutos.map((d) => d.minutos), meta);

  return (
    <div className="flex flex-col gap-3.5 px-5 pb-8">
      <div className="grid grid-cols-3 gap-2.5">
        <Metrica
          rotulo="Sequência"
          valor={`${progresso.streak.atual}`}
          sufixo={progresso.streak.atual === 1 ? "dia" : "dias"}
          nota={
            progresso.streak.recorde > progresso.streak.atual
              ? `recorde ${progresso.streak.recorde}`
              : undefined
          }
        />
        <Metrica rotulo="Hoje" valor={`${minutosHoje}`} sufixo={`/${meta} min`} />
        <Metrica
          rotulo="Temas feitos"
          valor={`${feitos}`}
          sufixo={`/${dados.temas.length}`}
          // O rótulo não muda mais de significado; a contagem para a prova vem
          // como nota, junto com o dia do cronograma.
          nota={
            emManutencao
              ? "manutenção"
              : estado.situacao === "em-curso"
                ? `dia ${estado.dia}/${estado.total} · faltam ${estado.faltam}`
                : estado.situacao === "prova-hoje"
                  ? "a prova é hoje"
                  : estado.situacao === "aguardando"
                    ? `faltam ${estado.faltam} dias`
                    : estado.situacao === "vencido"
                      ? "prova passou"
                      : undefined
          }
        />
      </div>

      {/* Uma ação principal, sempre. A ordem é regra de método e mora em lib. */}
      {emManutencao && vencidos.length > 0 ? (
        <AcaoPrincipal
          rotulo="Manutenção"
          titulo={`${vencidos.length} card${vencidos.length === 1 ? "" : "s"} para revisar`}
          descricao="Sem cronograma novo. Manter o que você já sabe custa poucos minutos por dia."
          href="/cards/"
        />
      ) : acao.tipo === "continuar" ? (
        <AcaoPrincipal
          rotulo="Continuar de onde parou"
          titulo={acao.tema.titulo}
          descricao={`Você abriu este tema e não concluiu. ${acao.tema.minutos} min.`}
          href={`/trilhas/${dados.trilhaSlug}/${acao.tema.modulo}/${acao.tema.slug}/`}
        />
      ) : acao.tipo === "revisar" ? (
        <AcaoPrincipal
          rotulo="Próxima ação"
          titulo={`${acao.vencidos} cards vencidos`}
          descricao="Passou de oito cards atrasados: revisão rende mais que conteúdo novo agora."
          href="/cards/"
        />
      ) : acao.tipo === "estudar" ? (
        <AcaoPrincipal
          rotulo="Próxima ação"
          titulo={acao.tema.titulo}
          descricao={`${moduloTitulo(dados, acao.tema.modulo)} · ${acao.tema.minutos} min · pré-teste, vídeo e cards.`}
          href={`/trilhas/${dados.trilhaSlug}/${acao.tema.modulo}/${acao.tema.slug}/`}
        />
      ) : (
        <AcaoPrincipal
          rotulo="Trilha completa"
          titulo="Hora de simular"
          descricao="Você concluiu todos os temas. O que falta agora é responder em voz alta."
          href={`/simulado/?trilha=${dados.trilhaSlug}`}
        />
      )}

      {/* Secundários numa linha só, para não competirem com a ação principal. */}
      <div className="flex gap-2">
        {vencidos.length > 0 && acao.tipo !== "revisar" ? (
          <Chip href="/cards/" icone={<IconeCards size={16} />}>
            {vencidos.length} card{vencidos.length === 1 ? "" : "s"}
          </Chip>
        ) : null}
        <Chip
          href={`/simulado/?trilha=${dados.trilhaSlug}${pontoFraco ? `&modulo=${pontoFraco.moduloSlug}` : ""}`}
          icone={<IconeDrill size={16} />}
        >
          {nomePontoFraco ? `Simular ${nomePontoFraco}` : "Simulado"}
        </Chip>
        <Chip href={`/trilhas/${dados.trilhaSlug}/plano/`} icone={<IconeRelogio size={16} />}>
          Plano
        </Chip>
      </div>

      {estado.situacao === "sem-plano" ? (
        <Card destaque>
          <RotuloAcento>Sem data marcada</RotuloAcento>
          <p className="mt-2 text-[15px] leading-relaxed">
            Diga quando é a prova e quantos minutos você tem por dia. A partir daí esta tela passa a
            seguir um cronograma, em vez de só listar o próximo tema.
          </p>
          <Link
            href={`/trilhas/${dados.trilhaSlug}/plano/`}
            className="mt-3 flex min-h-12 items-center justify-center rounded-xl bg-[var(--accent)] text-[15px] font-semibold text-[var(--accent-ink)] no-underline"
          >
            Definir a data da prova
          </Link>
        </Card>
      ) : null}

      <Card>
        <div className="flex items-baseline justify-between">
          <p className="text-[13px] font-semibold">Prontidão · {rotuloProntidao(geral)}</p>
          <p className="font-display text-xl font-bold text-[var(--accent)]">{geral}%</p>
        </div>
        <div className="mt-3 flex flex-col gap-2">
          {porModulo
            .filter((m) => m.temasTotal > 0)
            .map((m) => (
              <div key={m.moduloSlug} className="flex flex-col gap-0.5">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="truncate text-xs text-[var(--text-2)]">
                    {moduloTitulo(dados, m.moduloSlug)}
                  </span>
                  <span className="shrink-0 text-xs tabular-nums text-[var(--text-2)]">
                    {m.score}
                  </span>
                </div>
                <BarraProgresso
                  valor={m.score}
                  cor={
                    m.score >= 60
                      ? "var(--color-success)"
                      : m.score >= 25
                        ? "var(--accent)"
                        : "var(--color-danger)"
                  }
                />
              </div>
            ))}
        </div>

        {/* O que move o ponteiro: sem isto o aluno vê 34% e não sabe por quê. */}
        <details className="mt-3">
          <summary className="min-h-11 cursor-pointer list-none text-xs text-[var(--accent)]">
            Como chegamos a {geral}%
          </summary>
          <div className="mt-2 flex flex-col gap-1.5">
            {(
              [
                ["Temas concluídos", componentes.cobertura, PESOS.cobertura],
                ["Quiz", componentes.quiz, PESOS.quiz],
                ["Cards", componentes.cards, PESOS.cards],
                ["Checkpoint", componentes.checkpoint, PESOS.checkpoint],
                ["Simulado", componentes.simulado, PESOS.simulado],
              ] as const
            ).map(([nome, valor, peso]) => (
              <div key={nome} className="flex items-center gap-2.5">
                <span className="w-32 shrink-0 text-xs text-[var(--text-2)]">
                  {nome} <span className="text-[var(--muted)]">({Math.round(peso * 100)}%)</span>
                </span>
                <BarraProgresso valor={valor} className="flex-1" />
                <span className="w-7 shrink-0 text-right text-xs tabular-nums text-[var(--text-2)]">
                  {valor}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs leading-relaxed text-[var(--muted)]">
            {maiorGanho(componentes)} O simulado pesa mais que tudo porque é o formato real da
            prova.
          </p>
        </details>
      </Card>

      {semanaDeMinutos.some((d) => d.minutos > 0) ? (
        <Card>
          <Rotulo className="mb-2">Últimos 7 dias</Rotulo>
          <div className="flex items-end gap-1.5">
            {semanaDeMinutos.map((d) => (
              <div key={d.data} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className="w-full rounded-t bg-[var(--accent)]"
                  style={{
                    height: `${Math.max(4, (d.minutos / maiorDaSemana) * 48)}px`,
                    opacity: d.minutos ? 1 : 0.25,
                  }}
                />
                <span className="text-[10px] text-[var(--muted)]">{d.data.slice(8)}</span>
              </div>
            ))}
          </div>
        </Card>
      ) : null}
    </div>
  );
}

function moduloTitulo(dados: DadosHoje, slug: string): string {
  return dados.modulos.find((m) => m.slug === slug)?.titulo ?? slug;
}

/** Minutos estudados em cada um dos últimos N dias, do mais antigo ao de hoje. */
function ultimosDias(
  minutosPorDia: Record<string, number>,
  quantos: number,
  agora = new Date(),
): { data: string; minutos: number }[] {
  const hoje = hojeISO(agora);
  return Array.from({ length: quantos }, (_, i) => {
    const data = somarDias(hoje, i - (quantos - 1));
    return { data, minutos: minutosPorDia[data] ?? 0 };
  });
}

/** Onde está o maior ganho marginal, para a dica não ser genérica. */
function maiorGanho(c: {
  cobertura: number;
  quiz: number;
  cards: number;
  checkpoint: number;
  simulado: number;
}): string {
  const candidatos = [
    { nome: "responder o simulado oral", valor: c.simulado, peso: PESOS.simulado },
    { nome: "fazer os quizzes dos temas", valor: c.quiz, peso: PESOS.quiz },
    { nome: "revisar os cards", valor: c.cards, peso: PESOS.cards },
    { nome: "concluir os temas que faltam", valor: c.cobertura, peso: PESOS.cobertura },
    { nome: "fazer o checkpoint dos módulos", valor: c.checkpoint, peso: PESOS.checkpoint },
  ];
  const alvo = candidatos.sort((a, b) => (100 - b.valor) * b.peso - (100 - a.valor) * a.peso)[0];
  return alvo ? `O que mais sobe agora é ${alvo.nome}.` : "";
}

function Chip({
  href,
  icone,
  children,
}: {
  href: string;
  icone: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-2 text-center text-xs font-semibold no-underline"
    >
      {icone}
      <span className="truncate">{children}</span>
    </Link>
  );
}

function Metrica({
  rotulo,
  valor,
  sufixo,
  nota,
}: {
  rotulo: string;
  valor: string;
  sufixo: string;
  nota?: string;
}) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3">
      <p className="text-[11px] font-semibold text-[var(--muted)]">{rotulo}</p>
      <p className="font-display mt-0.5 text-xl font-bold">
        {valor}
        <span className="ml-1 text-[13px] font-medium text-[var(--text-2)]">{sufixo}</span>
      </p>
      {nota ? <p className="text-[10px] text-[var(--muted)]">{nota}</p> : null}
    </div>
  );
}

function AcaoPrincipal({
  rotulo,
  titulo,
  descricao,
  href,
}: {
  rotulo: string;
  titulo: string;
  descricao: string;
  href: string;
}) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-gradient-to-b from-[var(--elevated)] to-[var(--surface)] p-4.5">
      <RotuloAcento>{rotulo}</RotuloAcento>
      <p className="font-display mt-2 text-xl font-semibold leading-snug">{titulo}</p>
      <p className="mt-1.5 text-[13px] leading-relaxed text-[var(--text-2)]">{descricao}</p>
      <Link
        href={href}
        className="mt-3.5 flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[var(--accent)] text-[15px] font-semibold text-[var(--accent-ink)] no-underline"
      >
        Começar <IconeSeta size={18} />
      </Link>
    </div>
  );
}
