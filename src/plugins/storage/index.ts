import type { FastifyInstance } from "fastify";
import fs from "fs";
import path from "path";
import fp from "fastify-plugin";
import { http } from "@proto/js";

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

  const loadWorldsToSend = (): http.IWorldsResponse => {
    let response: http.IWorldsResponse = {
      worlds: {},
    };

    const areaFields = ["text", "win", "vp"];

    for (const i of worldsFiles) {
      const world = JSON.parse(
        fs.readFileSync(path.join(worldsPath, i)).toString(),
      );

      let properties: http.IWorldProperties = world.client;
      let areas: Record<string, http.IAreaResponse> = {};

      for (let i = 0; i < world.areas.length; i++) {
        const area = world.areas[i];
        let fields: Record<string, unknown> = {};
        for (const fieldName of areaFields) {
          const field = area[fieldName];
          if (field != undefined) fields[fieldName] = field;
        }

        if (Object.keys(fields).length !== 0) {
          areas[i] = fields;
        }
      }

      response.worlds![world.name] = {
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
    worldsToSend: new Uint8Array(
      http.WorldsResponse.encode(worldsToSend).finish().buffer,
    ),
  });
};

export default fp(storagePlugin);
