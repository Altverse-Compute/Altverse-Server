import grpc, { Metadata } from "@grpc/grpc-js";
import { loadSync } from "@grpc/proto-loader";
import path from "path";
import type { WebSocketServer } from "../ws";
import type { GameClient } from "@proto/ts/connection/Game.ts";
import type { ProtoGrpcType } from "@proto/ts/rpc.ts";
import { Env } from "../../util/env.ts";
import type { PongResponse } from "@proto/ts/connection/PongResponse.ts";
import type { AuthenticationResponse } from "@proto/ts/connection/AuthenticationResponse.ts";
import { logger } from "../../util/logger.ts";
import { AuthenticationFailed, AwardAuthenticationFailed } from "./errors.ts";
import loadCertificate from "../../util/cert.ts";

export class RPCClient {
  public client: GameClient;
  public metadata: grpc.Metadata = new grpc.Metadata();

  constructor() {
    const protoPath = path.join("./src/proto/proto/rpc.proto");

    const pkg = loadSync(protoPath, {});

    const proto = (grpc.loadPackageDefinition(pkg) as unknown as ProtoGrpcType)
      .connection;

    let credentials: grpc.ChannelCredentials;
    if (Env.devMode) credentials = grpc.ChannelCredentials.createInsecure();
    else {
      const certificates = loadCertificate();

      credentials = grpc.ChannelCredentials.createSsl(certificates.cert);
    }

    this.client = new proto.Game(Env.rpcHost, credentials) as GameClient;

    this.client.Authentication(
      {
        token: Env.rpcToken,
      },
      (
        err?: (grpc.ServiceError & typeof AuthenticationFailed) | null,
        response?: AuthenticationResponse,
      ) => {
        if (err) {
          logger.error({
            message: err.message,
            code: err.code,
          });
          throw new Error(err.message);
        }
        if (response) {
          this.metadata.add("token", response!.session!);
          logger.info({
            authentication: true,
          });
          logger.info("RPC: Authentication successful");
        }
      },
    );
  }

  AwardPlayer(databaseId: string, vp: number, accessory: string) {
    this.client.AwardPlayer(
      {
        id: databaseId,
        vp,
        accessory,
      },
      this.metadata,
      (
        err?: (grpc.ServiceError & typeof AwardAuthenticationFailed) | null,
        _?: PongResponse,
      ) => {
        if (err) {
          logger.error({
            message: err.message,
            code: err.code,
          });
        } else {
          logger.info({
            award: {
              databaseId: databaseId,
              vp,
              accessory,
            },
          });
        }
      },
    );
  }

  interval(wss: WebSocketServer) {
    let metadata: Metadata | undefined;
    setInterval(() => {
      if (!metadata) {
        metadata = this.metadata.clone();
      }
      this.client.Ping(
        {
          online: wss.clients.size,
          alive: true,
        },
        metadata,
        (
          err?: (grpc.ServiceError & typeof AuthenticationFailed) | null,
          _?: PongResponse,
        ) => {
          if (err) {
            logger.error({
              message: err.message,
              code: err.code,
            });
            throw err;
          }
        },
      );
    }, 1000);
  }
}
