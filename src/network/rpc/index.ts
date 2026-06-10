import grpc from "@grpc/grpc-js";
import { loadSync } from "@grpc/proto-loader";
import path from "path";
import type { WebSocketServer } from "../ws";
import { Env } from "../../service/env.ts";
import type { ProtoGrpcType } from "../../proto/generated/ts/rpc.ts";
import type { GameServiceClient } from "@proto/ts/connection/GameService.ts";
import type { AuthenticationResponse } from "@proto/ts/connection/AuthenticationResponse.ts";
import type { Pong } from "@proto/ts/connection/Pong.ts";
import type { GameClient } from "@proto/src/proto/generated/ts/connection/Game.ts";

export class RPCClient {
  public client: GameClient;
  public metadata: grpc.Metadata = new grpc.Metadata();

  constructor() {
    const protoPath = path.join("./src/proto/proto/rpc.proto");

    const pkg = loadSync(protoPath, {});

    const proto = (grpc.loadPackageDefinition(pkg) as unknown as ProtoGrpcType)
      .connection;

    this.client = new proto.Game(
      Env.rpcHost,
      grpc.credentials.createInsecure(),
    );

    this.client.Authentication(
      {
        token: Env.rpcToken,
      },
      (err?: grpc.ServiceError | null, response?: AuthenticationResponse) => {
        if (err) throw new Error(err.message);
        if (response) this.metadata.add("token", response.session);
      },
    );
  }

  interval(wss: WebSocketServer) {
    setInterval(() => {
      this.client.Ping(
        {
          online: wss.clients.size,
          alive: true,
        },
        this.metadata,
        (err?: grpc.ServiceError | null, response?: Pong) => {
          if (err) {
            throw err;
          }
        },
      );
    }, 5000);
  }
}
