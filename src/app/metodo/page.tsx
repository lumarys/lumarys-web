import type { Metadata } from "next";
import Link from "next/link";

import { AppShell } from "@/components/layout/AppShell";
import { Card, Rotulo } from "@/components/ui/Card";
import { JsonLd, jsonLdBreadcrumb, alternativas } from "@/lib/seo";

export const metadata: Metadata = {
  title: "O método",
  description:
    "Os nove princípios de Ultraaprendizado aplicados à Lumarys: metaaprendizado, foco, direcionamento, drills, recuperação, feedback, retenção, intuição e experimentação.",
  alternates: alternativas("/metodo/"),
};

const PRINCIPIOS = [
  {
    nome: "Metaaprendizado",
    frase: "Descubra o mapa antes de andar.",
    noSite:
      "Cada trilha abre com o que, por que e como, e cada tema diz por que ele cai na prova e como o entrevistador pergunta.",
    comoUsar: "Leia a página da trilha inteira uma vez antes do primeiro tema. Custa cinco minutos.",
  },
  {
    nome: "Foco",
    frase: "Sessões curtas e inteiras valem mais que horas fragmentadas.",
    noSite: "Um cronômetro de 25/5 no topo do tema e uma única próxima ação na tela Hoje.",
    comoUsar: "Comece o cronômetro antes de ler a primeira linha e deixe o celular no modo foco.",
  },
  {
    nome: "Direcionamento",
    frase: "Pratique do jeito que você vai ser cobrado.",
    noSite:
      "A prova é oral, então o simulado é oral: você fala, se ouve e se avalia por rubrica. Nada de só marcar alternativa.",
    comoUsar: "Responda em voz alta mesmo quando estiver sozinho. Ler a resposta na cabeça não conta.",
  },
  {
    nome: "Drills",
    frase: "Ataque o ponto fraco isolado.",
    noSite:
      "Cada tema tem um exercício curto no erro típico: classificar narrow e wide, escolher chave de partição, decidir ETL ou ELT.",
    comoUsar: "Se errou dois itens do mesmo drill, refaça no dia seguinte antes de avançar.",
  },
  {
    nome: "Recuperação",
    frase: "Tentar lembrar ensina mais que reler.",
    noSite:
      "Pré-teste antes do conteúdo, flashcards com resposta escondida e quiz depois da explicação.",
    comoUsar: "Erre o pré-teste sem culpa. A tentativa fracassada é o que prepara o cérebro.",
  },
  {
    nome: "Feedback",
    frase: "Peça o retorno duro, não o elogio.",
    noSite:
      "Rubricas com critérios verificáveis, resposta-modelo para comparar e prontidão por módulo.",
    comoUsar:
      "Ao se avaliar, conte quantos critérios você cumpriu de verdade. Nota alta que você não sustenta na banca não ajuda.",
  },
  {
    nome: "Retenção",
    frase: "Combata o esquecimento com espaçamento.",
    noSite: "Cards voltam em 1, 3, 7 e 12 dias, intercalados entre módulos.",
    comoUsar: "Faça os cards vencidos antes de conteúdo novo. É a regra que mais muda resultado.",
  },
  {
    nome: "Intuição",
    frase: "Entenda em vez de decorar.",
    noSite:
      "Cada tema termina com o desafio de explicar para alguém de negócio em um minuto, sem jargão.",
    comoUsar:
      "Se você travar numa palavra técnica ao explicar, achou o buraco. Volte para aquela seção.",
  },
  {
    nome: "Experimentação",
    frase: "Teste o próprio jeito de estudar.",
    noSite: "O plano registra minutos por dia e prontidão por módulo ao longo do tempo.",
    comoUsar:
      "Uma vez por semana, compare: o que rendeu mais, vídeo primeiro ou pré-teste primeiro? Mude uma coisa e observe.",
  },
];

export default function PaginaMetodo() {
  return (
    <AppShell comCabecalho>
      <div className="px-5 pb-8 pt-5">
        <Rotulo>O método</Rotulo>
        <h1 className="font-display mt-1.5 text-[26px] font-bold leading-[1.15]">
          Nove princípios, aplicados
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-[var(--text-2)]">
          A Lumarys segue os nove princípios de <em>Ultraaprendizado</em>, de Scott Young, somados
          a práticas com evidência em pesquisa de aprendizagem: recuperação, espaçamento e
          intercalação. Abaixo, o que cada princípio significa, onde ele aparece no site e o que
          você faz com ele.
        </p>

        <ol className="mt-6 flex list-none flex-col gap-3 p-0">
          {PRINCIPIOS.map((p, i) => (
            <li key={p.nome}>
              <Card>
                <div className="flex items-baseline gap-2.5">
                  <span className="font-display text-sm font-bold text-[var(--accent)]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h2 className="font-display text-lg font-semibold">{p.nome}</h2>
                </div>
                <p className="mt-1 text-sm italic text-[var(--text-2)]">{p.frase}</p>
                <p className="mt-2.5 text-[15px] leading-relaxed">{p.noSite}</p>
                <p className="mt-2 rounded-xl bg-[var(--bg)] px-3 py-2 text-[13px] leading-relaxed text-[var(--text-2)]">
                  <strong className="font-semibold text-[var(--text)]">Como usar:</strong>{" "}
                  {p.comoUsar}
                </p>
              </Card>
            </li>
          ))}
        </ol>

        <Card className="mt-6" destaque>
          <h2 className="font-display text-lg font-semibold">A regra que resume tudo</h2>
          <p className="mt-2 text-[15px] leading-relaxed">
            Uma próxima ação por vez. Se você abrir o site e ficar decidindo o que fazer, o método
            falhou. A tela <Link href="/hoje/">Hoje</Link> existe para tirar essa decisão de você.
          </p>
        </Card>
      </div>

      <JsonLd
        dados={jsonLdBreadcrumb([
          { nome: "Início", url: "/" },
          { nome: "O método", url: "/metodo/" },
        ])}
      />
    </AppShell>
  );
}
