import type { PreSignUpTriggerHandler } from "aws-lambda";

/**
 * Gatilho de pré-cadastro do Cognito: confirma o usuário e marca o e-mail como
 * verificado no ato do SignUp.
 *
 * Por quê: sem isto o Cognito manda um e-mail de confirmação (6 dígitos, um
 * template) na primeira entrada e outro de login (8 dígitos, outro template)
 * nas seguintes. Com a conta já confirmada, toda entrada passa pelo mesmo
 * desafio EMAIL_OTP: um e-mail só, sempre igual. A prova de posse do e-mail
 * continua sendo o código, que só chega a quem tem a caixa; a conta em si
 * não dá acesso a nada até o código ser respondido.
 *
 * Só o cadastro pelo app é aceito. Cadastro por provedor externo ou por
 * administrador não existe neste pool, mas se um dia existir, passa reto.
 */
export const handler: PreSignUpTriggerHandler = async (evento) => {
  if (evento.triggerSource === "PreSignUp_SignUp") {
    evento.response.autoConfirmUser = true;
    evento.response.autoVerifyEmail = true;
  }
  return evento;
};
