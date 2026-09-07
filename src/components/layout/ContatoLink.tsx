"use client";

import { CONTATO_EMAIL, enderecoDeContato } from "@/lib/company";
import { cx } from "@/lib/utils";

/**
 * O botão monta o `mailto:` no clique, padrão anti-robô usado em cernyn.com e
 * youco.io. O que mudou: o endereço também aparece em texto.
 *
 * Sem isso, a página de contato não fazia nada em navegador sem JavaScript ou
 * sem cliente de e-mail configurado, e não havia endereço nenhum para copiar —
 * era o ponto de falha mais concreto do site. Guardar o endereço de um negócio
 * de robô não vale uma página de contato que não funciona.
 */
export function ContatoLink({
  className,
  rotulo = "Contato",
  comEndereco = false,
  assunto,
}: {
  className?: string;
  rotulo?: string;
  /** Mostra o endereço em texto ao lado do botão. */
  comEndereco?: boolean;
  /** Preenche o assunto da mensagem, para o pedido chegar já classificado. */
  assunto?: string;
}) {
  const endereco = CONTATO_EMAIL;

  return (
    <>
      <button
        type="button"
        className={className}
        onClick={() => {
          window.location.href = enderecoDeContato(assunto);
        }}
      >
        {rotulo}
      </button>
      {comEndereco ? (
        <p className={cx("mt-2 text-center text-sm text-[var(--text-2)]")}>
          ou escreva para <span className="font-semibold text-[var(--text)]">{endereco}</span>
        </p>
      ) : null}
    </>
  );
}
