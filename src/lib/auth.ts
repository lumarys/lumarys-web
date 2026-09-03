"use client";

/**
 * Login sem senha no Cognito, direto pelo SDK — sem Amplify, que traria alguns
 * megabytes para fazer três chamadas.
 *
 * Fluxo: InitiateAuth com USER_AUTH pedindo EMAIL_OTP, o Cognito manda o código
 * e devolve uma sessão; RespondToAuthChallenge com o código fecha o login.
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
    const tipo = String(dados.__type ?? "").split("#").pop() ?? "ErroDesconhecido";
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
      default:
        return "Não consegui completar o acesso agora. Tente de novo em instantes.";
    }
  }
}

/** Passo 1: pede o código. Devolve a sessão do desafio. */
export async function pedirCodigo(email: string): Promise<string> {
  const dados = await chamar("InitiateAuth", {
    AuthFlow: "USER_AUTH",
    ClientId: CLIENT_ID,
    AuthParameters: { USERNAME: email.trim().toLowerCase(), PREFERRED_CHALLENGE: "EMAIL_OTP" },
  });

  const desafio = dados.Session;
  if (typeof desafio !== "string") {
    throw new ErroAuth("SemSessao", "O serviço não devolveu uma sessão de desafio.");
  }
  return desafio;
}

/** Passo 2: confirma o código e guarda a sessão. */
export async function confirmarCodigo(
  email: string,
  codigo: string,
  desafio: string,
): Promise<void> {
  const dados = await chamar("RespondToAuthChallenge", {
    ChallengeName: "EMAIL_OTP",
    ClientId: CLIENT_ID,
    Session: desafio,
    ChallengeResponses: { USERNAME: email.trim().toLowerCase(), EMAIL_OTP_CODE: codigo.trim() },
  });

  guardar(dados.AuthenticationResult as Record<string, unknown> | undefined, email);
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
