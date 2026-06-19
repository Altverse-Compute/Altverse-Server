import type { FastifyInstance, FastifyRequest } from "fastify";
import type { JoinPlayerResponse__Output } from "@proto/ts/connection/JoinPlayerResponse.ts";
import { Input } from "@/compute";
import type { ClientMessage } from "@routes/websocket/types.ts";
import { KeyUp } from "@routes/websocket/handlers/keyup.ts";
import { KeyDown } from "@routes/websocket/handlers/keydown.ts";
import { MousePos } from "@routes/websocket/handlers/mousepos.ts";
import { MouseEnable } from "@routes/websocket/handlers/mouseenable.ts";
import { Ability } from "@routes/websocket/handlers/ability.ts";
import { clientMessageValidate } from "@routes/websocket/validate.ts";
import fp from "fastify-plugin";
import { game } from "@proto/js";

export const wsRoutes = fp((fastify: FastifyInstance) => {
  let nextId = 0;
  let playerSessionTokens: string[] = [];

  const messageHandlers: Record<
    string,
    (req: FastifyRequest, data: game.ClientMessage) => void
  > = {
    chatMessage: (req, data) => {
      fastify.engine.chatMessage(req.name, req.sid, data.chatMessage!);
    },
    keyUp: (req, data) => {
      KeyUp(req, data.keyUp!);
    },
    init: (req, data) => {
      fastify.engine.join(req.name, req.sid);
    },
    mousePos: (req, data) => {
      MousePos(req, data.mousePos!);
    },
    mouseEnable: (req, data) => {
      MouseEnable(req, data.mouseEnable!);
    },
    ability: (req, data) => {
      Ability(req, data.ability!);
    },
  };

  fastify.route({
    method: "GET",
    url: "/",
    config: {
      rateLimit: {
        max: 3,
        timeWindow: "1s",
      },
    },
    handler(req, res) {
      res.send("What hello there");
    },
    wsHandler: async (socket, req) => {
      try {
        console.log("connection");
        const server = req.server;

        const cookieHeader = req.headers.cookie || "";
        const match = cookieHeader.match(/token=([\w\d]+)./);

        if (!match) {
          socket.close(4001, "Unauthorized: No token");
          return;
        }

        const token = match[1];

        playerSessionTokens.push(token);

        const joinData: JoinPlayerResponse__Output =
          await server.rpc.joinPlayer(token);

        req.name = joinData.name!;
        req.sid = nextId++;
        req.accountId = joinData.id!;
        req.role = joinData.role!;
        req.input = new Input();

        req.log.info(
          {
            req: {
              method: "GET",
              url: req.url,
              remoteAddress: req.ip,
            },
          },
          "incoming websocket request verified",
        );

        server.transfer.addClient(req.sid, socket, req.input);

        socket.on("message", (msg: Uint8Array, isunary: boolean) => {
          try {
            const data = game.ClientMessage.decode(msg);
            const valid = clientMessageValidate(data);

            if (!valid) {
              socket.close();
            }

            const keys = Object.keys(data);

            for (const key of keys) {
              const handler = messageHandlers[key];
              if (handler != undefined) handler(req, data);
              else req.log.error(`Unregistered message handler ${key}`);
            }
          } catch (e) {
            console.error(e);
          }
        });

        socket.on("close", () => {
          server.transfer.remClient(req.sid);
          server.engine.leave(req.name, req.sid);
        });
      } catch (e) {
        console.error(e);
        req.log.error(e, "WS Auth Error");
        socket.close(1011, "Internal Server Error");
      }
    },
  });
});
