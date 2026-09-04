import type { Metadata } from "next";
import Link from "next/link";

import { AppShell } from "@/components/layout/AppShell";
import { Rotulo } from "@/components/ui/Card";
import { ContatoLink } from "@/components/layout/ContatoLink";
import { EMPRESA } from "@/lib/company";
import { alternativas } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Política de privacidade",
  description:
    "Quais dados a Lumarys trata, para quê, por quanto tempo e como exercer seus direitos sob a LGPD.",
  alternates: alternativas("/privacidade/"),
};

const ATUALIZADO = "3 de setembro de 2026";

export default function PaginaPrivacidade() {
  return (
    <AppShell comCabecalho>
      <div className="prose-lumarys px-5 pb-8 pt-5">
        <Rotulo>Legal</Rotulo>
        <h1 className="font-display mt-1.5 text-[26px] font-bold leading-tight">
          Política de privacidade
        </h1>
        <p className="mt-1 text-xs text-[var(--muted)]">Atualizada em {ATUALIZADO}</p>

        <h2>Quem é o controlador</h2>
        <p>
          A Lumarys é uma marca da <strong>{EMPRESA.controladora}</strong>, CNPJ{" "}
          {EMPRESA.cnpj}, com sede na {EMPRESA.endereco}. A {EMPRESA.controladora} é a
          controladora dos dados pessoais tratados neste site, nos termos da Lei 13.709/2018
          (LGPD).
        </p>

        <h2>Quais dados tratamos</h2>
        <p>
          <strong>Sem conta.</strong> Você pode estudar sem se identificar. Nesse caso, seu
          progresso (temas concluídos, respostas de quiz, estado dos flashcards, plano de estudo)
          fica <strong>apenas no seu navegador</strong>, em armazenamento local. Nada disso chega
          aos nossos servidores, e limpar os dados do site apaga tudo.
        </p>
        <p>
          <strong>Com conta.</strong> Se você optar por salvar o progresso para continuar em outro
          aparelho, tratamos: seu <strong>endereço de e-mail</strong>, usado só para enviar o
          código de acesso e identificar sua conta; e o <strong>seu progresso de estudo</strong>,
          para sincronizar entre aparelhos. Não pedimos nome, telefone, documento nem dado de
          pagamento. Não usamos senha.
        </p>
        <p>
          <strong>Gravações de voz.</strong> No simulado, você pode gravar sua resposta para se
          ouvir. Esse áudio <strong>nunca sai do seu aparelho</strong>: ele não é enviado, não é
          armazenado por nós e é descartado quando você troca de pergunta ou fecha a página.
        </p>
        <p>
          <strong>Registros técnicos.</strong> O serviço de entrega de conteúdo registra acessos
          (endereço IP, data, hora, página e navegador) por prazo curto, para segurança e
          diagnóstico. Não usamos ferramentas de análise de comportamento nem publicidade, e não
          instalamos cookies de rastreamento.
        </p>

        <h2>Para que tratamos e com qual base legal</h2>
        <ul>
          <li>
            <strong>Autenticar você e sincronizar seu progresso:</strong> execução do serviço que
            você solicitou (art. 7º, V, LGPD).
          </li>
          <li>
            <strong>Enviar o código de acesso por e-mail:</strong> execução do serviço (art. 7º, V).
          </li>
          <li>
            <strong>Segurança, prevenção a fraude e diagnóstico:</strong> legítimo interesse
            (art. 7º, IX), limitado ao mínimo necessário.
          </li>
        </ul>

        <h2>Com quem compartilhamos</h2>
        <p>
          Usamos a Amazon Web Services como provedora de infraestrutura (hospedagem, autenticação,
          banco de dados e envio de e-mail), em regiões fora do Brasil. Não vendemos, alugamos nem
          cedemos dados pessoais para terceiros com finalidade publicitária.
        </p>
        <p>
          As páginas de tema incorporam vídeos do YouTube. O player só é carregado{" "}
          <strong>depois que você toca em assistir</strong>, e usamos o domínio sem cookies do
          YouTube. A partir do toque, valem os termos e a política de privacidade do Google.
        </p>

        <h2>Por quanto tempo guardamos</h2>
        <p>
          Enquanto sua conta existir. Uma conta sem nenhum acesso por 24 meses é apagada
          automaticamente. Você pode excluir a conta a qualquer momento, e a exclusão remove o
          e-mail e todo o progresso associado.
        </p>

        <h2>Seus direitos</h2>
        <p>
          A LGPD garante confirmação de tratamento, acesso, correção, anonimização, portabilidade,
          eliminação, informação sobre compartilhamento e revogação de consentimento. Na prática:
        </p>
        <ul>
          <li>
            <strong>Acesso e portabilidade:</strong> a tela da conta tem um botão que exporta todos
            os seus dados em JSON.
          </li>
          <li>
            <strong>Eliminação:</strong> a mesma tela tem o botão de excluir conta, que apaga tudo
            imediatamente.
          </li>
          <li>
            <strong>Demais direitos:</strong> escreva para a {EMPRESA.controladora} pelo contato
            abaixo.
          </li>
        </ul>

        <h2>Menores de idade</h2>
        <p>
          O serviço é dirigido a profissionais. Não tratamos conscientemente dados de menores de 16
          anos.
        </p>

        <h2>Segurança</h2>
        <p>
          Dados em trânsito trafegam por HTTPS. Dados em repouso ficam criptografados na
          infraestrutura da AWS. O acesso administrativo é restrito e auditado. Nunca pedimos senha
          nem código de acesso por telefone, mensagem ou e-mail de resposta.
        </p>

        <h2>Mudanças nesta política</h2>
        <p>
          Se algo mudar, atualizamos a data no topo. Mudança relevante para quem tem conta é
          avisada por e-mail.
        </p>

        <h2>Contato e encarregado</h2>
        <p>
          Fale com a {EMPRESA.controladora} pelo canal abaixo; pedidos relacionados a dados
          pessoais são encaminhados ao encarregado.
        </p>
        <ContatoLink
          rotulo="Falar sobre meus dados"
          className="mt-2 flex min-h-12 w-full items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--elevated)] text-sm font-semibold"
        />
        <p className="mt-4 text-sm text-[var(--muted)]">
          Veja também os <Link href="/termos/">termos de uso</Link>.
        </p>
      </div>
    </AppShell>
  );
}
