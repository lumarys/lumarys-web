"use client";

/**
 * Login sem senha no Cognito, direto pelo SDK — sem Amplify, que traria alguns
 * megabytes para fazer três chamadas.
 *
 * Fluxo para quem já tem conta: InitiateAuth com USER_AUTH pedindo EMAIL_OTP,
 * o Cognito manda o código e devolve uma sessão; RespondToAuthChallenge com o
 * código fecha o login.
 *
 * Fluxo para quem nunca entrou: SignUp sem senha cria a conta e manda o código
 * de confirmação; ConfirmSignUp devolve uma sessão que o InitiateAuth aceita
 * para entrar na hora, sem um segundo e-mail. É indispensável passar por aqui:
 * InitiateAuth para um e-mail que não existe no pool devolve um desafio de
 * mentira (proteção contra enumeração) e nenhum e-mail sai — a tela ficaria
 * esperando um código que nunca chega. Foi o que aconteceu no primeiro teste
 * real, em 04/09/2026.
 *
 * Onde os tokens ficam: access e id em memória (somem ao fechar a aba), refresh
 * em localStorage. Guardar o refresh é o que permite continuar logado; ele vale
 * 30 dias, é revogável no logout, e a política de conteúdo do site bloqueia
 * script de terceiro justamente para proteger esse ponto.
 */

const REGIAO = process.env.NEXT_PUBLIC_COGNITO_REGION ?? "us-east-1";
const CLIENT_ID = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID ?? "";
const CHAVE_REFRESH = "lumarys.refresh.v1";
const CHAVE_EMAIL = "lumarys.email.v1";

export const authConfigurada = CLIENT_ID.length > 0;

const ENDPOINT = `https://cognito-idp.${REGIAO}.amazonaws.com/`;

type Sessao = { accessToken: string; idToken: string; expiraEm: number };

let sessao: Sessao | null = null;

async function chamar(alvo: string, corpo: unknown): Promise<Record<string, unknown>> {
  const resposta = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "content-type": "application/x-amz-json-1.1",
      "x-amz-target": `AWSCognitoIdentityProviderService.${alvo}`,
    },
    body: JSON.stringify(corpo),
    signal: AbortSignal.timeout(20_000),
  });

  const dados = (await resposta.json().catch(() => ({}))) as Record<string, unknown>;
  if (!resposta.ok) {
    const tipo =
      String(dados.__type ?? "")
        .split("#")
        .pop() ?? "ErroDesconhecido";
    throw new ErroAuth(tipo, String(dados.message ?? "Falha ao falar com o serviço de acesso."));
  }
  return dados;
}

export class ErroAuth extends Error {
  constructor(
    readonly codigo: string,
    mensagem: string,
  ) {
    super(mensagem);
    this.name = "ErroAuth";
  }

  /** Mensagem que faz sentido para quem está tentando entrar. */
  get amigavel(): string {
    switch (this.codigo) {
      case "CodeMismatchException":
        return "Código incorreto. Confira e tente de novo.";
      case "ExpiredCodeException":
        return "Esse código expirou. Peça um novo.";
      case "TooManyRequestsException":
      case "LimitExceededException":
        return "Muitas tentativas. Espere um minuto e tente de novo.";
      case "NotAuthorizedException":
        return "Não consegui validar esse acesso. Comece de novo.";
      case "InvalidParameterException":
        return "E-mail inválido.";
      case "CodeDeliveryFailureException":
        return "Não consegui entregar o e-mail nesse endereço. Confira se está certo.";
      case "UserNotConfirmedException":
        return "Esse e-mail ainda não confirmou o cadastro. Peça um novo código.";
      default:
        return "Não consegui completar o acesso agora. Tente de novo em instantes.";
    }
  }
}

/**
 * Onde o código deve ser conferido. "cadastro" é primeira entrada (o código
 * veio do SignUp); "login" é conta existente (o código veio do desafio
 * EMAIL_OTP). A sessão do cadastro é opcional: sem ela, a confirmação vale,
 * mas o login exige um segundo código.
 */
export type Desafio = { tipo: "cadastro"; sessao?: string } | { tipo: "login"; sessao: string };

function normalizar(email: string): string {
  return email.trim().toLowerCase();
}

/** Passo 1: pede o código. Cria a conta se for a primeira vez. */
export async function pedirCodigo(email: string): Promise<Desafio> {
  const usuario = normalizar(email);

  // Primeiro tenta criar. Conta nova recebe o código de confirmação e uma
  // sessão que permite entrar sem segundo e-mail. Conta que já existe cai no
  // UsernameExistsException e segue para o login normal.
  try {
    const cadastro = await chamar("SignUp", {
      ClientId: CLIENT_ID,
      Username: usuario,
      UserAttributes: [{ Name: "email", Value: usuario }],
    });
    return {
      tipo: "cadastro",
      sessao: typeof cadastro.Session === "string" ? cadastro.Session : undefined,
    };
  } catch (e) {
    if (!(e instanceof ErroAuth) || e.codigo !== "UsernameExistsException") throw e;
  }

  try {
    return { tipo: "login", sessao: await iniciarDesafio(usuario) };
  } catch (e) {
    // Cadastrou, não confirmou e voltou: reenvia o código de confirmação.
    if (e instanceof ErroAuth && e.codigo === "UserNotConfirmedException") {
      await chamar("ResendConfirmationCode", { ClientId: CLIENT_ID, Username: usuario });
      return { tipo: "cadastro" };
    }
    throw e;
  }
}

