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
