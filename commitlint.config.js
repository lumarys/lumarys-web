/**
 * Conventional Commits em português.
 *
 * A base é a `config-conventional`; o que muda são dois limites que a regra
 * padrão herdou do inglês e não servem aqui:
 *
 * - `header-max-length` sobe de 100 para 120. O assunto carrega o card
 *   (`(LUM-128)`) e português é mais longo que inglês; o maior assunto já
 *   escrito neste repo tem 112 caracteres, e cortá-lo pioraria a mensagem.
 * - `subject-case` fica desligada. A regra proíbe começar por maiúscula, e em
 *   português o assunto às vezes começa por nome próprio ("Lefthook…").
 *
 * O corpo continua livre: é onde mora o porquê, e é a parte que importa.
 */
export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "header-max-length": [2, "always", 120],
    "subject-case": [0],
    "body-max-line-length": [0],
    "footer-max-line-length": [0],
  },
};