async function iniciarDesafio(usuario: string): Promise<string> {
  const dados = await chamar("InitiateAuth", {
    AuthFlow: "USER_AUTH",
    ClientId: CLIENT_ID,
    AuthParameters: { USERNAME: usuario, PREFERRED_CHALLENGE: "EMAIL_OTP" },
  });

  const desafio = dados.Session;
  if (typeof desafio !== "string") {
    throw new ErroAuth("SemSessao", "O serviço não devolveu uma sessão de desafio.");
  }
  return desafio;
}

/**
 * Passo 2: confirma o código e guarda a sessão. Devolve `null` quando entrou;
 * devolve um novo desafio quando o cadastro foi confirmado mas o login ainda
 * precisa de um código de acesso (segundo e-mail).
 */
export async function confirmarCodigo(
  email: string,
  codigo: string,
  desafio: Desafio,
): Promise<Desafio | null> {
  const usuario = normalizar(email);
  const codigoLimpo = codigo.trim();

  if (desafio.tipo === "login") {
    const dados = await chamar("RespondToAuthChallenge", {
      ChallengeName: "EMAIL_OTP",
      ClientId: CLIENT_ID,
      Session: desafio.sessao,
      ChallengeResponses: { USERNAME: usuario, EMAIL_OTP_CODE: codigoLimpo },
    });
    guardar(dados.AuthenticationResult as Record<string, unknown> | undefined, usuario);
    return null;
  }

  const confirmacao = await chamar("ConfirmSignUp", {
    ClientId: CLIENT_ID,
    Username: usuario,
    ConfirmationCode: codigoLimpo,
    ...(desafio.sessao ? { Session: desafio.sessao } : {}),
  });

  // Com a sessão da confirmação, o InitiateAuth entrega os tokens direto:
  // o e-mail acabou de ser provado.
  if (typeof confirmacao.Session === "string") {
    const dados = await chamar("InitiateAuth", {
      AuthFlow: "USER_AUTH",
      ClientId: CLIENT_ID,
      Session: confirmacao.Session,
      AuthParameters: { USERNAME: usuario },
    });
    if (dados.AuthenticationResult) {
      guardar(dados.AuthenticationResult as Record<string, unknown>, usuario);
      return null;
    }
  }

  return { tipo: "login", sessao: await iniciarDesafio(usuario) };
}

function guardar(resultado: Record<string, unknown> | undefined, email?: string) {
  if (!resultado) throw new ErroAuth("SemTokens", "O serviço não devolveu os tokens de acesso.");

  const access = String(resultado.AccessToken ?? "");
  const id = String(resultado.IdToken ?? "");
  const expira = Number(resultado.ExpiresIn ?? 3600);
  if (!access) throw new ErroAuth("SemTokens", "Resposta de acesso incompleta.");

  sessao = { accessToken: access, idToken: id, expiraEm: Date.now() + (expira - 60) * 1000 };

  const refresh = resultado.RefreshToken;
  try {
    if (typeof refresh === "string") window.localStorage.setItem(CHAVE_REFRESH, refresh);
    if (email) window.localStorage.setItem(CHAVE_EMAIL, email.trim().toLowerCase());
  } catch {
    /* navegador sem armazenamento: a sessão vale só enquanto a aba estiver aberta */
  }
}

/** Token para a API. Renova sozinho quando está perto de expirar. */
export async function tokenValido(): Promise<string | null> {
  if (sessao && sessao.expiraEm > Date.now()) return sessao.idToken || sessao.accessToken;

  let refresh: string | null = null;
  try {
    refresh = window.localStorage.getItem(CHAVE_REFRESH);
  } catch {
    return null;
  }
  if (!refresh) return null;

  try {
    const dados = await chamar("InitiateAuth", {
      AuthFlow: "REFRESH_TOKEN_AUTH",
      ClientId: CLIENT_ID,
      AuthParameters: { REFRESH_TOKEN: refresh },
    });
    guardar(dados.AuthenticationResult as Record<string, unknown> | undefined);
    return sessao ? sessao.idToken || sessao.accessToken : null;
  } catch {
    // Refresh vencido ou revogado: cai para o modo convidado sem estourar erro
    // na cara de quem só queria estudar.
    limparLocal();
    return null;
  }
}

export function emailSalvo(): string | null {
  try {
    return window.localStorage.getItem(CHAVE_EMAIL);
  } catch {
    return null;
  }
}

export function temSessaoPersistida(): boolean {
  try {
    return Boolean(window.localStorage.getItem(CHAVE_REFRESH));
  } catch {
    return false;
  }
}

/** Sair revoga o refresh no servidor; não basta apagar do navegador. */
export async function sair(): Promise<void> {
  let refresh: string | null = null;
  try {
    refresh = window.localStorage.getItem(CHAVE_REFRESH);
  } catch {
    /* segue para a limpeza local */
  }

  if (refresh) {
    try {
      await chamar("RevokeToken", { ClientId: CLIENT_ID, Token: refresh });
    } catch {
      /* se a revogação falhar, o token ainda sai deste aparelho */
    }
  }
  limparLocal();
}

function limparLocal() {
  sessao = null;
  try {
    window.localStorage.removeItem(CHAVE_REFRESH);
    window.localStorage.removeItem(CHAVE_EMAIL);
  } catch {
    /* nada a limpar */
  }
}
