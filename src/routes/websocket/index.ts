import type { FastifyInstance } from "fastify";
import type { JoinPlayerResponse__Output } from "@proto/ts/connection/JoinPlayerResponse.ts";
import { Input } from "@/compute";
import type { ClientMessage } from "@routes/websocket/types.ts";
import { KeyUp } from "@routes/websocket/handlers/keyup.ts";
import { KeyDown } from "@routes/websocket/handlers/keydown.ts";
import { MousePos } from "@routes/websocket/handlers/mousepos.ts";
import { MouseEnable } from "@routes/websocket/handlers/mouseenable.ts";
import { Ability } from "@routes/websocket/handlers/ability.ts";
import { clientMessageValidate } from "@routes/websocket/validate.ts";
import fp from "fastify-plugin"

export const wsRoutes = fp((fastify: FastifyInstance) => {
  let nextId = 0;
  let playerSessionTokens: string[] = [];

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
        console.log(token)

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
            const rawData = JSON.parse(msg.toString());
            const valid = clientMessageValidate(rawData);

            if (!valid) {
              socket.close();
            }

            const data = rawData as ClientMessage;

            const keys = Object.keys(data);

            for (const key of keys) {
              switch (key) {
                case "message":
                  server.engine.chatMessage(req.name, req.sid, data.message!);
                  break;
                case "keyUp":
                  KeyUp(req, data.keyUp!);
                  break;
                case "keyDown":
                  KeyDown(req, data.keyDown!);
                  break;
                case "init":
                  try {
                    server.engine.join(req.name, req.sid);
                  } catch {
                    socket.close();
                  }
                  break;
                case "mousePos":
                  MousePos(req, data.mousePos!);
                  break;
                case "mouseEnable":
                  MouseEnable(req, data.mouseEnable!);
                  break;
                case "ability":
                  Ability(req, data.ability!);
                  break;
              }
            }
          } catch {}
        });
        
        socket.on("close", () => {
          server.transfer.remClient(req.sid)
        })
      } catch (e) {
        console.error(e)
        req.log.error(e, "WS Auth Error");
        socket.close(1011, "Internal Server Error");
      }
    },
  });
})
