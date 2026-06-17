import { Input } from "../../compute";
import { logger } from "../../util/logger.ts";
import { clientMessageValidate } from "../../util/validate.ts";
import type { ClientMessage } from "./types.ts";
import { KeyDown } from "./handlers/keydown.ts";
import { KeyUp } from "./handlers/keyup.ts";
import { MousePos } from "./handlers/mousepos.ts";
import { MouseEnable } from "./handlers/mouseenable.ts";
import { Ability } from "./handlers/ability.ts";
import { coreEvents } from "../../util/events.ts";
import type { RPCClient } from "../rpc";
import type { Role__Output } from "@proto/ts/game/Role.ts";

export interface Client {
  id: number;
  input: Input;
  accountId: string;
  sessionToken: string;
  name: string;
  role: Role__Output;
}

export class WebSocketServer {
  nextId = 0;
  clients = new Map<number, Bun.ServerWebSocket<Client>>();
  playersSessionTokens: string[] = [];

  constructor(rpc: RPCClient) {
    rpc.interval(this);
    Bun.serve({
      fetch: async (req, server) => {
        if (!req.headers)
          return new Response("Headers is empty", { status: 401 });

        const cookie = req.headers.get("cookie");
        if (!cookie) {
          return new Response("Cookies is empty", { status: 401 });
        }
        const matches = cookie.match(/[^token=][\w\d]+/gm);
        if (!matches) {
          return new Response("Token is wrong", { status: 401 });
        }

        const token = matches[0];

        if (this.playersSessionTokens.includes(token)) {
          return new Response("Already connected", { status: 401 });
        }

        this.playersSessionTokens.push(token);

        let client: Client = {
          sessionToken: token,
          id: this.nextId++,
          accountId: "",
          input: new Input(),
          name: "",
          role: "USER",
        };

        try {
          const upgradeSuccess = await new Promise<boolean>((resolve) => {
            rpc.client.JoinPlayer({ token }, rpc.metadata, (err, response) => {
              if (err || !response) {
                logger.error(err);
                resolve(false);
                return;
              }

              client.accountId = response.id!;
              client.role = response.role!;
              client.name = response.name!;

              const upgraded = server.upgrade(req, { data: client });
              resolve(upgraded);
            });
          });
          if (upgradeSuccess) {
            logger.info({
              newConnection: {
                username: client.name,
                id: client.id,
              },
            });
            return undefined;
          } else {
            return new Response("Authentication or Upgrade failed", {
              status: 401,
            });
          }
        } catch (error) {
          logger.error("Internal error during upgrade");
          logger.error(error);
          return new Response("Internal Server Error", { status: 500 });
        }
      },
      websocket: {
        data: {} as Client,
        idleTimeout: 10,
        perMessageDeflate: true,
        maxPayloadLength: 1024,
        message: (
          ws: Bun.ServerWebSocket<Client>,
          msg: string | Buffer<ArrayBuffer>,
        ) => {
          try {
            const rawData = JSON.parse(msg.toString());
            const valid = clientMessageValidate(rawData);

            if (!valid) {
              ws.close();
            }

            const client = ws.data;

            const data = rawData as ClientMessage;

            const keys = Object.keys(data);

            for (const key of keys) {
              switch (key) {
                case "message":
                  coreEvents.emit("message", {
                    id: client.id,
                    content: data.message!,
                    username: client.name,
                  });
                  break;
                case "keyUp":
                  KeyUp(ws, data.keyUp!);
                  break;
                case "keyDown":
                  KeyDown(ws, data.keyDown!);
                  break;
                case "init":
                  try {
                    coreEvents.emit("join", {
                      id: client.id,
                      name: client.name,
                      role: client.role,
                    });
                    this.clients.set(client.id, ws);
                  } catch {
                    ws.close();
                  }
                  break;
                case "mousePos":
                  MousePos(ws, data.mousePos!);
                  break;
                case "mouseEnable":
                  MouseEnable(ws, data.mouseEnable!);
                  break;
                case "ability":
                  Ability(ws, data.ability!);
                  break;
              }
            }
          } catch {}
        },
        close: (ws) => {
          const client = ws.data;
          if (client.id !== undefined) {
            this.clients.delete(client.id);
            this.playersSessionTokens = this.playersSessionTokens.filter(
              (token) => token !== client.sessionToken,
            );
            coreEvents.emit("leave", { id: client.id, username: client.name });
          }
        },
      },
    });
  }

  tick(packages: Record<number, Buffer>) {
    for (const [id, client] of this.clients) {
      const pkg = packages[id]!;
      if (pkg) {
        client.send(pkg.buffer, true);
      }
    }
  }
}
