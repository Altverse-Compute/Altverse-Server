import {Input} from "../../compute";
import {SHARED_COMPRESSOR, type TemplatedApp, type WebSocket,} from "uWebSockets.js";
import {logger} from "../../service/logger.ts";
import {clientMessageValidate} from "../../service/validate.ts";
import type {ClientMessage} from "./types.ts";
import {KeyDown} from "./handlers/keydown.ts";
import {KeyUp} from "./handlers/keyup.ts";
import {MousePos} from "./handlers/mousepos.ts";
import {MouseEnable} from "./handlers/mouseenable.ts";
import {Ability} from "./handlers/ability.ts";
import {coreEvents} from "../../service/events.ts";
import type {RPCClient} from "../rpc";

export interface Client {
  id: number;
  input: Input;
}

export class WebSocketServer {
  nextId = 0;
  clients = new Map<number, WebSocket<Client>>();

  constructor(app: TemplatedApp, rpc: RPCClient) {
    app.ws<Client>("/", {
      compression: SHARED_COMPRESSOR,
      idleTimeout: 10,
      open: (ws) => {
        const data = ws.getUserData();

        data.id = this.nextId++;
        data.input = new Input();
        logger.info("User connected " + data.id);
        this.clients.set(data.id, ws);
      },
      message: async (ws, msg, isBinary) => {
        try {
          const rawData = JSON.parse(Buffer.from(msg).toString());
          const valid = clientMessageValidate(rawData);

          if (!valid) {
            ws.close();
          }

          const client = ws.getUserData();

          const data = rawData as ClientMessage;

          const keys = Object.keys(data);

          for (const key of keys) {
            switch (key) {
              case 'message':
                coreEvents.emit("message", {
                  id: client.id,
                  content: data.message!
                })
                break;
              case "keyUp":
                KeyUp(ws, data.keyUp!);
                break;
              case "keyDown":
                KeyDown(ws, data.keyDown!);
                break;
              case "init":
                rpc.client.JoinPlayer({
                  token: data.init!.session
                }, (err, resp) => {
                  if (err)  {
                    console.log(err)
                    ws.close();
                    return;
                  }
                  console.log(resp)
                  coreEvents.emit("join", {
                    id: client.id,
                    name: resp.name,
                    role: resp.role,
                  });
                })
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
      close: (ws: WebSocket<Client>) => {
        const client = ws.getUserData();
        if (client.id !== undefined) {
          this.clients.delete(client.id);
          logger.info(`Client ${client.id} disconnected`);
          coreEvents.emit("leave", { id: client.id });
        }
      },
    });
  }
  async tick(packages: Record<number, Buffer>) {
    for (const [id, client] of this.clients) {
      const pkg = packages[id]!;
      if (pkg) client.send(pkg, true);
    }
  }
}
