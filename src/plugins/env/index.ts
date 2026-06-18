import type { FastifyInstance } from "fastify";
import dotenv from "dotenv";
import fp from "fastify-plugin";

dotenv.config();

function env(key: string, fallback?: string): string {
  const value = process.env[key];
  if (value === undefined) {
    if (fallback !== undefined) return fallback;
    throw new Error(`Missing required env variable: ${key}`);
  }
  return value;
}

const envPlugin = (fastify: FastifyInstance) => {
  fastify.decorate("env", {
    dev: env("DEV_MODE", "true").toLowerCase() === "true",
    port: Number(env("PORT", "7001")),
    frontendUrl: env("FRONTEND_URL", "http://localhost:7010"),

    tickRate: Number(env("TICK_RATE", "60")),
    storagePath: env("STORAGE_PATH", "storage"),
    worldsPath: env("WORLDS_PATH", "worlds"),

    rpcToken: env("RPC_TOKEN"),
    rpcHost: env("RPC_HOST", "localhost:7030"),
    rpcPingInterval: Number(env("RPC_PING_INTERVAL", "5000")),

    clientCert: env("CLIENT_CERT", "client.crt"),
    clientKey: env("CLIENT_KEY", "client.key"),
    caCert: env("CA_CERT", "ca.crt"),
  });
};

export default fp(envPlugin);
