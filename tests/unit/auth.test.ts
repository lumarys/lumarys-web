import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * O login sem senha tem dois caminhos, e o defeito que motivou este teste foi
 * não ter o primeiro: e-mail novo ia direto para InitiateAuth, o Cognito
 * devolvia um desafio de mentira (anti-enumeração) e nenhum e-mail saía.
 */

type Chamada = { alvo: string; corpo: Record<string, unknown> };

function respostas(plano: (Record<string, unknown> | Error)[]) {
  const chamadas: Chamada[] = [];
  const fetchFalso = vi.fn(async (_url: string, init: RequestInit) => {
    const alvo = String((init.headers as Record<string, string>)["x-amz-target"])
      .split(".")
      .pop()!;
    chamadas.push({ alvo, corpo: JSON.parse(String(init.body)) });
    const proxima = plano.shift();
    if (proxima instanceof Error) {
      return new Response(JSON.stringify({ __type: proxima.name, message: proxima.message }), {
        status: 400,
      });
    }
    return new Response(JSON.stringify(proxima ?? {}), { status: 200 });
  });
  vi.stubGlobal("fetch", fetchFalso);
  return chamadas;
}

function erro(tipo: string): Error {
  const e = new Error(tipo);
  e.name = tipo;
  return e;
}

const TOKENS = { AccessToken: "a", IdToken: "i", RefreshToken: "r", ExpiresIn: 3600 };

describe("login sem senha", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_COGNITO_CLIENT_ID", "cliente-teste");
    vi.resetModules();
    window.localStorage.clear();
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("e-mail novo: cria a conta e o código vem do SignUp, não de um desafio falso", async () => {
    const chamadas = respostas([{ UserConfirmed: false, Session: "s-cadastro" }]);
    const { pedirCodigo } = await import("@/lib/auth");

    const desafio = await pedirCodigo("  Nova@Exemplo.com ");

    expect(desafio).toEqual({ tipo: "cadastro", sessao: "s-cadastro" });
    expect(chamadas.map((c) => c.alvo)).toEqual(["SignUp"]);
    expect(chamadas[0]?.corpo).toMatchObject({ Username: "nova@exemplo.com" });
    expect(chamadas[0]?.corpo).not.toHaveProperty("Password");
  });

  it("e-mail conhecido: SignUp recusa e o código vem do desafio EMAIL_OTP", async () => {
    const chamadas = respostas([erro("UsernameExistsException"), { Session: "s-login" }]);
    const { pedirCodigo } = await import("@/lib/auth");

    const desafio = await pedirCodigo("volta@exemplo.com");

    expect(desafio).toEqual({ tipo: "login", sessao: "s-login" });
    expect(chamadas.map((c) => c.alvo)).toEqual(["SignUp", "InitiateAuth"]);
    expect(chamadas[1]?.corpo).toMatchObject({
      AuthFlow: "USER_AUTH",
      AuthParameters: { USERNAME: "volta@exemplo.com", PREFERRED_CHALLENGE: "EMAIL_OTP" },
    });
  });

  it("cadastro sem confirmar: reenvia o código de confirmação", async () => {
    const chamadas = respostas([
      erro("UsernameExistsException"),
      erro("UserNotConfirmedException"),
      {},
    ]);
    const { pedirCodigo } = await import("@/lib/auth");

    expect(await pedirCodigo("pendente@exemplo.com")).toEqual({ tipo: "cadastro" });
    expect(chamadas.map((c) => c.alvo)).toEqual([
      "SignUp",
      "InitiateAuth",
      "ResendConfirmationCode",
    ]);
  });

  it("confirmação com sessão entra na hora, sem segundo e-mail", async () => {
    const chamadas = respostas([{ Session: "s-confirmado" }, { AuthenticationResult: TOKENS }]);
    const { confirmarCodigo } = await import("@/lib/auth");

    const proximo = await confirmarCodigo("nova@exemplo.com", "123456", {
      tipo: "cadastro",
      sessao: "s-cadastro",
    });

    expect(proximo).toBeNull();
    expect(chamadas.map((c) => c.alvo)).toEqual(["ConfirmSignUp", "InitiateAuth"]);
    expect(chamadas[0]?.corpo).toMatchObject({ ConfirmationCode: "123456", Session: "s-cadastro" });
    expect(chamadas[1]?.corpo).toMatchObject({ AuthFlow: "USER_AUTH", Session: "s-confirmado" });
    expect(window.localStorage.getItem("lumarys.refresh.v1")).toBe("r");
    expect(window.localStorage.getItem("lumarys.email.v1")).toBe("nova@exemplo.com");
  });

  it("confirmação sem sessão pede um código de acesso e devolve o novo desafio", async () => {
    const chamadas = respostas([{}, { Session: "s-login" }]);
    const { confirmarCodigo } = await import("@/lib/auth");

    const proximo = await confirmarCodigo("pendente@exemplo.com", "123456", { tipo: "cadastro" });

    expect(proximo).toEqual({ tipo: "login", sessao: "s-login" });
    expect(chamadas.map((c) => c.alvo)).toEqual(["ConfirmSignUp", "InitiateAuth"]);
    expect(window.localStorage.getItem("lumarys.refresh.v1")).toBeNull();
  });

  it("login: responde o desafio e guarda os tokens", async () => {
    const chamadas = respostas([{ AuthenticationResult: TOKENS }]);
    const { confirmarCodigo } = await import("@/lib/auth");

    const proximo = await confirmarCodigo("volta@exemplo.com", " 654321 ", {
      tipo: "login",
      sessao: "s-login",
    });

    expect(proximo).toBeNull();
    expect(chamadas[0]?.alvo).toBe("RespondToAuthChallenge");
    expect(chamadas[0]?.corpo).toMatchObject({
      ChallengeName: "EMAIL_OTP",
      Session: "s-login",
      ChallengeResponses: { USERNAME: "volta@exemplo.com", EMAIL_OTP_CODE: "654321" },
    });
    expect(window.localStorage.getItem("lumarys.refresh.v1")).toBe("r");
  });

  it("falha de entrega vira mensagem clara, em vez de esperar um código que não vem", async () => {
    respostas([erro("CodeDeliveryFailureException")]);
    const { pedirCodigo, ErroAuth } = await import("@/lib/auth");

    const promessa = pedirCodigo("ninguem@exemplo.com");
    await expect(promessa).rejects.toBeInstanceOf(ErroAuth);
    await promessa.catch((e: InstanceType<typeof ErroAuth>) => {
      expect(e.amigavel).toMatch(/entregar o e-mail/);
    });
  });
});
