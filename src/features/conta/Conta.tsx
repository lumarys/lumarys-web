"use client";

import { useState } from "react";

import { Card, Rotulo, RotuloAcento } from "@/components/ui/Card";
import { IconeAlerta, IconeCheck, IconeConta } from "@/components/ui/icons";
import { useProgresso } from "@/features/progresso/useProgresso";
import { useSessao } from "./useSessao";
import {
  authConfigurada,
  confirmarCodigo,
  digitosDoCodigo,
  ErroAuth,
  pedirCodigo,
  sair,
  type Desafio,
} from "@/lib/auth";
import { entrarEMesclar, excluirConta, exportar, syncConfigurado } from "@/lib/sync";
import { cx } from "@/lib/utils";

type Etapa = "deslogado" | "codigo" | "logado";

export function Conta() {
  const { progresso, pronto, recarregar } = useProgresso();
  const sessao = useSessao();
  // Enquanto o pedido de código está aberto, a etapa é local; fora disso, quem
  // manda é a sessão que existe no aparelho.
  const [etapaLocal, setEtapaLocal] = useState<Etapa | null>(null);
  const etapa: Etapa = etapaLocal ?? (sessao.logado ? "logado" : "deslogado");
  const [emailDigitado, setEmailDigitado] = useState("");
  const email = etapaLocal === null && sessao.logado ? (sessao.email ?? "") : emailDigitado;
  const [codigo, setCodigo] = useState("");
  const [desafio, setDesafio] = useState<Desafio | null>(null);
  const digitos = digitosDoCodigo(desafio);
  const [erro, setErro] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);

  const temasConcluidos = Object.values(progresso.trilhas).reduce(
    (acc, t) => acc + Object.keys(t.temasConcluidos).length,
    0,
  );
  const totalCards = Object.keys(progresso.cards).length;

  const disponivel = authConfigurada && syncConfigurado;

  async function enviarEmail() {
    setErro(null);
    setOcupado(true);
    try {
      setDesafio(await pedirCodigo(email));
      setEtapaLocal("codigo");
    } catch (e) {
      setErro(e instanceof ErroAuth ? e.amigavel : "Não consegui enviar o código agora.");
    } finally {
      setOcupado(false);
    }
  }

  async function validarCodigo() {
    setErro(null);
    setOcupado(true);
    try {
      if (!desafio) throw new ErroAuth("SemDesafio", "Peça o código de novo.");
      const proximo = await confirmarCodigo(email, codigo, desafio);
      if (proximo) {
        // Cadastro confirmado, mas o login precisa de um código próprio.
        setDesafio(proximo);
        setCodigo("");
        setAviso("Cadastro confirmado. Mandei o código de acesso; digite o novo.");
        return;
      }
      await entrarEMesclar();
      recarregar();
      sessao.atualizar();
      setEtapaLocal(null);
      setAviso("Progresso deste aparelho juntado à sua conta.");
    } catch (e) {
      setErro(e instanceof ErroAuth ? e.amigavel : "Não consegui validar o código.");
    } finally {
      setOcupado(false);
    }
  }

  async function baixarDados() {
    const blob = await exportar();
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "lumarys-meus-dados.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function apagar() {
    const certeza = window.confirm(
      "Isso apaga sua conta, seu e-mail e todo o progresso salvo, sem volta. Confirma?",
    );
    if (!certeza) return;

    setOcupado(true);
    const ok = await excluirConta();
    await sair();
    setOcupado(false);
    sessao.atualizar();
    setEtapaLocal(null);
    setAviso(
      ok
        ? "Conta e dados apagados. O progresso deste aparelho continua aqui."
        : "Saí deste aparelho, mas não consegui confirmar a exclusão no servidor. Tente de novo ou fale com a gente.",
    );
  }

  if (!pronto || !sessao.pronto) {
    return <div className="mx-5 h-40 animate-pulse rounded-2xl border border-[var(--border)]" />;
  }

  return (
    <div className="flex flex-col gap-3.5 px-5">
      <Card>
        <Rotulo className="mb-2">Neste aparelho</Rotulo>
        <p className="text-[15px] leading-relaxed">
          {temasConcluidos === 0 && totalCards === 0
            ? "Nenhum progresso ainda. Comece por um tema."
            : `${temasConcluidos} tema${temasConcluidos === 1 ? "" : "s"} concluído${temasConcluidos === 1 ? "" : "s"} e ${totalCards} card${totalCards === 1 ? "" : "s"} em revisão.`}
        </p>
        <p className="mt-2 text-[13px] leading-relaxed text-[var(--muted)]">
          Sem conta, tudo isso fica só neste navegador. Limpar os dados do site apaga.
        </p>
      </Card>

      {aviso ? (
        <p className="flex items-start gap-2 rounded-xl border border-[var(--color-success)]/40 bg-[var(--color-success)]/10 px-3.5 py-3 text-sm text-[var(--color-success)]">
          <IconeCheck size={18} className="mt-0.5 shrink-0" />
          {aviso}
        </p>
      ) : null}

      {!disponivel ? (
        <Card>
          <RotuloAcento>Conta ainda não ligada</RotuloAcento>
          <p className="mt-2 text-[15px] leading-relaxed">
            A sincronização entre aparelhos entra assim que a infraestrutura de acesso for
            publicada. Até lá, seu progresso é guardado neste navegador e funciona normalmente.
          </p>
          <button
            type="button"
            onClick={baixarDados}
            className="mt-3 min-h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--elevated)] text-sm font-semibold"
          >
            Exportar meus dados
          </button>
        </Card>
      ) : etapa === "logado" ? (
        <Card>
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-full bg-[var(--elevated)] text-[var(--text-2)]">
              <IconeConta size={22} />
            </span>
            <div className="min-w-0">
              <RotuloAcento>Conectado</RotuloAcento>
              <p className="truncate text-[15px] font-semibold">{email}</p>
            </div>
          </div>
          <p className="mt-3 text-[13px] leading-relaxed text-[var(--text-2)]">
            Seu progresso é sincronizado. Entrar com este mesmo e-mail em outro aparelho traz tudo
            para lá.
          </p>

          <div className="mt-4 flex flex-col gap-2">
            <button
              type="button"
              onClick={baixarDados}
              className="min-h-12 rounded-xl border border-[var(--border)] bg-[var(--elevated)] text-sm font-semibold"
            >
              Exportar meus dados
            </button>
            <button
              type="button"
              disabled={ocupado}
              onClick={async () => {
                await sair();
                sessao.atualizar();
                setEtapaLocal(null);
                setAviso("Você saiu deste aparelho. O progresso local continua aqui.");
              }}
              className="min-h-12 rounded-xl border border-[var(--border)] text-sm font-semibold disabled:opacity-50"
            >
              Sair
            </button>
            <button
              type="button"
              disabled={ocupado}
              onClick={apagar}
              className="min-h-12 rounded-xl border border-[var(--color-danger)]/40 bg-[var(--color-danger)]/10 text-sm font-semibold text-[var(--color-danger)] disabled:opacity-50"
            >
              Excluir minha conta
            </button>
          </div>
        </Card>
      ) : (
        <Card destaque>
          <RotuloAcento>
            {etapa === "codigo" ? "Digite o código" : "Salvar meu progresso"}
          </RotuloAcento>

          {etapa === "deslogado" ? (
            <>
              <p className="mt-2 text-[15px] leading-relaxed">
                Sem senha: você recebe um código por e-mail e entra com ele. Na primeira vez, o
                mesmo código cria a conta. O que já estudou aqui é juntado a ela, nada se perde.
              </p>
              <label className="mt-4 block">
                <span className="text-[13px] font-semibold">Seu e-mail</span>
                <input
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmailDigitado(e.target.value)}
                  placeholder="voce@exemplo.com"
                  className="mt-1.5 min-h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3.5 text-[15px] text-[var(--text)]"
                />
              </label>
              <button
                type="button"
                disabled={ocupado || !email.includes("@")}
                onClick={enviarEmail}
                className="mt-3 min-h-13 w-full rounded-xl bg-[var(--accent)] text-[15px] font-semibold text-[var(--accent-ink)] disabled:opacity-40"
              >
                {ocupado ? "Enviando..." : "Receber código"}
              </button>
            </>
          ) : (
            <>
              <p className="mt-2 text-[15px] leading-relaxed">
                Mandei um código para <strong>{email}</strong>. Ele vale por poucos minutos.
              </p>
              <label className="mt-4 block">
                <span className="text-[13px] font-semibold">Código de {digitos} dígitos</span>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={digitos}
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ""))}
                  placeholder={"0".repeat(digitos)}
                  className="font-display mt-1.5 min-h-13 w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3.5 text-center text-2xl font-bold tracking-[0.3em] text-[var(--text)]"
                />
              </label>
              <button
                type="button"
                disabled={ocupado || codigo.length < digitos}
                onClick={validarCodigo}
                className="mt-3 min-h-13 w-full rounded-xl bg-[var(--accent)] text-[15px] font-semibold text-[var(--accent-ink)] disabled:opacity-40"
              >
                {ocupado ? "Validando..." : "Entrar"}
              </button>
              <button
                type="button"
                disabled={ocupado}
                onClick={() => {
                  setEtapaLocal("deslogado");
                  setCodigo("");
                  setErro(null);
                }}
                className="mt-2 min-h-11 w-full text-[13px] text-[var(--muted)]"
              >
                Usar outro e-mail
              </button>
            </>
          )}

          {erro ? (
            <p
              className={cx(
                "mt-3 flex items-start gap-2 rounded-xl px-3.5 py-3 text-sm",
                "bg-[var(--color-danger)]/10 text-[var(--color-danger)]",
              )}
            >
              <IconeAlerta size={18} className="mt-0.5 shrink-0" />
              {erro}
            </p>
          ) : null}

          <p className="mt-3 text-[11px] leading-relaxed text-[var(--muted)]">
            Guardamos apenas seu e-mail e seu progresso. Nunca pedimos senha, e nunca pedimos esse
            código por telefone ou mensagem.
          </p>
        </Card>
      )}
    </div>
  );
}
