import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import type { GameClient } from "@proto/ts/connection/Game.ts";
import grpc from "@grpc/grpc-js";
import { loadSync } from "@grpc/proto-loader";
import path from "path";
import type { ProtoGrpcType } from "@proto/ts/rpc.ts";
import { awardPlayer } from "@/plugins/rpc/decorators/awardplayer.ts";
import { joinPlayer } from "@/plugins/rpc/decorators/joinplayer.ts";

const metadata = new grpc.Metadata();

async function rpcPlugin(fastify: FastifyInstance) {
  let ready = false;

  const protoPath = path.join("./src/proto/proto/rpc.proto");

  const pkg = loadSync(protoPath, {});

  const proto = (grpc.loadPackageDefinition(pkg) as unknown as ProtoGrpcType)
    .connection;

  let credentials: grpc.ChannelCredentials;
  if (fastify.env.dev) credentials = grpc.ChannelCredentials.createInsecure();
  else {
    const certificates = fastify.storage.certs;

    credentials = grpc.ChannelCredentials.createSsl(
      certificates.caCrt,
      certificates.clientKey,
      certificates.clientCrt,
    );
  }

  const client = new proto.Game(fastify.env.rpcHost, credentials, {}) as GameClient;

  const pingInterval = () => {
    client.Ping(
      {
        online: fastify.transfer.getClientsCount(),
        alive: true,
      },
      metadata,
      (err, _) => {
        if (err) {
          fastify.log.error({
            message: err.message,
            code: err.code,
          });
          throw err;
        }
      },
    );
  };

  client.waitForReady(new Date(Date.now() + 1 * 5000), (error) => {
    if (error) {
      fastify.log.error(error);
      throw error;
    }
    console.log("RPC was connected. Trying to authenticate...");
    setInterval(pingInterval, fastify.env.rpcPingInterval);
    ready = true;
    client.Authentication(
      {
        token: fastify.env.rpcToken,
      },
      (err, response) => {
        if (err) {
          fastify.log.error(err);
          throw err;
        }
        if (response) {
          console.log({
            rpcStatus: "authenticated",
            session: response!.session!,
          });
          metadata.add("token", response!.session!);
          fastify.log.info({
            authentication: true,
            session: response!.session!,
          });
        }
      },
    );
  });

  fastify.decorate("rpc", {
    awardPlayer: awardPlayer(fastify, client, metadata),
    joinPlayer: joinPlayer(fastify, client, metadata),
  });
}

export default fp(rpcPlugin);
