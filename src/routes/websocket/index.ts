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

export const wsRoutes = (fastify: FastifyInstance) => {
  let nextId = 0;
  let playerSessionTokens: string[] = [];

  fastify.route({
    method: "GET",
    url: "/",
    websocket: true,
    config: {
      rateLimit: {
        max: 3,
        timeWindow: "1s",
      },
    },
    handler(req, res) {
      res.send("What hello there");
    },
    async wsHandler(connection, req) {
      try {
        const cookieHeader = req.headers.cookie || "";
        const match = cookieHeader.match(/token=([^;]+)/);

        const ws = connection.socket;

        if (!match) {
          connection.close(4001, "Unauthorized: No token");
          return;
        }

        const token = match[1];

        playerSessionTokens.push(token);

        const joinData: JoinPlayerResponse__Output =
          await ws.rpc.joinPlayer(token);

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

        ws.send(Buffer.from([0x33, 0x33, 0x33]));

        ws.on("message", (msg: Uint8Array, isunary: boolean) => {
          try {
            const rawData = JSON.parse(msg.toString());
            const valid = clientMessageValidate(rawData);

            if (!valid) {
              ws.close();
            }

            const data = rawData as ClientMessage;

            const keys = Object.keys(data);

            for (const key of keys) {
              switch (key) {
                case "message":
                  ws.engine.chatMessage(req.name, req.sid, data.message!);
                  break;
                case "keyUp":
                  KeyUp(req, data.keyUp!);
                  break;
                case "keyDown":
                  KeyDown(req, data.keyDown!);
                  break;
                case "init":
                  try {
                    ws.engine.join(req.name, req.sid);
                  } catch {
                    ws.close();
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
      } catch (e) {
        req.log.error(e, "WS Auth Error");
        connection.close(1011, "Internal Server Error");
      }
    },
  });
};
