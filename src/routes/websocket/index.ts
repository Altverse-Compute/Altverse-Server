import type { FastifyInstance, FastifyRequest } from "fastify";
import { Input } from "@/compute";
import type { ClientMessage } from "@routes/websocket/types.ts";
import { KeyUp } from "@routes/websocket/handlers/keyup.ts";
import { KeyDown } from "@routes/websocket/handlers/keydown.ts";
import { MousePos } from "@routes/websocket/handlers/mousepos.ts";
import { MouseEnable } from "@routes/websocket/handlers/mouseenable.ts";
import { Ability } from "@routes/websocket/handlers/ability.ts";
import { clientMessageValidate } from "@routes/websocket/validate.ts";
import fp from "fastify-plugin";
import * as game from "@proto/game_pb";
import type { JoinPlayerResponse } from "@proto/rpc_pb";
import { createValidator } from "@bufbuild/protovalidate";
import { fromBinary } from "@bufbuild/protobuf";

export const wsRoutes = fp((fastify: FastifyInstance) => {
  let nextId = 0;
  let playerSessionTokens: string[] = [];
  const validation = createValidator();

  const messageHandlers: Record<
    string,
    (req: FastifyRequest, data: unknown) => void
  > = {
    chatMessage: (req, data) => {
      fastify.engine.chatMessage(req.name, req.sid, data as string);
    },
    keyDown: (req, data) => {
      KeyDown(req, data as game.ClientKey);
    },
    keyUp: (req, data) => {
      KeyUp(req, data as game.ClientKey);
    },
    init: (req, _) => {
      fastify.engine.join(req.name, req.sid);
    },
    mousePos: (req, data) => {
      MousePos(req, data as game.ClientMousePos);
    },
    mouseEnable: (req, data) => {
      MouseEnable(req, data as boolean);
    },
    ability: (req, data) => {
      Ability(req, data as game.ClientAbility);
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
        const server = req.server;

        const cookieHeader = req.headers.cookie || "";
        const match = cookieHeader.match(/token=([\w\d]+)./);

        if (!match) {
          socket.close(4001, "Unauthorized: No token");
          return;
        }

        const token = match[1];

        playerSessionTokens.push(token);

        const joinData: JoinPlayerResponse = await server.rpc.joinPlayer(token);

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
            const data = fromBinary(game.ClientMessageSchema, msg);
            console.log(data);

            if (!validation.validate(game.ClientMessageSchema, data)) {
              socket.close(4002, "Message validation failure");
              return;
            }

            const handler = messageHandlers[data.pkg.case!];
            if (handler != undefined) {
              handler(req, data.pkg.value);
            } else {
              req.log.error(`Unregistered message handler ${data.pkg.case!}`);
            }
          } catch (e) {
            req.log.error(e);
          }
        });

        socket.on("close", () => {
          server.transfer.remClient(req.sid);
          server.engine.leave(req.name, req.sid);
        });
      } catch (e) {
        req.log.error(e);
        req.log.error(e, "WS Auth Error");
        socket.close(1011, "Internal Server Error");
      }
    },
  });
});
