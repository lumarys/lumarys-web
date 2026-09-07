import type { Metadata } from "next";
import Link from "next/link";

import { AppShell } from "@/components/layout/AppShell";
import { BotaoLink } from "@/components/ui/Botao";
import { Recolhivel } from "@/components/ui/Recolhivel";
import {
  IconeCards,
  IconeCheck,
  IconeEstrela,
  IconePlay,
  IconeSeta,
  IconeSimulado,
  IconeTrilha,
} from "@/components/ui/icons";
import { Amostra } from "@/features/home/Amostra";
import { DeVolta } from "@/features/home/DeVolta";
import {
  estatisticasDaTrilha,
  contarTemas,
  listarTrilhas,
  sequenciaDaTrilha,
  temasDoModulo,
} from "@/lib/content";
import { JsonLd, jsonLdFaq } from "@/lib/seo";
import { formatarMinutos } from "@/lib/utils";
import { trilhasEmBreve } from "@content/trilhas";

export const metadata: Metadata = {
  title: "Lumarys — trilhas de estudo para provas, sabatinas e certificações",
  description:
    "Estude do jeito que a prova cobra. A ementa oficial vira estudo ativo: vídeo em português conferido, repetição espaçada e simulado no formato real. Comece sem cadastro.",
  alternates: { canonical: "/" },
};

const DIFERENCIAIS = [
  {
    Icone: IconeTrilha,
    titulo: "A ementa oficial, não um curso genérico",
    texto:
      "Cada trilha começa na lista de assuntos que a empresa ou a certificadora publica. O que acrescentamos vem marcado como “além da ementa”, para você saber o que é cobrado e o que é preparo extra.",
  },
  {
    Icone: IconePlay,
    titulo: "Vídeo em português, conferido um a um",
    texto:
      "Nada de link quebrado nem legenda automática. O canal e a duração de cada vídeo vêm de uma verificação automática que roda a cada publicação, e a explicação escrita é nossa.",
  },
  {
    Icone: IconeSimulado,
    titulo: "Simulado no formato da prova",
    texto:
      "Se a prova é oral, você responde em voz alta, se ouve e compara com uma resposta-modelo usando uma rubrica de critérios. Marcar alternativa não treina o que a banca cobra.",
  },
  {
    Icone: IconeEstrela,
    titulo: "Prontidão medida, não sensação",
    texto:
      "A barra combina quatro sinais com pesos diferentes, e o simulado pesa mais que tudo. Dar “concluído” em todos os temas sem responder nada não faz a barra encher.",
  },
];

const PERGUNTAS = [
  {
    pergunta: "Para quem é a Lumarys?",
    resposta:
      "Para profissionais que têm uma prova marcada: sabatina interna, processo de carreira ou certificação. A primeira trilha é a de Engenharia de Dados de uma grande instituição do mercado financeiro, montada a partir da ementa oficial da carreira.",
  },
  {
    pergunta: "É pago?",
    resposta:
      "Não. Estudar não custa nada e não exige cadastro. A conta existe só para continuar de onde parou em outro aparelho.",
  },
  {
    pergunta: "Preciso criar conta?",
    resposta:
      "Não para estudar. O progresso nasce no seu navegador. Se quiser continuar no computador o que começou no celular, entra com um código enviado por e-mail, sem senha.",
  },
  {
    pergunta: "Quanto tempo por dia?",
    resposta:
      "Você escolhe entre 20 e 60 minutos ao montar o plano, e o cronograma de 14 dias se ajusta a essa escolha. A tela Hoje passa a dizer o que fazer na sessão.",
  },
  {
    pergunta: "De onde vem o conteúdo?",
    resposta:
      "Da ementa oficial publicada pela empresa ou certificadora, acrescida de um módulo com o que a prova costuma cobrar e a ementa não cobre. Os vídeos são em português e conferidos um a um antes de publicar. Não reproduzimos questões reais de prova.",
  },
  {
    pergunta: "O que é uma sabatina?",
    resposta:
      "Uma arguição oral com banca: você responde falando, e o avaliador cobra raciocínio e trade-offs, não definições decoradas. Por isso o simulado daqui é oral, com rubrica e resposta-modelo.",
  },
];

