import type { FastifyInstance } from "fastify";
import fs from "fs";
import path from "path";
import fp from "fastify-plugin";

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
      return fs.readFileSync(path)
    }
    return Buffer.from([])
  }

  fastify.decorate("storage", {
    config,
    worlds,
    certs: {
      caCrt: loadCert(fastify.env.caCert),
      clientKey: loadCert(fastify.env.clientKey),
      clientCrt: loadCert(fastify.env.clientCert),
    },
  });
};

export default fp(storagePlugin);
