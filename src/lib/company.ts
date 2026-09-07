/**
 * Dados da empresa responsável. A Lumarys é uma marca da Cernyn e não tem
 * caixa de e-mail própria: todo contato vai para o e-mail da Cernyn, montado
 * no clique para não virar alvo de robô de spam.
 */
export const EMPRESA = {
  marca: "Lumarys",
  tagline: "Life long Learning 4 Ever",
  monograma: "LL4E",
  controladora: "Cernyn",
  controladoraUrl: "https://cernyn.com/",
  cnpj: "65.962.788/0001-62",
  endereco: "Rua Dona Francisca, 8300 · Zona Industrial Norte · Joinville-SC · CEP 89219-600",
  selo: "Sediada no Ágora Tech Park",
  contatoUsuario: "pinus",
  contatoDominio: "cernyn.com",
  site: "https://lumarys.com.br",
} as const;

export const CONTATO_EMAIL = `${EMPRESA.contatoUsuario}@${EMPRESA.contatoDominio}`;

/**
 * Destino do botão de contato. Fica aqui, e não no componente, porque o
 * assunto é a única parte com regra: um pedido de trilha precisa chegar já
 * classificado, e um assunto com acento ou espaço tem de ser escapado.
 *
 * O "mailto" é montado por junção, e não por template, porque o linter do
 * Next lê um template atribuído a location.href como rota interna.
 */
export function enderecoDeContato(assunto?: string): string {
  const consulta = assunto ? `?subject=${encodeURIComponent(assunto)}` : "";
  return ["mailto", CONTATO_EMAIL + consulta].join(":");
}