export default function Home() {
  const trilhas = listarTrilhas();
  const principal = trilhas[0];
  const numeros = principal ? estatisticasDaTrilha(principal) : null;

  // Amostra escolhida do próprio conteúdo: o primeiro tema da trilha, para a
  // home mostrar o que promete em vez de descrever.
  const primeiro = sequenciaDaTrilha(principal!)[0];
  const cardAmostra = primeiro?.tema.flashcards[0];
  const oralAmostra = primeiro?.tema.perguntas.find((q) => q.tipo === "oral");
  const sequencia = sequenciaDaTrilha(principal!).map(({ modulo, tema }) => ({
    slug: tema.slug,
    titulo: tema.titulo,
    modulo: modulo.slug,
    minutos: tema.minutos,
  }));

  return (
    <AppShell largura="site">
      {/* ───────────────────────────── Hero ───────────────────────────── */}
      <section className="relative overflow-hidden border-b border-[var(--border)]">
        {/* A luz é o conceito da marca: um brilho atrás do conteúdo, não um
            gradiente chapado no fundo inteiro. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-40 left-1/2 size-[680px] -translate-x-1/2 rounded-full opacity-60"
          // O brilho do herói era âmbar fixo: no tema claro virava uma
          // mancha amarela sobre papel. Agora segue o realce do tema.
          style={{
            background: "radial-gradient(circle, var(--realce-acento) 0%, transparent 68%)",
          }}
        />

        <div className="relative mx-auto max-w-6xl px-5 pb-16 pt-14 lg:grid lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-14 lg:pb-24 lg:pt-20">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-[var(--accent)]/25 bg-[var(--accent)]/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--accent)]">
              <span className="size-1.5 rounded-full bg-[var(--accent)]" />
              {principal?.origem ?? "Trilhas em português"}
            </p>

            {/* Quem busca "sabatina de engenharia de dados" precisa saber em
                cinco segundos que chegou ao lugar certo. O título genérico
                deixava isso para o texto do botão. */}
            <h1 className="font-display mt-5 text-[34px] font-bold leading-[1.08] sm:text-[42px] lg:text-[46px]">
              {principal?.titulo ?? "Trilhas de estudo"} em{" "}
              <span className="relative whitespace-nowrap text-[var(--accent)]">
                {principal?.prazoSugeridoDias ?? 14} dias
              </span>
            </h1>

            <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-[var(--text-2)]">
              {principal?.formatoProva ?? "Prova"} no {principal?.origem ?? ""}. A ementa oficial
              vira estudo ativo: {numeros?.temas ?? 30} temas com vídeo em português conferido,
              explicação escrita, repetição espaçada e simulado no formato real.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <BotaoLink href={principal ? `/trilhas/${principal.slug}/plano/` : "/trilhas/"}>
                Montar meu plano de {principal?.prazoSugeridoDias ?? 14} dias
                <IconeSeta size={18} />
              </BotaoLink>
              <BotaoLink
                href={principal ? `/trilhas/${principal.slug}/` : "/trilhas/"}
                variante="fantasma"
              >
                ou ver os {numeros?.temas ?? 30} temas
              </BotaoLink>
            </div>

            <p className="mt-4 flex items-center gap-2 text-[13px] text-[var(--muted)]">
              <IconeCheck size={15} className="text-[var(--color-success)]" />
              Grátis e sem cadastro para começar. A conta só serve para continuar em outro aparelho.
            </p>

            {principal ? (
              <DeVolta
                trilhaSlug={principal.slug}
                temas={sequencia}
                prazoDias={principal.prazoSugeridoDias}
              />
            ) : null}
          </div>

          {/* Prova concreta do que existe hoje, com números contados no build. */}
          {numeros && principal ? (
            <div className="mt-12 lg:mt-0">
              <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)]/80 p-6 shadow-[0_24px_60px_-30px_var(--sombra-cartao)] backdrop-blur">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
                  No ar agora
                </p>
                <p className="font-display mt-1.5 text-xl font-semibold">{principal.titulo}</p>
                <p className="mt-1 text-[13px] text-[var(--text-2)]">{principal.origem}</p>

                <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-5">
                  <Numero valor={numeros.temas} rotulo="temas" />
                  <Numero valor={formatarMinutos(numeros.minutos)} rotulo="de conteúdo" />
                  <Numero valor={numeros.flashcards} rotulo="flashcards" />
                  <Numero valor={numeros.perguntasOrais} rotulo="perguntas de sabatina" />
                </dl>

                <div className="mt-6 flex items-center gap-2 border-t border-[var(--border)] pt-4 text-[13px] text-[var(--text-2)]">
                  <IconePlay size={16} className="shrink-0 text-[var(--accent)]" />
                  {numeros.videos} vídeos em português, todos verificados
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {/* ─────────────────────────── Amostra ──────────────────────────── */}
      {cardAmostra && oralAmostra && primeiro ? (
        <section className="border-b border-[var(--border)]" aria-labelledby="amostra">
          <div className="mx-auto max-w-6xl px-5 py-14">
            <h2 id="amostra" className="font-display text-[26px] font-bold sm:text-[30px]">
              Veja antes de decidir
            </h2>
            <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-[var(--text-2)]">
              Isto é conteúdo real do primeiro tema, não exemplo inventado.
            </p>

            <div className="mt-8">
              <Amostra
                card={{
                  frente: cardAmostra.frente,
                  verso: cardAmostra.verso,
                  tema: primeiro.tema.titulo,
                }}
                pergunta={{
                  enunciado: oralAmostra.enunciado,
                  rubrica: oralAmostra.rubrica,
                  tema: primeiro.tema.titulo,
                }}
              />
            </div>

            <div className="mt-6 flex flex-wrap gap-2.5">
              <BotaoLink
                href={`/trilhas/${principal!.slug}/${primeiro.modulo.slug}/${primeiro.tema.slug}/`}
                variante="secundario"
              >
                Abrir o tema inteiro
                <IconeSeta size={18} />
              </BotaoLink>
              {/* O simulado é o diferencial anunciado aqui em cima e não tinha
                  link de página pública nenhuma. */}
              <BotaoLink href="/simulado/" variante="fantasma">
                Ver perguntas da sabatina
              </BotaoLink>
            </div>
          </div>
        </section>
      ) : null}

      {/* ───────────────────────── Diferenciais ───────────────────────── */}
      <section className="border-b border-[var(--border)]" aria-labelledby="diferenciais">
        <div className="mx-auto max-w-6xl px-5 py-16 lg:py-20">
          <h2 id="diferenciais" className="font-display text-[26px] font-bold sm:text-[30px]">
            Por que isto funciona melhor que um curso
          </h2>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-[var(--text-2)]">
            Curso é feito para ser assistido. Prova é feita para ser respondida. A diferença está em
            quatro escolhas.
          </p>

          <ul className="mt-10 grid list-none gap-4 p-0 sm:grid-cols-2">
            {DIFERENCIAIS.map(({ Icone, titulo, texto }) => (
              <li
                key={titulo}
                className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 transition-colors hover:border-[var(--accent)]/40"
              >
                <span className="inline-flex size-10 items-center justify-center rounded-xl bg-[var(--accent)]/12 text-[var(--accent)]">
                  <Icone size={20} />
                </span>
                <h3 className="font-display mt-4 text-[17px] font-semibold leading-snug">
                  {titulo}
                </h3>
                <p className="mt-2 text-[14px] leading-relaxed text-[var(--text-2)]">{texto}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ─────────────────────── Trilha em destaque ────────────────────── */}
      {principal ? (
        <section className="border-b border-[var(--border)]" aria-labelledby="trilha">
          <div className="mx-auto max-w-6xl px-5 py-16 lg:py-20">
            <div className="lg:flex lg:items-end lg:justify-between lg:gap-8">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--accent)]">
                  {principal.origem}
                </p>
                <h2 id="trilha" className="font-display mt-2 text-[26px] font-bold sm:text-[30px]">
                  {principal.titulo}
                </h2>
                <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-[var(--text-2)]">
                  {principal.objetivo}
                </p>
              </div>
              <BotaoLink
                href={`/trilhas/${principal.slug}/`}
                variante="secundario"
                className="mt-6 w-full shrink-0 lg:mt-0 lg:w-auto"
              >
                Abrir a trilha <IconeSeta size={18} />
              </BotaoLink>
            </div>

            <ol className="mt-10 grid list-none gap-2.5 p-0 sm:grid-cols-2 lg:grid-cols-3">
              {principal.modulos.map((modulo, i) => {
                const temas = temasDoModulo(modulo);
                if (temas.length === 0) return null;
                return (
                  <li
                    key={modulo.slug}
                    className="flex gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4"
                  >
                    <span className="font-display mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-[var(--elevated)] text-[12px] font-bold text-[var(--accent)]">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="min-w-0">
                      <p className="text-[14px] font-semibold leading-snug">
                        {modulo.titulo}
                        {!modulo.oficial ? (
                          <span className="ml-2 rounded bg-[var(--elevated)] px-1.5 py-0.5 align-middle text-[10px] font-semibold uppercase tracking-wide text-[var(--muted)]">
                            extra
                          </span>
                        ) : null}
                      </p>
                      <p className="mt-1 text-[12px] leading-snug text-[var(--muted)]">
                        {temas.length} {temas.length === 1 ? "tema" : "temas"} ·{" "}
                        {formatarMinutos(temas.reduce((a, t) => a + t.minutos, 0))}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>

            {/* As demais trilhas do catálogo. O destaque continua sendo a
                primeira — é a completa —, mas quem chega pela segunda precisa
                achá-la na home, e não só em /trilhas/. */}
            {trilhas.length > 1 ? (
              <div className="mt-8 border-t border-[var(--border)] pt-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
                  Também disponível
                </p>
                <ul className="mt-3 flex list-none flex-col gap-2 p-0 sm:flex-row sm:flex-wrap">
                  {trilhas.slice(1).map((outra) => (
                    <li key={outra.slug}>
                      <Link
                        href={`/trilhas/${outra.slug}/`}
                        className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 text-[14px] font-semibold no-underline"
                      >
                        {outra.titulo}
                        <span className="text-[12px] font-normal text-[var(--muted)]">
                          {contarTemas(outra)} temas
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {/* ───────────────────────── Como funciona ───────────────────────── */}
      <section className="border-b border-[var(--border)]" aria-labelledby="metodo">
        <div className="mx-auto max-w-6xl px-5 py-14">
          <h2 id="metodo" className="font-display text-[26px] font-bold sm:text-[30px]">
            Uma sessão, do começo ao fim
          </h2>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-[var(--text-2)]">
            Pré-teste antes de aprender, vídeo e explicação, cards espaçados em 1, 3, 7 e 12 dias, e
            simulado no ponto fraco. O método vem dos nove princípios de <em>Ultraaprendizado</em>,
            de Scott Young, somados a práticas com evidência em pesquisa de aprendizagem.
          </p>
          <p className="mt-4 text-[15px]">
            <Link href="/metodo/">Ver cada princípio e como usar</Link>
          </p>
        </div>
      </section>

      {/* ─────────────────────────── Em breve ──────────────────────────── */}
      <section aria-labelledby="breve">
        <div className="mx-auto max-w-6xl px-5 py-14">
          <h2 id="breve" className="font-display text-[26px] font-bold sm:text-[30px]">
            Próximas trilhas
          </h2>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-[var(--text-2)]">
            Mesma estrutura, outras ementas:{" "}
            {trilhasEmBreve.map((t, i) => (
              <span key={t.slug}>
                {i > 0 ? (i === trilhasEmBreve.length - 1 ? " e " : ", ") : ""}
                <strong className="font-semibold text-[var(--text)]">{t.titulo}</strong>
              </span>
            ))}
            . A ordem segue o que a comunidade pedir —{" "}
            <Link href="/trilhas/">veja o catálogo para pedir a sua</Link>.
          </p>

          {/* ───────────────────────────── Dúvidas ─────────────────────────── */}
          <section className="border-t border-[var(--border)]" aria-labelledby="duvidas">
            <div className="mx-auto max-w-3xl px-5 py-14">
              <h2 id="duvidas" className="font-display text-[26px] font-bold sm:text-[30px]">
                Perguntas que todo mundo faz
              </h2>
              <div className="mt-6 flex flex-col gap-2">
                {PERGUNTAS.map((p) => (
                  <Recolhivel key={p.pergunta} titulo={p.pergunta}>
                    <p className="text-[15px] leading-relaxed text-[var(--text-2)]">{p.resposta}</p>
                  </Recolhivel>
                ))}
              </div>

              <p className="mt-6 text-[13px] leading-relaxed text-[var(--muted)]">
                Escrito e mantido por Diego Vieira, na <Link href="/sobre/">Cernyn</Link>. A
                política editorial e o jeito de apontar um erro estão na página{" "}
                <Link href="/sobre/">Sobre</Link>.
              </p>
            </div>
          </section>

          <div className="mt-12 rounded-3xl border border-[var(--accent)]/25 bg-[var(--surface)] p-8 text-center">
            <IconeCards size={26} className="mx-auto text-[var(--accent)]" />
            <h2 className="font-display mt-4 text-[22px] font-bold sm:text-[26px]">
              Sua prova tem data. Comece hoje.
            </h2>
            <p className="mx-auto mt-2.5 max-w-lg text-[15px] leading-relaxed text-[var(--text-2)]">
              Diga quando é a prova e quantos minutos você tem por dia. O plano se ajusta e a tela
              Hoje passa a dizer o que fazer.
            </p>
            <BotaoLink
              href={principal ? `/trilhas/${principal.slug}/plano/` : "/trilhas/"}
              className="mt-6"
            >
              Montar meu plano <IconeSeta size={18} />
            </BotaoLink>
          </div>
        </div>
      </section>
      <JsonLd dados={jsonLdFaq(PERGUNTAS)} />
    </AppShell>
  );
}

function Numero({ valor, rotulo }: { valor: string | number; rotulo: string }) {
  return (
    // min-w-0 é o que impede um número longo de esticar a coluna do grid e,
    // por tabela, a página inteira no celular.
    <div className="min-w-0">
      <dt className="sr-only">{rotulo}</dt>
      <dd className="font-display text-[22px] font-bold leading-none text-[var(--text)] sm:text-[26px]">
        {valor}
      </dd>
      <p className="mt-1.5 text-[12px] leading-snug text-[var(--muted)]">{rotulo}</p>
    </div>
  );
}
