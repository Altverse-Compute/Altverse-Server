import { WebSocketServer } from "./ws";
import { RPCClient } from "./rpc";

export class Network {
  wss: WebSocketServer;
  rpc: RPCClient;

  constructor() {
    // @ts-ignore
    this.rpc = new RPCClient();
    this.wss = new WebSocketServer(this.rpc);
  }
}
