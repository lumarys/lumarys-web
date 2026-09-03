/**
 * API de progresso da Lumarys.
 *
 * Regra de ouro: o usuário vem SEMPRE do `sub` do JWT que o API Gateway já
 * validou, nunca do corpo da requisição. Cada rota opera apenas na partição
 * `u#<sub>`, então não existe caminho para ler o progresso de outra pessoa.
 */
import {
  DynamoDBClient,
} from "@aws-sdk/client-dynamodb";
import {
  BatchWriteCommand,
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import {
  CognitoIdentityProviderClient,
  AdminDeleteUserCommand,
} from "@aws-sdk/client-cognito-identity-provider";

const TABELA = process.env.TABELA!;
const USER_POOL_ID = process.env.USER_POOL_ID!;
const ORIGEM = process.env.ORIGEM_PERMITIDA ?? "https://lumarys.com.br";

/** 24 meses sem acesso e o item expira sozinho (LGPD, minimização). */
const TTL_SEGUNDOS = 60 * 60 * 24 * 730;
const TAMANHO_MAXIMO = 64 * 1024;

const dynamo = DynamoDBDocumentClient.from(new DynamoDBClient({}), {
  marshallOptions: { removeUndefinedValues: true },
});
const cognito = new CognitoIdentityProviderClient({});

type Evento = {
  routeKey?: string;
  rawPath?: string;
  body?: string;
  pathParameters?: Record<string, string | undefined>;
  requestContext?: { authorizer?: { jwt?: { claims?: Record<string, unknown> } } };
};

export async function handler(evento: Evento) {
  const sub = evento.requestContext?.authorizer?.jwt?.claims?.sub;
  if (typeof sub !== "string" || sub.length === 0) {
    return responder(401, { erro: "sem_identidade" });
  }

  const pk = `u#${sub}`;
  const rota = evento.routeKey ?? "";

  try {
    switch (rota) {
      case "GET /me/progresso":
        return responder(200, { itens: await lerTudo(pk) });

      case "PUT /me/progresso/{trilha}":
        return await gravar(pk, `trilha#${slug(evento.pathParameters?.trilha)}`, evento.body);

      case "PUT /me/cards/{trilha}":
        return await gravar(pk, `cards#${slug(evento.pathParameters?.trilha)}`, evento.body);

      case "GET /me/exportar": {
        const itens = await lerTudo(pk);
        return responder(
          200,
          { exportadoEm: new Date().toISOString(), usuario: sub, itens },
          { "content-disposition": 'attachment; filename="lumarys-meus-dados.json"' },
        );
      }

      case "DELETE /me":
        await apagarTudo(pk);
        await cognito.send(
          new AdminDeleteUserCommand({ UserPoolId: USER_POOL_ID, Username: sub }),
        );
        return responder(200, { removido: true });

      default:
        return responder(404, { erro: "rota_desconhecida" });
    }
  } catch (e) {
    // A mensagem do erro nunca volta para o cliente: pode conter nome de
    // recurso interno. O log tem o detalhe; a resposta, só o código.
    console.error("falha ao atender", rota, e);
    return responder(500, { erro: "falha_interna" });
  }
}

async function lerTudo(pk: string) {
  const itens: Record<string, unknown>[] = [];
  let cursor: Record<string, unknown> | undefined;

  do {
    const resposta = await dynamo.send(
      new QueryCommand({
        TableName: TABELA,
        KeyConditionExpression: "pk = :pk",
        ExpressionAttributeValues: { ":pk": pk },
        ExclusiveStartKey: cursor as never,
      }),
    );
    for (const item of resposta.Items ?? []) {
      const { pk: _pk, expiresAt: _ttl, ...resto } = item as Record<string, unknown>;
      itens.push(resto);
    }
    cursor = resposta.LastEvaluatedKey as Record<string, unknown> | undefined;
  } while (cursor);

  return itens;
}

async function gravar(pk: string, sk: string, corpo: string | undefined) {
  if (!corpo) return responder(400, { erro: "corpo_vazio" });
  if (Buffer.byteLength(corpo, "utf8") > TAMANHO_MAXIMO) {
    return responder(413, { erro: "corpo_grande_demais" });
  }

  let dados: unknown;
  try {
    dados = JSON.parse(corpo);
  } catch {
    return responder(400, { erro: "json_invalido" });
  }

  if (typeof dados !== "object" || dados === null || Array.isArray(dados)) {
    return responder(400, { erro: "formato_invalido" });
  }

  // Campos de controle vêm do servidor, não do cliente: quem manda o corpo não
  // decide a própria chave nem o próprio prazo de retenção.
  const { pk: _a, sk: _b, expiresAt: _c, ...conteudo } = dados as Record<string, unknown>;

  const agora = Date.now();
  await dynamo.send(
    new PutCommand({
      TableName: TABELA,
      Item: {
        ...conteudo,
        pk,
        sk,
        atualizadoEm: agora,
        expiresAt: Math.floor(agora / 1000) + TTL_SEGUNDOS,
      },
    }),
  );

  return responder(200, { gravado: true, sk, atualizadoEm: agora });
}

async function apagarTudo(pk: string) {
  const itens = await dynamo.send(
    new QueryCommand({
      TableName: TABELA,
      KeyConditionExpression: "pk = :pk",
      ExpressionAttributeValues: { ":pk": pk },
      ProjectionExpression: "pk, sk",
    }),
  );

  const chaves = (itens.Items ?? []) as { pk: string; sk: string }[];
  for (let i = 0; i < chaves.length; i += 25) {
    const lote = chaves.slice(i, i + 25);
    await dynamo.send(
      new BatchWriteCommand({
        RequestItems: {
          [TABELA]: lote.map((chave) => ({ DeleteRequest: { Key: chave } })),
        },
      }),
    );
  }
}

/** Só letras, números e hífen: o slug entra na chave de ordenação. */
function slug(valor: string | undefined): string {
  const limpo = (valor ?? "").toLowerCase().replace(/[^a-z0-9-]/g, "");
  if (!limpo) throw new Error("slug de trilha inválido");
  return limpo.slice(0, 80);
}

function responder(status: number, corpo: unknown, cabecalhos: Record<string, string> = {}) {
  return {
    statusCode: status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "access-control-allow-origin": ORIGEM,
      "cache-control": "no-store",
      ...cabecalhos,
    },
    body: JSON.stringify(corpo),
  };
}

export const _teste = { slug };
