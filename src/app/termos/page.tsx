import type { Metadata } from "next";
import Link from "next/link";

import { AppShell } from "@/components/layout/AppShell";
import { Rotulo } from "@/components/ui/Card";
import { EMPRESA } from "@/lib/company";

export const metadata: Metadata = {
  title: "Termos de uso",
  description: "As regras de uso da plataforma Lumarys, operada pela Cernyn.",
  alternates: { canonical: "/termos/" },
};

const ATUALIZADO = "3 de setembro de 2026";

export default function PaginaTermos() {
  return (
    <AppShell>
      <div className="prose-lumarys px-5 pb-8 pt-5">
        <Rotulo>Legal</Rotulo>
        <h1 className="font-display mt-1.5 text-[26px] font-bold leading-tight">Termos de uso</h1>
        <p className="mt-1 text-xs text-[var(--muted)]">Atualizados em {ATUALIZADO}</p>

        <h2>Quem opera o serviço</h2>
        <p>
          A Lumarys é uma marca da <strong>{EMPRESA.controladora}</strong>, CNPJ {EMPRESA.cnpj},
          sediada na {EMPRESA.endereco}. Ao usar o site, você concorda com estes termos.
        </p>

        <h2>O que o serviço é</h2>
        <p>
          Material de estudo organizado em trilhas, com vídeos de terceiros, explicações próprias,
          exercícios e simulados. O uso é gratuito.
        </p>

        <h2>O que o serviço não é</h2>
        <ul>
          <li>
            <strong>Não é garantia de aprovação.</strong> Nenhuma pontuação, prontidão ou selo
            deste site prevê resultado em prova real.
          </li>
          <li>
            <strong>Não é material oficial.</strong> Não temos vínculo, patrocínio nem endosso das
            empresas ou certificadoras cujas ementas servem de base. Nomes de empresas e de exames
            aparecem apenas para identificar a origem pública da ementa.
          </li>
          <li>
            <strong>Não reproduz questões de prova.</strong> Todas as perguntas são escritas do
            zero. Não publicamos nem aceitamos conteúdo obtido de exames reais.
          </li>
          <li>
            <strong>Não é aconselhamento profissional.</strong> Exemplos técnicos são didáticos e
            simplificados; decisões de arquitetura no seu trabalho são sua responsabilidade.
          </li>
        </ul>

        <h2>Conta e uso aceitável</h2>
        <p>
          A conta é pessoal e o acesso se dá por código enviado ao seu e-mail. Você é responsável
          pelo acesso à sua caixa de e-mail. É proibido tentar burlar limites técnicos, sobrecarregar
          o serviço, extrair conteúdo em massa de forma automatizada ou usar o site para atividade
          ilícita.
        </p>

        <h2>Conteúdo e licenças</h2>
        <p>
          O código-fonte da plataforma é aberto sob licença MIT. O conteúdo editorial (explicações,
          exercícios, perguntas e rubricas) é licenciado sob Creative Commons
          BY-NC-SA 4.0: você pode compartilhar e adaptar citando a fonte, sem uso comercial e
          mantendo a mesma licença. Vídeos e artigos linkados pertencem a seus autores e seguem os
          termos das plataformas de origem.
        </p>

        <h2>Disponibilidade</h2>
        <p>
          O serviço é oferecido no estado em que se encontra, sem garantia de disponibilidade
          contínua. Podemos alterar, suspender ou encerrar funcionalidades, avisando com
          antecedência razoável quando a mudança afetar quem tem conta.
        </p>

        <h2>Limitação de responsabilidade</h2>
        <p>
          Na máxima extensão permitida pela lei brasileira, a {EMPRESA.controladora} não responde
          por danos indiretos decorrentes do uso do site, incluindo resultado em processo seletivo
          ou prova.
        </p>

        <h2>Lei aplicável e foro</h2>
        <p>
          Aplica-se a lei brasileira. Fica eleito o foro da comarca de Joinville, Santa Catarina,
          para dirimir controvérsias, salvo quando a lei garantir ao consumidor foro diverso.
        </p>

        <p className="mt-4 text-sm text-[var(--muted)]">
          Veja também a <Link href="/privacidade/">política de privacidade</Link>.
        </p>
      </div>
    </AppShell>
  );
}
