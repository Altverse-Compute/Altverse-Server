import {App} from "uWebSockets.js";
import {WebSocketServer} from "./ws";
import {Env} from "../service/env.ts";
import {logger} from "../service/logger.ts";
import {RPCClient} from "./rpc";

export class Network {
  wss: WebSocketServer;
  rpc: RPCClient

  constructor() {
    // @ts-ignore
    const app = new App();
    this.rpc = new RPCClient()
    this.wss = new WebSocketServer(app, this.rpc);
    this.rpc.interval(this.wss)
    app.listen(Env.port, () => {
      logger.info("Server started at port " + Env.port);
    });
  }
}
