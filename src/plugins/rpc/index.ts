import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import { createGrpcTransport } from "@connectrpc/connect-node";
import { Game } from "@proto/rpc_pb";
import { createClient } from "@connectrpc/connect";

let session = "";

async function rpcPlugin(fastify: FastifyInstance) {
  let ready = false;

  const transport = createGrpcTransport({
    baseUrl: fastify.env.rpcHost,
  });

  const client = createClient(Game, transport);

  const pingInterval = () => {
    client
      .ping(
        {
          online: fastify.transfer.getClientsCount(),
          alive: true,
        },
        {
          headers: {
            "Alt-Authenticate": session,
          },
        },
      )
      .then((value) => {})
      .catch((err) => {
        if (err) {
          fastify.log.error({
            type: "Ping",
            message: err.message,
            code: err.code,
          });
          throw err;
        }
      });
  };

  ready = true;

  const authResp = await client.authentication({
    token: fastify.env.rpcToken,
    id: fastify.env.rpcId,
  });
  if (authResp) {
    session = authResp.session;
    fastify.log.info({
      authentication: true,
      session: authResp.session,
    });
  }
  setInterval(() => pingInterval(), fastify.env.rpcPingInterval);

  fastify.decorate("rpc", {
    async awardPlayer(id: string, vp: number, accessory: string) {
      await client.awardPlayer(
        {
          id,
          vp,
          accessory,
        },
        {
          headers: {
            "Alt-Authenticate": session,
          },
        },
      );
      fastify.log.info({
        award: {
          databaseId: id,
          vp,
          accessory,
        },
      });
    },
    async joinPlayer(token) {
      const response = await client.joinPlayer(
        {
          token,
        },
        {
          headers: {
            "Alt-Authenticate": session,
          },
        },
      );
      fastify.log.info({
        join: {
          username: response.name,
          id: response.id,
          role: response.role,
        },
      });
      return response;
    },
  });
}

export default fp(rpcPlugin);
