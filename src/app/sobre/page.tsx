import type { Metadata } from "next";
import Link from "next/link";

import { AppShell } from "@/components/layout/AppShell";
import { Card, Rotulo } from "@/components/ui/Card";
import { ContatoLink } from "@/components/layout/ContatoLink";
import { EMPRESA } from "@/lib/company";

export const metadata: Metadata = {
  title: "Sobre a Lumarys",
  description:
    "A Lumarys é uma marca da Cernyn. Trilhas de estudo montadas a partir de ementas oficiais, com método e fontes citadas.",
  alternates: { canonical: "/sobre/" },
};

export default function PaginaSobre() {
  return (
    <AppShell>
      <div className="px-5 pb-8 pt-5">
        <Rotulo>Sobre</Rotulo>
        <h1 className="font-display mt-1.5 text-[26px] font-bold leading-[1.15]">
          Lumarys — {EMPRESA.tagline}
        </h1>

        <div className="mt-4 flex flex-col gap-3.5 text-[15px] leading-relaxed">
          <p>
            A Lumarys existe para tornar o aprendizado contínuo viável para quem trabalha. Cada
            trilha parte de uma ementa oficial, publicada por uma empresa ou por uma certificadora,
            e vira estudo ativo em sessões curtas.
          </p>
          <p>
            A marca é da <a href={EMPRESA.controladoraUrl} target="_blank" rel="noopener noreferrer">Cernyn</a>,
            consultoria de engenharia digital sediada em Joinville. A Cernyn responde pela
            plataforma, inclusive pelo tratamento dos dados descrito na{" "}
            <Link href="/privacidade/">política de privacidade</Link>.
          </p>
        </div>

        <Card className="mt-5">
          <h2 className="font-display text-lg font-semibold">Política editorial</h2>
          <ul className="mt-2.5 flex list-none flex-col gap-2 p-0 text-[15px] leading-relaxed">
            <li>
              <strong className="font-semibold">Ementa oficial primeiro.</strong> O que a empresa
              ou a certificadora publica define a espinha da trilha. O que acrescentamos vem
              marcado como “além da ementa”.
            </li>
            <li>
              <strong className="font-semibold">Vídeo verificado.</strong> Todo vídeo é conferido
              por consulta automática antes de publicar, e o canal e a duração vêm dessa consulta,
              não de memória.
            </li>
            <li>
              <strong className="font-semibold">Sem dumps de prova.</strong> As perguntas dos
              simulados são escritas do zero, no formato da prova. Não reproduzimos questões reais
              de exames.
            </li>
            <li>
              <strong className="font-semibold">Fonte citada.</strong> Cada tema linka os artigos
              que sustentam a explicação, para você conferir.
            </li>
            <li>
              <strong className="font-semibold">Sem promessa de aprovação.</strong> O site mostra o
              quanto você provou saber, não garante resultado.
            </li>
          </ul>
        </Card>

        <Card className="mt-3.5">
          <h2 className="font-display text-lg font-semibold">Achou um erro?</h2>
          <p className="mt-2 text-[15px] leading-relaxed">
            Conteúdo técnico envelhece e erro acontece. Se algo estiver errado ou desatualizado,
            escreva para a gente.
          </p>
          <ContatoLink
            rotulo="Falar com a Cernyn"
            className="mt-3 flex min-h-12 w-full items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--elevated)] text-sm font-semibold"
          />
        </Card>
      </div>
    </AppShell>
  );
}
