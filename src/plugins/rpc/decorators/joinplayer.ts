import type { JoinPlayerResponse__Output } from "@proto/ts/connection/JoinPlayerResponse.ts";
import type { FastifyInstance } from "fastify";
import type { GameClient } from "@proto/ts/connection/Game.ts";
import grpc from "@grpc/grpc-js";

export const joinPlayer =
  (fastify: FastifyInstance, client: GameClient, metadata: grpc.Metadata) =>
  async (token: string): Promise<JoinPlayerResponse__Output | undefined> => {
    return new Promise<JoinPlayerResponse__Output | undefined>(
      (resolve, reject) => {
        client.JoinPlayer(
          {
            token,
          },
          metadata,
          (err, value) => {
            if (err) {
              fastify.log.error(err);
              reject(err);
              return;
            }
            fastify.log.info({
              join: {
                username: value!.name,
                id: value!.id,
                role: value!.role,
              },
            });
            resolve(value);
          },
        );
      },
    );
  };
