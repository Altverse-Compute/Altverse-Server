import type { FastifyInstance } from "fastify";
import fs from "fs";
import path from "path";
import fp from "fastify-plugin";
import * as http from "@proto/http_pb";
import { create, toBinary } from "@bufbuild/protobuf";

const storagePlugin = (fastify: FastifyInstance) => {
  if (!fs.existsSync(fastify.env.storagePath)) {
    const error = new Error(
      "Storage directory doesn't exist. Can't load config, worlds, etc...",
    );
    fastify.log.error(error);
    throw error;
  }

  const config = fs.readFileSync(
    path.join(fastify.env.storagePath, "config.json"),
    "utf8",
  );

  const worldsPath = path.join(fastify.env.storagePath, fastify.env.worldsPath);
  const worldsFiles = fs.readdirSync(worldsPath);
  let worlds: Array<string> = [];
  for (const i of worldsFiles) {
    const p = path.join(worldsPath, i);
    const file = fs.readFileSync(p) + "";
    worlds.push(file);
  }

  const loadCert = (path: string) => {
    if (fs.existsSync(path)) {
      return fs.readFileSync(path);
    }
    return Buffer.from([]);
  };

  const loadWorldsToSend = (): http.WorldsResponse => {
    let response = create(http.WorldsResponseSchema, {
      worlds: {},
    });

    const areaFields = ["text", "win", "vp"];

    for (const i of worldsFiles) {
      const world = JSON.parse(
        fs.readFileSync(path.join(worldsPath, i)).toString(),
      );

      let properties: http.WorldProperties = create(
        http.WorldPropertiesSchema,
        world.client,
      );
      let areas: Record<string, http.AreaResponse> = {};

      for (let i = 0; i < world.areas.length; i++) {
        const area = world.areas[i];
        let fields: Record<string, unknown> = {};
        for (const fieldName of areaFields) {
          const field = area[fieldName];
          if (field != undefined) fields[fieldName] = field;
        }

        if (Object.keys(fields).length !== 0) {
          areas[i] = {
            $typeName: "altverse.game.http.v1.AreaResponse",
            ...fields,
          };
        }
      }

      response.worlds![world.name] = {
        $typeName: "altverse.game.http.v1.WorldResponse",
        properties,
        areas,
      };
    }

    return response;
  };

  const worldsToSend = loadWorldsToSend();

  fastify.decorate("storage", {
    config,
    worlds,
    certs: {
      caCrt: loadCert(fastify.env.caCert),
      clientKey: loadCert(fastify.env.clientKey),
      clientCrt: loadCert(fastify.env.clientCert),
    },
    worldsToSend: toBinary(http.WorldsResponseSchema, worldsToSend),
  });
};

export default fp(storagePlugin);
