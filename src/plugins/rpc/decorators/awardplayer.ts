import type { FastifyInstance } from "fastify";
import type { GameClient } from "@proto/ts/connection/Game.ts";
import grpc from "@grpc/grpc-js";

export const awardPlayer =
  (fastify: FastifyInstance, client: GameClient, metadata: grpc.Metadata) =>
  async (id: string, vp: number, accessory: string) => {
    return new Promise((resolve, reject) => {
      client.AwardPlayer(
        {
          id,
          vp,
          accessory,
        },
        metadata,
        (err, _) => {
          if (err) {
            fastify.log.error(err);
            reject(err);
          } else {
            fastify.log.info({
              award: {
                databaseId: id,
                vp,
                accessory,
              },
            });
            resolve(undefined);
          }
        },
      );
    });
  };
